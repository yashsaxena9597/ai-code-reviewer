import type { Octokit } from '@octokit/rest';
import logger from '../utils/logger';

export interface PRDetails {
  owner: string;
  repo: string;
  number: number;
  title: string;
  baseSha: string;
  headSha: string;
  diff: string;
  filesChanged: number;
}

export async function fetchPRDetails(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
): Promise<PRDetails> {
  const [prResponse, diffResponse] = await Promise.all([
    octokit.pulls.get({ owner, repo, pull_number: pullNumber }),
    octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
      mediaType: { format: 'diff' },
    }),
  ]);

  const pr = prResponse.data;

  logger.info(`Fetched PR #${pullNumber}: "${pr.title}" (${pr.changed_files} files)`);

  return {
    owner,
    repo,
    number: pullNumber,
    title: pr.title,
    baseSha: pr.base.sha,
    headSha: pr.head.sha,
    diff: diffResponse.data as unknown as string,
    filesChanged: pr.changed_files,
  };
}

export async function fetchFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<string | null> {
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if ('content' in response.data && response.data.content) {
      return Buffer.from(response.data.content, 'base64').toString('utf-8');
    }

    return null;
  } catch {
    return null;
  }
}
