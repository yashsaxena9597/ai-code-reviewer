import fs from 'fs';
import path from 'path';
import { parseAIResponse, filterFindingsByMinSeverity } from '../../src/ai/response-parser';
import type { ReviewFinding } from '../../src/ai/provider';

const sampleResponse = fs.readFileSync(
  path.join(__dirname, '../fixtures/sample-ai-response.json'),
  'utf-8',
);

describe('response-parser', () => {
  describe('parseAIResponse', () => {
    it('should parse a valid JSON response', () => {
      const result = parseAIResponse(sampleResponse);
      expect(result.findings).toHaveLength(2);
      expect(result.summary).toBeDefined();
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('should parse findings with correct structure', () => {
      const result = parseAIResponse(sampleResponse);
      const finding = result.findings[0];
      expect(finding.line).toBe(3);
      expect(finding.severity).toBe('critical');
      expect(finding.category).toBe('security');
      expect(finding.issue).toContain('Hardcoded secret');
      expect(finding.explanation).toBeDefined();
      expect(finding.suggestedFix).toBeDefined();
    });

    it('should handle JSON wrapped in markdown code fences', () => {
      const wrapped = '```json\n' + sampleResponse + '\n```';
      const result = parseAIResponse(wrapped);
      expect(result.findings).toHaveLength(2);
    });

    it('should handle JSON wrapped in plain code fences', () => {
      const wrapped = '```\n' + sampleResponse + '\n```';
      const result = parseAIResponse(wrapped);
      expect(result.findings).toHaveLength(2);
    });

    it('should return empty findings for invalid JSON', () => {
      const result = parseAIResponse('this is not json at all');
      expect(result.findings).toHaveLength(0);
      expect(result.summary).toContain('Unable to parse');
    });

    it('should return empty findings for malformed response structure', () => {
      const result = parseAIResponse('{"foo": "bar"}');
      expect(result.findings).toHaveLength(0);
      expect(result.summary).toContain('did not match');
    });

    it('should handle empty findings array', () => {
      const result = parseAIResponse('{"findings": [], "summary": "All good!"}');
      expect(result.findings).toHaveLength(0);
      expect(result.summary).toBe('All good!');
    });

    it('should handle response with extra whitespace', () => {
      const result = parseAIResponse('  \n' + sampleResponse + '\n  ');
      expect(result.findings).toHaveLength(2);
    });
  });

  describe('filterFindingsByMinSeverity', () => {
    const findings: ReviewFinding[] = [
      {
        line: 1,
        severity: 'info',
        category: 'code-quality',
        issue: 'Info issue',
        explanation: 'Detail',
        suggestedFix: null,
      },
      {
        line: 2,
        severity: 'warning',
        category: 'code-quality',
        issue: 'Warning issue',
        explanation: 'Detail',
        suggestedFix: null,
      },
      {
        line: 3,
        severity: 'critical',
        category: 'security',
        issue: 'Critical issue',
        explanation: 'Detail',
        suggestedFix: 'fix code',
      },
    ];

    it('should return all findings when min severity is info', () => {
      expect(filterFindingsByMinSeverity(findings, 'info')).toHaveLength(3);
    });

    it('should filter out info when min severity is warning', () => {
      const filtered = filterFindingsByMinSeverity(findings, 'warning');
      expect(filtered).toHaveLength(2);
      expect(filtered.every((f) => f.severity !== 'info')).toBe(true);
    });

    it('should return only critical when min severity is critical', () => {
      const filtered = filterFindingsByMinSeverity(findings, 'critical');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].severity).toBe('critical');
    });
  });
});
