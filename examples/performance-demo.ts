// examples/performance-demo.ts
import dotenv from 'dotenv';
import { PerformanceOrchestrator } from '../src/orchestrator/performance-orchestrator';
import { ConnectionPool } from '../src/performance/connection-pool';
import { PerformanceMonitor } from '../src/performance/performance-monitor';
import { FileContext } from '../src/types';
import { FileCollector } from '../src/utils/file-collector';
import { Logger } from '../src/utils/logger';
import { BaseAgent } from '../src/agents/base-agent';

// Import all agents
import { AngularSecurityAgent } from '../src/agents/security-agent';
import { AngularArchitectureAgent } from '../src/agents/architecture-agent';
import { AngularPerformanceAgent } from '../src/agents/performance-agent';
import { AngularRxJSAgent } from '../src/agents/rxjs-agent';
import { AngularTestingAgent } from '../src/agents/testing-agent';
import { AngularAccessibilityAgent } from '../src/agents/accessibility-agent';

dotenv.config();

const logger = new Logger('PerformanceDemo');

/**
 * Demo 1: Basic performance-optimized review
 */
async function basicPerformanceReview() {
  console.log('\n🚀 Demo 1: Basic Performance-Optimized Review\n');

  const monitor = new PerformanceMonitor();

  await monitor.profile('full-review', async () => {
    // Initialize agents
    const agents: BaseAgent[] = [
      new AngularSecurityAgent({ name: 'security', description: 'Security' }),
      new AngularArchitectureAgent({ name: 'architecture', description: 'Architecture' }),
      new AngularPerformanceAgent({ name: 'performance', description: 'Performance' }),
    ];

    // Create performance orchestrator
    const orchestrator = new PerformanceOrchestrator(agents, {
      enableStreaming: true,
      enableDifferentialAnalysis: true,
      enableProgressUpdates: true,
      costBudget: 0.50,
      timeBudget: 60000,
      enableEarlyStop: true,
      enableSmartSelection: true,
    });

    // Collect files
    const collector = new FileCollector();
    const files = await collector.collectFiles('./src');

    logger.info(`Collected ${files.length} files`);

    // Execute review
    const result = await orchestrator.executeReview({
      files,
      config: {
        parallel: true,
        caching: true,
      },
    });

    // Display results
    console.log('\n📊 Results:');
    console.log(`Files analyzed: ${result.metrics.filesAnalyzed}`);
    console.log(`Files skipped: ${result.metrics.filesSkipped}`);
    console.log(`Total issues: ${result.summary.totalIssues}`);
    console.log(`Critical issues: ${result.summary.criticalIssues}`);
    console.log(`Cost: $${result.metrics.estimatedCost.toFixed(4)}`);
    console.log(`Time: ${result.summary.analysisTime}ms`);

    if (result.metrics.differentialStats) {
      console.log('\n📈 Differential Stats:');
      console.log(`  Added: ${result.metrics.differentialStats.added}`);
      console.log(`  Modified: ${result.metrics.differentialStats.modified}`);
      console.log(`  Deleted: ${result.metrics.differentialStats.deleted}`);
      console.log(`  Unchanged: ${result.metrics.differentialStats.unchanged}`);
      console.log(`  Changed: ${result.metrics.differentialStats.percentChanged.toFixed(1)}%`);
    }
  });

  // Print performance report
  monitor.printReport();
}

/**
 * Demo 2: Connection pooling for batch processing
 */
async function connectionPoolDemo() {
  console.log('\n🔌 Demo 2: Connection Pool for Batch Processing\n');

  const pool = new ConnectionPool({
    maxConnections: 3,
    idleTimeout: 30000,
    enableHttp2: true,
  });

  const monitor = new PerformanceMonitor();

  // Simulate multiple reviews
  const reviews = Array.from({ length: 5 }, (_, i) => ({
    name: `Review ${i + 1}`,
    files: [`file${i}.ts`],
  }));

  await monitor.profile('batch-with-pool', async () => {
    const results = await Promise.all(
      reviews.map(review =>
        pool.execute(async (client) => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          return { review: review.name, status: 'completed' };
        })
      )
    );

    console.log(`\n✅ Completed ${results.length} reviews`);
  });

  // Display pool stats
  const poolStats = pool.getStats();
  console.log('\n📊 Connection Pool Stats:');
  console.log(`Total requests: ${poolStats.totalRequests}`);
  console.log(`Pool hits: ${poolStats.poolHits} (reused connections)`);
  console.log(`Pool misses: ${poolStats.poolMisses} (new connections)`);
  console.log(`Reuse rate: ${((poolStats.poolHits / poolStats.totalRequests) * 100).toFixed(1)}%`);
  console.log(`Active connections: ${poolStats.activeConnections}`);
  console.log(`Idle connections: ${poolStats.idleConnections}`);
  console.log(`Avg response time: ${poolStats.avgResponseTime.toFixed(2)}ms`);

  // Cleanup
  await pool.close();
  monitor.printReport();
}

