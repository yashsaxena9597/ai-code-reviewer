import type { Octokit } from '@octokit/rest';
import type { ReviewSummary } from '../review/formatter';
import logger from '../utils/logger';

export async function createCheckRun(
  octokit: Octokit,
  owner: string,
  repo: string,
  headSha: string,
  summary: ReviewSummary,
): Promise<void> {
  await octokit.checks.create({
    owner,
    repo,
    name: 'AI Code Review',
    head_sha: headSha,
    status: 'completed',
    conclusion: summary.conclusion,
    output: {
      title: summary.title,
      summary: summary.body,
    },
  });

  logger.info(`Created check run for ${headSha}: ${summary.conclusion}`);
}
