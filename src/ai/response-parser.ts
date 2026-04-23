import { z } from 'zod/v4';
import type { ReviewResponse, ReviewFinding } from './provider';
import logger from '../utils/logger';

const findingSchema = z.object({
  line: z.number(),
  severity: z.enum(['critical', 'warning', 'info']),
  category: z.enum(['code-quality', 'security', 'performance']),
  issue: z.string().min(1),
  explanation: z.string().min(1),
  suggestedFix: z.string().nullable(),
});

const responseSchema = z.object({
  findings: z.array(findingSchema),
  summary: z.string().min(1),
});

export function parseAIResponse(rawResponse: string): ReviewResponse {
  // Strip markdown code fencing if present
  let cleaned = rawResponse.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    logger.warn('Failed to parse AI response as JSON', { error, rawResponse: rawResponse.slice(0, 200) });
    return {
      findings: [],
      summary: 'Unable to parse AI review response.',
    };
  }

  const result = responseSchema.safeParse(parsed);

  if (!result.success) {
    logger.warn('AI response does not match expected schema', {
      errors: result.error.issues,
    });
    return {
      findings: [],
      summary: 'AI response did not match expected format.',
    };
  }

  return result.data;
}

export function filterFindingsByMinSeverity(
  findings: ReviewFinding[],
  minSeverity: 'info' | 'warning' | 'critical',
): ReviewFinding[] {
  const severityOrder = { info: 0, warning: 1, critical: 2 };
  const minLevel = severityOrder[minSeverity];
  return findings.filter((f) => severityOrder[f.severity] >= minLevel);
}
