import { BaseAgent } from './base-agent';
import { AgentResponse, FileContext } from '../types';

export class SecurityAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Security Agent',
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      systemPrompt: `You are an Angular security expert. Analyze code for:
- XSS vulnerabilities (innerHTML, bypassSecurityTrust)
- CSRF protection
- Authentication and authorization issues
- Sensitive data exposure
- Insecure HTTP calls
- Input validation and sanitization
- Dependency vulnerabilities
- Security headers
- Token storage and handling
- API security practices

Flag critical security issues immediately.`,
    });
  }

  async analyze(files: FileContext[]): Promise<AgentResponse> {
    const fileList = files.map(f => `${f.path} (${f.size} bytes)`).join('\n');
    const fileContents = files.map(f => `=== ${f.path} ===\n${f.content}`).join('\n\n');

    const prompt = `Perform security analysis on these Angular files:

Files to review:
${fileList}

Code:
${fileContents}

Check for:
1. XSS vulnerabilities
2. Authentication/Authorization flaws
3. Data exposure risks
4. Insecure API calls
5. Input validation issues
6. Dependency security

Mark critical issues with [CRITICAL] severity.
Format: [SEVERITY] filename: description`;

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
