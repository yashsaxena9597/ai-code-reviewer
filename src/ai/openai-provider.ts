import OpenAI from 'openai';
import type { AIProvider, ReviewResponse } from './provider';
import { parseAIResponse } from './response-parser';
import logger from '../utils/logger';

const DEFAULT_MODEL = 'gpt-4o';

export class OpenAIProvider implements AIProvider {
  public readonly name = 'openai';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new OpenAI({ apiKey });
    this.model = model || DEFAULT_MODEL;
  }

  async reviewCode(prompt: string): Promise<ReviewResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 4096,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert code reviewer. Always respond with valid JSON matching the requested format. Be thorough but only flag real issues.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        logger.error('OpenAI response contained no content');
        return { findings: [], summary: 'No response from OpenAI.' };
      }

      return parseAIResponse(content);
    } catch (error) {
      logger.error('OpenAI API call failed', { error });
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
