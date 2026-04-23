import fs from 'fs';
import path from 'path';
import {
  parseDiff,
  getLanguageFromFilename,
  getAddedLines,
  getTotalChanges,
  type DiffFile,
} from '../../src/github/diff-parser';

const sampleDiff = fs.readFileSync(
  path.join(__dirname, '../fixtures/sample-diff.txt'),
  'utf-8',
);

describe('diff-parser', () => {
  describe('getLanguageFromFilename', () => {
    it('should detect TypeScript files', () => {
      expect(getLanguageFromFilename('src/utils/auth.ts')).toBe('typescript');
      expect(getLanguageFromFilename('App.tsx')).toBe('typescript');
    });

    it('should detect JavaScript files', () => {
      expect(getLanguageFromFilename('index.js')).toBe('javascript');
      expect(getLanguageFromFilename('Component.jsx')).toBe('javascript');
    });

    it('should detect other common languages', () => {
      expect(getLanguageFromFilename('main.py')).toBe('python');
      expect(getLanguageFromFilename('Main.java')).toBe('java');
      expect(getLanguageFromFilename('handler.php')).toBe('php');
      expect(getLanguageFromFilename('main.go')).toBe('go');
    });

    it('should return unknown for unrecognized extensions', () => {
      expect(getLanguageFromFilename('Makefile')).toBe('unknown');
      expect(getLanguageFromFilename('file.xyz')).toBe('unknown');
    });
  });

  describe('parseDiff', () => {
    let files: DiffFile[];

    beforeAll(() => {
      files = parseDiff(sampleDiff);
    });

    it('should parse the correct number of files', () => {
      expect(files).toHaveLength(2);
    });

    it('should parse filenames correctly', () => {
      expect(files[0].filename).toBe('src/utils/auth.ts');
      expect(files[1].filename).toBe('src/index.ts');
    });

    it('should detect file languages', () => {
      expect(files[0].language).toBe('typescript');
      expect(files[1].language).toBe('typescript');
    });

    it('should detect file status', () => {
      expect(files[0].status).toBe('modified');
      expect(files[1].status).toBe('added');
    });

    it('should parse chunks correctly', () => {
      expect(files[0].chunks.length).toBeGreaterThanOrEqual(1);
      expect(files[0].chunks[0].newStart).toBe(1);
    });

    it('should count additions and deletions', () => {
      expect(files[0].additions).toBeGreaterThan(0);
      expect(files[0].deletions).toBeGreaterThan(0);
      expect(files[1].additions).toBe(5);
      expect(files[1].deletions).toBe(0);
    });

    it('should parse individual line changes', () => {
      const addedChanges = files[0].chunks[0].changes.filter((c) => c.type === 'add');
      expect(addedChanges.length).toBeGreaterThan(0);
      expect(addedChanges[0].content).toBeDefined();
      expect(typeof addedChanges[0].line).toBe('number');
    });
  });

  describe('getAddedLines', () => {
    it('should return only added lines from a file', () => {
      const files = parseDiff(sampleDiff);
      const added = getAddedLines(files[1]);
      expect(added.length).toBe(5);
      expect(added.every((c) => c.type === 'add')).toBe(true);
    });
  });

  describe('getTotalChanges', () => {
    it('should sum additions and deletions across all files', () => {
      const files = parseDiff(sampleDiff);
      const totals = getTotalChanges(files);
      expect(totals.additions).toBeGreaterThan(0);
      expect(totals.deletions).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty diff', () => {
      const files = parseDiff('');
      expect(files).toHaveLength(0);
    });

    it('should handle diff with no chunks', () => {
      const diff = 'diff --git a/file.txt b/file.txt\nindex abc..def 100644\n';
      const files = parseDiff(diff);
      expect(files).toHaveLength(1);
      expect(files[0].chunks).toHaveLength(0);
    });
  });
});
