import matter from 'gray-matter';

export interface MetricsData {
    frontmatter: {
        repo?: string;
        updated?: string;
        [key: string]: any;
    };
    metrics: MetricItemData[];
}

export interface MetricItemData {
    name: string;
    value: number;
    unit: string | null;
}

export function parseMetrics(content: string): MetricsData {
    const { data: frontmatter, content: markdown } = matter(content);

    const metrics: MetricItemData[] = [];

    // Extract metrics from frontmatter if present
    if (frontmatter.metrics && Array.isArray(frontmatter.metrics)) {
        for (const metric of frontmatter.metrics) {
            if (metric.name && metric.value !== undefined) {
                metrics.push({
                    name: metric.name,
                    value: parseFloat(metric.value),
                    unit: metric.unit || null,
                });
            }
        }
    }

    // Parse markdown tables (| Metric | Value | Unit |)
    const lines = markdown.split('\n');
    let inTable = false;
    let headerParsed = false;

    for (const line of lines) {
        const trimmed = line.trim();

        // Detect table start
        if (trimmed.startsWith('|') && !inTable) {
            inTable = true;
            continue;
        }

        // Skip separator line
        if (inTable && !headerParsed && trimmed.match(/^\|[\s:-]+\|/)) {
            headerParsed = true;
            continue;
        }

        // Parse table rows
        if (inTable && headerParsed && trimmed.startsWith('|')) {
            const cells = trimmed
                .split('|')
                .map((cell) => cell.trim())
                .filter((cell) => cell);

            if (cells.length >= 2) {
                const name = cells[0];
                const valueStr = cells[1].replace(/[^0-9.-]/g, '');
                const value = parseFloat(valueStr);
                const unit = cells[2] || null;

                if (!isNaN(value)) {
                    metrics.push({ name, value, unit });
                }
            }
        }

        // End of table
        if (inTable && !trimmed.startsWith('|')) {
            inTable = false;
            headerParsed = false;
        }
    }

    return {
        frontmatter,
        metrics,
    };
}
