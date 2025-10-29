import { createHash } from 'crypto';
import { CacheEntry, FileContext } from '../types';

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number = 3600000; // 1 hour in milliseconds

  constructor(ttl?: number) {
    if (ttl) {
      this.defaultTTL = ttl;
    }
  }

  generateKey(file: FileContext): string {
    const hash = createHash('sha256');
    hash.update(file.path);
    hash.update(file.content);
    return hash.digest('hex');
  }

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const entry: CacheEntry = {
      key,
      value,
      timestamp: new Date(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, entry);
  }

  async checkCache(
    files: FileContext[]
  ): Promise<{ cached: any[]; uncached: FileContext[] }> {
    const cached: any[] = [];
    const uncached: FileContext[] = [];

    for (const file of files) {
      const key = this.generateKey(file);
      const cachedValue = await this.get(key);

      if (cachedValue) {
        cached.push(cachedValue);
      } else {
        uncached.push(file);
      }
    }

    return { cached, uncached };
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp.getTime() > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}
