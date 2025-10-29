// src/performance/performance-monitor.ts
import { Logger } from '../utils/logger';
import { PerformanceObserver, performance, PerformanceEntry } from 'perf_hooks';

export interface PerformanceProfile {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryBefore?: NodeJS.MemoryUsage;
  memoryAfter?: NodeJS.MemoryUsage;
  memoryDelta?: {
    heapUsed: number;
    external: number;
    rss: number;
  };
  metadata?: Record<string, any>;
}

export interface MonitorStats {
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  totalMemoryDelta: number;
  avgMemoryDelta: number;
}

export interface PerformanceReport {
  profiles: PerformanceProfile[];
  stats: MonitorStats;
  recommendations: string[];
  timestamp: number;
}

/**
 * Performance monitoring and profiling system
 * Tracks execution times, memory usage, and provides optimization recommendations
 */
export class PerformanceMonitor {
  private logger: Logger;
  private profiles: Map<string, PerformanceProfile> = new Map();
  private completedProfiles: PerformanceProfile[] = [];
  private observer?: PerformanceObserver;
  private enabled: boolean;

  constructor(enabled: boolean = true) {
    this.logger = new Logger('PerformanceMonitor');
    this.enabled = enabled;

    if (this.enabled) {
      this.setupObserver();
      this.logger.info('Performance monitoring enabled');
    }
  }

