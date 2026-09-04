import { test, expect } from 'vitest';
import { parseCodeDensity, aggregateCodeDensity } from '../lib/parsers/code-density';

test('parseCodeDensity counts tokens, comments, and code lines', () => {
  const content = `// header comment
const x = 1; // trailing comment
/* block
   comment */
function add(a, b) {
  return a + b;
}
# python-style comment
`;

  const stats = parseCodeDensity(content);
  // Code lines: const x = 1; / function add(a, b) { / return a + b; / } = 4
  expect(stats.codeLines).toBe(4);
  // Comment lines: // header, /* block, comment */, # python-style = 4
  expect(stats.commentLines).toBe(4);
  // Tokens: const(1) x(2) =(3) 1;(4) function(5) add(a,(6) b)(7) {(8) return(9) a(10) +(11) b;(12) }(13)
  expect(stats.tokens).toBe(13);
});

test('aggregateCodeDensity computes ratio and density across files', () => {
  const result = aggregateCodeDensity([
    { path: 'src/a.ts', content: '// c\nconst a = 1;\nconst b = 2;\n' },
    { path: 'src/b.ts', content: 'export function f() { return 1; }\n' },
    { path: 'README.md', content: '# not code\n' },
  ]);

  expect(result.filesAnalyzed).toBe(2);
  // codeLines: 2 + 1 = 3; commentLines: 1; tokens: 8 + 7 = 15
  expect(result.commentToCodeRatio).toBeCloseTo(1 / 3);
  expect(result.tokenDensity).toBeCloseTo(5);
});

test('aggregateCodeDensity returns nulls when no source files', () => {
  const result = aggregateCodeDensity([
    { path: 'README.md', content: '# docs only\n' },
  ]);
  expect(result.filesAnalyzed).toBe(0);
  expect(result.tokenDensity).toBeNull();
  expect(result.commentToCodeRatio).toBeNull();
});