// src/agents/base-agent.ts
import Anthropic from '@anthropic-ai/sdk';
import {
  AgentConfig,
  ReviewContext,
  ReviewFinding,
  AgentReview,
  ReviewMetrics,
  FileContext,
  AgentResponse,
  Issue,
  Suggestion
} from '../types';
import { ReviewCache } from '../cache/review-cache';

export class BaseAgent {
  protected client: Anthropic;
  protected config: AgentConfig;
  protected cache: ReviewCache | null;
  private static readonly MODELS = {
    SONNET_4: 'claude-sonnet-4-20250514',
    SONNET_3_5: 'claude-3-5-sonnet-20241022',
    HAIKU: 'claude-3-haiku-20240307'
  };

  constructor(configOrApiKey: AgentConfig | string, config?: AgentConfig, enableCache: boolean = true) {
    // Support both old and new constructor signatures
    let apiKey: string;
    let agentConfig: AgentConfig;

    if (typeof configOrApiKey === 'string') {
      // New signature: constructor(apiKey, config, enableCache)
      apiKey = configOrApiKey;
      agentConfig = config!;
    } else {
      // Old signature: constructor(config)
      apiKey = process.env.ANTHROPIC_API_KEY || '';
      agentConfig = configOrApiKey;
    }

    if (!apiKey) {
      throw new Error('Anthropic API key is required. Set ANTHROPIC_API_KEY environment variable or pass it to the constructor.');
    }

    this.client = new Anthropic({ apiKey });
    this.config = {
      ...agentConfig,
      model: agentConfig.model || process.env.DEFAULT_MODEL || BaseAgent.MODELS.SONNET_4,
      temperature: agentConfig.temperature ?? 0.2,
      maxTokens: agentConfig.maxTokens ?? 8192 // Increased for better analysis
    };
    this.cache = enableCache ? new ReviewCache() : null;
  }

  // Optional methods for new agent implementations
  protected buildSystemPrompt(): string {
    return `You are an expert code reviewer analyzing ${this.config.name}.
Provide detailed, actionable feedback.`;
  }

  protected buildReviewPrompt(context: ReviewContext): string {
    return `Review the following file: ${context.fileName}

\`\`\`
${context.fileContent}
\`\`\`

Provide your analysis in the following format:
- List any issues found
- Provide recommendations for improvement`;
  }

  protected parseResponse(response: string, context: ReviewContext): ReviewFinding[] {
    // Default simple parsing - can be overridden by subclasses
    const findings: ReviewFinding[] = [];
    const lines = response.split('\n');

    for (const line of lines) {
      if (line.toLowerCase().includes('critical') || line.toLowerCase().includes('error')) {
        findings.push({
          severity: 'critical',
          category: this.config.name,
          file: context.fileName,
          message: line.trim(),
        });
      } else if (line.toLowerCase().includes('warning') || line.toLowerCase().includes('issue')) {
        findings.push({
          severity: 'major',
          category: this.config.name,
          file: context.fileName,
          message: line.trim(),
        });
      }
    }

    return findings;
  }

  async review(context: ReviewContext): Promise<AgentReview> {
    const startTime = Date.now();
    let fromCache = false;

    try {
      // Check cache first
      if (this.cache?.isEnabled()) {
        const cached = await this.cache.get(context.fileContent, this.config.name);
        if (cached) {
          console.log(`✅ Cache hit for ${this.config.name}`);
          return { ...cached, fromCache: true };
        }
      }

      console.log(`🤖 ${this.config.name} analyzing ${context.fileName}...`);

      // Select optimal model based on complexity and file size
      const model = this.selectModel(context);

      // Build prompts
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildReviewPrompt(context);

      // Create message with proper typing
      const message = await this.client.messages.create({
        model,
        max_tokens: this.config.maxTokens!,
        temperature: this.config.temperature!,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userPrompt
        }]
      });

      if (!message.content || message.content.length === 0) {
        throw new Error('Empty response from Claude API');
      }

      const response = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      if (!response) {
        throw new Error('Invalid response format from Claude API');
      }

      const findings = this.parseResponse(response, context);
      const score = this.calculateScore(findings);

      const review: AgentReview = {
        agentName: this.config.name,
        timestamp: new Date(),
        findings,
        metrics: {
          score,
          executionTime: Date.now() - startTime,
          tokensUsed: (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0),
          modelUsed: model,
          cacheHit: fromCache
        },
        summary: this.generateSummary(findings),
        recommendations: this.extractRecommendations(response),
        fromCache
      };

