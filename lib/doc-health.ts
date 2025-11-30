// lib/doc-health.ts
import crypto from 'crypto';

export type HealthState = 'missing' | 'dormant' | 'malformed' | 'healthy';

export interface DocHealthInfo {
    score: number; // 0-100
    present: number;
    expected: number;
    missing: string[];
}

export const STANDARD_DOCS = [
    'README.md',
    'ROADMAP.md',
    'TASKS.md',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'METRICS.md',
    'FEATURES.md',
    'LICENSE',
] as const;

export const OPTIONAL_DOCS = [
    'SECURITY.md',
    'ROUTES.md',
    'CODE_OF_CONDUCT.md',
] as const;

export function calculateDocHealthState(
    exists: boolean,
    content: string | null,
    templateContent: string | null
): HealthState {
    if (!exists || !content) {
        return 'missing';
    }

    // If we have a template, check if it matches exactly (dormant)
    if (templateContent) {
        const contentHash = hashContent(content);
        const templateHash = hashContent(templateContent);
        
        if (contentHash === templateHash) {
            return 'dormant';
        }
    }

    // Check for malformed (missing key markers)
    // For now, we'll consider very short content as potentially malformed
    const trimmedContent = content.trim();
    if (trimmedContent.length < 50) {
        return 'malformed';
    }

    // Check for common template placeholder markers (not including AGENT INSTRUCTIONS which is valid)
    const templateMarkers = [
        '[Your content here]',
        '[Add your',
        'Replace this',
        '[TODO:',
        'TODO: Replace',
        'TODO: Add',
        'TODO: Update',
    ];

    const hasTemplateMarkers = templateMarkers.some(marker => 
        content.includes(marker)
    );

    if (hasTemplateMarkers) {
        return 'dormant';
    }

    return 'healthy';
}

export function hashContent(content: string): string {
    return crypto.createHash('md5').update(content.trim()).digest('hex');
}

export function calculateDocHealth(
    docStatuses: Array<{ doc_type: string; exists: boolean }>,
    repoType: string
): DocHealthInfo {
    const expectedDocs = getExpectedDocs(repoType).map((doc) => doc.toLowerCase().replace('.md', ''));
    const presentDocs = docStatuses
        .filter((d) => d.exists)
        .map((d) => d.doc_type.toLowerCase().replace('.md', ''));

    const missing = expectedDocs.filter((doc) => !presentDocs.includes(doc));

    const score = expectedDocs.length > 0
        ? Math.round(((expectedDocs.length - missing.length) / expectedDocs.length) * 100)
        : 0;

    return {
        score,
        present: expectedDocs.length - missing.length,
        expected: expectedDocs.length,
        missing,
    };
}

function getExpectedDocs(repoType: string): string[] {
    const base = ['README.md', 'FEATURES.md', 'METRICS.md'];
    switch (repoType) {
        case 'web-app':
            return [...base, 'ROADMAP.md', 'TASKS.md'];
        case 'game':
            return [...base, 'ROADMAP.md', 'TASKS.md'];
        case 'library':
            return [...base, 'CHANGELOG.md'];
        case 'tool':
            return [...base, 'ROADMAP.md', 'TASKS.md'];
        case 'bot':
            return [...base, 'ROADMAP.md', 'TASKS.md'];
        case 'research':
            return base;
        default:
            return [...base, 'ROADMAP.md'];
    }
}

export function getDocHealthColor(score: number): string {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
}
