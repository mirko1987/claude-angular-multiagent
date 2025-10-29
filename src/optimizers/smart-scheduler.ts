// src/optimizers/smart-scheduler.ts
import { BaseAgent } from '../agents/base-agent';
import { FileContext, AgentResponse } from '../types';
import { Logger } from '../utils/logger';
import pLimit from 'p-limit';

export interface AgentPriority {
  agent: BaseAgent;
  priority: number;
  estimatedCost: number;
  estimatedTime: number;
  model: 'haiku' | 'sonnet-3.5' | 'sonnet-4';
}

export interface SchedulerConfig {
  maxConcurrent?: number;
  costBudget?: number;
  timeBudget?: number;
  enableEarlyStop?: boolean;
  prioritizeSpeed?: boolean;
  prioritizeCost?: boolean;
}

export class SmartScheduler {
  private logger: Logger;
  private config: SchedulerConfig;

  constructor(config: SchedulerConfig = {}) {
    this.logger = new Logger('SmartScheduler');
    this.config = {
      maxConcurrent: config.maxConcurrent || parseInt(process.env.MAX_CONCURRENT_AGENTS || '3'),
      costBudget: config.costBudget || 1.0, // $1 default
      timeBudget: config.timeBudget || 120000, // 2 minutes
      enableEarlyStop: config.enableEarlyStop ?? true,
      prioritizeSpeed: config.prioritizeSpeed ?? false,
      prioritizeCost: config.prioritizeCost ?? true, // Default: optimize for cost
    };
  }

  /**
   * Prioritize agents based on multiple factors
   */
  prioritizeAgents(
    agents: BaseAgent[],
    files: FileContext[]
  ): AgentPriority[] {
    const priorities: AgentPriority[] = [];

    for (const agent of agents) {
      const agentName = agent.getName();
      let priority = 50; // Base priority

      // Critical agents get highest priority
      if (agentName.includes('Security')) {
        priority += 50; // Priority: 100
      } else if (agentName.includes('Architecture')) {
        priority += 30; // Priority: 80
      } else if (agentName.includes('Performance')) {
        priority += 20; // Priority: 70
      } else if (agentName.includes('Testing')) {
        priority += 10; // Priority: 60
      }

      // Estimate cost and time based on file complexity
      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      const complexity = this.estimateComplexity(files);

      let model: 'haiku' | 'sonnet-3.5' | 'sonnet-4' = 'sonnet-4';
      let estimatedCost = 0;
      let estimatedTime = 0;

      // Cost estimation (per million tokens)
      if (complexity < 20 && totalSize < 5000) {
        model = 'haiku';
        estimatedCost = (totalSize / 4 / 1000000) * 0.25; // Haiku input cost
        estimatedTime = 3000; // ~3s
        priority += 10; // Fast agents go first if prioritizing speed
      } else if (complexity < 50 && totalSize < 20000) {
        model = 'sonnet-3.5';
        estimatedCost = (totalSize / 4 / 1000000) * 3.0;
        estimatedTime = 8000; // ~8s
      } else {
        model = 'sonnet-4';
        estimatedCost = (totalSize / 4 / 1000000) * 3.0;
        estimatedTime = 12000; // ~12s
      }

      priorities.push({
        agent,
        priority,
        estimatedCost,
        estimatedTime,
        model,
      });
    }

    // Sort by priority (highest first)
    return priorities.sort((a, b) => {
      if (this.config.prioritizeSpeed) {
        // Speed priority: fast agents first
        return a.estimatedTime - b.estimatedTime;
      } else if (this.config.prioritizeCost) {
        // Cost priority: cheap agents first, but critical agents always first
        if (Math.abs(a.priority - b.priority) > 20) {
          return b.priority - a.priority; // Critical agents first
        }
        return a.estimatedCost - b.estimatedCost; // Then by cost
      } else {
        // Default: by priority
        return b.priority - a.priority;
      }
    });
  }

