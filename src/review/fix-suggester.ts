import type { ReviewFinding } from '../ai/provider';

export interface FormattedSuggestion {
  line: number;
  body: string;
}

export function formatFixSuggestion(finding: ReviewFinding): FormattedSuggestion {
  const severityEmoji = {
    critical: '🔴',
    warning: '🟡',
    info: '🔵',
  };

  const emoji = severityEmoji[finding.severity];
  let body = `${emoji} **${finding.severity.toUpperCase()}** - ${finding.issue}\n\n`;
  body += `${finding.explanation}\n`;

  if (finding.suggestedFix) {
    body += `\n**Suggested fix:**\n`;
    body += `\`\`\`suggestion\n${finding.suggestedFix}\n\`\`\`\n`;
  }

  return {
    line: finding.line,
    body,
  };
}

export function formatAllSuggestions(findings: ReviewFinding[]): FormattedSuggestion[] {
  return findings.map(formatFixSuggestion);
}
