import { buildReviewPrompt } from '../../src/ai/prompt-builder';
import { parseDiff } from '../../src/github/diff-parser';
import fs from 'fs';
import path from 'path';

const sampleDiff = fs.readFileSync(
  path.join(__dirname, '../fixtures/sample-diff.txt'),
  'utf-8',
);

describe('prompt-builder', () => {
  const files = parseDiff(sampleDiff);
  const file = files[0]; // auth.ts

  it('should include the filename and language', () => {
    const prompt = buildReviewPrompt(file, ['code-quality'], true);
    expect(prompt).toContain('src/utils/auth.ts');
    expect(prompt).toContain('typescript');
  });

  it('should include category instructions for code-quality', () => {
    const prompt = buildReviewPrompt(file, ['code-quality'], true);
    expect(prompt).toContain('Code Quality');
    expect(prompt).toContain('bugs');
    expect(prompt).not.toContain('Security');
  });

  it('should include multiple category instructions', () => {
    const prompt = buildReviewPrompt(file, ['code-quality', 'security', 'performance'], true);
    expect(prompt).toContain('Code Quality');
    expect(prompt).toContain('Security');
    expect(prompt).toContain('Performance');
  });

  it('should include diff content with line numbers', () => {
    const prompt = buildReviewPrompt(file, ['code-quality'], true);
    expect(prompt).toContain('hardcoded-secret-123');
  });

  it('should include fix instructions when auto_suggest_fixes is true', () => {
    const prompt = buildReviewPrompt(file, ['code-quality'], true);
    expect(prompt).toContain('suggestedFix');
    expect(prompt).toContain('corrected code snippet');
  });

  it('should disable fix suggestions when auto_suggest_fixes is false', () => {
    const prompt = buildReviewPrompt(file, ['code-quality'], false);
    expect(prompt).toContain('Set "suggestedFix" to null');
  });

  it('should request JSON response format', () => {
    const prompt = buildReviewPrompt(file, ['code-quality'], true);
    expect(prompt).toContain('valid JSON');
    expect(prompt).toContain('"findings"');
    expect(prompt).toContain('"severity"');
  });
});
