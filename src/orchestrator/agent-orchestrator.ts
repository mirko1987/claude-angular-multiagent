import { BaseAgent } from '../agents/base-agent';
import { ReviewRequest, OrchestratorResult, AgentResponse, AgentReview, OptimizationMetrics } from '../types';
import { Logger } from '../utils/logger';
import pLimit from 'p-limit';

export class AgentOrchestrator {
  private agents: BaseAgent[] = [];
  private logger: Logger;
  private concurrencyLimit: number;

  constructor(maxConcurrentAgents?: number) {
    this.logger = new Logger('AgentOrchestrator');
    // Use environment variable or parameter, default to 3 for safety
    this.concurrencyLimit = maxConcurrentAgents ||
                            parseInt(process.env.MAX_CONCURRENT_AGENTS || '3');
    this.logger.info(`Concurrency limit set to ${this.concurrencyLimit} agents`);
  }

  registerAgent(agent: BaseAgent): void {
    this.agents.push(agent);
    this.logger.info(`Registered agent: ${agent.getName()}`);
  }

  registerAgents(agents: BaseAgent[]): void {
    agents.forEach(agent => this.registerAgent(agent));
  }

  async executeReview(request: ReviewRequest): Promise<OrchestratorResult> {
    const startTime = Date.now();
    this.logger.info(`Starting review with ${this.agents.length} agents (max ${this.concurrencyLimit} concurrent)`);

    const agentResponses: AgentResponse[] = [];

    // Execute agents with concurrency control
    const limit = pLimit(this.concurrencyLimit);

    const promises = this.agents.map(agent =>
      limit(() => this.executeAgent(agent, request.files))
    );

    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        agentResponses.push(result.value);
      } else {
        this.logger.error(
          `Agent ${this.agents[index].getName()} failed:`,
          result.reason
        );
      }
    });

    const executionTime = Date.now() - startTime;

    const totalIssues = agentResponses.reduce(
      (sum, response) => sum + response.issues.length,
      0
    );

    const criticalIssues = agentResponses.reduce(
      (sum, response) => sum + response.issues.filter(i => i.severity === 'critical').length,
      0
    );

    const totalSuggestions = agentResponses.reduce(
      (sum, response) => sum + response.suggestions.length,
      0
    );

    this.logger.info(
      `Review completed in ${executionTime}ms. Found ${totalIssues} issues and ${totalSuggestions} suggestions`
    );

    // Convert AgentResponse[] to AgentReview[]
    const reviews: AgentReview[] = agentResponses.map(response => ({
      agentName: response.agentName,
      timestamp: response.timestamp,
      findings: response.issues.map(issue => ({
        severity: issue.severity === 'critical' ? 'critical' as const :
                  issue.severity === 'warning' ? 'major' as const : 'minor' as const,
        category: issue.category,
        file: issue.file,
        line: issue.line,
        message: issue.description,
      })),
      metrics: {
        score: 100 - (response.issues.filter(i => i.severity === 'critical').length * 20),
        executionTime: 0, // Not tracked in AgentResponse
        tokensUsed: response.tokensUsed || 0,
        modelUsed: 'claude-sonnet-4-20250514',
        cacheHit: false,
      },
      summary: response.analysis,
      recommendations: response.suggestions.map(s => s.title),
    }));

    const metrics: OptimizationMetrics = {
      cacheHits: 0,
      agentsSkipped: 0,
      modelsUsed: { 'claude-sonnet-4-20250514': this.agents.length },
      totalTokens: agentResponses.reduce((sum, r) => sum + (r.tokensUsed || 0), 0),
      estimatedCost: 0,
    };

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

  private async executeAgent(
    agent: BaseAgent,
    files: any[]
  ): Promise<AgentResponse> {
    this.logger.info(`Executing ${agent.getName()}`);
    const response = await agent.analyze(files);
    this.logger.info(
      `${agent.getName()} completed: ${response.issues.length} issues, ${response.suggestions.length} suggestions`
    );
    return response;
  }

  private generateSummary(responses: AgentResponse[]): string {
    const criticalIssues = responses.flatMap(r =>
      r.issues.filter(i => i.severity === 'critical')
    );

    const warnings = responses.flatMap(r =>
      r.issues.filter(i => i.severity === 'warning')
    );

    let summary = `# Code Review Summary\n\n`;
    summary += `**Agents Run:** ${responses.length}\n`;
    summary += `**Critical Issues:** ${criticalIssues.length}\n`;
    summary += `**Warnings:** ${warnings.length}\n\n`;

    if (criticalIssues.length > 0) {
      summary += `## Critical Issues\n\n`;
      criticalIssues.forEach(issue => {
        summary += `- **${issue.file}**: ${issue.description}\n`;
      });
      summary += `\n`;
    }

    return summary;
  }

  getAgentCount(): number {
    return this.agents.length;
  }
}
