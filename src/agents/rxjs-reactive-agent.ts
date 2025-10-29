import { BaseAgent } from './base-agent';
import { AgentResponse, FileContext } from '../types';

export class RxJSReactiveAgent extends BaseAgent {
  constructor() {
    super({
      name: 'RxJS Reactive Agent',
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      systemPrompt: `You are an RxJS and reactive programming expert. Analyze code for:
- Observable patterns and anti-patterns
- Subscription management and memory leaks
- Operator usage and optimization
- Subject usage (BehaviorSubject, ReplaySubject, etc.)
- Async pipe usage
- Error handling in streams
- Backpressure and performance
- Reactive state management
- Hot vs Cold observables

Identify memory leaks, inefficient operators, and missed reactive opportunities.`,
    });
  }

  async analyze(files: FileContext[]): Promise<AgentResponse> {
    const fileList = files.map(f => `${f.path} (${f.size} bytes)`).join('\n');
    const fileContents = files.map(f => `=== ${f.path} ===\n${f.content}`).join('\n\n');

    const prompt = `Analyze these files for RxJS and reactive programming issues:

Files to review:
${fileList}

Code:
${fileContents}

Focus on:
1. Memory leaks from unsubscribed observables
2. Inefficient operator chains
3. Missing async pipes
4. Improper Subject usage
5. Error handling gaps

Format: [SEVERITY] filename: description for issues
Use ### Title format for suggestions`;

    const analysis = await this.callClaude(prompt);

    return {
      agentName: this.config.name,
      analysis,
      issues: this.parseIssues(analysis),
      suggestions: this.parseSuggestions(analysis),
      timestamp: new Date(),
    };
  }
}
