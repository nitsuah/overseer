import { test, expect } from 'vitest';
import { parseTasks } from '../lib/parsers/tasks';

test('parseTasks handles tasks with subsections', () => {
  const content = `## Todo

### Phase 1

- [ ] Task A
- [ ] Task B

### Phase 2

- [ ] Task C`;

  const result = parseTasks(content);
  expect(result.tasks).toHaveLength(3);
  expect(result.tasks[0].subsection).toBe('Phase 1');
  expect(result.tasks[1].subsection).toBe('Phase 1');
  expect(result.tasks[2].subsection).toBe('Phase 2');
});

test('parseTasks handles tasks with custom IDs', () => {
  const content = `## Todo

- [ ] Custom task <!-- id: custom-id-123 -->
- [ ] Another task <!-- id: another-id -->`;

  const result = parseTasks(content);
  expect(result.tasks[0].id).toBe('custom-id-123');
  expect(result.tasks[1].id).toBe('another-id');
});

test('parseTasks generates IDs when not provided', () => {
  const content = `## Todo

- [ ] Implement feature X`;

  const result = parseTasks(content);
  expect(result.tasks[0].id).toBeTruthy();
  expect(result.tasks[0].id).toContain('implement-feature-x');
});

test('parseTasks handles in-progress status with /', () => {
  const content = `## In Progress

- [/] Ongoing task`;

  const result = parseTasks(content);
  expect(result.tasks[0].status).toBe('in-progress');
});

test('parseTasks handles done status with x', () => {
  const content = `## Done

- [x] Completed task`;

  const result = parseTasks(content);
  expect(result.tasks[0].status).toBe('done');
});

test('parseTasks handles * bullets', () => {
  const content = `## Todo

* [ ] Task with asterisk`;

  const result = parseTasks(content);
  expect(result.tasks).toHaveLength(1);
  expect(result.tasks[0].title).toBe('Task with asterisk');
});

test('parseTasks handles frontmatter with repo and updated', () => {
  const content = `---
repo: test-repo
updated: 2025-01-01
---

## Todo

- [ ] Task`;

  const result = parseTasks(content);
  expect(result.frontmatter.repo).toBe('test-repo');
  expect(result.frontmatter.updated).toBeInstanceOf(Date);
});

test('parseTasks handles empty content', () => {
  const result = parseTasks('');
  expect(result.tasks).toHaveLength(0);
  expect(result.frontmatter).toEqual({});
});

test('parseTasks includes section in generated IDs', () => {
  const content = `## Todo

- [ ] Same title

## Done

- [x] Same title`;

  const result = parseTasks(content);
  expect(result.tasks).toHaveLength(2);
  expect(result.tasks[0].id).toContain('todo');
  expect(result.tasks[1].id).toContain('done');
  expect(result.tasks[0].id).not.toBe(result.tasks[1].id);
});

test('parseTasks trims whitespace from titles', () => {
  const content = `## Todo

- [ ]   Task with extra spaces   `;

  const result = parseTasks(content);
  expect(result.tasks[0].title).toBe('Task with extra spaces');
});

test('parseTasks handles multiple sections', () => {
  const content = `## Todo

- [ ] Todo item

## In Progress

- [/] In progress item

## Done

- [x] Done item`;

  const result = parseTasks(content);
  expect(result.tasks).toHaveLength(3);
  expect(result.tasks[0].section).toBe('Todo');
  expect(result.tasks[1].section).toBe('In Progress');
  expect(result.tasks[2].section).toBe('Done');
});
