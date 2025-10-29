// examples/smart-review.ts
import 'dotenv/config';
import { SmartOrchestrator } from '../src/orchestrator/smart-orchestrator';
import { AngularArchitectureAgent } from '../src/agents/angular-architecture-agent';
import { RxJSReactiveAgent } from '../src/agents/rxjs-reactive-agent';
import { PerformanceAgent } from '../src/agents/performance-agent';
import { SecurityAgent } from '../src/agents/security-agent';
import { TestingAgent } from '../src/agents/testing-agent';
import { AccessibilityAgent } from '../src/agents/accessibility-agent';
import { FileAnalyzer } from '../src/utils/file-analyzer';

/**
 * Example 1: Cost-Optimized Review (DEFAULT)
 * Minimizes API costs while maintaining quality
 */
async function costOptimizedReview() {
  console.log('\n🎯 === COST-OPTIMIZED REVIEW ===\n');

  const orchestrator = new SmartOrchestrator({
    costBudget: 0.25,              // Max $0.25
    timeBudget: 60000,             // 1 minute
    enableEarlyStop: true,         // Stop if critical issues found
    enableCaching: true,           // Use cache
    enableSmartSelection: true,    // Only run relevant agents
    prioritizeCost: true,          // Optimize for cost
    prioritizeSpeed: false,
  });

  // Register all agents
  orchestrator.registerAgents([
    new AngularArchitectureAgent(),
    new SecurityAgent(),
    new PerformanceAgent(),
    new RxJSReactiveAgent(),
    new TestingAgent(),
    new AccessibilityAgent(),
  ]);

  const fileAnalyzer = new FileAnalyzer();
  const files = await fileAnalyzer.analyzeDirectory('./src');

  const result = await orchestrator.executeReview({ files });

  console.log(result.summary);
  console.log('\n📊 Optimizations:');
  console.log(`  Cache Hits: ${result.optimizations?.cacheHits}`);
  console.log(`  Agents Skipped: ${result.optimizations?.agentsSkipped}`);
  console.log(`  Total Cost: $${result.optimizations?.estimatedCost.toFixed(4)}`);
  console.log(`  Execution Time: ${result.executionTime}ms`);
}

/**
 * Example 2: Speed-Optimized Review
 * Maximizes speed while staying within reasonable cost
 */
async function speedOptimizedReview() {
  console.log('\n⚡ === SPEED-OPTIMIZED REVIEW ===\n');

  const orchestrator = new SmartOrchestrator({
    costBudget: 1.0,               // Higher budget for speed
    timeBudget: 30000,             // 30 seconds - aggressive
    maxConcurrent: 6,              // All agents in parallel
    enableEarlyStop: false,        // Don't stop early
    enableCaching: true,
    enableSmartSelection: false,   // Run all agents
    prioritizeCost: false,
    prioritizeSpeed: true,         // Optimize for speed
  });

  orchestrator.registerAgents([
    new SecurityAgent(),            // Critical first
    new AngularArchitectureAgent(),
    new PerformanceAgent(),
    new RxJSReactiveAgent(),
    new TestingAgent(),
    new AccessibilityAgent(),
  ]);

  const fileAnalyzer = new FileAnalyzer();
  const files = await fileAnalyzer.analyzeDirectory('./src');

  const result = await orchestrator.executeReview({ files });

  console.log(result.summary);
  console.log(`\n⏱️  Completed in ${result.executionTime}ms`);
}

/**
 * Example 3: Balanced Review (RECOMMENDED)
 * Good balance between cost and speed
 */
async function balancedReview() {
  console.log('\n⚖️  === BALANCED REVIEW (RECOMMENDED) ===\n');

  const orchestrator = new SmartOrchestrator({
    costBudget: 0.50,              // $0.50 budget
    timeBudget: 90000,             // 1.5 minutes
    maxConcurrent: 3,              // Moderate concurrency
    enableEarlyStop: true,
    enableCaching: true,
    enableSmartSelection: true,
    prioritizeCost: true,
    prioritizeSpeed: false,
  });

  orchestrator.registerAgents([
    new SecurityAgent(),
    new AngularArchitectureAgent(),
    new PerformanceAgent(),
    new RxJSReactiveAgent(),
    new TestingAgent(),
    new AccessibilityAgent(),
  ]);

  const fileAnalyzer = new FileAnalyzer();
  const files = await fileAnalyzer.analyzeDirectory('./src');

  const result = await orchestrator.executeReview({ files });

  console.log(result.summary);
  console.log('\n📈 Performance:');
  console.log(`  Cost: $${result.optimizations?.estimatedCost.toFixed(4)} / $0.50`);
  console.log(`  Time: ${result.executionTime}ms / 90000ms`);
  console.log(`  Issues: ${result.totalIssues}`);
  console.log(`  Suggestions: ${result.totalSuggestions}`);
}

/**
 * Example 4: Critical-Only Review
 * Only security and architecture - ultra fast and cheap
 */
async function criticalOnlyReview() {
  console.log('\n🔴 === CRITICAL-ONLY REVIEW ===\n');

  const orchestrator = new SmartOrchestrator({
    costBudget: 0.10,              // Minimal budget
    timeBudget: 30000,             // 30 seconds
    maxConcurrent: 2,
    enableEarlyStop: true,
    enableCaching: true,
    enableSmartSelection: true,
  });

  // Only register critical agents
  orchestrator.registerAgents([
    new SecurityAgent(),
    new AngularArchitectureAgent(),
  ]);

  const fileAnalyzer = new FileAnalyzer();
  const files = await fileAnalyzer.analyzeDirectory('./src');

  const result = await orchestrator.executeReview({ files });

  console.log(result.summary);
  console.log('\n💰 Ultra-low cost review completed!');
}

/**
 * Example 5: Runtime Configuration Updates
 */
async function dynamicConfigurationReview() {
  console.log('\n🔧 === DYNAMIC CONFIGURATION ===\n');

  const orchestrator = new SmartOrchestrator({
    costBudget: 0.50,
    enableCaching: true,
  });

  orchestrator.registerAgents([
    new SecurityAgent(),
    new AngularArchitectureAgent(),
    new PerformanceAgent(),
  ]);

  const fileAnalyzer = new FileAnalyzer();
  const files = await fileAnalyzer.analyzeDirectory('./src');

  // First review - cost optimized
  console.log('First review: Cost-optimized');
  let result = await orchestrator.executeReview({ files });
  console.log(`Cost: $${result.optimizations?.estimatedCost.toFixed(4)}`);

  // Update config for speed
  orchestrator.updateConfig({
    prioritizeSpeed: true,
    prioritizeCost: false,
    maxConcurrent: 6,
  });

  console.log('\nSecond review: Speed-optimized (with cache)');
  result = await orchestrator.executeReview({ files });
  console.log(`Time: ${result.executionTime}ms`);
}

// Run examples
async function main() {
  const example = process.argv[2] || 'balanced';

  switch (example) {
    case 'cost':
      await costOptimizedReview();
      break;
    case 'speed':
      await speedOptimizedReview();
      break;
    case 'balanced':
      await balancedReview();
      break;
    case 'critical':
      await criticalOnlyReview();
      break;
    case 'dynamic':
      await dynamicConfigurationReview();
      break;
    default:
      console.log('Usage: npm run example [cost|speed|balanced|critical|dynamic]');
      console.log('Running balanced review by default...\n');
      await balancedReview();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export {
  costOptimizedReview,
  speedOptimizedReview,
  balancedReview,
  criticalOnlyReview,
  dynamicConfigurationReview,
};