  /**
   * Set up performance observer for automatic tracking
   */
  private setupObserver(): void {
    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          this.logger.debug(
            `Performance entry: ${entry.name} - ${entry.duration.toFixed(2)}ms`
          );
        }
      });

      this.observer.observe({ entryTypes: ['measure', 'function'], buffered: true });
    } catch (error) {
      this.logger.warn('Failed to setup performance observer:', error);
    }
  }

  /**
   * Start profiling an operation
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    const profile: PerformanceProfile = {
      name,
      startTime: Date.now(),
      memoryBefore: process.memoryUsage(),
      metadata,
    };

    this.profiles.set(name, profile);

    // Mark performance start
    try {
      performance.mark(`${name}-start`);
    } catch (error) {
      this.logger.debug('Performance mark failed:', error);
    }

    this.logger.debug(`Started profiling: ${name}`);
  }

  /**
   * End profiling an operation
   */
  end(name: string): PerformanceProfile | null {
    if (!this.enabled) return null;

    const profile = this.profiles.get(name);
    if (!profile) {
      this.logger.warn(`No profile found for: ${name}`);
      return null;
    }

    // Complete the profile
    profile.endTime = Date.now();
    profile.duration = profile.endTime - profile.startTime;
    profile.memoryAfter = process.memoryUsage();

    if (profile.memoryBefore && profile.memoryAfter) {
      profile.memoryDelta = {
        heapUsed: profile.memoryAfter.heapUsed - profile.memoryBefore.heapUsed,
        external: profile.memoryAfter.external - profile.memoryBefore.external,
        rss: profile.memoryAfter.rss - profile.memoryBefore.rss,
      };
    }

    // Mark performance end and measure
    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    } catch (error) {
      this.logger.debug('Performance measure failed:', error);
    }

    this.profiles.delete(name);
    this.completedProfiles.push(profile);

    this.logger.debug(
      `Completed profiling: ${name} - ${profile.duration}ms, ` +
      `${this.formatBytes(profile.memoryDelta?.heapUsed || 0)} heap`
    );

    return profile;
  }

  /**
   * Profile an async function
   */
  async profile<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.enabled) {
      return fn();
    }

    this.start(name, metadata);

    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get statistics for all completed profiles
   */
  getStats(): MonitorStats {
    if (this.completedProfiles.length === 0) {
      return {
        totalOperations: 0,
        completedOperations: 0,
        failedOperations: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        totalMemoryDelta: 0,
        avgMemoryDelta: 0,
      };
    }

    const durations = this.completedProfiles
      .map(p => p.duration || 0)
      .filter(d => d > 0);

    const memoryDeltas = this.completedProfiles
      .map(p => p.memoryDelta?.heapUsed || 0);

    const totalMemoryDelta = memoryDeltas.reduce((sum, d) => sum + d, 0);

    return {
      totalOperations: this.completedProfiles.length + this.profiles.size,
      completedOperations: this.completedProfiles.length,
      failedOperations: 0, // TODO: track failures
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalMemoryDelta,
      avgMemoryDelta: totalMemoryDelta / memoryDeltas.length,
    };
  }

  /**
   * Generate performance report with recommendations
   */
  generateReport(): PerformanceReport {
    const stats = this.getStats();
    const recommendations: string[] = [];

    // Analyze and generate recommendations
    if (stats.avgDuration > 5000) {
      recommendations.push(
        '⚠️ High average duration (>5s) - Consider enabling caching or parallel execution'
      );
    }

    if (stats.maxDuration > 30000) {
      recommendations.push(
        '⚠️ Very long operations detected (>30s) - Review timeout settings or add progress updates'
      );
    }

    if (stats.avgMemoryDelta > 100 * 1024 * 1024) {
      recommendations.push(
        '⚠️ High memory usage (>100MB avg) - Consider streaming responses or chunking data'
      );
    }

    // Check for slow operations
    const slowOperations = this.completedProfiles
      .filter(p => (p.duration || 0) > 10000)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5);

    if (slowOperations.length > 0) {
      recommendations.push(
        `🐢 Slowest operations: ${slowOperations.map(p => `${p.name} (${p.duration}ms)`).join(', ')}`
      );
    }

    // Check for memory-intensive operations
    const memoryHeavy = this.completedProfiles
      .filter(p => (p.memoryDelta?.heapUsed || 0) > 50 * 1024 * 1024)
      .sort((a, b) => (b.memoryDelta?.heapUsed || 0) - (a.memoryDelta?.heapUsed || 0))
      .slice(0, 5);

    if (memoryHeavy.length > 0) {
      recommendations.push(
        `💾 Memory-intensive operations: ${memoryHeavy.map(p =>
          `${p.name} (${this.formatBytes(p.memoryDelta?.heapUsed || 0)})`
        ).join(', ')}`
      );
    }

    // Success rate recommendations
    const successRate = stats.totalOperations > 0
      ? (stats.completedOperations / stats.totalOperations) * 100
      : 100;

    if (successRate < 90) {
      recommendations.push(
        `⚠️ Low success rate (${successRate.toFixed(1)}%) - Review error handling`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance looks good! No major issues detected.');
    }

    return {
      profiles: this.completedProfiles,
      stats,
      recommendations,
      timestamp: Date.now(),
    };
  }

  /**
   * Print performance report to console
   */
  printReport(): void {
    const report = this.generateReport();

    console.log('\n📊 Performance Report\n');
    console.log(`Total Operations: ${report.stats.totalOperations}`);
    console.log(`Completed: ${report.stats.completedOperations}`);
    console.log(`Failed: ${report.stats.failedOperations}`);
    console.log(`\nTiming:`);
    console.log(`  Average: ${report.stats.avgDuration.toFixed(2)}ms`);
    console.log(`  Min: ${report.stats.minDuration.toFixed(2)}ms`);
    console.log(`  Max: ${report.stats.maxDuration.toFixed(2)}ms`);
    console.log(`\nMemory:`);
    console.log(`  Total Delta: ${this.formatBytes(report.stats.totalMemoryDelta)}`);
    console.log(`  Average Delta: ${this.formatBytes(report.stats.avgMemoryDelta)}`);
    console.log(`\n💡 Recommendations:`);
    report.recommendations.forEach(rec => console.log(`  ${rec}`));
    console.log('');
  }

  /**
   * Get top N slowest operations
   */
  getSlowestOperations(n: number = 10): PerformanceProfile[] {
    return [...this.completedProfiles]
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, n);
  }

  /**
   * Get top N memory-intensive operations
   */
  getMemoryIntensiveOperations(n: number = 10): PerformanceProfile[] {
    return [...this.completedProfiles]
      .sort((a, b) =>
        (b.memoryDelta?.heapUsed || 0) - (a.memoryDelta?.heapUsed || 0)
      )
      .slice(0, n);
  }

  /**
   * Clear all completed profiles
   */
  clear(): void {
    this.completedProfiles = [];
    this.profiles.clear();
    this.logger.info('Performance profiles cleared');
  }

  /**
   * Get current active profiles
   */
  getActiveProfiles(): PerformanceProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Export profiles to JSON
   */
  exportProfiles(): string {
    return JSON.stringify({
      active: Array.from(this.profiles.values()),
      completed: this.completedProfiles,
      stats: this.getStats(),
      timestamp: Date.now(),
    }, null, 2);
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const negative = bytes < 0;
    bytes = Math.abs(bytes);

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);

    return `${negative ? '-' : ''}${value.toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.enabled = false;
    this.logger.info('Performance monitoring stopped');
  }
}
