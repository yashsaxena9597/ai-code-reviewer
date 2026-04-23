import { formatFixSuggestion, formatAllSuggestions } from '../../src/review/fix-suggester';
import type { ReviewFinding } from '../../src/ai/provider';

describe('fix-suggester', () => {
  const criticalFinding: ReviewFinding = {
    line: 3,
    severity: 'critical',
    category: 'security',
    issue: 'Hardcoded secret',
    explanation: 'Secret should not be in code',
    suggestedFix: 'const SECRET = process.env.JWT_SECRET;',
  };

  const warningFinding: ReviewFinding = {
    line: 10,
    severity: 'warning',
    category: 'code-quality',
    issue: 'Empty catch block',
    explanation: 'Errors are silently swallowed',
    suggestedFix: null,
  };

  describe('formatFixSuggestion', () => {
    it('should format a finding with a suggested fix', () => {
      const result = formatFixSuggestion(criticalFinding);
      expect(result.line).toBe(3);
      expect(result.body).toContain('CRITICAL');
      expect(result.body).toContain('Hardcoded secret');
      expect(result.body).toContain('```suggestion');
      expect(result.body).toContain('process.env.JWT_SECRET');
    });

    it('should format a finding without a suggested fix', () => {
      const result = formatFixSuggestion(warningFinding);
      expect(result.line).toBe(10);
      expect(result.body).toContain('WARNING');
      expect(result.body).not.toContain('```suggestion');
    });

    it('should use correct emoji for each severity', () => {
      expect(formatFixSuggestion(criticalFinding).body).toContain('🔴');
      expect(formatFixSuggestion(warningFinding).body).toContain('🟡');
      expect(
        formatFixSuggestion({ ...warningFinding, severity: 'info' }).body,
      ).toContain('🔵');
    });
  });

  describe('formatAllSuggestions', () => {
    it('should format multiple findings', () => {
      const results = formatAllSuggestions([criticalFinding, warningFinding]);
      expect(results).toHaveLength(2);
      expect(results[0].line).toBe(3);
      expect(results[1].line).toBe(10);
    });

    it('should handle empty findings', () => {
      expect(formatAllSuggestions([])).toHaveLength(0);
    });
  });
});
