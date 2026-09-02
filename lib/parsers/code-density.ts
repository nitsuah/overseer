/**
 * Code density parser - computes token density and comment-to-code ratio
 * from source file content.
 *
 * Token density: average tokens per line of code (a proxy for logical-unit
 * density — dense files pack more logic per line).
 * Comment-to-code ratio: comment lines / code lines (documentation density).
 */

interface CodeDensityStats {
  tokenDensity: number | null;
  commentToCodeRatio: number | null;
  filesAnalyzed: number;
}

const CODE_EXTENSIONS = /\.(ts|tsx|js|jsx|py|go|rs|java|rb|php|c|h|cpp|hpp|cs|swift|kt|scala|sh|sql)$/;

/**
 * Parse a single source file and return token + comment counts.
 */
export function parseCodeDensity(content: string): {
  tokens: number;
  commentLines: number;
  codeLines: number;
} {
  const lines = content.split(/\r?\n/);
  let tokens = 0;
  let commentLines = 0;
  let codeLines = 0;

  let inBlockComment = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Handle block comments spanning multiple lines
    if (inBlockComment) {
      commentLines++;
      if (line.includes('*/')) inBlockComment = false;
      continue;
    }

    // Strip inline block comment start
    const blockStart = line.indexOf('/*');
    const lineComment = line.indexOf('//');
    const hashComment = line.startsWith('#') || line.startsWith('<!--');

    if (blockStart !== -1 && (lineComment === -1 || blockStart < lineComment)) {
      // Line starts a block comment
      commentLines++;
      if (!line.includes('*/')) inBlockComment = true;
      continue;
    }

    if (lineComment !== -1 && (blockStart === -1 || lineComment < blockStart)) {
      // Line comment (or code + trailing comment)
      const codePart = line.slice(0, lineComment).trim();
      if (codePart) {
        codeLines++;
        tokens += codePart.split(/\s+/).length;
      } else {
        commentLines++;
      }
      continue;
    }

    if (hashComment) {
      commentLines++;
      continue;
    }

    codeLines++;
    tokens += line.split(/\s+/).length;
  }

  return { tokens, commentLines, codeLines };
}

/**
 * Aggregate density stats across a set of source files.
 * Returns nulls when no analyzable files were found.
 */
export function aggregateCodeDensity(files: { path: string; content: string }[]): CodeDensityStats {
  let totalTokens = 0;
  let totalCommentLines = 0;
  let totalCodeLines = 0;
  let filesAnalyzed = 0;

  for (const file of files) {
    if (!CODE_EXTENSIONS.test(file.path.toLowerCase())) continue;
    const stats = parseCodeDensity(file.content);
    totalTokens += stats.tokens;
    totalCommentLines += stats.commentLines;
    totalCodeLines += stats.codeLines;
    filesAnalyzed++;
  }

  if (filesAnalyzed === 0 || totalCodeLines === 0) {
    return { tokenDensity: null, commentToCodeRatio: null, filesAnalyzed: 0 };
  }

  return {
    tokenDensity: totalTokens / totalCodeLines,
    commentToCodeRatio: totalCommentLines / totalCodeLines,
    filesAnalyzed,
  };
}