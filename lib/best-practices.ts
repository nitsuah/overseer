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
    const detectedCICD = fileList.filter(f => cicdFiles.some(ci => f.includes(ci)));
    const hasCICD = detectedCICD.length > 0;
    
    // Check if CI/CD files seem minimal/template (dormant check)
    let cicdStatus: HealthState = 'missing';
    if (hasCICD) {
        // If we detect workflow files, consider them healthy by default
        // Could be enhanced to check file size/content in the future
        cicdStatus = 'healthy';
    }
    
    practices.push({
        type: 'ci_cd',
        status: cicdStatus,
        details: { 
            exists: hasCICD,
            detected: detectedCICD
        }
    });

    // 4. Pre-commit Hooks Detection
    const hasHooks = fileList.some(f => f.includes('.husky/') || f.includes('.git/hooks/'));
    practices.push({
        type: 'pre_commit_hooks',
        status: hasHooks ? 'healthy' : 'missing',
        details: { exists: hasHooks }
    });

    // 5. Testing Framework Detection
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
    
    // Testing is 'dormant' if config exists but no test files, 'healthy' if both exist
    let testingStatus: HealthState = 'missing';
    if (hasTesting) {
        testingStatus = testFiles.length > 0 ? 'healthy' : 'dormant';
    }
    
    practices.push({
        type: 'testing_framework',
        status: testingStatus,
        details: { 
            exists: hasTesting,
            detected: detectedTestingConfigs,
            testFileCount: testFiles.length,
            testFiles: testFiles.slice(0, 10) // Limit to first 10 for details
        }
    });

    // 6. Linting
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

    // 7. Deploy Badge (if README provided)
    if (readmeContent) {
        // Check for common deployment badges
        const deployBadgePatterns = [
            'api.netlify.com/api/v1/badges',      // Netlify
            'vercel.com/button',                  // Vercel deploy button
            'img.shields.io/badge/Deployed',      // Generic deploy badge
            'img.shields.io/badge/vercel',        // Vercel shields.io badge
            'img.shields.io.*vercel',             // Any shields.io Vercel badge
            'railway.app',                        // Railway
            'render.com',                         // Render
            'fly.io',                             // Fly.io
            'heroku.com',                         // Heroku
        ];
        const hasDeployBadge = deployBadgePatterns.some(pattern => readmeContent.includes(pattern));
        practices.push({
            type: 'deploy_badge',
            status: hasDeployBadge ? 'healthy' : 'missing',
            details: { exists: hasDeployBadge }
        });
    }

    // 8. Environment Template
    const hasEnvExample = fileList.some(f => f.includes('.env.example') || f.includes('.env.template'));
    practices.push({
        type: 'env_template',
        status: hasEnvExample ? 'healthy' : 'missing',
        details: { exists: hasEnvExample }
    });

    // 9. Dependabot
    const hasDependabot = fileList.some(f => f.includes('.github/dependabot.yml'));
    practices.push({
        type: 'dependabot',
        status: hasDependabot ? 'healthy' : 'missing',
        details: { exists: hasDependabot }
    });

    // 10. Docker
    const dockerFiles = ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml', '.dockerignore'];
    const detectedDockerFiles = fileList.filter(f => {
        const lowerF = f.toLowerCase();
        return dockerFiles.some(docker => {
            const lowerDocker = docker.toLowerCase();
            // Match exact files or variants like Dockerfile.test, docker-compose.test.yml
            return lowerF.endsWith(lowerDocker) || 
                   lowerF.includes(`/${lowerDocker}`) ||
                   lowerF.match(new RegExp(`dockerfile(?:\\.\\w+)?$`)) ||
                   lowerF.match(new RegExp(`docker-compose(?:\\.\\w+)?\\.ya?ml$`));
        });
    });
    const hasDocker = detectedDockerFiles.length > 0;
    practices.push({
        type: 'docker',
        status: hasDocker ? 'healthy' : 'missing',
        details: { 
            exists: hasDocker,
            detected: detectedDockerFiles
        }
    });

    return { practices };
}
