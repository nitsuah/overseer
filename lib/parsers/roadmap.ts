import matter from 'gray-matter';

export interface RoadmapData {
    frontmatter: {
        status?: string;
        priority?: 'low' | 'medium' | 'high';
        owner?: string;
        [key: string]: any;
    };
    items: RoadmapItemData[];
}

export interface RoadmapItemData {
    title: string;
    quarter: string | null;
    status: 'planned' | 'in-progress' | 'completed';
    section: string;
}

export function parseRoadmap(content: string): RoadmapData {
    const { data: frontmatter, content: markdown } = matter(content);

    const items: RoadmapItemData[] = [];
    const lines = markdown.split('\n');
    let currentSection = '';

    for (const line of lines) {
        // Detect section headers (## Q1 2025, ## Phase 1, etc.)
        const sectionMatch = line.match(/^##\s+(.+)$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1].trim();
            continue;
        }

        // Parse task list items
        const taskMatch = line.match(/^-\s+\[([ x/])\]\s+(.+)$/);
        if (taskMatch) {
            const [, statusChar, title] = taskMatch;
            const status = statusChar === 'x' ? 'completed' : statusChar === '/' ? 'in-progress' : 'planned';

            items.push({
                title: title.trim(),
                quarter: currentSection || null,
                status,
                section: currentSection,
            });
        }
    }

    return {
        frontmatter,
        items,
    };
}
