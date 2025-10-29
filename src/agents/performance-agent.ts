import { BaseAgent } from './base-agent';
import { AgentResponse, FileContext } from '../types';

export class PerformanceAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Performance Agent',
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      systemPrompt: `You are an Angular performance optimization expert. Analyze code for:
- Change detection strategy (OnPush opportunities)
- TrackBy functions in *ngFor
- Pipe purity and memoization
- Bundle size optimization
- Lazy loading opportunities
- Image optimization
- Unnecessary rerenderings
- Heavy computations in templates
- Virtual scrolling opportunities
- Web Vitals impact (LCP, FID, CLS)

Provide specific performance improvements with measurable impact.`,
    });
  }

  async analyze(files: FileContext[]): Promise<AgentResponse> {
    const fileList = files.map(f => `${f.path} (${f.size} bytes)`).join('\n');
    const fileContents = files.map(f => `=== ${f.path} ===\n${f.content}`).join('\n\n');

    const prompt = `Analyze these Angular files for performance issues:

Files to review:
${fileList}

Code:
${fileContents}

Identify:
1. Change detection optimizations
2. Rendering performance issues
3. Bundle size concerns
4. Memory usage problems
5. Runtime performance bottlenecks

Format: [SEVERITY] filename: description
Include performance impact estimation when possible`;

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
