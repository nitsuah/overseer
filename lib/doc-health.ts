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
    const expectedDocs = getExpectedDocs(repoType);
    // Normalize present docs for matching (strip .md, lowercase)
    const presentDocs = new Set(
        docStatuses
            .filter((d) => d.exists)
            .map((d) => d.doc_type.toLowerCase().replace('.md', ''))
    );

    // For each expected doc, check if present (with fallback support)
    const missing: string[] = [];
    let presentCount = 0;

    for (const expected of expectedDocs) {
        const normalized = expected.toLowerCase().replace('.md', '');
        // Check direct match or docs/ fallback
        const hasDirect = presentDocs.has(normalized);
        const hasFallback = DOCS_WITH_FALLBACK.has(expected) && presentDocs.has(`docs/${normalized}`);

        if (hasDirect || hasFallback) {
            presentCount++;
        } else {
            missing.push(normalized);
        }
    }

    const score = expectedDocs.length > 0
        ? Math.round((presentCount / expectedDocs.length) * 100)
        : 0;

    return {
        score,
        present: presentCount,
        expected: expectedDocs.length,
        missing,
    };
}

// Docs that support docs/ subdirectory fallback (synced from root or docs/)
const DOCS_WITH_FALLBACK = new Set([
    'ROADMAP.md',
    'TASKS.md',
    'FEATURES.md',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
]);

function getExpectedDocs(repoType: string): string[] {
    const base = ['README.md', 'FEATURES.md', 'METRICS.md'];
    let expected: string[];
    switch (repoType) {
        case 'web-app':
            expected = [...base, 'ROADMAP.md', 'TASKS.md'];
            break;
        case 'game':
            expected = [...base, 'ROADMAP.md', 'TASKS.md'];
            break;
        case 'library':
            expected = [...base, 'CHANGELOG.md'];
            break;
        case 'tool':
            expected = [...base, 'ROADMAP.md', 'TASKS.md'];
            break;
        case 'bot':
            expected = [...base, 'ROADMAP.md', 'TASKS.md'];
            break;
        case 'research':
            expected = base;
            break;
        default:
            expected = [...base, 'ROADMAP.md'];
            break;
    }
    // Include docs/ variants for docs that support fallback
    const withFallback = expected.flatMap(doc =>
        DOCS_WITH_FALLBACK.has(doc) ? [doc, `docs/${doc}`] : [doc]
    );
    return withFallback;
}

export function getDocHealthColor(score: number): string {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
}
