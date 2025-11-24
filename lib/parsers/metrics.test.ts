
import { describe, it, expect } from 'vitest';
import { parseMetrics } from './metrics';

describe('parseMetrics', () => {
    it('should parse metrics from frontmatter', () => {
        const content = `---
metrics:
  - name: Coverage
    value: 80
    unit: '%'
---
`;
        const result = parseMetrics(content);
        expect(result.metrics).toHaveLength(1);
        expect(result.metrics[0]).toEqual({
            name: 'Coverage',
            value: 80,
            unit: '%',
        });
    });

    it('should parse metrics from markdown table', () => {
        const content = `
# Metrics

| Metric | Value | Unit |
|---|---|---|
| Build Time | 120 | s |
| Bundle Size | 500 | KB |
`;
        const result = parseMetrics(content);
        expect(result.metrics).toHaveLength(2);
        expect(result.metrics[0]).toEqual({
            name: 'Build Time',
            value: 120,
            unit: 's',
        });
        expect(result.metrics[1]).toEqual({
            name: 'Bundle Size',
            value: 500,
            unit: 'KB',
        });
    });
});
