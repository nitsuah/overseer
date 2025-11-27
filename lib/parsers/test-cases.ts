/**
 * Test case parser - counts test cases in test files
 * Detects: it(), test(), describe() calls (Jest, Vitest, Mocha patterns)
 */

interface TestStats {
  totalTests: number;
  totalDescribeBlocks: number;
  testFiles: string[];
}

/**
 * Parse test file content and count test cases
 */
export function parseTestFile(content: string): { tests: number; describes: number } {
  let tests = 0;
  let describes = 0;

  // Match it(), test(), it.skip(), it.only(), test.skip(), test.only(), etc.
  // Handles: it('...', test('..., it("...", test("...
  const testPatterns = [
    /\bit\s*\(/g,           // it(
    /\btest\s*\(/g,         // test(
    /\bit\.\w+\s*\(/g,      // it.skip(, it.only(, etc.
    /\btest\.\w+\s*\(/g,    // test.skip(, test.only(, etc.
  ];

  // Match describe(), describe.skip(), describe.only(), etc.
  const describePatterns = [
    /\bdescribe\s*\(/g,     // describe(
    /\bdescribe\.\w+\s*\(/g, // describe.skip(, describe.only(, etc.
  ];

  // Remove comments to avoid counting commented tests
  const cleanContent = content
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*/g, '');          // Remove line comments

  // Count test cases
  for (const pattern of testPatterns) {
    const matches = cleanContent.match(pattern);
    if (matches) {
      tests += matches.length;
    }
  }

  // Count describe blocks
  for (const pattern of describePatterns) {
    const matches = cleanContent.match(pattern);
    if (matches) {
      describes += matches.length;
    }
  }

  return { tests, describes };
}

/**
 * Aggregate test stats from multiple files
 */
export function aggregateTestStats(files: { path: string; content: string }[]): TestStats {
  let totalTests = 0;
  let totalDescribeBlocks = 0;
  const testFiles: string[] = [];

  for (const file of files) {
    const stats = parseTestFile(file.content);
    if (stats.tests > 0 || stats.describes > 0) {
      totalTests += stats.tests;
      totalDescribeBlocks += stats.describes;
      testFiles.push(file.path);
    }
  }

  return {
    totalTests,
    totalDescribeBlocks,
    testFiles,
  };
}

/**
 * Check if a file is a test file by path
 */
export function isTestFile(path: string): boolean {
  const testPatterns = [
    /\.test\.(ts|tsx|js|jsx)$/,
    /\.spec\.(ts|tsx|js|jsx)$/,
    /__tests__\//,
    /\.test\./,
    /\.spec\./,
  ];

  return testPatterns.some(pattern => pattern.test(path.toLowerCase()));
}
