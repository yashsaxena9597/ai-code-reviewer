export interface DiffFile {
  filename: string;
  language: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  chunks: DiffChunk[];
  additions: number;
  deletions: number;
}

export interface DiffChunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  content: string;
  changes: DiffChange[];
}

export interface DiffChange {
  type: 'add' | 'delete' | 'normal';
  line: number;
  content: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  java: 'java',
  php: 'php',
  cs: 'csharp',
  cpp: 'cpp',
  c: 'c',
  swift: 'swift',
  kt: 'kotlin',
  yml: 'yaml',
  yaml: 'yaml',
  json: 'json',
  md: 'markdown',
  sql: 'sql',
  sh: 'shell',
  bash: 'shell',
  css: 'css',
  scss: 'scss',
  html: 'html',
};

export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return LANGUAGE_MAP[ext] || 'unknown';
}

export function parseDiff(rawDiff: string): DiffFile[] {
  const files: DiffFile[] = [];
  const fileDiffs = rawDiff.split(/^diff --git /m).filter(Boolean);

  for (const fileDiff of fileDiffs) {
    const file = parseFileDiff(fileDiff);
    if (file) {
      files.push(file);
    }
  }

  return files;
}

function parseFileDiff(fileDiff: string): DiffFile | null {
  const lines = fileDiff.split('\n');

  // Extract filename from the first line: a/path b/path
  const headerMatch = lines[0]?.match(/a\/(.+?)\s+b\/(.+)/);
  if (!headerMatch) return null;

  const filename = headerMatch[2];
  const language = getLanguageFromFilename(filename);

  // Determine file status
  let status: DiffFile['status'] = 'modified';
  if (fileDiff.includes('new file mode')) status = 'added';
  else if (fileDiff.includes('deleted file mode')) status = 'removed';
  else if (fileDiff.includes('rename from')) status = 'renamed';

  const chunks: DiffChunk[] = [];
  let additions = 0;
  let deletions = 0;

  // Find chunk headers: @@ -oldStart,oldLines +newStart,newLines @@
  const chunkRegex = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@(.*)$/;
  let currentChunk: DiffChunk | null = null;
  let currentNewLine = 0;

  for (const line of lines) {
    const chunkMatch = line.match(chunkRegex);

    if (chunkMatch) {
      if (currentChunk) chunks.push(currentChunk);

      const newStart = parseInt(chunkMatch[3], 10);
      currentNewLine = newStart;

      currentChunk = {
        oldStart: parseInt(chunkMatch[1], 10),
        oldLines: parseInt(chunkMatch[2] || '1', 10),
        newStart,
        newLines: parseInt(chunkMatch[4] || '1', 10),
        content: '',
        changes: [],
      };
      continue;
    }

    if (!currentChunk) continue;

    if (line.startsWith('+') && !line.startsWith('+++')) {
      currentChunk.changes.push({
        type: 'add',
        line: currentNewLine,
        content: line.substring(1),
      });
      currentChunk.content += line.substring(1) + '\n';
      additions++;
      currentNewLine++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      currentChunk.changes.push({
        type: 'delete',
        line: currentNewLine,
        content: line.substring(1),
      });
      deletions++;
    } else if (line.startsWith(' ')) {
      currentChunk.changes.push({
        type: 'normal',
        line: currentNewLine,
        content: line.substring(1),
      });
      currentNewLine++;
    }
  }

  if (currentChunk) chunks.push(currentChunk);

  return {
    filename,
    language,
    status,
    chunks,
    additions,
    deletions,
  };
}

export function getAddedLines(file: DiffFile): DiffChange[] {
  return file.chunks.flatMap((chunk) => chunk.changes.filter((change) => change.type === 'add'));
}

export function getTotalChanges(files: DiffFile[]): { additions: number; deletions: number } {
  return files.reduce(
    (totals, file) => ({
      additions: totals.additions + file.additions,
      deletions: totals.deletions + file.deletions,
    }),
    { additions: 0, deletions: 0 },
  );
}
