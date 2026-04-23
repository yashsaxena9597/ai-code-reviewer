import type { ReviewFinding } from '../ai/provider';

export interface ReviewScore {
  score: number;
  grade: string;
  passed: boolean;
  breakdown: {
    critical: number;
    warning: number;
    info: number;
  };
}

const SEVERITY_WEIGHTS = {
  critical: 2.5,
  warning: 1.0,
  info: 0.3,
};

const GRADE_MAP: [number, string][] = [
  [9, 'A+'],
  [8, 'A'],
  [7, 'B+'],
  [6, 'B'],
  [5, 'C'],
  [4, 'D'],
  [0, 'F'],
];

export function calculateScore(
  findings: ReviewFinding[],
  totalLinesChanged: number,
  minScoreToPass: number,
): ReviewScore {
  const breakdown = {
    critical: findings.filter((f) => f.severity === 'critical').length,
    warning: findings.filter((f) => f.severity === 'warning').length,
    info: findings.filter((f) => f.severity === 'info').length,
  };

  const totalPenalty =
    breakdown.critical * SEVERITY_WEIGHTS.critical +
    breakdown.warning * SEVERITY_WEIGHTS.warning +
    breakdown.info * SEVERITY_WEIGHTS.info;

  // Normalize penalty by lines changed (more lines = more tolerance)
  const normalizedPenalty = totalLinesChanged > 0 ? totalPenalty / Math.sqrt(totalLinesChanged) : totalPenalty;

  // Score starts at 10 and decreases with penalty
  let score = Math.max(1, Math.round((10 - normalizedPenalty) * 10) / 10);

  // Auto-fail if any critical security issue exists
  if (breakdown.critical > 0 && score > 5) {
    score = Math.min(score, 5);
  }

  // Cap at 10
  score = Math.min(10, score);

  const grade = GRADE_MAP.find(([threshold]) => score >= threshold)?.[1] || 'F';

  return {
    score,
    grade,
    passed: score >= minScoreToPass,
    breakdown,
  };
}
