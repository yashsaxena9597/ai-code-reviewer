import type { ReviewFinding } from '../ai/provider';
import type { ReviewScore } from './scorer';
import type { DiffFile } from '../github/diff-parser';

export interface ReviewComment {
  path: string;
  line: number;
  body: string;
}

export interface ReviewSummary {
  title: string;
  body: string;
  conclusion: 'success' | 'failure' | 'neutral';
}

const SEVERITY_EMOJI = {
  critical: '🔴',
  warning: '🟡',
  info: '🔵',
};

export function formatInlineComments(
  findings: ReviewFinding[],
  filename: string,
): ReviewComment[] {
  return findings.map((finding) => {
    const emoji = SEVERITY_EMOJI[finding.severity];
    let body = `### ${emoji} ${finding.severity.toUpperCase()}: ${finding.issue}\n\n`;
    body += `**Category:** ${finding.category}\n\n`;
    body += `${finding.explanation}\n`;

    if (finding.suggestedFix) {
      body += `\n**Suggested fix:**\n\`\`\`suggestion\n${finding.suggestedFix}\n\`\`\`\n`;
    }

    return {
      path: filename,
      line: finding.line,
      body,
    };
  });
}

export function formatSummaryComment(
  score: ReviewScore,
  allFindings: ReviewFinding[],
  filesReviewed: number,
  summaries: string[],
): string {
  const scoreBar = generateScoreBar(score.score);

  let body = `## 🤖 AI Code Review Summary\n\n`;
  body += `### Score: ${score.score}/10 ${score.grade} ${score.passed ? '✅' : '❌'}\n\n`;
  body += `${scoreBar}\n\n`;

  body += `| Metric | Count |\n|--------|-------|\n`;
  body += `| Files Reviewed | ${filesReviewed} |\n`;
  body += `| 🔴 Critical | ${score.breakdown.critical} |\n`;
  body += `| 🟡 Warnings | ${score.breakdown.warning} |\n`;
  body += `| 🔵 Info | ${score.breakdown.info} |\n`;
  body += `| **Total Issues** | **${allFindings.length}** |\n\n`;

  if (summaries.length > 0) {
    body += `### File Summaries\n\n`;
    summaries.forEach((s) => {
      body += `> ${s}\n\n`;
    });
  }

  if (score.breakdown.critical > 0) {
    body += `### ⚠️ Critical Issues Found\n\n`;
    const criticals = allFindings.filter((f) => f.severity === 'critical');
    criticals.forEach((f) => {
      body += `- **${f.issue}** (line ${f.line}): ${f.explanation.slice(0, 150)}...\n`;
    });
    body += '\n';
  }

  body += `---\n*Reviewed by [AI Code Reviewer](https://github.com/yashsaxena/ai-code-reviewer)*`;

  return body;
}

export function formatCheckRunOutput(
  score: ReviewScore,
  allFindings: ReviewFinding[],
  filesReviewed: number,
): ReviewSummary {
  const conclusion = score.passed ? 'success' : 'failure';
  const title = `Score: ${score.score}/10 ${score.grade} - ${allFindings.length} issue(s) found`;

  let body = `## Review Results\n\n`;
  body += `- **Score:** ${score.score}/10 (${score.grade})\n`;
  body += `- **Status:** ${score.passed ? 'PASSED ✅' : 'FAILED ❌'}\n`;
  body += `- **Files Reviewed:** ${filesReviewed}\n`;
  body += `- **Issues:** ${score.breakdown.critical} critical, ${score.breakdown.warning} warnings, ${score.breakdown.info} info\n\n`;

  if (allFindings.length > 0) {
    body += `### Issues\n\n`;
    allFindings.forEach((f) => {
      const emoji = SEVERITY_EMOJI[f.severity];
      body += `${emoji} **${f.issue}** (line ${f.line})\n`;
    });
  }

  return { title, body, conclusion };
}

function generateScoreBar(score: number): string {
  const filled = Math.round(score);
  const empty = 10 - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${score}/10`;
}
