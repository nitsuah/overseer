interface DiffViewProps {
  original: string;
  modified: string;
  filename: string;
}

interface DiffLine {
  type: 'add' | 'remove' | 'context' | 'header';
  content: string;
  lineNum?: { old?: number; new?: number };
}

export function DiffView({ original, modified, filename }: DiffViewProps) {
  const diffLines = computeDiff(original, modified);

  return (
    <div className="font-mono text-xs">
      {/* Diff header */}
      <div className="bg-slate-800 border-b border-slate-600 px-2 py-1 text-slate-400">
        <div>diff --git a/{filename} b/{filename}</div>
        <div>--- a/{filename}</div>
        <div>+++ b/{filename}</div>
      </div>

      {/* Diff content */}
      <div className="bg-slate-900">
        {diffLines.map((line, idx) => (
          <div
            key={idx}
            className={`px-2 py-0.5 ${
              line.type === 'add'
                ? 'bg-green-900/30 text-green-300'
                : line.type === 'remove'
                ? 'bg-red-900/30 text-red-300'
                : line.type === 'header'
                ? 'bg-blue-900/30 text-blue-300'
                : 'text-slate-400'
            }`}
          >
            <span className="select-none text-slate-600 inline-block w-16 text-right mr-2">
              {line.lineNum?.old !== undefined && (
                <span className="inline-block w-6 text-right">{line.lineNum.old}</span>
              )}
              {' '}
              {line.lineNum?.new !== undefined && (
                <span className="inline-block w-6 text-right">{line.lineNum.new}</span>
              )}
            </span>
            <span className="select-none inline-block w-4">
              {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
            </span>
            <span className="whitespace-pre">{line.content || ' '}</span>
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <div className="bg-slate-800 border-t border-slate-600 px-2 py-1 text-slate-400 text-xs">
        {diffLines.filter(l => l.type === 'add').length} additions, {diffLines.filter(l => l.type === 'remove').length} deletions
      </div>
    </div>
  );
}

function computeDiff(original: string, modified: string): DiffLine[] {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  
  // Use Myers diff algorithm (LCS-based)
  const lcs = computeLCS(originalLines, modifiedLines);
  const diff: DiffLine[] = [];
  
  let oi = 0, mi = 0;
  let lcsIdx = 0;
  
  while (oi < originalLines.length || mi < modifiedLines.length) {
    if (lcsIdx < lcs.length && 
        oi === lcs[lcsIdx].oldIdx && 
        mi === lcs[lcsIdx].newIdx) {
      // This line is in common
      diff.push({
        type: 'context',
        content: originalLines[oi],
        lineNum: { old: oi + 1, new: mi + 1 },
      });
      oi++;
      mi++;
      lcsIdx++;
    } else if (lcsIdx < lcs.length && oi < lcs[lcsIdx].oldIdx) {
      // Line removed from original
      diff.push({
        type: 'remove',
        content: originalLines[oi],
        lineNum: { old: oi + 1 },
      });
      oi++;
    } else if (lcsIdx < lcs.length && mi < lcs[lcsIdx].newIdx) {
      // Line added to modified
      diff.push({
        type: 'add',
        content: modifiedLines[mi],
        lineNum: { new: mi + 1 },
      });
      mi++;
    } else {
      // End of LCS - add remaining lines
      if (oi < originalLines.length) {
        diff.push({
          type: 'remove',
          content: originalLines[oi],
          lineNum: { old: oi + 1 },
        });
        oi++;
      } else if (mi < modifiedLines.length) {
        diff.push({
          type: 'add',
          content: modifiedLines[mi],
          lineNum: { new: mi + 1 },
        });
        mi++;
      }
    }
  }
  
  // Collapse context to only show lines near changes
  return collapseContext(diff);
}

function computeLCS(a: string[], b: string[]): Array<{ oldIdx: number; newIdx: number }> {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  
  // Build LCS length matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Backtrack to find LCS
  const lcs: Array<{ oldIdx: number; newIdx: number }> = [];
  let i = m, j = n;
  
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift({ oldIdx: i - 1, newIdx: j - 1 });
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return lcs;
}

function collapseContext(diff: DiffLine[]): DiffLine[] {
  const CONTEXT_LINES = 3;
  const result: DiffLine[] = [];
  let i = 0;
  
  while (i < diff.length) {
    if (diff[i].type !== 'context') {
      // Found a change - include context before and after
      const start = Math.max(0, i - CONTEXT_LINES);
      
      // Add context separator if we skipped lines
      const lastLine = result.length > 0 ? result[result.length - 1].lineNum?.old : undefined;
      if (lastLine !== undefined && start > lastLine + 1) {
        result.push({ type: 'header', content: '...' });
      }
      
      // Add context before change
      for (let j = start; j < i; j++) {
        if (diff[j].type === 'context' && 
            !result.some(r => r.lineNum?.old === diff[j].lineNum?.old)) {
          result.push(diff[j]);
        }
      }
      
      // Add the change(s)
      while (i < diff.length && diff[i].type !== 'context') {
        result.push(diff[i]);
        i++;
      }
      
      // Add context after change
      const contextEnd = Math.min(diff.length, i + CONTEXT_LINES);
      for (let j = i; j < contextEnd; j++) {
        if (diff[j].type === 'context') {
          result.push(diff[j]);
        }
      }
      
      i = contextEnd;
    } else {
      i++;
    }
  }
  
  return result;
}
