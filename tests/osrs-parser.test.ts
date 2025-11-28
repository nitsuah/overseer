import { describe, it, expect } from 'vitest';
import logger from '@/lib/log';
import { parseRoadmap } from '@/lib/parsers/roadmap';
import { parseTasks } from '@/lib/parsers/tasks';
import { parseFeatures } from '@/lib/parsers/features';

describe('OSRS Parser Tests', () => {
  it('should parse osrs ROADMAP.md', () => {
    const content = `# Roadmap

## Q1 2025

- [ ] Core feature development
- [ ] Initial MVP release
- [x] Project setup and architecture

## Q2 2025

- [ ] User feedback integration`;

    const result = parseRoadmap(content);
  logger.debug('Roadmap items:', result.items.length);
  logger.debug(JSON.stringify(result.items, null, 2));
    expect(result.items.length).toBeGreaterThan(0);
  });

  it('should parse osrs TASKS.md', () => {
    const content = `# Tasks

## Todo

- [ ] Implement new feature X
- [ ] Fix bug in module Y

## In Progress

- [ ] Refactoring database layer

## Done

- [x] Set up CI/CD pipeline`;

    const result = parseTasks(content);
  logger.debug('Tasks:', result.tasks.length);
  logger.debug(JSON.stringify(result.tasks, null, 2));
    expect(result.tasks.length).toBeGreaterThan(0);
  });

  it('should parse osrs FEATURES.md', () => {
    const content = `# Features

## Core Capabilities

### 📊 Feature Category Name

- **Feature Name**: Description of what it does`;

    const result = parseFeatures(content);
  logger.debug('Features:', result.categories.length);
  logger.debug(JSON.stringify(result.categories, null, 2));
    expect(result.categories.length).toBeGreaterThan(0);
  });
});
