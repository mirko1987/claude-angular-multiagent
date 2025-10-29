import { FileContext } from '../types';
import { AnalysisResult } from './agent-selector';

export class PreAnalyzer {
  async analyze(files: FileContext[]): Promise<AnalysisResult> {
    const fileTypes = this.detectFileTypes(files);
    const hasTests = this.checkForTests(files);
    const hasTemplates = this.checkForTemplates(files);
    const hasStyles = this.checkForStyles(files);
    const complexity = this.estimateComplexity(files);

    return {
      fileTypes,
      hasTests,
      hasTemplates,
      hasStyles,
      complexity,
    };
  }

  private detectFileTypes(files: FileContext[]): string[] {
    const types = new Set<string>();

    for (const file of files) {
      if (file.path.endsWith('.component.ts')) {
        types.add('component');
      } else if (file.path.endsWith('.service.ts')) {
        types.add('service');
      } else if (file.path.endsWith('.module.ts')) {
        types.add('module');
      } else if (file.path.endsWith('.spec.ts')) {
        types.add('spec');
      } else if (file.path.endsWith('.html')) {
        types.add('template');
      } else if (file.path.endsWith('.css') || file.path.endsWith('.scss')) {
        types.add('style');
      } else if (file.path.endsWith('.ts')) {
        types.add('typescript');
      }
    }

    return Array.from(types);
  }

  private checkForTests(files: FileContext[]): boolean {
    return files.some(
      file => file.path.endsWith('.spec.ts') || file.path.includes('test')
    );
  }

  private checkForTemplates(files: FileContext[]): boolean {
    return files.some(file => file.path.endsWith('.html'));
  }

  private checkForStyles(files: FileContext[]): boolean {
    return files.some(
      file =>
        file.path.endsWith('.css') ||
        file.path.endsWith('.scss') ||
        file.path.endsWith('.sass')
    );
  }

  private estimateComplexity(
    files: FileContext[]
  ): 'low' | 'medium' | 'high' {
    const totalLines = files.reduce(
      (sum, file) => sum + file.content.split('\n').length,
      0
    );

    const avgLinesPerFile = totalLines / files.length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    // Check for complexity indicators
    const hasObservables = files.some(f => f.content.includes('Observable'));
    const hasComplexRx = files.some(
      f =>
        f.content.includes('switchMap') ||
        f.content.includes('mergeMap') ||
        f.content.includes('combineLatest')
    );
    const hasManyDependencies = files.some(
      f => (f.content.match(/constructor\(/g) || []).length > 5
    );

    if (
      totalSize > 500000 ||
      avgLinesPerFile > 500 ||
      (hasComplexRx && hasManyDependencies)
    ) {
      return 'high';
    } else if (
      totalSize > 100000 ||
      avgLinesPerFile > 200 ||
      hasObservables
    ) {
      return 'medium';
    }

    return 'low';
  }

  getFileLanguage(path: string): string {
    if (path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.scss')) return 'scss';
    if (path.endsWith('.json')) return 'json';

    return 'text';
  }
}
