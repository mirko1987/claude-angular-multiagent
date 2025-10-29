import { promises as fs } from 'fs';
import * as path from 'path';
import { FileContext } from '../types';

export class FileAnalyzer {
  private supportedExtensions = [
    '.ts',
    '.js',
    '.html',
    '.css',
    '.scss',
    '.json',
  ];

  async analyzeDirectory(dirPath: string): Promise<FileContext[]> {
    const files: FileContext[] = [];

    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip common directories
        if (this.shouldSkipDirectory(entry.name)) {
          continue;
        }

        const subFiles = await this.analyzeDirectory(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        if (this.isSupported(entry.name)) {
          const fileContext = await this.analyzeFile(fullPath);
          if (fileContext) {
            files.push(fileContext);
          }
        }
      }
    }

    return files;
  }

  async analyzeFile(filePath: string): Promise<FileContext | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);

      return {
        path: filePath,
        content,
        language: this.getLanguage(filePath),
        size: stats.size,
      };
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
      return null;
    }
  }

  async analyzeFiles(filePaths: string[]): Promise<FileContext[]> {
    const files: FileContext[] = [];

    for (const filePath of filePaths) {
      const fileContext = await this.analyzeFile(filePath);
      if (fileContext) {
        files.push(fileContext);
      }
    }

    return files;
  }

  private getLanguage(filePath: string): string {
    const ext = path.extname(filePath);

    const languageMap: Record<string, string> = {
      '.ts': 'typescript',
      '.js': 'javascript',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.json': 'json',
    };

    return languageMap[ext] || 'text';
  }

  private isSupported(filename: string): boolean {
    const ext = path.extname(filename);
    return this.supportedExtensions.includes(ext);
  }

  private shouldSkipDirectory(dirname: string): boolean {
    const skipDirs = [
      'node_modules',
      'dist',
      'build',
      '.git',
      '.angular',
      'coverage',
      '.vscode',
      '.idea',
    ];

    return skipDirs.includes(dirname);
  }

  filterByPattern(files: FileContext[], pattern: string): FileContext[] {
    const regex = new RegExp(pattern);
    return files.filter(file => regex.test(file.path));
  }

  filterBySize(files: FileContext[], maxSize: number): FileContext[] {
    return files.filter(file => file.size <= maxSize);
  }

  groupByType(files: FileContext[]): Map<string, FileContext[]> {
    const groups = new Map<string, FileContext[]>();

    for (const file of files) {
      const language = file.language;

      if (!groups.has(language)) {
        groups.set(language, []);
      }

      groups.get(language)!.push(file);
    }

    return groups;
  }

  getTotalSize(files: FileContext[]): number {
    return files.reduce((sum, file) => sum + file.size, 0);
  }

  getTotalLines(files: FileContext[]): number {
    return files.reduce(
      (sum, file) => sum + file.content.split('\n').length,
      0
    );
  }
}
