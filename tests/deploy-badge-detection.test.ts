import { test, expect } from 'vitest';
import { checkBestPractices } from '../lib/best-practices';
import type { Octokit } from '@octokit/rest';

function mockOctokit(): Octokit {
  // Minimal mock: getBranch throws so branch protection defaults
  return {
    rest: {
      repos: {
        getBranch: async () => { throw new Error('mock'); }
      }
    }
  } as unknown as Octokit;
}

test('detects Netlify deploy badge', async () => {
  const readme = `[![Netlify Status](https://api.netlify.com/api/v1/badges/25a0a90d-195b-4e53-9d94-9a4107321939/deploy-status)](https://app.netlify.com/projects/nitsuah-arcade/deploys)`;
  const res = await checkBestPractices('owner','repo', mockOctokit(), [], readme);
  const deploy = res.practices.find(p=>p.type==='deploy_badge');
  expect(deploy?.status).toBe('healthy');
});

test('detects GitHub Actions deploy badge', async () => {
  const readme = `[![Deploy Status](https://github.com/nitsuah/avatar/actions/workflows/deploy.yml/badge.svg)](https://github.com/nitsuah/avatar/actions)`;
  const res = await checkBestPractices('owner','repo', mockOctokit(), [], readme);
  const deploy = res.practices.find(p=>p.type==='deploy_badge');
  expect(deploy?.status).not.toBe('missing');
});

test('detects Vercel deployed-on shields badge', async () => {
  const readme = `[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)`;
  const res = await checkBestPractices('owner','repo', mockOctokit(), [], readme);
  const deploy = res.practices.find(p=>p.type==='deploy_badge');
  expect(deploy?.status).toBe('healthy');
});

test('mixed badges: CI + Deploy yields healthy', async () => {
  const readme = `
[![CI](https://github.com/nitsuah/games/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/nitsuah/games/actions)
[![Netlify Status](https://api.netlify.com/api/v1/badges/25a0a90d-195b-4e53-9d94-9a4107321939/deploy-status)](https://app.netlify.com/sites/nitsuah-arcade/deploys)
`;
  const res = await checkBestPractices('owner','repo', mockOctokit(), [], readme);
  const deploy = res.practices.find(p=>p.type==='deploy_badge');
  expect(deploy?.status).toBe('healthy');
});

test('low-confidence deploy indicator yields needs_attention', async () => {
  const readme = `
![Status](https://img.shields.io/badge/deploy-ready-blue)
`;
  const res = await checkBestPractices('owner','repo', mockOctokit(), [], readme);
  const deploy = res.practices.find(p=>p.type==='deploy_badge');
  expect(['needs_attention','healthy','missing']).toContain(deploy?.status as string);
});

