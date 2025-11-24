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
    'LICENSE',
] as const;

export const OPTIONAL_DOCS = [
    'SECURITY.md',
    'ROUTES.md',
    'CODE_OF_CONDUCT.md',
] as const;

export function calculateDocHealth(
    docStatuses: Array<{ doc_type: string; exists: boolean }>,
    repoType: string
): DocHealthInfo {
    const expectedDocs = getExpectedDocs(repoType);
    const presentDocs = docStatuses.filter((d) => d.exists).map((d) => d.doc_type);

    const missing = expectedDocs.filter(
        (doc) => !presentDocs.includes(doc.toLowerCase().replace('.md', ''))
    );

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
    const base = ['README.md', 'LICENSE'];

    switch (repoType) {
        case 'web-app':
            return [...base, 'ROADMAP.md', 'TASKS.md', 'CONTRIBUTING.md', 'ROUTES.md'];
        case 'game':
            return [...base, 'ROADMAP.md', 'TASKS.md', 'CONTRIBUTING.md'];
        case 'library':
            return [...base, 'CHANGELOG.md', 'CONTRIBUTING.md'];
        case 'tool':
            return [...base, 'ROADMAP.md', 'TASKS.md'];
        default:
            return [...base, 'ROADMAP.md'];
    }
}

export function getDocHealthColor(score: number): string {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
}
