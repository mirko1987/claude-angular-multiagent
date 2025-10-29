// src/performance/stream-processor.ts
import Anthropic from '@anthropic-ai/sdk';
import { Logger } from '../utils/logger';
import { EventEmitter } from 'events';

export interface StreamChunk {
  type: 'start' | 'content' | 'complete' | 'error';
  content?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  timestamp: number;
}

/**
 * Streaming processor for real-time responses
 * Provides immediate feedback instead of waiting for complete response
 */
export class StreamProcessor extends EventEmitter {
  private logger: Logger;
  private client: Anthropic;

  constructor(apiKey: string) {
    super();
    this.logger = new Logger('StreamProcessor');
    this.client = new Anthropic({ apiKey });
  }

  /**
   * Process request with streaming for real-time feedback
   */
  async processWithStreaming(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number = 4096
  ): Promise<string> {
    this.logger.info('Starting streaming request');

    let fullResponse = '';
    let startTime = Date.now();

    this.emit('chunk', {
      type: 'start',
      timestamp: Date.now(),
    } as StreamChunk);

    try {
      const stream = await this.client.messages.stream({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userPrompt,
        }],
      });

      // Process chunks as they arrive
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text;
          fullResponse += text;

          // Emit chunk for real-time processing
          this.emit('chunk', {
            type: 'content',
            content: text,
            timestamp: Date.now(),
          } as StreamChunk);
        }
      }

      const finalMessage = await stream.finalMessage();
      const elapsed = Date.now() - startTime;

      this.logger.info(`Streaming completed in ${elapsed}ms, ${finalMessage.usage?.input_tokens} input tokens, ${finalMessage.usage?.output_tokens} output tokens`);

      this.emit('chunk', {
        type: 'complete',
        content: fullResponse,
        usage: {
          inputTokens: finalMessage.usage?.input_tokens || 0,
          outputTokens: finalMessage.usage?.output_tokens || 0,
        },
        timestamp: Date.now(),
      } as StreamChunk);

      return fullResponse;
    } catch (error) {
      this.logger.error('Streaming error:', error);

      this.emit('chunk', {
        type: 'error',
        content: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      } as StreamChunk);

      throw error;
    }
  }

  /**
   * Batch multiple requests with connection reuse
   */
  async processBatch(
    requests: Array<{
      model: string;
      systemPrompt: string;
      userPrompt: string;
      maxTokens?: number;
    }>
  ): Promise<string[]> {
    this.logger.info(`Processing batch of ${requests.length} requests`);

    // Process all requests concurrently reusing the connection
    const promises = requests.map(req =>
      this.processWithStreaming(
        req.model,
        req.systemPrompt,
        req.userPrompt,
        req.maxTokens
      )
    );

    return Promise.all(promises);
  }
}
