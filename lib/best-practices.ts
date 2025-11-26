import { Octokit } from '@octokit/rest';

export type HealthState = 'missing' | 'dormant' | 'malformed' | 'healthy';

export interface BestPractice {
    type: string;
    status: HealthState;
    details: {
        exists: boolean;
        [key: string]: unknown;
    };
}

export interface BestPracticesResult {
    practices: BestPractice[];
}

export async function checkBestPractices(
    owner: string,
    repo: string,
    octokit: Octokit,
    fileList: string[],
    readmeContent?: string
): Promise<BestPracticesResult> {
    const practices: BestPractice[] = [];

    // 1. Branch Protection
    let branchProtection: BestPractice = {
        type: 'branch_protection',
        status: 'missing',
        details: { exists: false, protected: false, requiresReviews: false }
    };
    
    try {
        const { data: branch } = await octokit.rest.repos.getBranch({
            owner,
            repo,
            branch: 'main',
        });
        
        if (branch.protected) {
            const hasReviews = branch.protection?.required_pull_request_reviews !== undefined;
            branchProtection = {
                type: 'branch_protection',
                status: hasReviews ? 'healthy' : 'dormant',
                details: {
                    exists: true,
                    protected: true,
                    requiresReviews: hasReviews,
                    requiredStatusChecks: branch.protection?.required_status_checks !== undefined
                }
            };
        } else {
            branchProtection.status = 'missing';
        }
    } catch {
        console.warn(`Failed to check branch protection for ${owner}/${repo}`);
    }
    practices.push(branchProtection);

    // 2. .gitignore
    const gitignoreExists = fileList.includes('.gitignore');
    practices.push({
        type: 'gitignore',
        status: gitignoreExists ? 'healthy' : 'missing',
        details: { exists: gitignoreExists }
    });

    // 3. CI/CD Detection
    const cicdFiles = [
        '.github/workflows',
        '.gitlab-ci.yml',
        'netlify.toml',
        '.circleci',
        'azure-pipelines.yml',
        'bitbucket-pipelines.yml'
    ];
    const hasCICD = fileList.some(f => cicdFiles.some(ci => f.includes(ci)));
    practices.push({
        type: 'cicd',
        status: hasCICD ? 'healthy' : 'missing',
        details: { 
            exists: hasCICD,
            detected: fileList.filter(f => cicdFiles.some(ci => f.includes(ci)))
        }
    });

    // 4. Pre-commit Hooks Detection
    const hasHooks = fileList.some(f => f.includes('.husky/') || f.includes('.git/hooks/'));
    practices.push({
        type: 'pre_commit_hooks',
        status: hasHooks ? 'healthy' : 'missing',
        details: { exists: hasHooks }
    });

    // 5. PR Template
    const prTemplateFiles = [
        'pull_request_template.md',
        '.github/pull_request_template.md',
        'docs/pull_request_template.md',
        '.github/PULL_REQUEST_TEMPLATE.md'
    ];
    const hasPRTemplate = fileList.some(f => 
        prTemplateFiles.some(template => f.toLowerCase().includes(template.toLowerCase()))
    );
    practices.push({
        type: 'pr_template',
        status: hasPRTemplate ? 'healthy' : 'missing',
        details: { exists: hasPRTemplate }
    });

    // 6. Testing Framework Detection
    const testingFiles = [
        'vitest.config',
        'jest.config',
        'playwright.config',
        'cypress.config',
        '.mocharc'
    ];
    const detectedTestingConfigs = fileList.filter(f => testingFiles.some(test => f.includes(test)));
    const hasTesting = detectedTestingConfigs.length > 0;
    
    // Count test files
    const testFilePatterns = [
        '.test.', 
        '.spec.', 
        '__tests__/',
        '/tests/',
        '/test/',
        'e2e/'
    ];
    const testFiles = fileList.filter(f => 
        testFilePatterns.some(pattern => f.toLowerCase().includes(pattern))
    );
    
    practices.push({
        type: 'testing_framework',
        status: hasTesting ? 'healthy' : 'missing',
        details: { 
            exists: hasTesting,
            detected: detectedTestingConfigs,
            testFileCount: testFiles.length,
            testFiles: testFiles.slice(0, 10) // Limit to first 10 for details
        }
    });

    // 7. Linting
    const lintingFiles = [
        '.eslintrc',
        'eslint.config',
        '.prettierrc',
        'biome.json'
    ];
    const hasLinting = fileList.some(f => lintingFiles.some(lint => f.includes(lint)));
    practices.push({
        type: 'linting',
        status: hasLinting ? 'healthy' : 'missing',
        details: { 
            exists: hasLinting,
            detected: fileList.filter(f => lintingFiles.some(lint => f.includes(lint)))
        }
    });

    // 8. Netlify Badge (if README provided)
    if (readmeContent) {
        const hasNetlifyBadge = readmeContent.includes('api.netlify.com/api/v1/badges');
        practices.push({
            type: 'netlify_badge',
            status: hasNetlifyBadge ? 'healthy' : 'missing',
            details: { exists: hasNetlifyBadge }
        });
    }

    // 9. Environment Template
    const hasEnvExample = fileList.some(f => f.includes('.env.example') || f.includes('.env.template'));
    practices.push({
        type: 'env_template',
        status: hasEnvExample ? 'healthy' : 'missing',
        details: { exists: hasEnvExample }
    });

    // 10. Dependabot
    const hasDependabot = fileList.some(f => f.includes('.github/dependabot.yml'));
    practices.push({
        type: 'dependabot',
        status: hasDependabot ? 'healthy' : 'missing',
        details: { exists: hasDependabot }
    });

    return { practices };
}
