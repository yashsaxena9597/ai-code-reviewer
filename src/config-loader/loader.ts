import yaml from 'js-yaml';
import { z } from 'zod/v4';
import { DEFAULT_CONFIG, type ReviewConfig } from '../config/defaults';

const configSchema = z.object({
  provider: z.enum(['claude', 'openai']).optional(),
  model: z.string().optional(),
  review: z
    .object({
      categories: z.array(z.enum(['code-quality', 'security', 'performance'])).optional(),
      max_files: z.number().min(1).max(100).optional(),
      max_lines: z.number().min(50).max(2000).optional(),
      min_score_to_pass: z.number().min(1).max(10).optional(),
      auto_suggest_fixes: z.boolean().optional(),
    })
    .optional(),
  ignore: z
    .object({
      files: z.array(z.string()).optional(),
      directories: z.array(z.string()).optional(),
    })
    .optional(),
});

export function parseConfigYaml(content: string): ReviewConfig {
  let parsed: unknown;
  try {
    parsed = yaml.load(content);
  } catch {
    return { ...DEFAULT_CONFIG };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ...DEFAULT_CONFIG };
  }

  const result = configSchema.safeParse(parsed);

  if (!result.success) {
    return { ...DEFAULT_CONFIG };
  }

  const userConfig = result.data;

  return {
    provider: userConfig.provider ?? DEFAULT_CONFIG.provider,
    model: userConfig.model ?? DEFAULT_CONFIG.model,
    review: {
      categories: userConfig.review?.categories ?? DEFAULT_CONFIG.review.categories,
      max_files: userConfig.review?.max_files ?? DEFAULT_CONFIG.review.max_files,
      max_lines: userConfig.review?.max_lines ?? DEFAULT_CONFIG.review.max_lines,
      min_score_to_pass:
        userConfig.review?.min_score_to_pass ?? DEFAULT_CONFIG.review.min_score_to_pass,
      auto_suggest_fixes:
        userConfig.review?.auto_suggest_fixes ?? DEFAULT_CONFIG.review.auto_suggest_fixes,
    },
    ignore: {
      files: userConfig.ignore?.files ?? DEFAULT_CONFIG.ignore.files,
      directories: userConfig.ignore?.directories ?? DEFAULT_CONFIG.ignore.directories,
    },
  };
}

export function shouldIgnoreFile(
  filename: string,
  config: ReviewConfig,
): boolean {
  // Check directory ignores (only match top-level or as a path segment)
  for (const dir of config.ignore.directories) {
    if (filename.startsWith(`${dir}/`)) {
      return true;
    }
    // Match as a path segment (e.g., "src/__tests__/file.ts" matches "__tests__")
    const segments = filename.split('/');
    if (segments.slice(0, -1).includes(dir)) {
      return true;
    }
  }

  // Check file pattern ignores
  for (const pattern of config.ignore.files) {
    if (matchGlobPattern(pattern, filename)) {
      return true;
    }
  }

  return false;
}

function matchGlobPattern(pattern: string, filename: string): boolean {
  const basename = filename.split('/').pop() || '';

  // Exact match
  if (pattern === basename || pattern === filename) return true;

  // Wildcard extension match (e.g., *.md)
  if (pattern.startsWith('*.')) {
    const ext = pattern.slice(1);
    return basename.endsWith(ext);
  }

  // Simple wildcard match
  if (pattern.includes('*')) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
    return regex.test(basename);
  }

  return false;
}