/**
 * Demo 3: Incremental review (differential analysis)
 */
async function incrementalReviewDemo() {
  console.log('\n📝 Demo 3: Incremental Review (Differential Analysis)\n');

  const monitor = new PerformanceMonitor();

  const agents: BaseAgent[] = [
    new AngularSecurityAgent({ name: 'security', description: 'Security' }),
    new AngularArchitectureAgent({ name: 'architecture', description: 'Architecture' }),
  ];

  const orchestrator = new PerformanceOrchestrator(agents, {
    enableDifferentialAnalysis: true,
    enableProgressUpdates: true,
    costBudget: 0.30,
  });

  const collector = new FileCollector();

  // First review - all files
  console.log('🔄 First review (full analysis)...');
  await monitor.profile('first-review', async () => {
    const files = await collector.collectFiles('./src');
    const result = await orchestrator.executeReview({ files, config: {} });

    console.log(`  Analyzed: ${result.metrics.filesAnalyzed} files`);
    console.log(`  Cost: $${result.metrics.estimatedCost.toFixed(4)}`);
  });

  // Second review - only changed files
  console.log('\n🔄 Second review (incremental)...');
  await monitor.profile('incremental-review', async () => {
    const files = await collector.collectFiles('./src');
    const result = await orchestrator.executeReview({ files, config: {} });

    console.log(`  Analyzed: ${result.metrics.filesAnalyzed} files`);
    console.log(`  Skipped: ${result.metrics.filesSkipped} files (unchanged)`);
    console.log(`  Cost: $${result.metrics.estimatedCost.toFixed(4)}`);

    if (result.metrics.differentialStats) {
      const savings = result.metrics.filesSkipped > 0
        ? ((result.metrics.filesSkipped / (result.metrics.filesAnalyzed + result.metrics.filesSkipped)) * 100)
        : 0;
      console.log(`  Savings: ${savings.toFixed(1)}% (${result.metrics.filesSkipped} files skipped)`);
    }
  });

  monitor.printReport();
}

/**
 * Demo 4: Complete optimization stack
 */
async function completeOptimizationDemo() {
  console.log('\n🎯 Demo 4: Complete Optimization Stack\n');

  const monitor = new PerformanceMonitor();
  const pool = new ConnectionPool({
    maxConnections: 5,
    enableHttp2: true,
  });

  await monitor.profile('complete-optimization', async () => {
    // All agents
    const agents: BaseAgent[] = [
      new AngularSecurityAgent({ name: 'security', description: 'Security' }),
      new AngularArchitectureAgent({ name: 'architecture', description: 'Architecture' }),
      new AngularPerformanceAgent({ name: 'performance', description: 'Performance' }),
      new AngularRxJSAgent({ name: 'rxjs', description: 'RxJS' }),
      new AngularTestingAgent({ name: 'testing', description: 'Testing' }),
      new AngularAccessibilityAgent({ name: 'accessibility', description: 'Accessibility' }),
    ];

    // Full optimization config
    const orchestrator = new PerformanceOrchestrator(agents, {
      enableStreaming: true,
      enableDifferentialAnalysis: true,
      enableProgressUpdates: true,
      enableCaching: true,
      enableSmartSelection: true,
      enableEarlyStop: true,
      costBudget: 1.0,
      timeBudget: 120000,
      maxConcurrent: 3,
      prioritizeCost: true,
    });

    const collector = new FileCollector();
    const files = await collector.collectFiles('./src');

    console.log(`📁 Processing ${files.length} files with all optimizations enabled\n`);

    const result = await orchestrator.executeReview({
      files,
      config: {
        parallel: true,
        caching: true,
      },
    });

    // Detailed results
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE RESULTS');
    console.log('='.repeat(60));

    console.log('\n📈 Analysis:');
    console.log(`  Files analyzed: ${result.metrics.filesAnalyzed}`);
    console.log(`  Files skipped: ${result.metrics.filesSkipped}`);
    console.log(`  Cache hits: ${result.metrics.cacheHits}`);
    console.log(`  Agents skipped: ${result.metrics.agentsSkipped}`);

    console.log('\n🔍 Issues Found:');
    console.log(`  Total: ${result.summary.totalIssues}`);
    console.log(`  Critical: ${result.summary.criticalIssues}`);
    console.log(`  Suggestions: ${result.summary.suggestions}`);

    console.log('\n💰 Cost Analysis:');
    console.log(`  Estimated cost: $${result.metrics.estimatedCost.toFixed(4)}`);
    if (result.metrics.totalTokensSaved) {
      const savedCost = (result.metrics.totalTokensSaved / 1000000) * 3.0;
      console.log(`  Tokens saved: ${result.metrics.totalTokensSaved.toLocaleString()}`);
      console.log(`  Cost saved: ~$${savedCost.toFixed(4)}`);
    }

    console.log('\n⏱️  Performance:');
    console.log(`  Total time: ${result.summary.analysisTime}ms`);
    console.log(`  Avg per file: ${(result.summary.analysisTime / result.metrics.filesAnalyzed).toFixed(0)}ms`);

    if (result.metrics.differentialStats) {
      console.log('\n📝 Differential Analysis:');
      console.log(`  Changed: ${result.metrics.differentialStats.percentChanged.toFixed(1)}%`);
      console.log(`  Added: ${result.metrics.differentialStats.added}`);
      console.log(`  Modified: ${result.metrics.differentialStats.modified}`);
      console.log(`  Deleted: ${result.metrics.differentialStats.deleted}`);
      console.log(`  Unchanged: ${result.metrics.differentialStats.unchanged}`);
    }

    console.log('\n' + '='.repeat(60));
  });

  // Pool stats
  const poolStats = pool.getStats();
  console.log('\n🔌 Connection Pool:');
  console.log(`  Total requests: ${poolStats.totalRequests}`);
  console.log(`  Reuse rate: ${poolStats.totalRequests > 0 ? ((poolStats.poolHits / poolStats.totalRequests) * 100).toFixed(1) : 0}%`);

  // Performance report
  monitor.printReport();

  // Cleanup
  await pool.close();
}

