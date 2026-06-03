import { test, expect } from 'vitest';
import { checkCommunityStandards } from '../lib/community-standards';

test('marks core standards healthy when present in owner .github fallback', () => {
  const result = checkCommunityStandards(['README.md'], {
    fallbackFiles: ['CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md'],
    fallbackRepo: 'nitsuah/.github',
  });

  const contributing = result.standards.find((s) => s.type === 'contributing');
  const codeOfConduct = result.standards.find((s) => s.type === 'code_of_conduct');
  const security = result.standards.find((s) => s.type === 'security');

  expect(contributing?.status).toBe('healthy');
  expect(codeOfConduct?.status).toBe('healthy');
  expect(security?.status).toBe('healthy');

  expect(contributing?.details.existsInRepo).toBe(false);
  expect(contributing?.details.existsInGithubFallback).toBe(true);
});

test('marks core standards missing when absent from both repo and fallback', () => {
  const result = checkCommunityStandards(['README.md'], {
    fallbackFiles: [],
    fallbackRepo: 'nitsuah/.github',
  });

  const contributing = result.standards.find((s) => s.type === 'contributing');
  const codeOfConduct = result.standards.find((s) => s.type === 'code_of_conduct');
  const security = result.standards.find((s) => s.type === 'security');

  expect(contributing?.status).toBe('missing');
  expect(codeOfConduct?.status).toBe('missing');
  expect(security?.status).toBe('missing');

  expect(contributing?.details.existsInRepo).toBe(false);
  expect(contributing?.details.existsInGithubFallback).toBe(false);
});

test('prefers repo-local presence details when both local and fallback files exist', () => {
  const result = checkCommunityStandards(['CONTRIBUTING.md', 'SECURITY.md'], {
    fallbackFiles: ['CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md'],
    fallbackRepo: 'nitsuah/.github',
  });

  const contributing = result.standards.find((s) => s.type === 'contributing');
  const security = result.standards.find((s) => s.type === 'security');

  expect(contributing?.status).toBe('healthy');
  expect(security?.status).toBe('healthy');

  expect(contributing?.details.existsInRepo).toBe(true);
  expect(contributing?.details.existsInGithubFallback).toBe(true);
  expect(security?.details.existsInRepo).toBe(true);
  expect(security?.details.existsInGithubFallback).toBe(true);
});

test('marks funding/issue_template/pr_template healthy when present in org .github fallback', () => {
  const result = checkCommunityStandards(['README.md'], {
    fallbackFiles: [
      '.github/funding.yml',
      '.github/ISSUE_TEMPLATE/bug_report.md',
      '.github/PULL_REQUEST_TEMPLATE.md',
    ],
    fallbackRepo: 'nitsuah/.github',
  });

  const funding = result.standards.find((s) => s.type === 'funding');
  const issueTemplate = result.standards.find((s) => s.type === 'issue_template');
  const prTemplate = result.standards.find((s) => s.type === 'pr_template');

  expect(funding?.status).toBe('healthy');
  expect(funding?.details.existsInRepo).toBe(false);
  expect(funding?.details.existsInGithubFallback).toBe(true);

  expect(issueTemplate?.status).toBe('healthy');
  expect(issueTemplate?.details.existsInRepo).toBe(false);
  expect(issueTemplate?.details.existsInGithubFallback).toBe(true);

  expect(prTemplate?.status).toBe('healthy');
  expect(prTemplate?.details.existsInRepo).toBe(false);
  expect(prTemplate?.details.existsInGithubFallback).toBe(true);
});

test('marks codeowners healthy when present in repo (.github/, root, docs/)', () => {
  const cases = ['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS'];
  for (const file of cases) {
    const result = checkCommunityStandards([file], {});
    const codeowners = result.standards.find((s) => s.type === 'codeowners');
    expect(codeowners?.status, `expected healthy for ${file}`).toBe('healthy');
    expect(codeowners?.details.existsInRepo).toBe(true);
    expect(codeowners?.details.existsInGithubFallback).toBe(false);
  }
});

test('marks codeowners healthy when present in org .github fallback', () => {
  const result = checkCommunityStandards(['README.md'], {
    fallbackFiles: ['CODEOWNERS'],
    fallbackRepo: 'nitsuah/.github',
  });
  const codeowners = result.standards.find((s) => s.type === 'codeowners');
  expect(codeowners?.status).toBe('healthy');
  expect(codeowners?.details.existsInRepo).toBe(false);
  expect(codeowners?.details.existsInGithubFallback).toBe(true);
});

test('marks codeowners missing when absent from both repo and fallback', () => {
  const result = checkCommunityStandards(['README.md'], {
    fallbackFiles: [],
    fallbackRepo: 'nitsuah/.github',
  });
  const codeowners = result.standards.find((s) => s.type === 'codeowners');
  expect(codeowners?.status).toBe('missing');
  expect(codeowners?.details.existsInRepo).toBe(false);
  expect(codeowners?.details.existsInGithubFallback).toBe(false);
});