      // Cache the result
      if (this.cache?.isEnabled() && !fromCache) {
        await this.cache.set(context.fileContent, this.config.name, review);
      }

      return review;
    } catch (error) {
      console.error(`❌ ${this.config.name} failed:`, error);

      // Provide helpful error message
      if (error instanceof Error) {
        throw new Error(`${this.config.name} review failed: ${error.message}`);
      }
      throw error;
    }
  }

  protected selectModel(context: ReviewContext): string {
    // Use configurable model if specified
    if (this.config.model && this.config.model !== BaseAgent.MODELS.SONNET_4) {
      return this.config.model;
    }

    const complexity = context.metadata?.complexity || 0;
    const fileSize = context.fileContent.length;

    // Use Haiku for very simple and small files (cost optimization)
    if (complexity < 20 && fileSize < 5000) {
      return BaseAgent.MODELS.HAIKU;
    }

    // Use Sonnet 3.5 for simple to medium complexity (good balance)
    if (complexity < 50 && fileSize < 20000) {
      return BaseAgent.MODELS.SONNET_3_5;
    }

    // Use Sonnet 4 for complex files or when high quality is needed
    // Sonnet 4 has better reasoning and code understanding
    return BaseAgent.MODELS.SONNET_4;
  }

  protected calculateScore(findings: ReviewFinding[]): number {
    if (findings.length === 0) return 100;

    const severityWeights: Record<ReviewFinding['severity'], number> = {
      critical: 20,
      major: 10,
      minor: 5,
      info: 2
    };

    const deduction = findings.reduce((total, finding) => {
      return total + (severityWeights[finding.severity] || 0);
    }, 0);

    return Math.max(0, Math.min(100, 100 - deduction));
  }

  protected generateSummary(findings: ReviewFinding[]): string {
    const severityCounts = findings.reduce((acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const critical = severityCounts.critical || 0;
    const major = severityCounts.major || 0;
    const minor = severityCounts.minor || 0;
    const info = severityCounts.info || 0;

    if (critical > 0) {
      return `⚠️ Found ${critical} critical issue${critical > 1 ? 's' : ''} requiring immediate attention`;
    }

    if (major > 0) {
      return `⚡ Found ${major} major issue${major > 1 ? 's' : ''}${minor > 0 ? ` and ${minor} minor issue${minor > 1 ? 's' : ''}` : ''}`;
    }

    if (minor > 0) {
      return `📝 Found ${minor} minor issue${minor > 1 ? 's' : ''}`;
    }

    if (info > 0) {
      return `ℹ️ Found ${info} informational item${info > 1 ? 's' : ''}`;
    }

    return '✅ No significant issues found';
  }

  protected extractRecommendations(response: string): string[] {
    const recommendations: string[] = [];
    const lines = response.split('\n');

    // Look for recommendation sections
    const recommendationHeaders = [
      'recommendation',
      'suggest',
      'consider',
      'best practice',
      'improvement'
    ];

    let inRecommendations = false;
    let consecutiveEmptyLines = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      const lowerLine = trimmedLine.toLowerCase();

      // Check if we're entering a recommendations section
      if (recommendationHeaders.some(header => lowerLine.includes(header))) {
        inRecommendations = true;
        consecutiveEmptyLines = 0;
        continue;
      }

      if (inRecommendations) {
        // Track empty lines to exit recommendations section
        if (trimmedLine === '') {
          consecutiveEmptyLines++;
          if (consecutiveEmptyLines >= 2) {
            break;
          }
          continue;
        } else {
          consecutiveEmptyLines = 0;
        }

        // Extract bullet points and numbered lists
        if (trimmedLine.match(/^[-*•]\s+/) || trimmedLine.match(/^\d+\.\s+/)) {
          const cleaned = trimmedLine.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').trim();
          if (cleaned.length > 0) {
            recommendations.push(cleaned);
          }
        }
      }
    }

    return recommendations;
  }

  protected parseJSON<T = any>(response: string): T | null {
    try {
      // Try to find JSON block between ```json and ```
      const jsonBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch) {
        return JSON.parse(jsonBlockMatch[1]);
      }

      // Try to find standalone JSON object
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('Failed to parse JSON from response:', error);
    }
    return null;
  }

  /**
   * Get the model constants for external use
   */
  static getModels() {
    return BaseAgent.MODELS;
  }

  /**
   * Get the agent name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Backward compatibility: analyze method that maps to review
   * @deprecated Use review() instead
   */
  async analyze(files: FileContext[]): Promise<AgentResponse> {
    // For backward compatibility with old agent implementations
    // This assumes single file review - can be extended for multiple files
    if (files.length === 0) {
      throw new Error('No files provided for analysis');
    }

    const file = files[0];
    const context: ReviewContext = {
      fileName: file.path,
      fileContent: file.content,
      fileType: this.inferFileType(file.path),
      metadata: {
        lines: file.content.split('\n').length,
        complexity: 50, // Default complexity
        imports: [],
        exports: [],
        classes: [],
        methods: []
      }
    };

    const review = await this.review(context);

    // Map new review format to old AgentResponse format
    return {
      agentName: review.agentName,
      analysis: review.summary,
      issues: review.findings.map(f => ({
        severity: f.severity === 'major' ? 'warning' as const :
                  f.severity === 'minor' ? 'info' as const :
                  f.severity as 'critical' | 'warning' | 'info',
        file: f.file,
        line: f.line,
        description: f.message,
        category: f.category
      })),
      suggestions: review.recommendations.map(rec => ({
        title: rec,
        description: rec,
        priority: 'medium' as const
      })),
      timestamp: review.timestamp,
      tokensUsed: review.metrics.tokensUsed
    };
  }

  private inferFileType(path: string): ReviewContext['fileType'] {
    if (path.endsWith('.component.ts')) return 'component';
    if (path.endsWith('.service.ts')) return 'service';
    if (path.endsWith('.directive.ts')) return 'directive';
    if (path.endsWith('.pipe.ts')) return 'pipe';
    if (path.endsWith('.module.ts')) return 'module';
    if (path.endsWith('.guard.ts')) return 'guard';
    if (path.endsWith('.interceptor.ts')) return 'interceptor';
    return 'component'; // default
  }

  /**
   * Legacy method for backward compatibility with old agents
   * @deprecated Use client.messages.create directly in new agents
   */
  protected async callClaude(prompt: string): Promise<string> {
    try {
      const message = await this.client.messages.create({
        model: this.config.model || BaseAgent.MODELS.SONNET_4,
        max_tokens: this.config.maxTokens || 8192,
        temperature: this.config.temperature || 0.2,
        system: this.config.systemPrompt || '',
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      if (!message.content || message.content.length === 0) {
        throw new Error('Empty response from Claude API');
      }

      const content = message.content[0];
      return content.type === 'text' ? content.text : '';
    } catch (error) {
      console.error(`Error calling Claude API:`, error);
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use parseResponse instead
   */
  protected parseIssues(text: string): Issue[] {
    const issues: Issue[] = [];
    const lines = text.split('\n');
    const issuePattern = /^\s*\[(\w+)\]\s*(.+?):\s*(.+)$/i;

    for (const line of lines) {
      const match = line.match(issuePattern);
      if (match) {
        const severity = match[1].toLowerCase();

        // Validate severity
        if (severity === 'critical' || severity === 'warning' || severity === 'info') {
          issues.push({
            severity: severity as 'critical' | 'warning' | 'info',
            file: match[2].trim(),
            description: match[3].trim(),
            category: this.config.name,
          });
        }
      }
    }

    return issues;
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use parseResponse instead
   */
  protected parseSuggestions(text: string): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Split by ### headers
    const sections = text.split(/(?=^###\s+)/m);

    for (const section of sections) {
      const lines = section.trim().split('\n');
      if (lines.length > 0 && lines[0].startsWith('###')) {
        const title = lines[0].replace(/^###\s*/, '').trim();
        const description = lines.slice(1).join('\n').trim();

        if (title && description) {
          // Determine priority based on keywords
          let priority: 'high' | 'medium' | 'low' = 'medium';

          const lowerTitle = title.toLowerCase();
          if (lowerTitle.includes('critical') || lowerTitle.includes('security') || lowerTitle.includes('urgent')) {
            priority = 'high';
          } else if (lowerTitle.includes('minor') || lowerTitle.includes('optional') || lowerTitle.includes('consider')) {
            priority = 'low';
          }

          suggestions.push({
            title,
            description,
            priority,
          });
        }
      }
    }

    return suggestions;
  }
}