import { AgentOrchestrator } from './agent-orchestrator';
import { ReviewRequest, OrchestratorResult, OptimizationMetrics } from '../types';
import { CacheManager } from '../optimizers/cache-manager';
import { ChunkProcessor } from '../optimizers/chunk-processor';
import { AgentSelector } from '../optimizers/agent-selector';
import { PreAnalyzer } from '../optimizers/pre-analyzer';
import { RateLimiter } from '../optimizers/rate-limiter';
import { Deduplicator } from '../optimizers/deduplicator';
import { Logger } from '../utils/logger';

export class OptimizedOrchestrator extends AgentOrchestrator {
  private cacheManager: CacheManager;
  private chunkProcessor: ChunkProcessor;
  private agentSelector: AgentSelector;
  private preAnalyzer: PreAnalyzer;
  private rateLimiter: RateLimiter;
  private deduplicator: Deduplicator;
  private optimizerLogger: Logger;

  constructor(maxConcurrentAgents?: number) {
    // Pass concurrency limit to parent
    super(maxConcurrentAgents);
    this.optimizerLogger = new Logger('OptimizedOrchestrator');
    this.cacheManager = new CacheManager();
    this.chunkProcessor = new ChunkProcessor();
    this.agentSelector = new AgentSelector();
    this.preAnalyzer = new PreAnalyzer();
    this.rateLimiter = new RateLimiter();
    this.deduplicator = new Deduplicator();
  }

  async executeReview(request: ReviewRequest): Promise<OrchestratorResult> {
    const startTime = Date.now();
    const metrics: OptimizationMetrics = {
      cacheHits: 0,
      chunksProcessed: 0,
      agentsSkipped: 0,
      totalTokensSaved: 0,
      modelsUsed: {},
      totalTokens: 0,
      estimatedCost: 0
    };

    this.optimizerLogger.info('Starting optimized review');

    // Step 1: Pre-analysis to determine file types and complexity
    const analysisResult = await this.preAnalyzer.analyze(request.files);
    this.optimizerLogger.info(`Pre-analysis: ${analysisResult.fileTypes.join(', ')}`);

    // Step 2: Select relevant agents based on file types
    const relevantAgents = this.agentSelector.selectAgents(
      this.getAgentCount(),
      analysisResult
    );
    metrics.agentsSkipped = this.getAgentCount() - relevantAgents.length;
    this.optimizerLogger.info(`Selected ${relevantAgents.length} relevant agents`);

    // Step 3: Check cache for previously analyzed files
    const { cached, uncached } = await this.cacheManager.checkCache(
      request.files
    );
    metrics.cacheHits = cached.length;

    if (cached.length > 0) {
      this.optimizerLogger.info(`Cache hit for ${cached.length} files`);
    }

    // Step 4: Chunk large files if needed
    const chunks = this.chunkProcessor.process(uncached);
    metrics.chunksProcessed = chunks.length;

    // Step 5: Deduplicate similar code blocks
    const dedupedChunks = await this.deduplicator.deduplicate(chunks);

    // Step 6: Rate limiting
    await this.rateLimiter.waitIfNeeded();

    // Step 7: Execute review with optimizations
    const result = await super.executeReview({
      ...request,
      files: dedupedChunks,
    });

    // Step 8: Merge cached results
    // (Implementation would merge cached analysis results here)

    const executionTime = Date.now() - startTime;

    this.optimizerLogger.info(
      `Optimized review completed in ${executionTime}ms with ${metrics.cacheHits} cache hits`
    );

    // Merge metrics from parent with optimization metrics
    return {
      ...result,
      summary: {
        ...result.summary,
        analysisTime: executionTime,
      },
      metrics: {
        ...result.metrics,
        ...metrics,
      },
    };
  }

  async clearCache(): Promise<void> {
    await this.cacheManager.clear();
    this.optimizerLogger.info('Cache cleared');
  }

  getCacheStats(): any {
    return this.cacheManager.getStats();
  }
}
