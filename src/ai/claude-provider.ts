import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, ReviewResponse } from './provider';
import { parseAIResponse } from './response-parser';
import logger from '../utils/logger';

const DEFAULT_MODEL = 'claude-sonnet-4-6-20250514';

export class ClaudeProvider implements AIProvider {
  public readonly name = 'claude';
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model || DEFAULT_MODEL;
  }

  async reviewCode(prompt: string): Promise<ReviewResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        system:
          'You are an expert code reviewer. Always respond with valid JSON matching the requested format. Be thorough but only flag real issues.',
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        logger.error('Claude response contained no text block');
        return { findings: [], summary: 'No response from Claude.' };
      }

      return parseAIResponse(textBlock.text);
    } catch (error) {
      logger.error('Claude API call failed', { error });
      throw new Error(`Claude API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
