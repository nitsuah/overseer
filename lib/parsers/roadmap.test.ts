
import { describe, it, expect } from 'vitest';
import { parseRoadmap } from './roadmap';

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
