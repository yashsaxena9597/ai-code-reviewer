import type { DiffFile } from '../github/diff-parser';
import type { ReviewCategory } from '../config/defaults';

const CATEGORY_INSTRUCTIONS: Record<ReviewCategory, string> = {
  'code-quality': `**Code Quality**: Look for bugs, logic errors, anti-patterns, code smells, dead code, unclear naming, missing error handling, and violations of clean code principles.`,
  security: `**Security**: Identify vulnerabilities including hardcoded secrets/credentials, SQL injection, XSS, command injection, path traversal, insecure deserialization, missing input validation, improper authentication/authorization, and OWASP Top 10 issues.`,
  performance: `**Performance**: Flag N+1 queries, unnecessary re-renders, memory leaks, inefficient algorithms, missing caching opportunities, synchronous blocking operations, and unoptimized database queries.`,
};

export function buildReviewPrompt(
  file: DiffFile,
  categories: ReviewCategory[],
  autoSuggestFixes: boolean,
): string {
  const categoryInstructions = categories
    .map((cat) => CATEGORY_INSTRUCTIONS[cat])
    .join('\n\n');

  const diffContent = file.chunks
    .map((chunk) =>
      chunk.changes
        .map((change) => {
          const prefix = change.type === 'add' ? '+' : change.type === 'delete' ? '-' : ' ';
          return `${prefix} ${change.line}: ${change.content}`;
        })
        .join('\n'),
    )
    .join('\n\n');

  const fixInstruction = autoSuggestFixes
    ? `For each issue found, provide a "suggestedFix" with the corrected code snippet. If no fix is applicable, set it to null.`
    : `Set "suggestedFix" to null for all findings.`;

  return `You are an expert code reviewer. Analyze the following code diff and identify issues.

## File: ${file.filename} (${file.language})

## Review Categories
${categoryInstructions}

## Code Diff (+ = added lines, - = removed lines, line numbers shown)
\`\`\`
${diffContent}
\`\`\`

## Instructions
- Focus ONLY on the added (+) and modified lines.
- Reference the exact line number where each issue occurs.
- Be specific and actionable in your explanations.
- Only report real issues, not style preferences.
- ${fixInstruction}

## Required Response Format
Respond with valid JSON only, no markdown fencing:
{
  "findings": [
    {
      "line": <line_number>,
      "severity": "critical" | "warning" | "info",
      "category": "code-quality" | "security" | "performance",
      "issue": "<brief issue title>",
      "explanation": "<detailed explanation of the problem and why it matters>",
      "suggestedFix": "<corrected code snippet or null>"
    }
  ],
  "summary": "<2-3 sentence overview of the code quality>"
}

If no issues are found, return: {"findings": [], "summary": "<positive summary>"}`;
}
