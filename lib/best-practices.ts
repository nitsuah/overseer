import { Octokit } from '@octokit/rest';

/**
 * Represents the health state of a best practice check.
 *
 * - 'missing': The best practice is not present or not implemented.
 * - 'dormant': The best practice exists but is not actively enforced or used.
 * - 'malformed': The best practice exists but is incorrectly configured or broken.
 * - 'healthy': The best practice is present and correctly configured.
 */
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
    const preCommitFiles = ['.husky/', '.git/hooks/', '.pre-commit-config.yaml'];
    const detectedHooks = fileList.filter(f => preCommitFiles.some(hook => f.includes(hook)));
    const hasHooks = detectedHooks.length > 0;
    practices.push({
        type: 'pre_commit_hooks',
        status: hasHooks ? 'healthy' : 'missing',
        details: { 
            exists: hasHooks,
            detected: detectedHooks
        }
    });

    // 5. Testing Framework Detection
    const testingFiles = [
        'vitest.config',
        'jest.config',
        'playwright.config',
        'cypress.config',
        '.mocharc',
        'pytest.ini',
        'pyproject.toml',  // Can contain pytest config
        'tox.ini',
        // Web3/Solidity testing frameworks
        'hardhat.config',  // Hardhat testing framework
        'truffle-config',  // Truffle testing framework
        'foundry.toml',    // Foundry testing framework
        'dappfile',        // DappTools testing
        'brownie-config'   // Brownie testing framework
    ];
    const detectedTestingConfigs = fileList.filter(f => testingFiles.some(test => f.includes(test)));
    const hasTesting = detectedTestingConfigs.length > 0;
    
    // Count test files
    const testFilePatterns = [
        '.test.', 
        '.spec.', 
        '__tests__/',
        'tests/',      // Match tests/ at any level (not just /tests/)
        'test/',       // Match test/ at any level  
        'e2e/',
        'test_',       // Python test files: test_*.py
        '_test.',      // Go test files: *_test.go
        '.t.sol'       // Solidity test files (Foundry convention)
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
        'biome.json',
        '.flake8',
        '.pylintrc',
        'pylint.ini',
        'ruff.toml',
        'pyproject.toml',  // Can contain ruff/black/isort config
        // Web3/Solidity linting
        '.solhint.json',   // Solhint config
        '.solhintrc',      // Alternative Solhint config
        'slither.config',  // Slither static analyzer
        'mythril.yml'      // Mythril security analyzer
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

    // 7. Deploy Badge
    type Evidence = { url: string; alt?: string; confidence: number; kind: 'deploy'|'ci'|'qa'|'unknown' };
    let deployBadgeStatus: HealthState = 'missing';
    let deployBadgeDetails: { exists: boolean; evidence?: Evidence[]; hasCI?: boolean; isDeployable?: boolean } = { exists: false };
    
    if (readmeContent) {
        // Check for common deployment badges
        // Robust detection of CI/CD and deploy badges via URL + alt-text keywords with scoring
        const badgeMdRegex = /!\[[^\]]*\]\(([^)]+)\)/gi; // Markdown image
        const badgeLinkMdRegex = /\[!\[[^\]]*\]\(([^)]+)\)\]\(([^)]+)\)/gi; // Linked badge
        const badgeHtmlRegex = /<img[^>]+src=["']([^"']+)["'][^>]*?(?:alt=["']([^"']+)["'])?[^>]*>/gi; // HTML image
        
        const urlPatterns: RegExp[] = [
            /github\.com\/.+?\/actions\/workflows\/.+?\.yml\/badge\.svg/i, // GitHub Actions workflow badge
            /api\.netlify\.com\/api\/v1\/badges\/[a-f0-9-]+\/deploy-status(?:\?branch=[^\s"')]+)?/i, // Netlify deploy badge
            /img\.shields\.io\/badge\/Deployed%20on-Vercel(?:-black)?/i, // Vercel deployed-on badge
            /gitlab\.com\/.+?\/badges\/.+?\/pipeline\.svg/i, // GitLab pipeline
            /circleci\.com\/gh\/.+?\.svg/i, // CircleCI
            /travis-ci\.(com|org)\/.+?\.svg/i // Travis
        ];
        const lowConfidencePatterns: RegExp[] = [
            /img\.shields\.io\/.*(deploy|deployment|vercel|netlify|render|pages)/i, // generic shields - low confidence
        ];
        const altKeywords = /(deploy|deployment|deployed|ci|cd|build|pipeline|actions|netlify|vercel|render|pages|status)/i;

        const evidences: Evidence[] = [];

        function score(url: string, alt?: string): Evidence {
            let confidence = 0;
            const highConfidenceMatch = urlPatterns.some(p => p.test(url));
            const lowConfidenceMatch = lowConfidencePatterns.some(p => p.test(url));
            if (highConfidenceMatch) confidence += 0.6;
            else if (lowConfidenceMatch) confidence += 0.4; // Lower confidence for generic patterns
            if (alt && altKeywords.test(alt)) confidence += 0.3;
            // simple type classification
            const lower = url.toLowerCase() + ' ' + (alt || '').toLowerCase();
            let kind: Evidence['kind'] = 'unknown';
            if (/(netlify|vercel|render|pages|deploy)/.test(lower)) kind = 'deploy';
            else if (/(actions|workflow|pipeline|circleci|travis|gitlab)/.test(lower)) kind = 'ci';
            else if (/(pylint|bandit|codeql|coverage|lint|test)/.test(lower)) kind = 'qa';
            return { url, alt, confidence, kind };
        }

    // Extract Markdown badges
    for (const match of readmeContent.matchAll(badgeMdRegex)) {
        const src = match[1] || '';
        evidences.push(score(src));
    }
    // Extract linked badges
    for (const match of readmeContent.matchAll(badgeLinkMdRegex)) {
        const src = match[1] || '';
        evidences.push(score(src));
    }
    // Extract HTML badges
    for (const match of readmeContent.matchAll(badgeHtmlRegex)) {
        const src = match[1] || '';
        const alt = match[2];
        evidences.push(score(src, alt));
    }
    const top = evidences.sort((a, b) => b.confidence - a.confidence)[0];
    const hasDeploy = evidences.some(e => e.kind === 'deploy' && e.confidence >= 0.6) ||
        (top && top.confidence >= 0.8 && /deploy|netlify|vercel|render|pages/i.test((top.alt || '') + top.url));
    
    // Check if repo has ANY quality badge (CI, QA, deploy) - having something is better than nothing
    const hasAnyCIorQABadge = evidences.some(e => 
        (e.kind === 'ci' || e.kind === 'qa') && e.confidence >= 0.6
    );
    
        // For non-deployable repos (tools, libraries, bots), CI badges are sufficient
        const isLikelyDeployable = fileList.some(f => 
            f.includes('netlify.toml') || 
            f.includes('vercel.json') || 
            f.includes('render.yaml') ||
            f.includes('fly.toml') ||
            f.includes('railway.json') ||
            f.includes('Procfile') ||
            f.includes('app.yaml') || // Google App Engine
            f.includes('azure-pipelines.yml')
        );

        deployBadgeStatus = hasDeploy ? 'healthy' : 
                hasAnyCIorQABadge && !isLikelyDeployable ? 'healthy' : // CI badge is good enough for non-deployable repos
                hasAnyCIorQABadge && isLikelyDeployable ? 'dormant' : // Has CI but should have deploy badge
                evidences.some(e=>e.kind==='deploy' && e.confidence>=0.4) ? 'dormant' : 
                'missing';
        
        deployBadgeDetails = {
            exists: hasDeploy || (hasAnyCIorQABadge && !isLikelyDeployable),
            evidence: evidences.slice(0,5),
            hasCI: hasAnyCIorQABadge,
            isDeployable: isLikelyDeployable
        };
    }
    
    // Always add deploy_badge practice, even if README is not available
    practices.push({
        type: 'deploy_badge',
        status: deployBadgeStatus,
        details: deployBadgeDetails
    });

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
