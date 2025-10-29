import 'dotenv/config';
import { OptimizedOrchestrator } from './orchestrator/optimized-orchestrator';
import { AngularArchitectureAgent } from './agents/angular-architecture-agent';
import { RxJSReactiveAgent } from './agents/rxjs-reactive-agent';
import { PerformanceAgent } from './agents/performance-agent';
import { SecurityAgent } from './agents/security-agent';
import { TestingAgent } from './agents/testing-agent';
import { AccessibilityAgent } from './agents/accessibility-agent';
import { FileAnalyzer } from './utils/file-analyzer';
import { ReportGenerator } from './formatters/report-generator';
import { GitHubCommentFormatter } from './formatters/github-comment-formatter';
import { Logger } from './utils/logger';

export class AngularMultiAgent {
  private orchestrator: OptimizedOrchestrator;
  private fileAnalyzer: FileAnalyzer;
  private reportGenerator: ReportGenerator;
  private githubFormatter: GitHubCommentFormatter;
  private logger: Logger;

  constructor(maxConcurrentAgents?: number) {
    this.logger = new Logger('AngularMultiAgent');
    this.orchestrator = new OptimizedOrchestrator(maxConcurrentAgents);
    this.fileAnalyzer = new FileAnalyzer();
    this.reportGenerator = new ReportGenerator();
    this.githubFormatter = new GitHubCommentFormatter();

    this.initializeAgents();
  }

  private initializeAgents(): void {
    this.logger.info('Initializing agents...');

    this.orchestrator.registerAgents([
      new AngularArchitectureAgent(),
      new RxJSReactiveAgent(),
      new PerformanceAgent(),
      new SecurityAgent(),
      new TestingAgent(),
      new AccessibilityAgent(),
    ]);

    this.logger.info(
      `Initialized ${this.orchestrator.getAgentCount()} agents`
    );
  }

  async reviewDirectory(dirPath: string): Promise<string> {
    this.logger.info(`Starting review of directory: ${dirPath}`);

    const files = await this.fileAnalyzer.analyzeDirectory(dirPath);
    this.logger.info(
      `Found ${files.length} files (${this.fileAnalyzer.getTotalSize(files)} bytes)`
    );

    const result = await this.orchestrator.executeReview({
      files,
      config: { parallel: true, caching: true }
    });

    return this.reportGenerator.generateMarkdown(result);
  }

  async reviewFiles(filePaths: string[]): Promise<string> {
    this.logger.info(`Starting review of ${filePaths.length} files`);

    const files = await this.fileAnalyzer.analyzeFiles(filePaths);

    const result = await this.orchestrator.executeReview({
      files,
      config: { parallel: true, caching: true }
    });

    return this.reportGenerator.generateMarkdown(result);
  }

  async reviewForGitHub(filePaths: string[]): Promise<string> {
    this.logger.info(
      `Starting GitHub PR review of ${filePaths.length} files`
    );

    const files = await this.fileAnalyzer.analyzeFiles(filePaths);

    const result = await this.orchestrator.executeReview({
      files,
      config: { parallel: true, caching: true }
    });

    return this.githubFormatter.formatPRComment(result);
  }
}

// CLI Example
async function main() {
  const multiAgent = new AngularMultiAgent();

  // Example: Review a directory
  const targetDir = process.argv[2] || './src';

  try {
    const report = await multiAgent.reviewDirectory(targetDir);
    console.log(report);
  } catch (error) {
    console.error('Error during review:', error);
    process.exit(1);
  }
}

// Export for library usage
export * from './types';
export * from './agents/base-agent';
export * from './orchestrator/agent-orchestrator';
export * from './orchestrator/optimized-orchestrator';
export * from './formatters/report-generator';
export * from './formatters/github-comment-formatter';

// Run if called directly
if (require.main === module) {
  main();
}
