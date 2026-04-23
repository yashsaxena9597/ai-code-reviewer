export interface ReviewConfig {
  provider: 'claude' | 'openai';
  model: string;
  review: {
    categories: ReviewCategory[];
    max_files: number;
    max_lines: number;
    min_score_to_pass: number;
    auto_suggest_fixes: boolean;
  };
  ignore: {
    files: string[];
    directories: string[];
  };
}

export type ReviewCategory = 'code-quality' | 'security' | 'performance';

export const DEFAULT_CONFIG: ReviewConfig = {
  provider: 'claude',
  model: 'claude-sonnet-4-6',
  review: {
    categories: ['code-quality', 'security', 'performance'],
    max_files: 20,
    max_lines: 500,
    min_score_to_pass: 6,
    auto_suggest_fixes: true,
  },
  ignore: {
    files: [
      '*.md',
      '*.json',
      'package-lock.json',
      'yarn.lock',
      '*.lock',
      '*.min.js',
      '*.min.css',
    ],
    directories: ['node_modules', 'dist', 'build', '.github', 'coverage', 'vendor'],
  },
};
