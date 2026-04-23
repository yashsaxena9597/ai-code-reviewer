export interface ReviewFinding {
  line: number;
  severity: 'critical' | 'warning' | 'info';
  category: 'code-quality' | 'security' | 'performance';
  issue: string;
  explanation: string;
  suggestedFix: string | null;
}

export interface ReviewResponse {
  findings: ReviewFinding[];
  summary: string;
}

export interface AIProvider {
  name: string;
  reviewCode(prompt: string): Promise<ReviewResponse>;
}

export type ProviderName = 'claude' | 'openai';

import { ClaudeProvider } from './claude-provider';
import { OpenAIProvider } from './openai-provider';

export function createProvider(name: ProviderName, apiKey: string, model?: string): AIProvider {
  switch (name) {
    case 'claude':
      return new ClaudeProvider(apiKey, model);
    case 'openai':
      return new OpenAIProvider(apiKey, model);
    default:
      throw new Error(`Unknown AI provider: ${name}`);
  }
}
