export interface AnalysisResult {
  fileTypes: string[];
  hasTests: boolean;
  hasTemplates: boolean;
  hasStyles: boolean;
  complexity: 'low' | 'medium' | 'high';
}

export class AgentSelector {
  selectAgents(totalAgents: number, analysisResult: AnalysisResult): string[] {
    const selectedAgents: string[] = [];

    // Always run architecture and security agents
    selectedAgents.push('Angular Architecture Agent', 'Security Agent');

    // Select based on file types
    if (analysisResult.hasTemplates || analysisResult.hasStyles) {
      selectedAgents.push('Accessibility Agent');
    }

    // If there are TypeScript files with observables
    if (
      analysisResult.fileTypes.includes('typescript') ||
      analysisResult.fileTypes.includes('component')
    ) {
      selectedAgents.push('RxJS Reactive Agent');
    }

    // If complexity is medium or high, run performance agent
    if (
      analysisResult.complexity === 'medium' ||
      analysisResult.complexity === 'high'
    ) {
      selectedAgents.push('Performance Agent');
    }

    // If there are test files or no test files (to suggest adding them)
    if (analysisResult.hasTests || !analysisResult.hasTests) {
      selectedAgents.push('Testing Agent');
    }

    return selectedAgents;
  }

  shouldRunAgent(agentName: string, fileTypes: string[]): boolean {
    const agentFileMapping: Record<string, string[]> = {
      'Angular Architecture Agent': [
        'typescript',
        'component',
        'service',
        'module',
      ],
      'RxJS Reactive Agent': ['typescript', 'component', 'service'],
      'Performance Agent': ['component', 'template', 'typescript'],
      'Security Agent': ['typescript', 'component', 'service'],
      'Testing Agent': ['spec', 'test'],
      'Accessibility Agent': ['component', 'template', 'html'],
    };

    const relevantTypes = agentFileMapping[agentName] || [];

    return fileTypes.some(type => relevantTypes.includes(type));
  }

  prioritizeAgents(agents: string[], criticalPaths: string[]): string[] {
    // Prioritize security and architecture for critical paths
    if (criticalPaths.length > 0) {
      return [
        'Security Agent',
        'Angular Architecture Agent',
        ...agents.filter(
          a => a !== 'Security Agent' && a !== 'Angular Architecture Agent'
        ),
      ];
    }

    return agents;
  }
}
