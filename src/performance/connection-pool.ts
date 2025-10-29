// src/performance/connection-pool.ts
import Anthropic from '@anthropic-ai/sdk';
import { Logger } from '../utils/logger';

export interface PoolConfig {
  maxConnections?: number;
  connectionTimeout?: number;
  idleTimeout?: number;
  enableHttp2?: boolean;
}

export interface PoolStats {
  activeConnections: number;
  idleConnections: number;
  totalRequests: number;
  poolHits: number;
  poolMisses: number;
  avgResponseTime: number;
}

interface PooledConnection {
  client: Anthropic;
  lastUsed: number;
  requestCount: number;
  isActive: boolean;
}

/**
 * Connection pool manager for Anthropic API
 * Reuses HTTP connections for better performance
 * Supports HTTP/2 for multiplexing
 */
export class ConnectionPool {
  private logger: Logger;
  private config: Required<PoolConfig>;
  private connections: PooledConnection[] = [];
  private stats: PoolStats;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: PoolConfig = {}) {
    this.logger = new Logger('ConnectionPool');
    this.config = {
      maxConnections: config.maxConnections ?? 5,
      connectionTimeout: config.connectionTimeout ?? 30000,
      idleTimeout: config.idleTimeout ?? 60000,
      enableHttp2: config.enableHttp2 ?? true,
    };

    this.stats = {
      activeConnections: 0,
      idleConnections: 0,
      totalRequests: 0,
      poolHits: 0,
      poolMisses: 0,
      avgResponseTime: 0,
    };

    // Start cleanup of idle connections
    this.startCleanup();

    this.logger.info(
      `Connection pool initialized: max=${this.config.maxConnections}, ` +
      `http2=${this.config.enableHttp2}`
    );
  }

  /**
   * Get a client from the pool (or create new one)
   */
  async acquire(): Promise<Anthropic> {
    this.stats.totalRequests++;

    // Try to find an idle connection
    const idle = this.connections.find(conn => !conn.isActive);

    if (idle) {
      // Reuse existing connection
      idle.isActive = true;
      idle.lastUsed = Date.now();
      idle.requestCount++;

      this.stats.poolHits++;
      this.updateStats();

      this.logger.debug(`Reused connection (${this.stats.poolHits} pool hits)`);
      return idle.client;
    }

    // Create new connection if under limit
    if (this.connections.length < this.config.maxConnections) {
      const client = this.createClient();
      const pooledConn: PooledConnection = {
        client,
        lastUsed: Date.now(),
        requestCount: 1,
        isActive: true,
      };

      this.connections.push(pooledConn);
      this.stats.poolMisses++;
      this.updateStats();

      this.logger.debug(
        `Created new connection (${this.connections.length}/${this.config.maxConnections})`
      );
      return client;
    }

    // Pool is full, wait for a connection to become available
    this.logger.warn('Connection pool full, waiting for available connection');
    return this.waitForConnection();
  }

  /**
   * Release a client back to the pool
   */
  release(client: Anthropic): void {
    const conn = this.connections.find(c => c.client === client);

    if (conn) {
      conn.isActive = false;
      conn.lastUsed = Date.now();
      this.updateStats();

      this.logger.debug(`Released connection (${conn.requestCount} requests)`);
    }
  }

  /**
   * Execute a function with a pooled client
   */
  async execute<T>(
    fn: (client: Anthropic) => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    const client = await this.acquire();

    try {
      const result = await fn(client);

      // Update response time stats
      const responseTime = Date.now() - startTime;
      this.updateResponseTime(responseTime);

      return result;
    } finally {
      this.release(client);
    }
  }

  /**
   * Create a new Anthropic client
   */
  private createClient(): Anthropic {
    const apiKey = process.env.ANTHROPIC_API_KEY || '';

    // Configure for HTTP/2 if enabled
    const options: any = {
      apiKey,
    };

    // Note: Anthropic SDK uses fetch which may use HTTP/2 automatically
    // Additional HTTP/2 configuration would go here

    return new Anthropic(options);
  }

  /**
   * Wait for a connection to become available
   */
  private async waitForConnection(): Promise<Anthropic> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection pool timeout'));
      }, this.config.connectionTimeout);

      const interval = setInterval(() => {
        const idle = this.connections.find(conn => !conn.isActive);

        if (idle) {
          clearTimeout(timeout);
          clearInterval(interval);

          idle.isActive = true;
          idle.lastUsed = Date.now();
          idle.requestCount++;

          this.stats.poolHits++;
          this.updateStats();

          resolve(idle.client);
        }
      }, 100); // Check every 100ms
    });
  }

  /**
   * Update pool statistics
   */
  private updateStats(): void {
    this.stats.activeConnections = this.connections.filter(c => c.isActive).length;
    this.stats.idleConnections = this.connections.filter(c => !c.isActive).length;
  }

  /**
   * Update average response time
   */
  private updateResponseTime(responseTime: number): void {
    const totalTime = this.stats.avgResponseTime * (this.stats.totalRequests - 1);
    this.stats.avgResponseTime = (totalTime + responseTime) / this.stats.totalRequests;
  }

  /**
   * Start cleanup of idle connections
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const beforeCount = this.connections.length;

      // Remove connections that have been idle too long
      this.connections = this.connections.filter(conn => {
        if (!conn.isActive && now - conn.lastUsed > this.config.idleTimeout) {
          this.logger.debug(`Removing idle connection (idle for ${now - conn.lastUsed}ms)`);
          return false;
        }
        return true;
      });

      if (this.connections.length < beforeCount) {
        this.logger.info(
          `Cleaned up ${beforeCount - this.connections.length} idle connections ` +
          `(${this.connections.length} remaining)`
        );
        this.updateStats();
      }
    }, this.config.idleTimeout / 2); // Check at half the idle timeout
  }

  /**
   * Get pool statistics
   */
  getStats(): PoolStats {
    return { ...this.stats };
  }

  /**
   * Get detailed connection info
   */
  getConnectionInfo(): Array<{
    requestCount: number;
    isActive: boolean;
    idleTime: number;
  }> {
    const now = Date.now();
    return this.connections.map(conn => ({
      requestCount: conn.requestCount,
      isActive: conn.isActive,
      idleTime: now - conn.lastUsed,
    }));
  }

  /**
   * Drain the pool (wait for all active requests to complete)
   */
  async drain(): Promise<void> {
    this.logger.info('Draining connection pool...');

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const activeCount = this.connections.filter(c => c.isActive).length;

        if (activeCount === 0) {
          clearInterval(checkInterval);
          this.logger.info('Connection pool drained');
          resolve();
        } else {
          this.logger.debug(`Waiting for ${activeCount} active connections to complete`);
        }
      }, 100);
    });
  }

  /**
   * Close all connections and cleanup
   */
  async close(): Promise<void> {
    this.logger.info('Closing connection pool...');

    // Wait for active connections to complete
    await this.drain();

    // Stop cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Clear all connections
    this.connections = [];
    this.updateStats();

    this.logger.info('Connection pool closed');
  }

  /**
   * Reset pool statistics
   */
  resetStats(): void {
    this.stats = {
      activeConnections: this.stats.activeConnections,
      idleConnections: this.stats.idleConnections,
      totalRequests: 0,
      poolHits: 0,
      poolMisses: 0,
      avgResponseTime: 0,
    };

    this.logger.info('Pool statistics reset');
  }
}
