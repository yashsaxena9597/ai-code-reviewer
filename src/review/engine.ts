import type { DiffFile } from '../github/diff-parser';
import type { ReviewConfig } from '../config/defaults';
import type { AIProvider, ReviewFinding, ReviewResponse } from '../ai/provider';
import { buildReviewPrompt } from '../ai/prompt-builder';
import { shouldIgnoreFile } from '../config-loader/loader';
import { calculateScore, type ReviewScore } from './scorer';
import { formatInlineComments, formatSummaryComment, formatCheckRunOutput, type ReviewComment, type ReviewSummary } from './formatter';
import { getTotalChanges } from '../github/diff-parser';
import logger from '../utils/logger';

export interface EngineResult {
  comments: ReviewComment[];
  summaryComment: string;
  checkRun: ReviewSummary;
  score: ReviewScore;
  findings: ReviewFinding[];
  filesReviewed: number;
}

export async function reviewPullRequest(
  files: DiffFile[],
  config: ReviewConfig,
  provider: AIProvider,
): Promise<EngineResult> {
  // Filter files
  const filesToReview = files
    .filter((f) => f.status !== 'removed')
    .filter((f) => !shouldIgnoreFile(f.filename, config))
    .slice(0, config.review.max_files);

  logger.info(`Reviewing ${filesToReview.length} of ${files.length} files using ${provider.name}`);

  const allFindings: ReviewFinding[] = [];
  const allComments: ReviewComment[] = [];
  const fileSummaries: string[] = [];

  for (const file of filesToReview) {
    // Skip files with too many lines
    if (file.additions + file.deletions > config.review.max_lines) {
      logger.info(`Skipping ${file.filename}: too many changes (${file.additions + file.deletions} lines)`);
      fileSummaries.push(`**${file.filename}**: Skipped (too many changes)`);
      continue;
    }

    try {
      const prompt = buildReviewPrompt(
        file,
        config.review.categories,
        config.review.auto_suggest_fixes,
      );

      const response: ReviewResponse = await provider.reviewCode(prompt);

      allFindings.push(...response.findings);
      allComments.push(...formatInlineComments(response.findings, file.filename));
      fileSummaries.push(`**${file.filename}**: ${response.summary}`);

      logger.info(`Reviewed ${file.filename}: ${response.findings.length} findings`);
    } catch (error) {
      logger.error(`Failed to review ${file.filename}`, { error });
      fileSummaries.push(`**${file.filename}**: Review failed`);
    }
  }

  const { additions } = getTotalChanges(filesToReview);
  const score = calculateScore(allFindings, additions, config.review.min_score_to_pass);

  const summaryComment = formatSummaryComment(
    score,
    allFindings,
    filesToReview.length,
    fileSummaries,
  );

  const checkRun = formatCheckRunOutput(score, allFindings, filesToReview.length);

  return {
    comments: allComments,
    summaryComment,
    checkRun,
    score,
    findings: allFindings,
    filesReviewed: filesToReview.length,
  };
}
