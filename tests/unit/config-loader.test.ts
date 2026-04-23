import fs from 'fs';
import path from 'path';
import { parseConfigYaml, shouldIgnoreFile } from '../../src/config-loader/loader';
import { DEFAULT_CONFIG } from '../../src/config/defaults';

const sampleConfig = fs.readFileSync(
  path.join(__dirname, '../fixtures/sample-config.yml'),
  'utf-8',
);

describe('config-loader', () => {
  describe('parseConfigYaml', () => {
    it('should parse a valid config file', () => {
      const config = parseConfigYaml(sampleConfig);
      expect(config.provider).toBe('openai');
      expect(config.model).toBe('gpt-4o');
      expect(config.review.categories).toEqual(['code-quality', 'security']);
      expect(config.review.max_files).toBe(10);
      expect(config.review.max_lines).toBe(300);
      expect(config.review.min_score_to_pass).toBe(7);
      expect(config.review.auto_suggest_fixes).toBe(false);
    });

    it('should return defaults for empty content', () => {
      const config = parseConfigYaml('');
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should return defaults for invalid YAML', () => {
      const config = parseConfigYaml('not: [valid: yaml: content');
      expect(config.provider).toBe(DEFAULT_CONFIG.provider);
    });

    it('should merge partial config with defaults', () => {
      const config = parseConfigYaml('provider: openai\n');
      expect(config.provider).toBe('openai');
      expect(config.model).toBe(DEFAULT_CONFIG.model);
      expect(config.review.max_files).toBe(DEFAULT_CONFIG.review.max_files);
      expect(config.ignore.files).toEqual(DEFAULT_CONFIG.ignore.files);
    });

    it('should handle config with only review section', () => {
      const config = parseConfigYaml('review:\n  max_files: 5\n');
      expect(config.review.max_files).toBe(5);
      expect(config.review.max_lines).toBe(DEFAULT_CONFIG.review.max_lines);
      expect(config.provider).toBe(DEFAULT_CONFIG.provider);
    });

    it('should handle config with only ignore section', () => {
      const config = parseConfigYaml('ignore:\n  files:\n    - "*.log"\n');
      expect(config.ignore.files).toEqual(['*.log']);
      expect(config.ignore.directories).toEqual(DEFAULT_CONFIG.ignore.directories);
    });
  });

  describe('shouldIgnoreFile', () => {
    const config = DEFAULT_CONFIG;

    it('should ignore files matching extension patterns', () => {
      expect(shouldIgnoreFile('README.md', config)).toBe(true);
      expect(shouldIgnoreFile('data.json', config)).toBe(true);
      expect(shouldIgnoreFile('package-lock.json', config)).toBe(true);
    });

    it('should ignore files in ignored directories', () => {
      expect(shouldIgnoreFile('node_modules/express/index.js', config)).toBe(true);
      expect(shouldIgnoreFile('dist/bundle.js', config)).toBe(true);
      expect(shouldIgnoreFile('src/distribution/file.ts', config)).toBe(false); // "distribution" should not match "dist"
    });

    it('should not ignore valid source files', () => {
      expect(shouldIgnoreFile('src/index.ts', config)).toBe(false);
      expect(shouldIgnoreFile('src/utils/auth.ts', config)).toBe(false);
      expect(shouldIgnoreFile('app.js', config)).toBe(false);
    });

    it('should ignore lock files', () => {
      expect(shouldIgnoreFile('yarn.lock', config)).toBe(true);
      expect(shouldIgnoreFile('pnpm-lock.yaml', config)).toBe(false); // not in default list but *.lock matches
    });

    it('should ignore minified files', () => {
      expect(shouldIgnoreFile('bundle.min.js', config)).toBe(true);
      expect(shouldIgnoreFile('styles.min.css', config)).toBe(true);
    });

    it('should work with custom config', () => {
      const customConfig = parseConfigYaml(sampleConfig);
      expect(shouldIgnoreFile('src/auth.test.ts', customConfig)).toBe(true);
      expect(shouldIgnoreFile('src/auth.spec.ts', customConfig)).toBe(true);
      expect(shouldIgnoreFile('__tests__/helper.ts', customConfig)).toBe(true);
      expect(shouldIgnoreFile('src/auth.ts', customConfig)).toBe(false);
    });
  });
});
