import { FileContext } from '../types';

export class ChunkProcessor {
  private maxChunkSize: number = 100000; // 100KB
  private overlapSize: number = 1000; // 1KB overlap between chunks

  constructor(maxChunkSize?: number, overlapSize?: number) {
    if (maxChunkSize) {
      this.maxChunkSize = maxChunkSize;
    }
    if (overlapSize) {
      this.overlapSize = overlapSize;
    }
  }

  process(files: FileContext[]): FileContext[] {
    const chunked: FileContext[] = [];

    for (const file of files) {
      if (file.size <= this.maxChunkSize) {
        chunked.push(file);
      } else {
        const chunks = this.chunkFile(file);
        chunked.push(...chunks);
      }
    }

    return chunked;
  }

  private chunkFile(file: FileContext): FileContext[] {
    const chunks: FileContext[] = [];
    const content = file.content;
    let offset = 0;
    let chunkIndex = 0;

    while (offset < content.length) {
      const chunkSize = Math.min(this.maxChunkSize, content.length - offset);
      const end = offset + chunkSize;

      // Add overlap from previous chunk if not first chunk
      const start = offset > 0 ? offset - this.overlapSize : 0;

      const chunkContent = content.slice(start, end);

      chunks.push({
        path: `${file.path}#chunk-${chunkIndex}`,
        content: chunkContent,
        language: file.language,
        size: chunkContent.length,
      });

      offset = end;
      chunkIndex++;
    }

    return chunks;
  }

  shouldChunk(file: FileContext): boolean {
    return file.size > this.maxChunkSize;
  }

  estimateChunks(file: FileContext): number {
    if (!this.shouldChunk(file)) {
      return 1;
    }

    return Math.ceil(file.size / this.maxChunkSize);
  }
}
