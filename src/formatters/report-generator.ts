import { OrchestratorResult, AgentReview, ReviewFinding } from '../types';

export class ReportGenerator {
  generateMarkdown(result: OrchestratorResult): string {
    let report = `# Angular Code Review Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Execution Time:** ${result.summary.analysisTime}ms\n`;
    report += `**Total Issues:** ${result.summary.totalIssues}\n`;
    report += `**Total Suggestions:** ${result.summary.suggestions}\n\n`;

    if (result.metrics) {
      report += `## Optimizations\n\n`;
      report += `- Cache Hits: ${result.metrics.cacheHits}\n`;
      report += `- Chunks Processed: ${result.metrics.chunksProcessed || 0}\n`;
      report += `- Agents Skipped: ${result.metrics.agentsSkipped}\n`;
      report += `- Tokens Saved: ${result.metrics.totalTokensSaved || 0}\n\n`;
    }

    report += `---\n\n`;

    // Group issues by severity
    const criticalIssues: ReviewFinding[] = [];
    const majorIssues: ReviewFinding[] = [];
    const minorIssues: ReviewFinding[] = [];

    result.reviews.forEach(review => {
      review.findings.forEach(finding => {
        switch (finding.severity) {
          case 'critical':
            criticalIssues.push(finding);
            break;
          case 'major':
            majorIssues.push(finding);
            break;
          case 'minor':
          case 'info':
            minorIssues.push(finding);
            break;
        }
      });
    });

    if (criticalIssues.length > 0) {
      report += `## 🔴 Critical Issues (${criticalIssues.length})\n\n`;
      criticalIssues.forEach(finding => {
        report += this.formatFinding(finding);
      });
      report += `\n`;
    }

    if (majorIssues.length > 0) {
      report += `## 🟡 Major Issues (${majorIssues.length})\n\n`;
      majorIssues.forEach(finding => {
        report += this.formatFinding(finding);
      });
      report += `\n`;
    }

    if (minorIssues.length > 0) {
      report += `## 🔵 Minor Issues (${minorIssues.length})\n\n`;
      minorIssues.forEach(finding => {
        report += this.formatFinding(finding);
      });
      report += `\n`;
    }

    // Agent-specific sections
    report += `## Agent Detailed Reports\n\n`;
    result.reviews.forEach(review => {
      report += this.formatAgentReview(review);
    });

    return report;
  }

  generateHTML(result: OrchestratorResult): string {
    const markdown = this.generateMarkdown(result);

    // Simple HTML wrapper (in production, use a proper markdown-to-html converter)
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Code Review Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #333; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .issue {
      padding: 15px;
      margin: 10px 0;
      border-left: 4px solid #ccc;
      background: #f9f9f9;
    }
    .critical { border-left-color: #dc3545; }
    .warning { border-left-color: #ffc107; }
    .info { border-left-color: #17a2b8; }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <pre>${markdown}</pre>
  </div>
</body>
</html>`;
  }

  generateJSON(result: OrchestratorResult): string {
    return JSON.stringify(result, null, 2);
  }

  private formatFinding(finding: ReviewFinding): string {
    let formatted = `### ${finding.file}`;
    if (finding.line) {
      formatted += `:${finding.line}`;
    }
    formatted += `\n\n`;
    formatted += `**Category:** ${finding.category}\n`;
    formatted += `**Message:** ${finding.message}\n`;
    if (finding.suggestion) {
      formatted += `**Suggestion:** ${finding.suggestion}\n`;
    }
    formatted += `\n`;
    return formatted;
  }

  private formatAgentReview(review: AgentReview): string {
    let formatted = `### ${review.agentName}\n\n`;
    formatted += `**Findings:** ${review.findings.length}\n`;
    formatted += `**Recommendations:** ${review.recommendations.length}\n`;
    formatted += `**Score:** ${review.metrics.score}\n`;
    formatted += `**Tokens Used:** ${review.metrics.tokensUsed}\n`;
    formatted += `**Execution Time:** ${review.metrics.executionTime}ms\n`;

    formatted += `\n${review.summary}\n\n`;

    if (review.recommendations.length > 0) {
      formatted += `#### Recommendations\n\n`;
      review.recommendations.forEach(recommendation => {
        formatted += `- ${recommendation}\n`;
      });
      formatted += `\n`;
    }

    formatted += `---\n\n`;
    return formatted;
  }
}
