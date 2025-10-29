import { createHash } from 'crypto';
import { FileContext } from '../types';

export class Deduplicator {
  private seenHashes: Set<string> = new Set();

  async deduplicate(files: FileContext[]): Promise<FileContext[]> {
    const unique: FileContext[] = [];

    for (const file of files) {
      const hash = this.hashContent(file.content);

      if (!this.seenHashes.has(hash)) {
        this.seenHashes.add(hash);
        unique.push(file);
      }
    }

    return unique;
  }

  private hashContent(content: string): string {
    return createHash('md5').update(content).digest('hex');
  }

  findDuplicates(
    files: FileContext[]
  ): Map<string, FileContext[]> {
    const hashMap = new Map<string, FileContext[]>();

    for (const file of files) {
      const hash = this.hashContent(file.content);

      if (!hashMap.has(hash)) {
        hashMap.set(hash, []);
      }

      hashMap.get(hash)!.push(file);
    }

    // Filter to only duplicates
    const duplicates = new Map<string, FileContext[]>();
    hashMap.forEach((files, hash) => {
      if (files.length > 1) {
        duplicates.set(hash, files);
      }
    });

    return duplicates;
  }

  findSimilarCode(
    files: FileContext[],
    similarityThreshold: number = 0.9
  ): Array<{ file1: FileContext; file2: FileContext; similarity: number }> {
    const similar: Array<{
      file1: FileContext;
      file2: FileContext;
      similarity: number;
    }> = [];

    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const similarity = this.calculateSimilarity(
          files[i].content,
          files[j].content
        );

        if (similarity >= similarityThreshold) {
          similar.push({
            file1: files[i],
            file2: files[j],
            similarity,
          });
        }
      }
    }

    return similar;
  }

  private calculateSimilarity(content1: string, content2: string): number {
    // Simple similarity based on common lines
    const lines1 = new Set(content1.split('\n'));
    const lines2 = new Set(content2.split('\n'));

    const commonLines = Array.from(lines1).filter(line =>
      lines2.has(line)
    ).length;

    const totalLines = Math.max(lines1.size, lines2.size);

    return commonLines / totalLines;
  }

  reset(): void {
    this.seenHashes.clear();
  }
}
