import React from 'react';

interface DiffViewProps {
  original: string;
  modified: string;
  filename: string;
}

interface DiffLine {
  type: 'add' | 'remove' | 'context' | 'header';
  content: string;
  lineNum?: { old?: number; new?: number };
  hiddenLines?: DiffLine[]; // For expandable context headers
}

export function DiffView({ original, modified, filename }: DiffViewProps) {
  const diffLines = computeDiff(original, modified);
  const [expandedSections, setExpandedSections] = React.useState<Set<number>>(new Set());

  const toggleExpand = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  return (
    <div className="font-mono text-xs w-full overflow-x-auto">
      {/* Diff header */}
      <div className="bg-slate-800 border-b border-slate-600 px-2 py-1 text-slate-400">
        <div>diff --git a/{filename} b/{filename}</div>
        <div>--- a/{filename}</div>
        <div>+++ b/{filename}</div>
      </div>

      {/* Diff content */}
      <div className="bg-slate-900">
        {diffLines.map((line, idx) => {
          // Handle expandable context headers
          if (line.type === 'header' && line.hiddenLines) {
            const isExpanded = expandedSections.has(idx);
            return (
              <React.Fragment key={idx}>
                <div
                  className="bg-blue-900/20 text-blue-300 px-2 py-1 cursor-pointer hover:bg-blue-900/30 border-y border-blue-800/50"
                  onClick={() => toggleExpand(idx)}
                >
                  <span className="select-none inline-block w-20 text-right mr-2 text-slate-600">...</span>
                  <span className="select-none inline-block w-4 text-slate-600">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <span className="text-xs">
                    {isExpanded ? 'Hide' : 'Show'} {line.hiddenLines.length} unchanged lines
                  </span>
                </div>
                {isExpanded && line.hiddenLines.map((hiddenLine, hiddenIdx) => (
                  <div
                    key={`${idx}-hidden-${hiddenIdx}`}
                    className="text-slate-400 px-2 py-0.5"
                  >
                    <span className="select-none text-slate-600 inline-block w-16 text-right mr-2">
                      {hiddenLine.lineNum?.old !== undefined && (
                        <span className="inline-block w-6 text-right">{hiddenLine.lineNum.old}</span>
                      )}
                      {' '}
                      {hiddenLine.lineNum?.new !== undefined && (
                        <span className="inline-block w-6 text-right">{hiddenLine.lineNum.new}</span>
                      )}
                    </span>
                    <span className="select-none inline-block w-4"> </span>
                    <span className="whitespace-pre">{hiddenLine.content || ' '}</span>
                  </div>
                ))}
              </React.Fragment>
            );
          }

          return (
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
              <span className="whitespace-pre-wrap break-words">{line.content || ' '}</span>
            </div>
          );
        })}
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
  // Set ignoreWhitespace to true to treat lines with only whitespace differences as unchanged
  const lcs = computeLCS(originalLines, modifiedLines, true);
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
    } else {
      // Handle changes - collect deletions and additions, then pair them up
      const removes: DiffLine[] = [];
      const adds: DiffLine[] = [];
      
      // Collect consecutive removes
      while (oi < originalLines.length && 
             (lcsIdx >= lcs.length || oi < lcs[lcsIdx].oldIdx)) {
        removes.push({
          type: 'remove',
          content: originalLines[oi],
          lineNum: { old: oi + 1 },
        });
        oi++;
      }
      
      // Collect consecutive adds
      while (mi < modifiedLines.length && 
             (lcsIdx >= lcs.length || mi < lcs[lcsIdx].newIdx)) {
        adds.push({
          type: 'add',
          content: modifiedLines[mi],
          lineNum: { new: mi + 1 },
        });
        mi++;
      }
      
      // Pair up lines - if they're identical, treat as context
      const maxLen = Math.max(removes.length, adds.length);
      for (let i = 0; i < maxLen; i++) {
        const removeLine = i < removes.length ? removes[i] : null;
        const addLine = i < adds.length ? adds[i] : null;
        
        // If both exist and are identical, treat as context
        if (removeLine && addLine && removeLine.content === addLine.content) {
          diff.push({
            type: 'context',
            content: removeLine.content,
            lineNum: { 
              old: removeLine.lineNum?.old, 
              new: addLine.lineNum?.new 
            },
          });
        } else {
          // Show as actual changes
          if (removeLine) diff.push(removeLine);
          if (addLine) diff.push(addLine);
        }
      }
    }
  }
  
  // Collapse context to focus on changes
  return collapseContext(diff);
}

