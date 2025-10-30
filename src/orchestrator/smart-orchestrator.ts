// src/orchestrator/smart-orchestrator.ts
import { AgentOrchestrator } from './agent-orchestrator';
import { ReviewRequest, OrchestratorResult, OptimizationMetrics, AgentReview } from '../types';
import { SmartScheduler, SchedulerConfig } from '../optimizers/smart-scheduler';
import { CacheManager } from '../optimizers/cache-manager';
import { PreAnalyzer } from '../optimizers/pre-analyzer';
import { AgentSelector } from '../optimizers/agent-selector';
import { Logger } from '../utils/logger';
import { BaseAgent } from '../agents/base-agent';

export interface SmartOrchestratorConfig {
  maxConcurrent?: number;
  costBudget?: number;
  timeBudget?: number;
  enableEarlyStop?: boolean;
  enableCaching?: boolean;
  enableSmartSelection?: boolean;
  prioritizeSpeed?: boolean;
  prioritizeCost?: boolean;
}

export class SmartOrchestrator extends AgentOrchestrator {
  private scheduler: SmartScheduler;
  private cacheManager: CacheManager;
  private preAnalyzer: PreAnalyzer;
  private agentSelector: AgentSelector;
  private smartLogger: Logger;
  private config: SmartOrchestratorConfig;

  constructor(config: SmartOrchestratorConfig = {}) {
    super(config.maxConcurrent);

    this.config = {
      maxConcurrent: config.maxConcurrent || 6,
      costBudget: config.costBudget || 0.50, // $0.50 default budget
      timeBudget: config.timeBudget || 120000, // 2 minutes
      enableEarlyStop: config.enableEarlyStop ?? true,
      enableCaching: config.enableCaching ?? true,
      enableSmartSelection: config.enableSmartSelection ?? true,
      prioritizeSpeed: config.prioritizeSpeed ?? false,
      prioritizeCost: config.prioritizeCost ?? true,
    };

    this.smartLogger = new Logger('SmartOrchestrator');
    this.scheduler = new SmartScheduler({
      maxConcurrent: this.config.maxConcurrent,
      costBudget: this.config.costBudget,
      timeBudget: this.config.timeBudget,
      enableEarlyStop: this.config.enableEarlyStop,
      prioritizeSpeed: this.config.prioritizeSpeed,
      prioritizeCost: this.config.prioritizeCost,
    });

    this.cacheManager = new CacheManager();
    this.preAnalyzer = new PreAnalyzer();
    this.agentSelector = new AgentSelector();

    this.smartLogger.info('SmartOrchestrator initialized with config:', this.config);
  }

  async executeReview(request: ReviewRequest): Promise<OrchestratorResult> {
    const startTime = Date.now();

    this.smartLogger.info('🚀 Starting SMART review process');
    this.smartLogger.info(`Files: ${request.files.length}, Agents available: ${this.getAgentCount()}`);

    const metrics: OptimizationMetrics = {
      cacheHits: 0,
      agentsSkipped: 0,
      chunksProcessed: 0,
      modelsUsed: {},
      totalTokens: 0,
      totalTokensSaved: 0,
      estimatedCost: 0,
    };

    // Step 1: Check cache
    let filesToAnalyze = request.files;
    if (this.config.enableCaching) {
      const { cached, uncached } = await this.cacheManager.checkCache(request.files);
      metrics.cacheHits = cached.length;
      filesToAnalyze = uncached;

      if (cached.length > 0) {
        this.smartLogger.info(`💾 Cache hit: ${cached.length} files, analyzing ${uncached.length} new files`);
      }
    }

    // Step 2: Pre-analyze files to select relevant agents
    let agentsToRun = this.getAllAgents();

    if (this.config.enableSmartSelection && filesToAnalyze.length > 0) {
      const analysisResult = await this.preAnalyzer.analyze(filesToAnalyze);
      const relevantAgentNames = this.agentSelector.selectAgents(
        this.getAgentCount(),
        analysisResult
      );

      agentsToRun = agentsToRun.filter(agent =>
        relevantAgentNames.includes(agent.getName())
      );

      metrics.agentsSkipped = this.getAgentCount() - agentsToRun.length;

      this.smartLogger.info(
        `🎯 Smart selection: ${agentsToRun.length}/${this.getAgentCount()} agents selected (skipped ${metrics.agentsSkipped})`
      );
    }

    // Step 3: Execute with smart scheduler
    const { responses, metrics: execMetrics } = await this.scheduler.executeIntelligent(
      agentsToRun,
      filesToAnalyze
    );

    // Update metrics
    metrics.estimatedCost = execMetrics.totalCost;
    metrics.agentsSkipped += execMetrics.agentsSkipped;

    // Count model usage
    responses.forEach(r => {
      const modelUsed = r.tokensUsed ? 'sonnet-4' : 'haiku'; // Simplified
      metrics.modelsUsed[modelUsed] = (metrics.modelsUsed[modelUsed] || 0) + 1;
      metrics.totalTokens += r.tokensUsed || 0;
    });

    // Calculate savings
    const regularCost = this.getAgentCount() * 0.05; // Estimated $0.05 per agent
    metrics.totalTokensSaved = Math.max(0, regularCost - execMetrics.totalCost) * 1000000;

    const executionTime = Date.now() - startTime;

    // Generate summary
    const totalIssues = responses.reduce((sum, r) => sum + r.issues.length, 0);
    const criticalIssues = responses.reduce(
      (sum, r) => sum + r.issues.filter((i: any) => i.severity === 'critical').length,
      0
    );
    const totalSuggestions = responses.reduce((sum, r) => sum + r.suggestions.length, 0);

    this.smartLogger.info('✅ Smart review completed');
    this.smartLogger.info(`📊 Stats: ${execMetrics.agentsExecuted} agents executed, ${totalIssues} issues found`);
    this.smartLogger.info(`💰 Cost: $${execMetrics.totalCost.toFixed(4)} (budget: $${this.config.costBudget})`);
    this.smartLogger.info(`⏱️  Time: ${executionTime}ms (budget: ${this.config.timeBudget}ms)`);
    this.smartLogger.info(`💾 Cache: ${metrics.cacheHits} hits, saved ~$${(metrics.totalTokensSaved / 1000000 * 3).toFixed(4)}`);

    if (execMetrics.earlyStop) {
      this.smartLogger.warn('🛑 Early stop triggered due to critical issues');
    }

    // Convert AgentResponse[] to AgentReview[]
    const reviews: AgentReview[] = responses.map(response => ({
      agentName: response.agentName,
      timestamp: response.timestamp,
      findings: response.issues.map((issue: any) => ({
        severity: issue.severity === 'critical' ? 'critical' as const :
                  issue.severity === 'warning' ? 'major' as const : 'minor' as const,
        category: issue.category,
        file: issue.file,
        line: issue.line,
        message: issue.description,
      })),
      metrics: {
        score: 100 - (response.issues.filter((i: any) => i.severity === 'critical').length * 20),
        executionTime: 0,
        tokensUsed: response.tokensUsed || 0,
        modelUsed: 'claude-sonnet-4-20250514',
        cacheHit: false,
      },
      summary: response.analysis,
      recommendations: response.suggestions.map((s: any) => s.title),
    }));

    return {
      reviews,
      summary: {
        totalIssues,
        criticalIssues,
        suggestions: totalSuggestions,
        filesAnalyzed: request.files.length,
        analysisTime: executionTime,
      },
      metrics,
    };
  }

