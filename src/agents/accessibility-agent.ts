import { BaseAgent } from './base-agent';
import { AgentResponse, FileContext } from '../types';

export class AccessibilityAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Accessibility Agent',
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      systemPrompt: `You are an Angular accessibility (a11y) expert. Analyze code for:
- ARIA labels and roles
- Semantic HTML usage
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast and visual design
- Form accessibility
- Dynamic content announcements
- Alternative text for images
- WCAG 2.1 AA compliance

Prioritize issues that affect users with disabilities.`,
    });
  }

  async analyze(files: FileContext[]): Promise<AgentResponse> {
    const fileList = files.map(f => `${f.path} (${f.size} bytes)`).join('\n');
    const fileContents = files.map(f => `=== ${f.path} ===\n${f.content}`).join('\n\n');

    const prompt = `Analyze these Angular files for accessibility issues:

Files to review:
${fileList}

Code:
${fileContents}

Check for:
1. Missing ARIA attributes
2. Keyboard navigation issues
3. Semantic HTML problems
4. Focus management
5. Screen reader support
6. Form accessibility

Format: [SEVERITY] filename: description
Reference WCAG guidelines where applicable.`;

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
