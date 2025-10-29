// src/types/index.ts
export interface AgentConfig {
  name: string;
  role?: string;
  expertise?: string[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
  systemPrompt?: string; // For backward compatibility
}

export interface ReviewContext {
  fileName: string;
  fileContent: string;
  fileType: 'component' | 'service' | 'directive' | 'pipe' | 'module' | 'guard' | 'interceptor';
  projectContext?: string;
  relatedFiles?: Map<string, string>;
  metadata?: FileMetadata;
}

export interface FileMetadata {
  lines: number;
  complexity: number;
  imports: string[];
  exports: string[];
  classes: string[];
  methods: string[];
}

export interface ReviewFinding {
  severity: 'critical' | 'major' | 'minor' | 'info';
  category: string;
  file: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  message: string;
  suggestion?: string;
  codeSnippet?: string;
  rule?: string;
}

export interface AgentReview {
  agentName: string;
  timestamp: Date;
  findings: ReviewFinding[];
  metrics: ReviewMetrics;
  summary: string;
  recommendations: string[];
  fromCache?: boolean;
}

export interface ReviewMetrics {
  score: number;
  executionTime: number;
  tokensUsed: number;
  modelUsed: string;
  cacheHit: boolean;
}

export interface MultiAgentReport {
  reportId: string;
  timestamp: Date;
  filesReviewed: number;
  overallScore: number;
  criticalIssues: number;
  majorIssues: number;
  minorIssues: number;
  agentReviews: AgentReview[];
  consolidatedFindings: ReviewFinding[];
  executionTime: number;
  consensus: ConsensusReport;
  optimizations?: OptimizationMetrics;
}

export interface ConsensusReport {
  agreedIssues: AgreedIssue[];
  disputedIssues: ReviewFinding[];
  confidence: number;
}

export interface AgreedIssue extends ReviewFinding {
  agreedBy: string[];
  confidence: number;
}

export interface OptimizationMetrics {
  cacheHits: number;
  agentsSkipped: number;
  chunksProcessed?: number;
  modelsUsed: Record<string, number>;
  totalTokens: number;
  totalTokensSaved?: number;
  estimatedCost: number;
}

// Backward compatibility types
export interface FileContext {
  path: string;
  content: string;
  language: string;
  size: number;
}

export interface Issue {
  severity: 'critical' | 'warning' | 'info';
  file: string;
  line?: number;
  description: string;
  category: string;
}

export interface Suggestion {
  title: string;
  description: string;
  code?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AgentResponse {
  agentName: string;
  analysis: string;
  issues: Issue[];
  suggestions: Suggestion[];
  timestamp: Date;
  tokensUsed?: number;
}

export interface ReviewRequest {
  files: FileContext[];
  config: {
    parallel?: boolean;
    caching?: boolean;
  };
  prDescription?: string;
  changedLines?: number;
  branch?: string;
}

export interface OrchestratorResult {
  reviews: AgentReview[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    suggestions: number;
    filesAnalyzed: number;
    analysisTime: number;
  };
  metrics: OptimizationMetrics;
}

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: Date;
  ttl: number;
}

// Performance-related types
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

export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'unchanged';
  oldHash?: string;
  newHash?: string;
}

export interface StreamChunk {
  type: 'start' | 'content' | 'complete' | 'error';
  content?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  timestamp: number;
}

export interface PoolConfig {
  maxConnections?: number;
  connectionTimeout?: number;
  idleTimeout?: number;
  enableHttp2?: boolean;
}

export interface PoolStats {
  activeConnections: number;
  idleConnections: number;
  totalRequests: number;
  poolHits: number;
  poolMisses: number;
  avgResponseTime: number;
}

export interface PerformanceProfile {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryBefore?: NodeJS.MemoryUsage;
  memoryAfter?: NodeJS.MemoryUsage;
  memoryDelta?: {
    heapUsed: number;
    external: number;
    rss: number;
  };
  metadata?: Record<string, any>;
}