/**
 * Computes the Longest Common Subsequence (LCS) between two arrays of strings.
 * Optionally ignores whitespace differences by trimming lines before comparison.
 * Note: When ignoreWhitespace is true, whitespace-only changes will be treated as unchanged.
 * @param a - The first array of lines.
 * @param b - The second array of lines.
 * @param ignoreWhitespace - If true, trims lines before comparison. Default: false.
 */
function computeLCS(
  a: string[],
  b: string[],
  ignoreWhitespace: boolean = false
): Array<{ oldIdx: number; newIdx: number }> {
  const m = a.length;
  const n = b.length;
  
  // Normalize lines for comparison if requested
  const aNorm = ignoreWhitespace ? a.map(line => line.trim()) : a;
  const bNorm = ignoreWhitespace ? b.map(line => line.trim()) : b;
  
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  
  // Build LCS length matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (aNorm[i - 1] === bNorm[j - 1]) {
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
    if (aNorm[i - 1] === bNorm[j - 1]) {
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
  let lastAddedIdx = -1;
  
  // Find all change blocks (consecutive non-context lines)
  const changeBlocks: Array<{ start: number; end: number }> = [];
  let i = 0;
  while (i < diff.length) {
    if (diff[i].type !== 'context') {
      const blockStart = i;
      while (i < diff.length && diff[i].type !== 'context') {
        i++;
      }
      changeBlocks.push({ start: blockStart, end: i - 1 });
    } else {
      i++;
    }
  }
  
  // Process each change block with context
  changeBlocks.forEach((block, blockIdx) => {
    const contextStart = Math.max(0, block.start - CONTEXT_LINES);
    const contextEnd = Math.min(diff.length - 1, block.end + CONTEXT_LINES);
    
    // Add expandable header if we skipped lines
    if (lastAddedIdx >= 0 && contextStart > lastAddedIdx + 1) {
      const hiddenStart = lastAddedIdx + 1;
      const hiddenEnd = contextStart - 1;
      const hiddenLines = diff.slice(hiddenStart, hiddenEnd + 1).filter(l => l.type === 'context');
      
      if (hiddenLines.length > 0) {
        result.push({ 
          type: 'header', 
          content: '...',
          hiddenLines
        });
      }
    }
    
    // Add leading context (if this is the first block, add from start)
    if (blockIdx === 0 && contextStart > 0) {
      const hiddenLines = diff.slice(0, contextStart).filter(l => l.type === 'context');
      if (hiddenLines.length > 0) {
        result.push({ 
          type: 'header', 
          content: '...',
          hiddenLines
        });
      }
    }
    
    // Add context before change
    for (let j = contextStart; j < block.start; j++) {
      if (diff[j].type === 'context' && j > lastAddedIdx) {
        result.push(diff[j]);
        lastAddedIdx = j;
      }
    }
    
    // Add the changes
    for (let j = block.start; j <= block.end; j++) {
      result.push(diff[j]);
      lastAddedIdx = j;
    }
    
    // Add context after change
    for (let j = block.end + 1; j <= contextEnd; j++) {
      if (diff[j].type === 'context' && j > lastAddedIdx) {
        result.push(diff[j]);
        lastAddedIdx = j;
      }
    }
  });
  
  // Add final expandable section if there are trailing lines
  if (lastAddedIdx < diff.length - 1) {
    const hiddenLines = diff.slice(lastAddedIdx + 1).filter(l => l.type === 'context');
    if (hiddenLines.length > 0) {
      result.push({ 
        type: 'header', 
        content: '...',
        hiddenLines
      });
    }
  }
  
  return result;
}
