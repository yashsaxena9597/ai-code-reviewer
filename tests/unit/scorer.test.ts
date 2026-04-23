import { calculateScore } from '../../src/review/scorer';
import type { ReviewFinding } from '../../src/ai/provider';

const makeFinding = (severity: ReviewFinding['severity'], category: ReviewFinding['category'] = 'code-quality'): ReviewFinding => ({
  line: 1,
  severity,
  category,
  issue: 'Test issue',
  explanation: 'Test explanation',
  suggestedFix: null,
});

describe('scorer', () => {
  it('should return perfect score for no findings', () => {
    const score = calculateScore([], 100, 6);
    expect(score.score).toBe(10);
    expect(score.grade).toBe('A+');
    expect(score.passed).toBe(true);
  });

  it('should reduce score for critical findings', () => {
    const findings = [makeFinding('critical', 'security')];
    const score = calculateScore(findings, 100, 6);
    expect(score.score).toBeLessThanOrEqual(5);
    expect(score.breakdown.critical).toBe(1);
  });

  it('should reduce score less for warnings', () => {
    const findings = [makeFinding('warning')];
    const score = calculateScore(findings, 100, 6);
    expect(score.score).toBeGreaterThan(5);
    expect(score.score).toBeLessThan(10);
  });

  it('should reduce score minimally for info findings', () => {
    const findings = [makeFinding('info')];
    const score = calculateScore(findings, 100, 6);
    expect(score.score).toBeGreaterThan(9);
  });

  it('should fail when score is below minimum', () => {
    const findings = [
      makeFinding('critical', 'security'),
      makeFinding('critical', 'security'),
      makeFinding('critical', 'security'),
    ];
    const score = calculateScore(findings, 10, 6);
    expect(score.passed).toBe(false);
  });

  it('should pass when score meets minimum', () => {
    const findings = [makeFinding('info')];
    const score = calculateScore(findings, 100, 6);
    expect(score.passed).toBe(true);
  });

  it('should count breakdown correctly', () => {
    const findings = [
      makeFinding('critical'),
      makeFinding('critical'),
      makeFinding('warning'),
      makeFinding('info'),
      makeFinding('info'),
      makeFinding('info'),
    ];
    const score = calculateScore(findings, 50, 6);
    expect(score.breakdown.critical).toBe(2);
    expect(score.breakdown.warning).toBe(1);
    expect(score.breakdown.info).toBe(3);
  });

  it('should cap critical findings score at 5', () => {
    const findings = [makeFinding('critical')];
    const score = calculateScore(findings, 1000, 6); // large lines = small penalty
    expect(score.score).toBeLessThanOrEqual(5);
  });

  it('should never go below 1', () => {
    const findings = Array(50).fill(null).map(() => makeFinding('critical', 'security'));
    const score = calculateScore(findings, 1, 6);
    expect(score.score).toBeGreaterThanOrEqual(1);
  });

  it('should assign correct grades', () => {
    expect(calculateScore([], 100, 6).grade).toBe('A+');

    const warningFindings = [makeFinding('warning'), makeFinding('warning')];
    const warningScore = calculateScore(warningFindings, 100, 6);
    expect(['A+', 'A', 'B+', 'B', 'C', 'D', 'F']).toContain(warningScore.grade);
  });
});
