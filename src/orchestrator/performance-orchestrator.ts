// src/orchestrator/performance-orchestrator.ts
import { SmartOrchestrator } from './smart-orchestrator';
import { StreamProcessor } from '../performance/stream-processor';
import { DifferentialAnalyzer } from '../performance/differential-analyzer';
import { ReviewRequest, OrchestratorResult, FileContext, OptimizationMetrics } from '../types';
import { Logger } from '../utils/logger';
import { BaseAgent } from '../agents/base-agent';

export interface PerformanceConfig {
  enableStreaming?: boolean;
  enableDifferentialAnalysis?: boolean;
  enableProgressUpdates?: boolean;
  costBudget?: number;
  timeBudget?: number;
  maxConcurrent?: number;
  enableEarlyStop?: boolean;
  enableSmartSelection?: boolean;
  enableCaching?: boolean;
  prioritizeCost?: boolean;
}

export interface PerformanceMetrics extends OptimizationMetrics {
  streamingEnabled: boolean;
  differentialEnabled: boolean;
  filesAnalyzed: number;
  filesSkipped: number;
  timeToFirstChunk?: number;
  totalStreamTime?: number;
  differentialStats?: {
    added: number;
    modified: number;
    deleted: number;
    unchanged: number;
    percentChanged: number;
  };
}

/**
 * Performance-optimized orchestrator combining:
 * - Real-time streaming responses
 * - Differential analysis (only changed files)
 * - Smart caching and selection
 * - Progress monitoring
 */
export class PerformanceOrchestrator extends SmartOrchestrator {
  private performanceLogger: Logger;
  private streamProcessor: StreamProcessor;
  private differentialAnalyzer: DifferentialAnalyzer;
  private performanceConfig: PerformanceConfig;

  constructor(agents: BaseAgent[], config: PerformanceConfig = {}) {
    // Pass through to SmartOrchestrator
    super({
      costBudget: config.costBudget,
      timeBudget: config.timeBudget,
      maxConcurrent: config.maxConcurrent,
      enableEarlyStop: config.enableEarlyStop,
      enableSmartSelection: config.enableSmartSelection,
      enableCaching: config.enableCaching,
      prioritizeCost: config.prioritizeCost,
    });

    // Register agents
    this.registerAgents(agents);

    this.performanceLogger = new Logger('PerformanceOrchestrator');
    this.performanceConfig = {
      enableStreaming: config.enableStreaming ?? true,
      enableDifferentialAnalysis: config.enableDifferentialAnalysis ?? true,
      enableProgressUpdates: config.enableProgressUpdates ?? true,
      ...config,
    };

    // Initialize performance components
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    this.streamProcessor = new StreamProcessor(apiKey);
    this.differentialAnalyzer = new DifferentialAnalyzer();

    // Set up streaming event handlers
    if (this.performanceConfig.enableStreaming) {
      this.setupStreamingHandlers();
    }

    this.performanceLogger.info(
      `Performance optimizations: streaming=${this.performanceConfig.enableStreaming}, ` +
      `differential=${this.performanceConfig.enableDifferentialAnalysis}`
    );
  }

