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
