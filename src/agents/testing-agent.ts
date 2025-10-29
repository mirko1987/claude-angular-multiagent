import { BaseAgent } from './base-agent';
import { AgentResponse, FileContext } from '../types';

export class TestingAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Testing Agent',
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      systemPrompt: `You are an Angular testing expert. Analyze code for:
- Test coverage and completeness
- TestBed configuration
- Mock and spy usage
- Async testing patterns
- Component testing best practices
- Service testing
- Integration test opportunities
- E2E test coverage
- Test maintainability
- Testing anti-patterns

Suggest specific tests that should be added or improved.`,
    });
  }

  async analyze(files: FileContext[]): Promise<AgentResponse> {
    const fileList = files.map(f => `${f.path} (${f.size} bytes)`).join('\n');
    const fileContents = files.map(f => `=== ${f.path} ===\n${f.content}`).join('\n\n');

    const prompt = `Analyze testing quality and coverage for these Angular files:

Files to review:
${fileList}

Code:
${fileContents}

Evaluate:
1. Missing test cases
2. Test quality issues
3. Mock/spy improvements
4. Async testing problems
5. Test maintainability

Format: [SEVERITY] filename: description
Suggest specific test cases to add.`;

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
