import { OrchestratorResult, Issue, ReviewFinding } from '../types';

export class GitHubCommentFormatter {
  formatPRComment(result: OrchestratorResult): string {
    let comment = `## 🤖 AI Code Review\n\n`;

    // Summary stats
    comment += `| Metric | Value |\n`;
    comment += `|--------|-------|\n`;
    comment += `| ⏱️ Execution Time | ${result.summary.analysisTime}ms |\n`;
    comment += `| 🔍 Agents Run | ${result.reviews.length} |\n`;
    comment += `| 🐛 Total Issues | ${result.summary.totalIssues} |\n`;
    comment += `| 💡 Suggestions | ${result.summary.suggestions} |\n\n`;

    // Critical issues first
    const criticalIssues = this.getCriticalIssues(result);
    if (criticalIssues.length > 0) {
      comment += `### 🔴 Critical Issues (${criticalIssues.length})\n\n`;
      criticalIssues.forEach(issue => {
        comment += this.formatIssueForGitHub(issue);
      });
      comment += `\n`;
    }

    // Warnings
    const warnings = this.getWarnings(result);
    if (warnings.length > 0 && warnings.length <= 10) {
      comment += `### 🟡 Warnings (${warnings.length})\n\n`;
      warnings.forEach(issue => {
        comment += this.formatIssueForGitHub(issue);
      });
      comment += `\n`;
    } else if (warnings.length > 10) {
      comment += `### 🟡 Warnings (${warnings.length})\n\n`;
      comment += `<details>\n<summary>Click to expand warnings</summary>\n\n`;
      warnings.forEach(issue => {
        comment += this.formatIssueForGitHub(issue);
      });
      comment += `\n</details>\n\n`;
    }

    // Agent summaries (collapsed)
    comment += `### 📊 Agent Reports\n\n`;
    result.reviews.forEach(review => {
      const issueCount = review.findings.length;
      const suggestionCount = review.recommendations.length;

      comment += `<details>\n`;
      comment += `<summary><strong>${review.agentName}</strong> - ${issueCount} findings, ${suggestionCount} recommendations</summary>\n\n`;
      comment += `${this.truncateText(review.summary, 1000)}\n\n`;

      if (review.recommendations.length > 0) {
        comment += `#### Top Recommendations:\n\n`;
        review.recommendations.slice(0, 3).forEach(recommendation => {
          comment += `- ${recommendation}\n`;
        });
      }

      comment += `\n</details>\n\n`;
    });

    // Optimizations footer
    if (result.metrics) {
      comment += `---\n\n`;
      comment += `<sub>`;
      comment += `Cache hits: ${result.metrics.cacheHits} | `;
      comment += `Chunks: ${result.metrics.chunksProcessed || 0} | `;
      comment += `Optimizations: ${result.metrics.agentsSkipped} agents skipped`;
      comment += `</sub>\n`;
    }

    return comment;
  }

  formatInlineComment(issue: Issue): {
    path: string;
    line: number;
    body: string;
  } | null {
    if (!issue.line) {
      return null;
    }

    const severityEmoji = {
      critical: '🔴',
      warning: '🟡',
      info: '🔵',
    };

    return {
      path: issue.file,
      line: issue.line,
      body: `${severityEmoji[issue.severity]} **${issue.category}**\n\n${issue.description}`,
    };
  }

  private getCriticalIssues(result: OrchestratorResult): ReviewFinding[] {
    return result.reviews.flatMap(review =>
      review.findings.filter(f => f.severity === 'critical')
    );
  }

  private getWarnings(result: OrchestratorResult): ReviewFinding[] {
    return result.reviews.flatMap(review =>
      review.findings.filter(f => f.severity === 'major')
    );
  }

  private formatIssueForGitHub(finding: ReviewFinding): string {
    let formatted = `- **\`${finding.file}`;
    if (finding.line) {
      formatted += `:${finding.line}`;
    }
    formatted += `\`** - ${finding.message}\n`;
    return formatted;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength) + '...\n\n*[Truncated for brevity]*';
  }
}
