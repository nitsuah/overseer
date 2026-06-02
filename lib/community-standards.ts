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

export interface CommunityStandardsOptions {
    fallbackFiles?: string[];
    fallbackRepo?: string;
}

export function checkCommunityStandards(
    fileList: string[],
    options: CommunityStandardsOptions = {}
): CommunityStandardsResult {
    const lowerFiles = fileList.map(f => f.toLowerCase());
    const fallbackFiles = (options.fallbackFiles || []).map(f => f.toLowerCase());
    const fallbackSet = new Set(fallbackFiles);
    const standards: CommunityStandard[] = [];

    const codeOfConductInRepo = lowerFiles.includes('code_of_conduct.md');
    const codeOfConductInFallback = fallbackSet.has('code_of_conduct.md');
    const contributingInRepo = lowerFiles.includes('contributing.md');
    const contributingInFallback = fallbackSet.has('contributing.md');
    const securityInRepo = lowerFiles.includes('security.md');
    const securityInFallback = fallbackSet.has('security.md');

    // Core community files
    standards.push({
        type: 'code_of_conduct',
        status: codeOfConductInRepo || codeOfConductInFallback ? 'healthy' : 'missing',
        details: {
            exists: codeOfConductInRepo || codeOfConductInFallback,
            existsInRepo: codeOfConductInRepo,
            existsInGithubFallback: codeOfConductInFallback,
            fallbackRepo: options.fallbackRepo || null,
        }
    });

    standards.push({
        type: 'contributing',
        status: contributingInRepo || contributingInFallback ? 'healthy' : 'missing',
        details: {
            exists: contributingInRepo || contributingInFallback,
            existsInRepo: contributingInRepo,
            existsInGithubFallback: contributingInFallback,
            fallbackRepo: options.fallbackRepo || null,
        }
    });

    standards.push({
        type: 'security',
        status: securityInRepo || securityInFallback ? 'healthy' : 'missing',
        details: {
            exists: securityInRepo || securityInFallback,
            existsInRepo: securityInRepo,
            existsInGithubFallback: securityInFallback,
            fallbackRepo: options.fallbackRepo || null,
        }
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

    // CODEOWNERS
    const hasCodeowners = lowerFiles.includes('.github/codeowners') || lowerFiles.includes('codeowners');
    standards.push({
        type: 'codeowners',
        status: hasCodeowners ? 'healthy' : 'missing',
        details: { exists: hasCodeowners }
    });

    // Copilot Instructions
    const hasCopilotInstructions = lowerFiles.includes('.github/copilot-instructions.md');
    standards.push({
        type: 'copilot_instructions',
        status: hasCopilotInstructions ? 'healthy' : 'missing',
        details: { exists: hasCopilotInstructions }
    });

    // Funding configuration
    const hasFunding = lowerFiles.includes('.github/funding.yml') || lowerFiles.includes('.github/funding.yaml');
    standards.push({
        type: 'funding',
        status: hasFunding ? 'healthy' : 'missing',
        details: { exists: hasFunding }
    });

    return { standards };
}
