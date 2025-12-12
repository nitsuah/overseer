import { test, expect } from 'vitest';
import { checkBestPractices } from '../lib/best-practices';
import type { Octokit } from '@octokit/rest';

function mockOctokit(): Octokit {
  return {
    rest: {
      repos: {
        getBranch: async () => { throw new Error('mock'); }
      }
    }
  } as unknown as Octokit;
}

test('detects Hardhat testing framework', async () => {
  const fileList = [
    'hardhat.config.ts',
    'test/RegisterPortal.test.ts',
    'test/Domains.test.ts',
    'contracts/RegisterPortal.sol',
    'package.json'
  ];
  const res = await checkBestPractices('owner','repo', mockOctokit(), fileList);
  const testing = res.practices.find(p => p.type === 'testing_framework');
  expect(testing?.status).toBe('healthy');
  expect(testing?.details.detected).toContain('hardhat.config.ts');
  expect(testing?.details.testFileCount).toBeGreaterThan(0);
});

test('detects Foundry testing framework with .t.sol tests', async () => {
  const fileList = [
    'foundry.toml',
    'test/Counter.t.sol',
    'test/Token.t.sol',
    'src/Counter.sol'
  ];
  const res = await checkBestPractices('owner','repo', mockOctokit(), fileList);
  const testing = res.practices.find(p => p.type === 'testing_framework');
  expect(testing?.status).toBe('healthy');
  expect(testing?.details.testFileCount).toBe(2); // Two .t.sol files
});

test('detects Truffle testing framework', async () => {
  const fileList = [
    'truffle-config.js',
    'test/token.test.js',
    'contracts/Token.sol'
  ];
  const res = await checkBestPractices('owner','repo', mockOctokit(), fileList);
  const testing = res.practices.find(p => p.type === 'testing_framework');
  expect(testing?.status).toBe('healthy');
});

test('detects Solhint linting configuration', async () => {
  const fileList = [
    '.solhint.json',
    '.solhintignore',
    'hardhat.config.ts',
    'contracts/RegisterPortal.sol'
  ];
  const res = await checkBestPractices('owner','repo', mockOctokit(), fileList);
  const linting = res.practices.find(p => p.type === 'linting');
  expect(linting?.status).toBe('healthy');
  expect(linting?.details.detected).toContain('.solhint.json');
});

test('detects alternative Solhint config (.solhintrc)', async () => {
  const fileList = [
    '.solhintrc.json',
    'contracts/Token.sol'
  ];
  const res = await checkBestPractices('owner','repo', mockOctokit(), fileList);
  const linting = res.practices.find(p => p.type === 'linting');
  expect(linting?.status).toBe('healthy');
});

test('detects Slither static analyzer config', async () => {
  const fileList = [
    'slither.config.json',
    'contracts/NFT.sol'
  ];
  const res = await checkBestPractices('owner','repo', mockOctokit(), fileList);
  const linting = res.practices.find(p => p.type === 'linting');
  expect(linting?.status).toBe('healthy');
});

test('Web3 project with both testing and linting (deployer-like)', async () => {
  const fileList = [
    'hardhat.config.ts',
    '.solhint.json',
    '.solhintignore',
    'test/RegisterPortal.test.ts',
    'test/LabNFT.test.ts',
    'test/Domains.test.ts',
    'contracts/RegisterPortal.sol',
    'contracts/LabNFT.sol',
    'contracts/Domains.sol',
    'package.json',
    'tsconfig.json'
  ];
  const res = await checkBestPractices('owner','repo', mockOctokit(), fileList);
  
  const testing = res.practices.find(p => p.type === 'testing_framework');
  expect(testing?.status).toBe('healthy');
  expect(testing?.details.testFileCount).toBe(3);
  
  const linting = res.practices.find(p => p.type === 'linting');
  expect(linting?.status).toBe('healthy');
});

test('Hardhat config without tests yields dormant status', async () => {
  const fileList = [
    'hardhat.config.ts',
    'contracts/Token.sol',
    'package.json'
  ];
  const res = await checkBestPractices('owner','repo', mockOctokit(), fileList);
  const testing = res.practices.find(p => p.type === 'testing_framework');
  expect(testing?.status).toBe('dormant'); // Config exists but no test files
});

test('Solidity contracts without linting yields missing status', async () => {
  const fileList = [
    'hardhat.config.ts',
    'contracts/Token.sol',
    'test/token.test.ts'
  ];
  const res = await checkBestPractices('owner','repo', mockOctokit(), fileList);
  const linting = res.practices.find(p => p.type === 'linting');
  expect(linting?.status).toBe('missing');
});
