import { describe, it, expect } from 'vitest';
import { extractBadges, extractBuildSteps, extractEnvVarMentions } from './extractors';

describe('extractBadges', () => {
  it('extracts badge markdown from readme', () => {
    const readme = `# Project
[![CI](https://badge.url/badge.svg)](https://github.com/actions)
[![Coverage](https://codecov.io/badge.svg)](https://codecov.io)
Some other text`;
    expect(extractBadges(readme)).toHaveLength(2);
  });

  it('returns empty array when no badges', () => {
    expect(extractBadges('# Project\nNo badges here')).toEqual([]);
  });
});

describe('extractBuildSteps', () => {
  it('captures lines under Installation section', () => {
    const readme = `# Project
## Installation
npm install
npm run build
## Usage
npm start`;
    const steps = extractBuildSteps(readme);
    expect(steps).toContain('npm install');
    expect(steps).toContain('npm run build');
    expect(steps).not.toContain('npm start');
  });

  it('returns empty string when no matching section', () => {
    const readme = '# Project\n## Overview\nJust a description';
    expect(extractBuildSteps(readme)).toBe('');
  });

  it('captures Getting Started section', () => {
    const readme = `# Project\n## Getting Started\nclone the repo\nrun setup`;
    const steps = extractBuildSteps(readme);
    expect(steps).toContain('clone the repo');
  });
});

describe('extractEnvVarMentions', () => {
  it('extracts UPPER_CASE identifiers from readme', () => {
    const readme = `Set DATABASE_URL and API_KEY before running`;
    const vars = extractEnvVarMentions(readme);
    expect(vars).toContain('DATABASE_URL');
    expect(vars).toContain('API_KEY');
  });

  it('extracts process.env.VAR references', () => {
    const readme = 'Use process.env.SECRET_KEY for auth';
    const vars = extractEnvVarMentions(readme);
    expect(vars).toContain('SECRET_KEY');
  });

  it('deduplicates repeated vars', () => {
    const readme = 'API_KEY is needed. Set API_KEY in your environment.';
    const vars = extractEnvVarMentions(readme);
    expect(vars.filter((v) => v === 'API_KEY')).toHaveLength(1);
  });
});
