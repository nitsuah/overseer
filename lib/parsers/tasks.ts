import matter from 'gray-matter';
import { Task } from '@/types/repo';

export interface TaskData {
    frontmatter: {
        repo?: string;
        updated?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
    tasks: Task[];
}

export function parseTasks(content: string): TaskData {
    const { data: frontmatter, content: markdown } = matter(content);

    const tasks: Task[] = [];
    const lines = markdown.split('\n');
    let currentSection = '';
    let currentSubsection = '';

    for (const line of lines) {
        // Detect main section headers (## Done, ## In Progress, ## Todo)
        const sectionMatch = line.match(/^##\s+(.+)$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1].trim();
            currentSubsection = ''; // Reset subsection when entering new section
            continue;
        }

        // Detect subsection headers (### Phase 1, ### Phase 2, etc.)
        const subsectionMatch = line.match(/^###\s+(.+)$/);
        if (subsectionMatch) {
            currentSubsection = subsectionMatch[1].trim();
            continue;
        }

        // Parse task list items with optional ID in HTML comment - handle both - and * bullets
        const taskMatch = line.match(/^[-*]\s+\[([ x/])\]\s+(.+?)(?:\s+<!--\s*id:\s*(.+?)\s*-->)?$/);
        if (taskMatch) {
            const [, statusChar, title, id] = taskMatch;
            const status = statusChar === 'x' ? 'done' : statusChar === '/' ? 'in-progress' : 'todo';

            // Generate ID if not provided
            const taskId = id?.trim() || generateTaskId(title);

            tasks.push({
                id: taskId,
                title: title.trim(),
                status,
                section: currentSection || null,
                subsection: currentSubsection || null,
            });
        }
    }

    return {
        frontmatter,
        tasks,
    };
}

function generateTaskId(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
}
