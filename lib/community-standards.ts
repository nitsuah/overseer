export type HealthState = 'missing' | 'dormant' | 'malformed' | 'healthy';

export interface CommunityStandard {
    type: string;
    status: HealthState;
    details: {
        exists: boolean;
        [key: string]: unknown;
    };
}

export interface CommunityStandardsResult {
    standards: CommunityStandard[];
}

export function checkCommunityStandards(fileList: string[]): CommunityStandardsResult {
    const lowerFiles = fileList.map(f => f.toLowerCase());
    const standards: CommunityStandard[] = [];

    // Core community files
    standards.push({
        type: 'code_of_conduct',
        status: lowerFiles.includes('code_of_conduct.md') ? 'healthy' : 'missing',
        details: { exists: lowerFiles.includes('code_of_conduct.md') }
    });

    standards.push({
        type: 'contributing',
        status: lowerFiles.includes('contributing.md') ? 'healthy' : 'missing',
        details: { exists: lowerFiles.includes('contributing.md') }
    });

    standards.push({
        type: 'security',
        status: lowerFiles.includes('security.md') ? 'healthy' : 'missing',
        details: { exists: lowerFiles.includes('security.md') }
    });

    standards.push({
        type: 'license',
        status: lowerFiles.includes('license.md') || lowerFiles.includes('license') ? 'healthy' : 'missing',
        details: { exists: lowerFiles.includes('license.md') || lowerFiles.includes('license') }
    });

    standards.push({
        type: 'changelog',
        status: lowerFiles.includes('changelog.md') ? 'healthy' : 'missing',
        details: { exists: lowerFiles.includes('changelog.md') }
    });

    // Templates
    const hasIssueTemplate = lowerFiles.some(f => f.includes('issue_template'));
    standards.push({
        type: 'issue_template',
        status: hasIssueTemplate ? 'healthy' : 'missing',
        details: { exists: hasIssueTemplate }
    });

    const hasPRTemplate = lowerFiles.some(f => f.includes('pull_request_template'));
    standards.push({
        type: 'pr_template',
        status: hasPRTemplate ? 'healthy' : 'missing',
        details: { exists: hasPRTemplate }
    });

    return { standards };
}
