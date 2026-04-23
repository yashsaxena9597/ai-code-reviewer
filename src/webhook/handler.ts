import { parseDiff } from '../github/diff-parser';
import { parseConfigYaml } from '../config-loader/loader';
import { createProvider } from '../ai/provider';
import { createInstallationOctokit } from '../github/client';
import { fetchPRDetails, fetchFileContent } from '../github/pr-fetcher';
import { submitReview } from '../github/comment-publisher';
import { createCheckRun } from '../github/check-run';
import { reviewPullRequest } from '../review/engine';
import { getEnv } from '../config/env';
import logger from '../utils/logger';

interface WebhookPayload {
  action: string;
  number: number;
  pull_request: {
    head: {
      sha: string;
      ref: string;
    };
    base: {
      ref: string;
    };
  };
  repository: {
    name: string;
    owner: {
      login: string;
    };
  };
  installation?: {
    id: number;
  };
}

const SUPPORTED_ACTIONS = ['opened', 'synchronize', 'reopened'];

export async function handleWebhook(
  event: string,
  payload: WebhookPayload,
): Promise<{ status: number; message: string }> {
  if (event !== 'pull_request') {
    return { status: 200, message: `Ignored event: ${event}` };
  }

  if (!SUPPORTED_ACTIONS.includes(payload.action)) {
    return { status: 200, message: `Ignored action: ${payload.action}` };
  }

  if (!payload.installation?.id) {
    return { status: 400, message: 'Missing installation ID' };
  }

  const env = getEnv();
  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const pullNumber = payload.number;
  const installationId = payload.installation.id;

  logger.info(`Processing PR #${pullNumber} on ${owner}/${repo} (action: ${payload.action})`);

  try {
    // Create authenticated client
    const octokit = await createInstallationOctokit(
      env.GITHUB_APP_ID,
      Buffer.from(env.GITHUB_APP_PRIVATE_KEY, 'base64').toString('utf-8'),
      installationId,
    );

    // Fetch PR details and diff
    const prDetails = await fetchPRDetails(octokit, owner, repo, pullNumber);

    // Load repo config
    const configContent = await fetchFileContent(
      octokit,
      owner,
      repo,
      '.codereview.yml',
      prDetails.headSha,
    );
    const config = parseConfigYaml(configContent || '');

    // Parse diff
    const files = parseDiff(prDetails.diff);

    // Create AI provider
    const apiKey =
      config.provider === 'claude' ? env.ANTHROPIC_API_KEY : env.OPENAI_API_KEY;
    const provider = createProvider(config.provider, apiKey, config.model);

    // Run review
    const result = await reviewPullRequest(files, config, provider);

    // Publish results
    const reviewEvent = result.score.passed ? 'COMMENT' : 'REQUEST_CHANGES';

    await Promise.all([
      submitReview(
        octokit,
        owner,
        repo,
        pullNumber,
        prDetails.headSha,
        result.comments,
        result.summaryComment,
        reviewEvent as 'COMMENT' | 'REQUEST_CHANGES',
      ),
      createCheckRun(octokit, owner, repo, prDetails.headSha, result.checkRun),
    ]);

    logger.info(
      `Review complete for PR #${pullNumber}: score ${result.score.score}/10 (${result.score.grade})`,
    );

    return {
      status: 200,
      message: `Review complete: ${result.score.score}/10 (${result.findings.length} issues)`,
    };
  } catch (error) {
    logger.error(`Failed to process PR #${pullNumber}`, { error });
    return {
      status: 500,
      message: `Review failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
