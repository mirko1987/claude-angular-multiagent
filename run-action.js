#!/usr/bin/env node
// run-action.js - GitHub Action runner script
require('dotenv').config();

const { SecurityAgent } = require('./dist/agents/security-agent');
const { AngularArchitectureAgent } = require('./dist/agents/angular-architecture-agent');
const { PerformanceAgent } = require('./dist/agents/performance-agent');
const { RxJSAgent } = require('./dist/agents/rxjs-agent');
const { TestingAgent } = require('./dist/agents/testing-agent');
const { AccessibilityAgent } = require('./dist/agents/accessibility-agent');
const { PerformanceOrchestrator } = require('./dist/orchestrator/performance-orchestrator');
const { FileAnalyzer } = require('./dist/utils/file-analyzer');
const glob = require('glob');
const fs = require('fs');
const path = require('path');

async function runAction() {
  try {
    // Get configuration from environment variables
    const targetDir = process.argv[2] || process.cwd();
    const filesPattern = process.argv[3] || process.env.FILES_PATTERN || 'src/**/*.ts';
    const reviewMode = process.env.REVIEW_MODE || 'smart';
    const costBudget = parseFloat(process.env.COST_BUDGET || '0.50');
    const timeBudget = parseInt(process.env.TIME_BUDGET || '90000');
    const maxConcurrent = parseInt(process.env.MAX_CONCURRENT_AGENTS || '6');
    const enableCaching = process.env.ENABLE_CACHING !== 'false';
    const enableStreaming = process.env.ENABLE_STREAMING === 'true';
    const enableDifferential = process.env.ENABLE_DIFFERENTIAL !== 'false';

    // Verify API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error(JSON.stringify({
        error: 'ANTHROPIC_API_KEY not found',
        summary: { totalIssues: 0, criticalIssues: 0, suggestions: 0, filesAnalyzed: 0, analysisTime: 0 },
        metrics: { estimatedCost: 0 },
        reviews: []
      }));
      process.exit(1);
    }

    // Create agents based on review mode
    let agents = [];

    switch (reviewMode) {
      case 'security':
        agents = [new SecurityAgent()];
        break;
      case 'architecture':
        agents = [new AngularArchitectureAgent()];
        break;
      case 'performance':
        agents = [new PerformanceAgent()];
        break;
      case 'critical':
        agents = [
          new SecurityAgent(),
          new AngularArchitectureAgent(),
        ];
        break;
      case 'cost':
        agents = [
          new SecurityAgent(),
          new AngularArchitectureAgent(),
        ];
        break;
      case 'speed':
        agents = [
          new SecurityAgent(),
          new PerformanceAgent(),
        ];
        break;
      case 'all':
        agents = [
          new SecurityAgent(),
          new AngularArchitectureAgent(),
          new PerformanceAgent(),
          new RxJSAgent(),
          new TestingAgent(),
          new AccessibilityAgent(),
        ];
        break;
      case 'smart':
      default:
        // Smart mode - let orchestrator choose
        agents = [
          new SecurityAgent(),
          new AngularArchitectureAgent(),
          new PerformanceAgent(),
        ];
        break;
    }

    // Create orchestrator
    const orchestrator = new PerformanceOrchestrator(agents, {
      costBudget,
      timeBudget,
      maxConcurrent,
      enableStreaming,
      enableDifferentialAnalysis: enableDifferential,
      enableSmartSelection: reviewMode === 'smart',
      enableEarlyStop: reviewMode === 'smart',
      enableCaching,
      prioritizeCost: reviewMode === 'cost',
      prioritizeSpeed: reviewMode === 'speed',
    });

    // Find files to review
    const filePattern = path.join(targetDir, filesPattern);
    const filePaths = glob.sync(filePattern, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.spec.ts', '**/*.test.ts']
    });

    if (filePaths.length === 0) {
      console.error(JSON.stringify({
        error: 'No files found matching pattern: ' + filesPattern,
        summary: { totalIssues: 0, criticalIssues: 0, suggestions: 0, filesAnalyzed: 0, analysisTime: 0 },
        metrics: { estimatedCost: 0 },
        reviews: []
      }));
      process.exit(1);
    }

    // Read files
    const files = filePaths.map(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(targetDir, filePath);

      return {
        path: relativePath,
        content,
        language: 'typescript',
        size: content.length
      };
    });

    // Limit to first 20 files for cost control
    const filesToReview = files.slice(0, 20);

    console.error(`\n🚀 Starting review:`);
    console.error(`   Mode: ${reviewMode}`);
    console.error(`   Files: ${filesToReview.length}/${filePaths.length}`);
    console.error(`   Agents: ${agents.length}`);
    console.error(`   Budget: $${costBudget}, ${timeBudget}ms`);
    console.error('');

    // Execute review
    const result = await orchestrator.executeReview({
      files: filesToReview,
      config: {
        parallel: maxConcurrent > 1,
        caching: enableCaching
      }
    });

    // Output results as JSON to stdout
    console.log(JSON.stringify(result, null, 2));

    // Log summary to stderr
    console.error(`\n✅ Review completed:`);
    console.error(`   Total issues: ${result.summary.totalIssues}`);
    console.error(`   Critical issues: ${result.summary.criticalIssues}`);
    console.error(`   Suggestions: ${result.summary.suggestions}`);
    console.error(`   Time: ${(result.summary.analysisTime / 1000).toFixed(1)}s`);
    console.error(`   Cost: $${result.metrics.estimatedCost.toFixed(4)}`);

    // Exit with error code if there are critical issues and fail-on-critical is enabled
    if (result.summary.criticalIssues > 0 && process.env.FAIL_ON_CRITICAL === 'true') {
      process.exit(1);
    }

  } catch (error) {
    console.error(JSON.stringify({
      error: error.message,
      stack: error.stack,
      summary: { totalIssues: 0, criticalIssues: 0, suggestions: 0, filesAnalyzed: 0, analysisTime: 0 },
      metrics: { estimatedCost: 0 },
      reviews: []
    }));
    process.exit(1);
  }
}

runAction();
