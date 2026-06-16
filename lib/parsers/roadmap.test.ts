
import { describe, it, expect } from 'vitest';
import { parseRoadmap, diffRoadmapItems } from './roadmap';

describe('parseRoadmap', () => {
    it('should parse roadmap items correctly', () => {
        const content = `---
priority: high
---
# Roadmap

## Q1 2025
- [ ] Feature A
- [x] Feature B
- [/] Feature C

## Q2 2025
- [ ] Feature D
`;
        const result = parseRoadmap(content);

        expect(result.frontmatter.priority).toBe('high');
        expect(result.items).toHaveLength(4);

        expect(result.items[0]).toEqual({
            title: 'Feature A',
            quarter: 'Q1 2025',
            status: 'planned',
            section: 'Q1 2025',
        });

        expect(result.items[1]).toEqual({
            title: 'Feature B',
            quarter: 'Q1 2025',
            status: 'completed',
            section: 'Q1 2025',
        });

        expect(result.items[2]).toEqual({
            title: 'Feature C',
            quarter: 'Q1 2025',
            status: 'in-progress',
            section: 'Q1 2025',
        });

        expect(result.items[3]).toEqual({
            title: 'Feature D',
            quarter: 'Q2 2025',
            status: 'planned',
            section: 'Q2 2025',
        });
    });

    it('should handle empty content', () => {
        const result = parseRoadmap('');
        expect(result.items).toHaveLength(0);
    });
});

describe('diffRoadmapItems', () => {
    const item = (title: string, quarter: string | null, status: 'planned' | 'in-progress' | 'completed') => ({
        title,
        quarter,
        status,
        section: quarter || '',
    });

    it('matches existing rows by title for update and preserves their ids', () => {
        const existing = [{ id: 'row-1', title: 'Feature A' }];
        const parsed = [item('Feature A', 'Q2 2025', 'in-progress')];

        const plan = diffRoadmapItems(existing, parsed);

        expect(plan.toUpdate).toEqual([{ id: 'row-1', title: 'Feature A', quarter: 'Q2 2025', status: 'in-progress' }]);
        expect(plan.toInsert).toHaveLength(0);
        expect(plan.toDeleteIds).toHaveLength(0);
    });

    it('queues new titles for insert', () => {
        const existing: { id: string; title: string }[] = [];
        const parsed = [item('Feature A', 'Q1 2025', 'planned')];

        const plan = diffRoadmapItems(existing, parsed);

        expect(plan.toInsert).toEqual([{ title: 'Feature A', quarter: 'Q1 2025', status: 'planned' }]);
        expect(plan.toUpdate).toHaveLength(0);
        expect(plan.toDeleteIds).toHaveLength(0);
    });

    it('queues rows whose titles disappeared from ROADMAP.md for delete', () => {
        const existing = [{ id: 'row-1', title: 'Feature A' }, { id: 'row-2', title: 'Removed Feature' }];
        const parsed = [item('Feature A', 'Q1 2025', 'completed')];

        const plan = diffRoadmapItems(existing, parsed);

        expect(plan.toUpdate).toEqual([{ id: 'row-1', title: 'Feature A', quarter: 'Q1 2025', status: 'completed' }]);
        expect(plan.toDeleteIds).toEqual(['row-2']);
    });
});