/**
 * Demo 5: Performance comparison
 */
async function performanceComparison() {
  console.log('\n⚖️  Demo 5: Performance Comparison\n');

  const monitor = new PerformanceMonitor();
  const collector = new FileCollector();
  const files = await collector.collectFiles('./src');

  const agents: BaseAgent[] = [
    new AngularSecurityAgent({ name: 'security', description: 'Security' }),
    new AngularArchitectureAgent({ name: 'architecture', description: 'Architecture' }),
  ];

  // Test 1: No optimizations
  console.log('🐢 Test 1: No optimizations');
  const result1 = await monitor.profile('no-optimization', async () => {
    const orch = new PerformanceOrchestrator(agents, {
      enableStreaming: false,
      enableDifferentialAnalysis: false,
      enableSmartSelection: false,
      enableEarlyStop: false,
      enableCaching: false,
      maxConcurrent: 1,
    });

    return orch.executeReview({ files: files.slice(0, 5), config: {} });
  });

  // Test 2: With all optimizations
  console.log('\n🚀 Test 2: All optimizations');
  const result2 = await monitor.profile('full-optimization', async () => {
    const orch = new PerformanceOrchestrator(agents, {
      enableStreaming: true,
      enableDifferentialAnalysis: true,
      enableSmartSelection: true,
      enableEarlyStop: true,
      enableCaching: true,
      maxConcurrent: 3,
    });

    return orch.executeReview({ files: files.slice(0, 5), config: {} });
  });

  // Comparison
  console.log('\n📊 Comparison:');
  console.log(`  Time improvement: ${((1 - result2.summary.analysisTime / result1.summary.analysisTime) * 100).toFixed(1)}%`);
  console.log(`  Cost improvement: ${((1 - result2.metrics.estimatedCost / result1.metrics.estimatedCost) * 100).toFixed(1)}%`);

  monitor.printReport();
}

// Main runner
async function main() {
  const args = process.argv.slice(2);
  const demo = args[0] || 'all';

  try {
    switch (demo) {
      case 'basic':
        await basicPerformanceReview();
        break;

      case 'pool':
        await connectionPoolDemo();
        break;

      case 'incremental':
        await incrementalReviewDemo();
        break;

      case 'complete':
        await completeOptimizationDemo();
        break;

      case 'compare':
        await performanceComparison();
        break;

      case 'all':
        await basicPerformanceReview();
        await connectionPoolDemo();
        await incrementalReviewDemo();
        await completeOptimizationDemo();
        await performanceComparison();
        break;

      default:
        console.log('Unknown demo. Available: basic, pool, incremental, complete, compare, all');
    }

    console.log('\n✅ Performance demo completed!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export {
  basicPerformanceReview,
  connectionPoolDemo,
  incrementalReviewDemo,
  completeOptimizationDemo,
  performanceComparison,
};
