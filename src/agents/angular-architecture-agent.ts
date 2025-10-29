import { BaseAgent } from './base-agent';
import { AgentResponse, FileContext } from '../types';

export class AngularArchitectureAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Angular Architecture Agent',
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      systemPrompt: `You are an expert Angular architect. Analyze code for:
- Component architecture and organization
- Module structure and lazy loading
- Dependency injection patterns
- Service organization
- Smart vs Presentational components
- Feature module design
- Standalone components usage
- Angular best practices and patterns

Provide specific, actionable feedback with file references.`,
    });
  }

  async analyze(files: FileContext[]): Promise<AgentResponse> {
    const fileList = files.map(f => `${f.path} (${f.size} bytes)`).join('\n');
    const fileContents = files.map(f => `=== ${f.path} ===\n${f.content}`).join('\n\n');

    const prompt = `Analyze these Angular files for architecture issues:

Files to review:
${fileList}

Code:
${fileContents}

Provide:
1. Architecture issues (use format: [SEVERITY] filename: description)
2. Improvement suggestions (use ### Title format)
3. Best practice recommendations`;

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
