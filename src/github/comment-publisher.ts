import type { Octokit } from '@octokit/rest';
import type { ReviewComment } from '../review/formatter';
import logger from '../utils/logger';

export async function submitReview(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
  commitSha: string,
  comments: ReviewComment[],
  summaryBody: string,
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT' = 'COMMENT',
): Promise<void> {
  const reviewComments = comments.map((comment) => ({
    path: comment.path,
    line: comment.line,
    body: comment.body,
  }));

  try {
    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      commit_id: commitSha,
      body: summaryBody,
      event,
      comments: reviewComments,
    });

    logger.info(`Submitted review with ${comments.length} comments on PR #${pullNumber}`);
  } catch (error) {
    logger.error('Failed to submit PR review', { error, pullNumber });

    // Fallback: post summary as a regular comment if review fails
    await postComment(octokit, owner, repo, pullNumber, summaryBody);
  }
}

export async function postComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
  body: string,
): Promise<void> {
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: pullNumber,
    body,
  });

  logger.info(`Posted comment on PR #${pullNumber}`);
}
