import { Octokit } from '@octokit/rest';

export type TemplateLanguage = 'python' | 'javascript' | 'mixed' | 'other';

export async function detectTemplateLanguage(octokit: Octokit, owner: string, repo: string): Promise<TemplateLanguage> {
  let rootFiles: string[] = [];
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path: '' });
    if (Array.isArray(data)) rootFiles = data.map(f => f.name.toLowerCase());
  } catch {}

  const pythonSignals = [
    'pyproject.toml',
    'requirements.txt',
    'setup.py',
    'pytest.ini',
  ];
  const jsSignals = [
    'package.json',
    'tsconfig.json',
    'eslint.config.mjs',
    '.eslintrc.js',
    'vitest.config.ts',
    'jest.config.js',
  ];

  const hasPython = pythonSignals.some(f => rootFiles.includes(f));
  const hasJS = jsSignals.some(f => rootFiles.includes(f));

  if (hasPython && hasJS) return 'mixed';
  if (hasPython) return 'python';
  if (hasJS) return 'javascript';
  return 'other';
}