  private generateSmartSummary(
    responses: any[],
    metrics: OptimizationMetrics,
    execMetrics: any
  ): string {
    const criticalIssues = responses.flatMap(r =>
      r.issues.filter((i: any) => i.severity === 'critical')
    );

    let summary = `# 🤖 Smart AI Code Review\n\n`;

    summary += `## 📊 Execution Summary\n\n`;
    summary += `- **Agents Executed**: ${execMetrics.agentsExecuted}\n`;
    summary += `- **Agents Skipped**: ${execMetrics.agentsSkipped} (smart selection + budget)\n`;
    summary += `- **Execution Time**: ${execMetrics.totalTime}ms\n`;
    summary += `- **Cost**: $${execMetrics.totalCost.toFixed(4)}\n`;
    summary += `- **Cost Efficiency**: ${((1 - execMetrics.totalCost / (this.config.costBudget || 1)) * 100).toFixed(1)}% under budget\n\n`;

    summary += `## 🎯 Optimization Impact\n\n`;
    summary += `- **Cache Hits**: ${metrics.cacheHits} files (saved API calls)\n`;
    summary += `- **Smart Selection**: ${metrics.agentsSkipped} irrelevant agents skipped\n`;
    summary += `- **Estimated Savings**: $${((this.getAgentCount() * 0.05 - execMetrics.totalCost)).toFixed(4)}\n`;

    if (execMetrics.earlyStop) {
      summary += `- **Early Stop**: ✅ Activated (critical issues found)\n`;
    }

    summary += `\n## 🔍 Issues Found\n\n`;
    summary += `- **Critical**: ${criticalIssues.length}\n`;

    const warnings = responses.flatMap(r =>
      r.issues.filter((i: any) => i.severity === 'warning')
    );
    summary += `- **Warnings**: ${warnings.length}\n\n`;

    if (criticalIssues.length > 0) {
      summary += `### ⚠️ Critical Issues\n\n`;
      criticalIssues.slice(0, 5).forEach((issue: any) => {
        summary += `- **${issue.file}**: ${issue.description}\n`;
      });

      if (criticalIssues.length > 5) {
        summary += `\n_...and ${criticalIssues.length - 5} more critical issues_\n`;
      }
    }

    return summary;
  }

  private getAllAgents(): BaseAgent[] {
    // Access private agents array through reflection (not ideal but works)
    return (this as any).agents || [];
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(config: Partial<SmartOrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
    this.smartLogger.info('Configuration updated:', config);

    // Recreate scheduler with new config
    this.scheduler = new SmartScheduler({
      maxConcurrent: this.config.maxConcurrent,
      costBudget: this.config.costBudget,
      timeBudget: this.config.timeBudget,
      enableEarlyStop: this.config.enableEarlyStop,
      prioritizeSpeed: this.config.prioritizeSpeed,
      prioritizeCost: this.config.prioritizeCost,
    });
  }

  /**
   * Get current configuration
   */
  getConfig(): SmartOrchestratorConfig {
    return { ...this.config };
  }
}
