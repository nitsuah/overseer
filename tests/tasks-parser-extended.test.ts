import { test, expect } from 'vitest';
import { parseTasks } from '../lib/parsers/tasks';

test('parseTasks handles different status types', () => {
  const content = `## Todo

- [ ] Not started task
- [/] In progress task
- [x] Completed task`;

  const result = parseTasks(content);
  expect(result.tasks).toHaveLength(3);
  expect(result.tasks[0].status).toBe('todo');
  expect(result.tasks[1].status).toBe('in-progress');
  expect(result.tasks[2].status).toBe('done');
});

test('parseTasks handles explicit IDs in comments', () => {
  const content = `## Todo

- [ ] Task with ID <!-- id: custom-task-id -->`;

  const result = parseTasks(content);
  expect(result.tasks[0].id).toBe('custom-task-id');
});

test('parseTasks generates IDs from titles', () => {
  const content = `## Todo

- [ ] Add New Feature X`;

  const result = parseTasks(content);
  expect(result.tasks[0].id).toBe('todo-add-new-feature-x');
});

test('parseTasks handles subsections', () => {
  const content = `## In Progress

### Phase 1

- [ ] Task A

### Phase 2

- [ ] Task B`;

  const result = parseTasks(content);
  expect(result.tasks).toHaveLength(2);
  expect(result.tasks[0].section).toBe('In Progress');
  expect(result.tasks[0].subsection).toBe('Phase 1');
  expect(result.tasks[1].subsection).toBe('Phase 2');
});

test('parseTasks handles asterisk bullets', () => {
  const content = `## Todo

* [ ] Task with asterisk`;

  const result = parseTasks(content);
  expect(result.tasks).toHaveLength(1);
  expect(result.tasks[0].title).toBe('Task with asterisk');
});

test('parseTasks handles multiple sections', () => {
  const content = `## Todo

- [ ] Todo task

## Done

- [x] Done task`;

  const result = parseTasks(content);
  expect(result.tasks).toHaveLength(2);
  expect(result.tasks[0].section).toBe('Todo');
  expect(result.tasks[1].section).toBe('Done');
});

test('parseTasks handles frontmatter', () => {
  const content = `---
repo: test-repo
updated: 2024-01-01
---

## Todo

- [ ] Task`;

  const result = parseTasks(content);
  expect(result.frontmatter.repo).toBe('test-repo');
  expect(result.frontmatter.updated).toEqual(new Date('2024-01-01'));
});

test('parseTasks handles empty content', () => {
  const result = parseTasks('');
  expect(result.tasks).toHaveLength(0);
});

test('parseTasks resets subsection on new section', () => {
  const content = `## Section 1

### Subsection A

- [ ] Task 1

## Section 2

- [ ] Task 2`;

  const result = parseTasks(content);
  expect(result.tasks[0].subsection).toBe('Subsection A');
  expect(result.tasks[1].subsection).toBeNull();
});
