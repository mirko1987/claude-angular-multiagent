import { FileContext } from '../types';

export interface ModelSelection {
  model: string;
  reason: string;
  estimatedCost: number;
}

export class ModelOptimizer {
  private models = {
    'claude-sonnet-4-20250514': {
      inputCost: 3.0, // per million tokens
      outputCost: 15.0,
      contextWindow: 200000,
      quality: 'highest',
    },
    'claude-3-5-sonnet-20241022': {
      inputCost: 3.0,
      outputCost: 15.0,
      contextWindow: 200000,
      quality: 'high',
    },
    'claude-3-haiku-20240307': {
      inputCost: 0.25,
      outputCost: 1.25,
      contextWindow: 200000,
      quality: 'medium',
    },
  };

  selectModel(files: FileContext[], agentType: string): ModelSelection {
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const estimatedTokens = totalSize / 4; // Rough estimation: 1 token ≈ 4 chars

    // Use Haiku for simple tasks or small files
    if (
      totalSize < 10000 ||
      agentType === 'Testing Agent' ||
      agentType === 'Accessibility Agent'
    ) {
      return {
        model: 'claude-3-haiku-20240307',
        reason: 'Small file size or simple task - Haiku is sufficient',
        estimatedCost: this.estimateCost(
          'claude-3-haiku-20240307',
          estimatedTokens
        ),
      };
    }

    // Use Sonnet 4 for complex analysis
    if (
      agentType === 'Security Agent' ||
      agentType === 'Angular Architecture Agent' ||
      totalSize > 50000
    ) {
      return {
        model: 'claude-sonnet-4-20250514',
        reason: 'Complex analysis or large files require Sonnet 4',
        estimatedCost: this.estimateCost(
          'claude-sonnet-4-20250514',
          estimatedTokens
        ),
      };
    }

    // Default to Sonnet 4 for medium complexity
    return {
      model: 'claude-sonnet-4-20250514',
      reason: 'Medium complexity - using Claude Sonnet 4',
      estimatedCost: this.estimateCost(
        'claude-sonnet-4-20250514',
        estimatedTokens
      ),
    };
  }

  private estimateCost(model: string, tokens: number): number {
    const modelInfo = this.models[model as keyof typeof this.models];
    if (!modelInfo) return 0;

    const inputCost = (tokens / 1000000) * modelInfo.inputCost;
    const outputCost = (tokens * 0.5 / 1000000) * modelInfo.outputCost; // Assume output is 50% of input

    return inputCost + outputCost;
  }

  estimateTotalCost(files: FileContext[], agentCount: number): number {
    let totalCost = 0;

    for (let i = 0; i < agentCount; i++) {
      const selection = this.selectModel(files, `Agent-${i}`);
      totalCost += selection.estimatedCost;
    }

    return totalCost;
  }
}
