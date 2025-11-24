
import { describe, it, expect } from 'vitest';
import { parseTasks } from './tasks';

describe('parseTasks', () => {
    it('should parse tasks correctly', () => {
        const content = `
# Tasks

## Todo
- [ ] Task 1

## In Progress
- [/] Task 2

## Done
- [x] Task 3
`;
        const result = parseTasks(content);

        expect(result.tasks).toHaveLength(3);
        expect(result.tasks[0].title).toBe('Task 1');
        expect(result.tasks[0].status).toBe('todo');
        expect(result.tasks[0].section).toBe('Todo');

        expect(result.tasks[1].title).toBe('Task 2');
        expect(result.tasks[1].status).toBe('in-progress');

        expect(result.tasks[2].title).toBe('Task 3');
        expect(result.tasks[2].status).toBe('done');
    });
});
