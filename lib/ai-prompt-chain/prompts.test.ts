import { describe, it, expect } from 'vitest';
import { buildPracticePrompt } from './prompts';
import type { EnrichedContext } from './types';

function makeContext(
  practiceType: EnrichedContext['practiceType'],
  overrides: Partial<EnrichedContext> = {}
): EnrichedContext {
  return {
    repoName: 'my-repo',
    repoOwner: 'my-owner',
    language: 'TypeScript',
    practiceType,
    template: '# placeholder template',
    ...overrides,
  };
}

describe('buildPracticePrompt snapshots', () => {
  it('deploy_badge with no readme', () => {
    const prompt = buildPracticePrompt(makeContext('deploy_badge'));
    expect(prompt).toMatchSnapshot();
  });

  it('deploy_badge with readme and netlify', () => {
    const prompt = buildPracticePrompt(
      makeContext('deploy_badge', {
        readme: '# My App\n[![CI](https://github.com/badge)](https://github.com)',
        badges: ['[![CI Badge](url)](url)'],
        fileList: ['netlify.toml', '.github/workflows/ci.yml'],
      })
    );
    expect(prompt).toMatchSnapshot();
  });

  it('env_template with discovered vars', () => {
    const prompt = buildPracticePrompt(
      makeContext('env_template', {
        envVars: ['DATABASE_URL', 'API_KEY', 'SECRET'],
        existingFiles: { '.env': 'DATABASE_URL=postgres://localhost/db' },
      })
    );
    expect(prompt).toMatchSnapshot();
  });

  it('dependabot with npm and pip', () => {
    const prompt = buildPracticePrompt(
      makeContext('dependabot', {
        packageManagers: ['npm', 'pip'],
        language: 'Python',
      })
    );
    expect(prompt).toMatchSnapshot();
  });

  it('ci_cd for TypeScript project', () => {
    const prompt = buildPracticePrompt(
      makeContext('ci_cd', {
        packageManagers: ['npm'],
        buildSteps: 'npm install\nnpm run build',
      })
    );
    expect(prompt).toMatchSnapshot();
  });

  it('ci_cd for Python project', () => {
    const prompt = buildPracticePrompt(
      makeContext('ci_cd', {
        language: 'Python',
        packageManagers: ['pip'],
      })
    );
    expect(prompt).toMatchSnapshot();
  });

  it('gitignore for TypeScript', () => {
    const prompt = buildPracticePrompt(makeContext('gitignore', { packageManagers: ['npm'] }));
    expect(prompt).toMatchSnapshot();
  });

  it('pre_commit_hooks for Python', () => {
    const prompt = buildPracticePrompt(
      makeContext('pre_commit_hooks', { language: 'Python', packageManagers: ['pip'] })
    );
    expect(prompt).toMatchSnapshot();
  });

  it('testing_framework for TypeScript', () => {
    const prompt = buildPracticePrompt(makeContext('testing_framework'));
    expect(prompt).toMatchSnapshot();
  });

  it('linting for TypeScript', () => {
    const prompt = buildPracticePrompt(makeContext('linting'));
    expect(prompt).toMatchSnapshot();
  });

  it('docker prompt generates Dockerfile guidance', () => {
    const prompt = buildPracticePrompt(
      makeContext('docker', {
        existingFiles: { 'Dockerfile': 'FROM node:alpine\nWORKDIR /app' },
      })
    );
    expect(prompt).toContain('Dockerfile');
    expect(prompt).toContain('TypeScript');
    expect(prompt).toMatchSnapshot();
  });

  it('docker prompt truncates oversized context to aggregate limit', () => {
    const prompt = buildPracticePrompt(
      makeContext('docker', {
        existingFiles: { 'Dockerfile': 'x'.repeat(3000) },
      })
    );
    expect(prompt).toContain('...(truncated)');
    expect(prompt).toContain('TASK:');
  });
});

describe('buildPracticePrompt content assertions', () => {
  it('deploy_badge includes repo name', () => {
    const prompt = buildPracticePrompt(makeContext('deploy_badge'));
    expect(prompt).toContain('my-repo');
  });

  it('env_template lists discovered env vars', () => {
    const prompt = buildPracticePrompt(
      makeContext('env_template', { envVars: ['MY_SECRET', 'PORT'] })
    );
    expect(prompt).toContain('MY_SECRET');
    expect(prompt).toContain('PORT');
  });

  it('dependabot lists detected package managers', () => {
    const prompt = buildPracticePrompt(
      makeContext('dependabot', { packageManagers: ['npm', 'pip'] })
    );
    expect(prompt).toContain('npm');
    expect(prompt).toContain('pip');
  });

  it('ci_cd TypeScript includes node setup', () => {
    const prompt = buildPracticePrompt(makeContext('ci_cd'));
    expect(prompt).toContain('Node');
  });

  it('ci_cd Python includes python setup', () => {
    const prompt = buildPracticePrompt(
      makeContext('ci_cd', { language: 'Python', packageManagers: ['pip'] })
    );
    expect(prompt).toContain('pytest');
  });

  it('testing_framework TypeScript mentions Vitest', () => {
    const prompt = buildPracticePrompt(makeContext('testing_framework'));
    expect(prompt).toContain('Vitest');
  });

  it('linting TypeScript mentions eslint.config.mjs', () => {
    const prompt = buildPracticePrompt(makeContext('linting'));
    expect(prompt).toContain('eslint.config.mjs');
  });

  it('docker prompt includes Dockerfile guidance', () => {
    const prompt = buildPracticePrompt(makeContext('docker'));
    expect(prompt).toContain('Dockerfile');
  });

  it('throws for unknown practice type at runtime', () => {
    const ctx = makeContext('deploy_badge');
    (ctx as Record<string, unknown>).practiceType = 'invalid_type';
    expect(() => buildPracticePrompt(ctx)).toThrow('Unknown practice type: invalid_type');
  });
});
