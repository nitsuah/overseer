import matter from 'gray-matter';

export interface TaskData {
    frontmatter: {
        repo?: string;
        updated?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
    tasks: TaskItemData[];
}

export interface TaskItemData {
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    section: string | null;
}

export function parseTasks(content: string): TaskData {
    const { data: frontmatter, content: markdown } = matter(content);

    const tasks: TaskItemData[] = [];
    const lines = markdown.split('\n');
    let currentSection = '';

    for (const line of lines) {
        // Detect section headers (## Backlog, ## In Progress, etc.)
        const sectionMatch = line.match(/^##\s+(.+)$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1].trim();
            continue;
        }

        // Parse task list items with optional ID in HTML comment
        const taskMatch = line.match(/^-\s+\[([ x/])\]\s+(.+?)(?:\s+<!--\s*id:\s*(.+?)\s*-->)?$/);
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