  /**
   * Execute review with performance optimizations
   */
  async executeReview(request: ReviewRequest): Promise<OrchestratorResult> {
    const startTime = Date.now();
    let filesToAnalyze = request.files;
    let differentialStats = undefined;

    // Step 1: Differential analysis - only analyze changed files
    if (this.performanceConfig.enableDifferentialAnalysis) {
      const result = this.differentialAnalyzer.getChangedFiles(request.files);

      filesToAnalyze = result.changedFiles;
      differentialStats = result.stats;

      this.performanceLogger.info(
        `Differential analysis: ${result.changedFiles.length}/${request.files.length} files need analysis ` +
        `(${differentialStats.percentChanged.toFixed(1)}% changed)`
      );

      if (this.performanceConfig.enableProgressUpdates) {
        console.log(`\n📊 Differential Analysis:`);
        console.log(`   ✅ Added: ${differentialStats.added}`);
        console.log(`   📝 Modified: ${differentialStats.modified}`);
        console.log(`   ❌ Deleted: ${differentialStats.deleted}`);
        console.log(`   ⏭️  Unchanged: ${differentialStats.unchanged}`);
        console.log(`   📈 Changed: ${differentialStats.percentChanged.toFixed(1)}%\n`);
      }

      // If no files changed, return early
      if (filesToAnalyze.length === 0) {
        this.performanceLogger.info('No files changed - skipping analysis');

        return {
          reviews: [],
          summary: {
            totalIssues: 0,
            criticalIssues: 0,
            suggestions: 0,
            filesAnalyzed: 0,
            analysisTime: Date.now() - startTime,
          },
          metrics: {
            cacheHits: request.files.length,
            agentsSkipped: this.getAgentCount(),
            modelsUsed: {},
            totalTokens: 0,
            estimatedCost: 0,
            totalTokensSaved: 0,
            filesAnalyzed: 0,
            filesSkipped: request.files.length,
            streamingEnabled: this.performanceConfig.enableStreaming!,
            differentialEnabled: true,
            differentialStats,
          } as PerformanceMetrics,
        };
      }
    }

    // Step 2: Execute with parent's smart orchestration
    // Update the request with filtered files
    const optimizedRequest = {
      ...request,
      files: filesToAnalyze,
    };

    const result = await super.executeReview(optimizedRequest);

    // Step 3: Enhance metrics with performance data
    const performanceMetrics: PerformanceMetrics = {
      ...result.metrics,
      streamingEnabled: this.performanceConfig.enableStreaming!,
      differentialEnabled: this.performanceConfig.enableDifferentialAnalysis!,
      filesAnalyzed: filesToAnalyze.length,
      filesSkipped: request.files.length - filesToAnalyze.length,
      differentialStats,
    };

    this.performanceLogger.info(
      `Review completed: ${filesToAnalyze.length} files analyzed, ` +
      `${performanceMetrics.filesSkipped} skipped, ` +
      `$${performanceMetrics.estimatedCost.toFixed(4)} cost`
    );

    return {
      ...result,
      metrics: performanceMetrics,
    };
  }

  /**
   * Set up real-time streaming event handlers
   */
  private setupStreamingHandlers(): void {
    this.streamProcessor.on('chunk', (chunk) => {
      if (!this.performanceConfig.enableProgressUpdates) return;

      switch (chunk.type) {
        case 'start':
          console.log('🚀 Starting streaming response...');
          break;

        case 'content':
          // Real-time content streaming (optional: can be buffered)
          // process.stdout.write('.');
          break;

        case 'complete':
          console.log(`\n✅ Stream complete (${chunk.usage?.outputTokens} tokens)`);
          break;

        case 'error':
          console.error(`\n❌ Stream error: ${chunk.content}`);
          break;
      }
    });
  }

  /**
   * Process agent request with streaming if enabled
   */
  async processAgentWithStreaming(
    agent: BaseAgent,
    files: FileContext[]
  ): Promise<string> {
    if (!this.performanceConfig.enableStreaming) {
      // Fallback to regular processing
      const response = await agent.analyze(files);
      return response.analysis;
    }

    const agentName = agent.getName();
    const systemPrompt = `You are a ${agentName} specialized in Angular code review.`;
    const userPrompt = this.buildPromptForFiles(files);

    return this.streamProcessor.processWithStreaming(
      process.env.DEFAULT_MODEL || 'claude-sonnet-4-20250514',
      systemPrompt,
      userPrompt,
      8192
    );
  }

  /**
   * Build prompt for files
   */
  private buildPromptForFiles(files: FileContext[]): string {
    let prompt = 'Analyze the following Angular files:\n\n';

    for (const file of files) {
      prompt += `File: ${file.path}\n`;
      prompt += '```typescript\n';
      prompt += file.content;
      prompt += '\n```\n\n';
    }

    return prompt;
  }

  /**
   * Reset differential analyzer (force full analysis next time)
   */
  resetDifferentialAnalysis(): void {
    this.differentialAnalyzer.reset();
    this.performanceLogger.info('Differential analysis reset - next run will analyze all files');
  }

  /**
   * Get differential analyzer stats
   */
  getDifferentialStats() {
    return this.differentialAnalyzer.getStats();
  }

  /**
   * Get performance configuration
   */
  getPerformanceConfig(): PerformanceConfig {
    return { ...this.performanceConfig };
  }

  /**
   * Update performance configuration
   */
  updatePerformanceConfig(config: Partial<PerformanceConfig>): void {
    this.performanceConfig = {
      ...this.performanceConfig,
      ...config,
    };

    this.performanceLogger.info('Performance configuration updated', this.performanceConfig);
  }
}