  /**
   * Execute agents with intelligent scheduling
   */
  async executeIntelligent(
    agents: BaseAgent[],
    files: FileContext[]
  ): Promise<{
    responses: AgentResponse[];
    metrics: {
      totalCost: number;
      totalTime: number;
      agentsExecuted: number;
      agentsSkipped: number;
      earlyStop: boolean;
    };
  }> {
    const startTime = Date.now();
    const prioritized = this.prioritizeAgents(agents, files);

    this.logger.info(`Executing ${prioritized.length} agents with intelligent scheduling`);
    this.logger.info(`Config: maxConcurrent=${this.config.maxConcurrent}, costBudget=$${this.config.costBudget}, timeBudget=${this.config.timeBudget}ms`);

    // Log execution plan
    prioritized.forEach((p, i) => {
      this.logger.info(
        `[${i + 1}] ${p.agent.getName()} - Priority: ${p.priority}, Model: ${p.model}, Est. Cost: $${p.estimatedCost.toFixed(4)}, Est. Time: ${p.estimatedTime}ms`
      );
    });

    const responses: AgentResponse[] = [];
    let totalCost = 0;
    let agentsExecuted = 0;
    let agentsSkipped = 0;
    let earlyStop = false;

    // Adaptive concurrency based on remaining budget
    const adaptiveConcurrency = this.calculateAdaptiveConcurrency(
      prioritized,
      this.config.costBudget!
    );

    const limit = pLimit(adaptiveConcurrency);

    // Execute in waves based on priority tiers
    const waves = this.createExecutionWaves(prioritized);

    for (const wave of waves) {
      this.logger.info(`Executing wave with ${wave.length} agents (concurrency: ${adaptiveConcurrency})`);

      const wavePromises = wave.map(p =>
        limit(async () => {
          // Check budget before executing
          if (totalCost >= this.config.costBudget!) {
            this.logger.warn(`Cost budget exceeded, skipping ${p.agent.getName()}`);
            agentsSkipped++;
            return null;
          }

          const timeElapsed = Date.now() - startTime;
          if (timeElapsed >= this.config.timeBudget!) {
            this.logger.warn(`Time budget exceeded, skipping ${p.agent.getName()}`);
            agentsSkipped++;
            return null;
          }

          try {
            this.logger.info(`⚡ Executing ${p.agent.getName()} with ${p.model}`);
            const agentStart = Date.now();

            const response = await p.agent.analyze(files);

            const agentTime = Date.now() - agentStart;
            totalCost += p.estimatedCost;
            agentsExecuted++;

            this.logger.info(
              `✅ ${p.agent.getName()} completed in ${agentTime}ms - Issues: ${response.issues.length}, Cost: $${p.estimatedCost.toFixed(4)}`
            );

            return response;
          } catch (error) {
            this.logger.error(`❌ ${p.agent.getName()} failed:`, error);
            return null;
          }
        })
      );

      const waveResults = await Promise.allSettled(wavePromises);

      // Collect results
      for (const result of waveResults) {
        if (result.status === 'fulfilled' && result.value) {
          responses.push(result.value);

          // Early stop if critical issues found
          if (this.config.enableEarlyStop) {
            const criticalIssues = result.value.issues.filter(
              i => i.severity === 'critical'
            );

            if (criticalIssues.length >= 3) {
              this.logger.warn(
                `🛑 Early stop: Found ${criticalIssues.length} critical issues. Skipping remaining agents.`
              );
              earlyStop = true;
              agentsSkipped = prioritized.length - agentsExecuted;
              break;
            }
          }
        }
      }

      if (earlyStop) break;
    }

    const totalTime = Date.now() - startTime;

    this.logger.info(
      `Execution completed: ${agentsExecuted} executed, ${agentsSkipped} skipped, Total cost: $${totalCost.toFixed(4)}, Time: ${totalTime}ms`
    );

    return {
      responses,
      metrics: {
        totalCost,
        totalTime,
        agentsExecuted,
        agentsSkipped,
        earlyStop,
      },
    };
  }

  /**
   * Create execution waves based on priority tiers
   */
  private createExecutionWaves(prioritized: AgentPriority[]): AgentPriority[][] {
    const waves: AgentPriority[][] = [];

    // Critical tier (priority >= 90)
    const critical = prioritized.filter(p => p.priority >= 90);
    if (critical.length > 0) waves.push(critical);

    // High tier (priority 70-89)
    const high = prioritized.filter(p => p.priority >= 70 && p.priority < 90);
    if (high.length > 0) waves.push(high);

    // Medium tier (priority 50-69)
    const medium = prioritized.filter(p => p.priority >= 50 && p.priority < 70);
    if (medium.length > 0) waves.push(medium);

    // Low tier (priority < 50)
    const low = prioritized.filter(p => p.priority < 50);
    if (low.length > 0) waves.push(low);

    return waves;
  }

  /**
   * Calculate adaptive concurrency based on budget
   */
  private calculateAdaptiveConcurrency(
    prioritized: AgentPriority[],
    costBudget: number
  ): number {
    const avgCost = prioritized.reduce((sum, p) => sum + p.estimatedCost, 0) / prioritized.length;

    // If we can afford all agents at once, use max concurrency
    if (avgCost * this.config.maxConcurrent! <= costBudget) {
      return this.config.maxConcurrent!;
    }

    // Otherwise, limit concurrency to stay within budget
    const safeConcurrency = Math.floor(costBudget / avgCost);
    return Math.max(1, Math.min(safeConcurrency, this.config.maxConcurrent!));
  }

  /**
   * Estimate file complexity
   */
  private estimateComplexity(files: FileContext[]): number {
    const totalLines = files.reduce(
      (sum, f) => sum + f.content.split('\n').length,
      0
    );
    const avgLines = totalLines / files.length;

    // Simple heuristic
    if (avgLines < 100) return 10;
    if (avgLines < 300) return 30;
    if (avgLines < 500) return 50;
    return 80;
  }
}
