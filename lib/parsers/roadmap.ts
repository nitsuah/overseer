import matter from 'gray-matter';

export interface RoadmapData {
    frontmatter: {
        status?: string;
        priority?: 'low' | 'medium' | 'high';
        owner?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // Detect section headers (## Q1 2025, ## Phase 1, etc.) - also accept # as fallback
        const sectionMatch = line.match(/^(#{1,2})\s+(.+)$/);
        if (sectionMatch) {
            currentSection = sectionMatch[2].trim();
            continue;
        }

        // Parse task list items - handle both - and * bullets
        const taskMatch = line.match(/^[-*]\s+\[([ x/])\]\s+(.+)$/);
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
