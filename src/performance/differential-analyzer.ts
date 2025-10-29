// src/performance/differential-analyzer.ts
import { createHash } from 'crypto';
import { FileContext } from '../types';
import { Logger } from '../utils/logger';

export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'unchanged';
  oldHash?: string;
  newHash?: string;
}

/**
 * Differential analyzer - only analyze changed files
 * HUGE performance improvement for incremental reviews
 */
export class DifferentialAnalyzer {
  private logger: Logger;
  private fileHashes: Map<string, string> = new Map();
  private storageKey = 'file-hashes-v1';

  constructor() {
    this.logger = new Logger('DifferentialAnalyzer');
    this.loadHashesFromStorage();
  }

  /**
   * Calculate hash for file content
   */
  private hashFile(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Detect changes in files
   */
  detectChanges(files: FileContext[]): FileChange[] {
    const changes: FileChange[] = [];

    for (const file of files) {
      const newHash = this.hashFile(file.content);
      const oldHash = this.fileHashes.get(file.path);

      if (!oldHash) {
        // New file
        changes.push({
          path: file.path,
          status: 'added',
          newHash,
        });
      } else if (oldHash !== newHash) {
        // Modified file
        changes.push({
          path: file.path,
          status: 'modified',
          oldHash,
          newHash,
        });
      } else {
        // Unchanged file
        changes.push({
          path: file.path,
          status: 'unchanged',
          oldHash,
          newHash,
        });
      }

      // Update hash
      this.fileHashes.set(file.path, newHash);
    }

    // Detect deleted files
    const currentPaths = new Set(files.map(f => f.path));
    for (const [path, hash] of this.fileHashes.entries()) {
      if (!currentPaths.has(path)) {
        changes.push({
          path,
          status: 'deleted',
          oldHash: hash,
        });
        this.fileHashes.delete(path);
      }
    }

    this.saveHashesToStorage();

    const changedCount = changes.filter(c => c.status !== 'unchanged').length;
    this.logger.info(
      `Detected ${changedCount} changed files out of ${files.length} total`
    );

    return changes;
  }

  /**
   * Get only changed files for analysis
   */
  getChangedFiles(
    files: FileContext[],
    includeUnchanged: boolean = false
  ): {
    changedFiles: FileContext[];
    changes: FileChange[];
    stats: {
      added: number;
      modified: number;
      deleted: number;
      unchanged: number;
      percentChanged: number;
    };
  } {
    const changes = this.detectChanges(files);

    const changedFiles = files.filter(file => {
      const change = changes.find(c => c.path === file.path);
      return change && (
        change.status === 'added' ||
        change.status === 'modified' ||
        (includeUnchanged && change.status === 'unchanged')
      );
    });

    const stats = {
      added: changes.filter(c => c.status === 'added').length,
      modified: changes.filter(c => c.status === 'modified').length,
      deleted: changes.filter(c => c.status === 'deleted').length,
      unchanged: changes.filter(c => c.status === 'unchanged').length,
      percentChanged: files.length > 0
        ? ((changes.filter(c => c.status !== 'unchanged').length / files.length) * 100)
        : 0,
    };

    this.logger.info(
      `Stats: ${stats.added} added, ${stats.modified} modified, ${stats.deleted} deleted, ${stats.unchanged} unchanged (${stats.percentChanged.toFixed(1)}% changed)`
    );

    return { changedFiles, changes, stats };
  }

  /**
   * Reset all stored hashes (force full analysis)
   */
  reset(): void {
    this.fileHashes.clear();
    this.saveHashesToStorage();
    this.logger.info('Reset all file hashes');
  }

  /**
   * Load hashes from persistent storage
   */
  private loadHashesFromStorage(): void {
    try {
      // In browser: localStorage, in Node: file system
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const data = JSON.parse(stored);
          this.fileHashes = new Map(Object.entries(data));
          this.logger.info(`Loaded ${this.fileHashes.size} file hashes from storage`);
        }
      }
    } catch (error) {
      this.logger.warn('Failed to load hashes from storage:', error);
    }
  }

  /**
   * Save hashes to persistent storage
   */
  private saveHashesToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = Object.fromEntries(this.fileHashes);
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
    } catch (error) {
      this.logger.warn('Failed to save hashes to storage:', error);
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalFiles: number;
    oldestHash: Date | null;
    newestHash: Date | null;
  } {
    return {
      totalFiles: this.fileHashes.size,
      oldestHash: null, // Could add timestamp tracking
      newestHash: null,
    };
  }
}
