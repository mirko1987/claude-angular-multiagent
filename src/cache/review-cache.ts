// src/cache/review-cache.ts
import { createHash } from 'crypto';
import { AgentReview } from '../types';

interface CacheEntry {
  review: AgentReview;
  timestamp: number;
  ttl: number;
}

export class ReviewCache {
  private cache: Map<string, CacheEntry>;
  private defaultTTL: number;
  private enabled: boolean;

  constructor(ttl: number = 3600000, enabled: boolean = true) {
    this.cache = new Map();
    this.defaultTTL = ttl; // 1 hour default
    this.enabled = enabled && (process.env.CACHE_ENABLED !== 'false');
  }

  /**
   * Generate a cache key based on file content and agent name
   */
  private generateKey(content: string, agentName: string): string {
    const hash = createHash('sha256');
    hash.update(content);
    hash.update(agentName);
    return hash.digest('hex');
  }

  /**
   * Get cached review if available and not expired
   */
  async get(content: string, agentName: string): Promise<AgentReview | null> {
    if (!this.enabled) return null;

    const key = this.generateKey(content, agentName);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.review;
  }

  /**
   * Store review in cache
   */
  async set(
    content: string,
    agentName: string,
    review: AgentReview,
    ttl?: number
  ): Promise<void> {
    if (!this.enabled) return;

    const key = this.generateKey(content, agentName);
    const entry: CacheEntry = {
      review,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    this.cache.set(key, entry);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  async cleanup(): Promise<void> {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.cache.size,
      hits: 0, // Would need to track these
      misses: 0
    };
  }

  /**
   * Check if cache is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
