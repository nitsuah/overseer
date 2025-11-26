
import { GitHubClient, RepoMetadata } from './github';
import { parseRoadmap } from './parsers/roadmap';
import { parseTasks } from './parsers/tasks';
import { parseMetrics } from './parsers/metrics';
import { parseFeatures } from './parsers/features';
import { calculateDocHealthState, hashContent, calculateDocHealth } from './doc-health';
import { checkBestPractices } from './best-practices';
import { checkCommunityStandards } from './community-standards';
import { calculateHealthScore } from './health-score';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncRepo(repo: RepoMetadata, github: GitHubClient, db: any) {
    const owner = repo.fullName.split('/')[0];

    // Fetch additional metrics
    let lastCommitDate = null;
    let openPrs = 0;

    try {
        // Use pushedAt from repo metadata as last commit approximation
        lastCommitDate = repo.pushedAt;
    } catch (e) {
        console.warn(`Failed to get commit data for ${repo.fullName}`, e);
    }

    try {
        // Get open PRs count
        const prs = await github.getPullRequests(repo.name, owner);
        openPrs = prs.length;
    } catch (e) {
        console.warn(`Failed to fetch PRs for ${repo.fullName}`, e);
    }

    // Fetch branches count
    let branchesCount = 0;
    try {
        const branches = await github.getBranches(repo.name, owner);
        branchesCount = branches.length;
    } catch (e) {
        console.warn(`Could not get branches for ${repo.name}:`, (e as Error).message);
    }

    // Upsert repo with new metrics
    const repoRows = await db`
        INSERT INTO repos (
            name, full_name, description, language, stars, forks, open_issues, url, homepage, topics, 
            last_synced, updated_at, last_commit_date, open_prs, branches_count
        )
        VALUES (
            ${repo.name}, ${repo.fullName}, ${repo.description}, ${repo.language}, ${repo.stars}, 
            ${repo.forks}, ${repo.openIssues}, ${repo.url}, ${repo.homepage}, ${repo.topics}, 
            NOW(), NOW(), ${lastCommitDate}, ${openPrs}, ${branchesCount}
        )
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          language = EXCLUDED.language,
          stars = EXCLUDED.stars,
          forks = EXCLUDED.forks,
          open_issues = EXCLUDED.open_issues,
          url = EXCLUDED.url,
          homepage = EXCLUDED.homepage,
          topics = EXCLUDED.topics,
          last_synced = NOW(),
          updated_at = NOW(),
          last_commit_date = EXCLUDED.last_commit_date,
          open_prs = EXCLUDED.open_prs,
          branches_count = EXCLUDED.branches_count
        RETURNING id;
    `;
    const repoId = repoRows[0].id;

    // Get file list for best practices and community standards checks
    let fileList: string[] = [];
    try {
        fileList = await github.getRepoFileList(repo.name, owner);
    } catch (e) {
        console.warn(`Failed to fetch file list for ${repo.fullName}`, e);
    }

    // ROADMAP.md
    const roadmapContent = await github.getFileContent(repo.name, 'ROADMAP.md', owner);
    const roadmapHealthState = calculateDocHealthState(!!roadmapContent, roadmapContent, null);
    if (roadmapContent) {
        const roadmapData = parseRoadmap(roadmapContent);
        await db`DELETE FROM roadmap_items WHERE repo_id = ${repoId}`;
        for (const item of roadmapData.items) {
            await db`
                INSERT INTO roadmap_items (repo_id, title, quarter, status)
                VALUES (${repoId}, ${item.title}, ${item.quarter}, ${item.status})
            `;
        }
    }
    await db`
        INSERT INTO doc_status (repo_id, doc_type, exists, health_state, content_hash, last_checked)
        VALUES (${repoId}, 'roadmap', ${!!roadmapContent}, ${roadmapHealthState}, ${roadmapContent ? hashContent(roadmapContent) : null}, NOW())
        ON CONFLICT (repo_id, doc_type) DO UPDATE SET 
            exists = EXCLUDED.exists, 
            health_state = EXCLUDED.health_state,
            content_hash = EXCLUDED.content_hash,
            last_checked = EXCLUDED.last_checked
    `;

    // TASKS.md
    const tasksContent = await github.getFileContent(repo.name, 'TASKS.md', owner);
    const tasksHealthState = calculateDocHealthState(!!tasksContent, tasksContent, null);
    if (tasksContent) {
        const tasksData = parseTasks(tasksContent);
        await db`DELETE FROM tasks WHERE repo_id = ${repoId}`;
        for (const task of tasksData.tasks) {
            await db`
                INSERT INTO tasks (repo_id, task_id, title, status, section)
                VALUES (${repoId}, ${task.id}, ${task.title}, ${task.status}, ${task.section})
            `;
        }
    }
    await db`
        INSERT INTO doc_status (repo_id, doc_type, exists, health_state, content_hash, last_checked)
        VALUES (${repoId}, 'tasks', ${!!tasksContent}, ${tasksHealthState}, ${tasksContent ? hashContent(tasksContent) : null}, NOW())
        ON CONFLICT (repo_id, doc_type) DO UPDATE SET 
            exists = EXCLUDED.exists, 
            health_state = EXCLUDED.health_state,
            content_hash = EXCLUDED.content_hash,
            last_checked = EXCLUDED.last_checked
    `;

    // METRICS.md
    const metricsContent = await github.getFileContent(repo.name, 'METRICS.md', owner);
    const metricsHealthState = calculateDocHealthState(!!metricsContent, metricsContent, null);
    if (metricsContent) {
        const metricsData = parseMetrics(metricsContent);
        await db`DELETE FROM metrics WHERE repo_id = ${repoId}`;
        for (const metric of metricsData.metrics) {
            await db`
                INSERT INTO metrics (repo_id, metric_name, value, unit, timestamp)
                VALUES (${repoId}, ${metric.name}, ${metric.value}, ${metric.unit}, NOW())
            `;
        }
    }
    await db`
        INSERT INTO doc_status (repo_id, doc_type, exists, health_state, content_hash, last_checked)
        VALUES (${repoId}, 'metrics', ${!!metricsContent}, ${metricsHealthState}, ${metricsContent ? hashContent(metricsContent) : null}, NOW())
        ON CONFLICT (repo_id, doc_type) DO UPDATE SET 
            exists = EXCLUDED.exists, 
            health_state = EXCLUDED.health_state,
            content_hash = EXCLUDED.content_hash,
            last_checked = EXCLUDED.last_checked
    `;

    // FEATURES.md
    const featuresContent = await github.getFileContent(repo.name, 'FEATURES.md', owner);
    const featuresHealthState = calculateDocHealthState(!!featuresContent, featuresContent, null);
    if (featuresContent) {
        const featuresData = parseFeatures(featuresContent);
        await db`DELETE FROM features WHERE repo_id = ${repoId}`;
        for (const category of featuresData.categories) {
            await db`
                INSERT INTO features (repo_id, category, title, description, items)
                VALUES (${repoId}, ${category.name}, ${category.name}, ${category.description || ''}, ${category.items})
            `;
        }
    }
    await db`
        INSERT INTO doc_status (repo_id, doc_type, exists, health_state, content_hash, last_checked)
        VALUES (${repoId}, 'features', ${!!featuresContent}, ${featuresHealthState}, ${featuresContent ? hashContent(featuresContent) : null}, NOW())
        ON CONFLICT (repo_id, doc_type) DO UPDATE SET 
            exists = EXCLUDED.exists, 
            health_state = EXCLUDED.health_state,
            content_hash = EXCLUDED.content_hash,
            last_checked = EXCLUDED.last_checked
    `;

    // Other docs (README, LICENSE, CHANGELOG, CONTRIBUTING)
    const docTypes = ['README.md', 'LICENSE.md', 'CHANGELOG.md', 'CONTRIBUTING.md'];
    for (const docFile of docTypes) {
        const content = await github.getFileContent(repo.name, docFile, owner);
        const docType = docFile.replace('.md', '').toLowerCase();
        const healthState = calculateDocHealthState(!!content, content, null);
        await db`
            INSERT INTO doc_status (repo_id, doc_type, exists, health_state, content_hash, last_checked)
            VALUES (${repoId}, ${docType}, ${content !== null}, ${healthState}, ${content ? hashContent(content) : null}, NOW())
            ON CONFLICT (repo_id, doc_type) DO UPDATE SET 
                exists = EXCLUDED.exists, 
                health_state = EXCLUDED.health_state,
                content_hash = EXCLUDED.content_hash,
                last_checked = EXCLUDED.last_checked
        `;
    }

    // Best Practices Detection
    try {
        const readmeContent = await github.getFileContent(repo.name, 'README.md', owner);
        const bestPracticesResult = await checkBestPractices(owner, repo.name, github.octokit, fileList, readmeContent || undefined);
        
        await db`DELETE FROM best_practices WHERE repo_id = ${repoId}`;
        for (const practice of bestPracticesResult.practices) {
            await db`
                INSERT INTO best_practices (repo_id, practice_type, status, details, last_checked)
                VALUES (${repoId}, ${practice.type}, ${practice.status}, ${JSON.stringify(practice.details)}, NOW())
            `;
        }
    } catch (e) {
        console.warn(`Failed to check best practices for ${repo.fullName}`, e);
    }

    // Community Standards Detection
    try {
        const communityStandardsResult = checkCommunityStandards(fileList);
        
        await db`DELETE FROM community_standards WHERE repo_id = ${repoId}`;
        for (const standard of communityStandardsResult.standards) {
            await db`
                INSERT INTO community_standards (repo_id, standard_type, status, details, last_checked)
                VALUES (${repoId}, ${standard.type}, ${standard.status}, ${JSON.stringify(standard.details)}, NOW())
            `;
        }
    } catch (e) {
        console.warn(`Failed to check community standards for ${repo.fullName}`, e);
    }

    // Calculate and update health score
    try {
        // Fetch all data needed for health calculation
        const docStatuses = await db`SELECT * FROM doc_status WHERE repo_id = ${repoId}`;
        const bestPractices = await db`SELECT * FROM best_practices WHERE repo_id = ${repoId}`;
        const communityStandards = await db`SELECT * FROM community_standards WHERE repo_id = ${repoId}`;
        const metrics = await db`SELECT * FROM metrics WHERE repo_id = ${repoId}`;
        
        const docHealth = calculateDocHealth(docStatuses, 'other');
        const coverage = metrics.find((m: { metric_name: string }) => m.metric_name?.toLowerCase().includes('coverage'));
        const hasTests = bestPractices.some((bp: { practice_type: string; status: string }) => 
            bp.practice_type === 'testing_framework' && bp.status === 'healthy'
        );
        const hasCI = bestPractices.some((bp: { practice_type: string; status: string }) => 
            bp.practice_type === 'cicd' && bp.status === 'healthy'
        );
        
        const daysSinceCommit = lastCommitDate 
            ? Math.floor((Date.now() - new Date(lastCommitDate).getTime()) / (1000 * 60 * 60 * 24))
            : 365;
        
        const healthScore = calculateHealthScore({
            docHealth: docHealth.score,
            hasTests,
            codeCoverage: coverage?.value,
            bestPracticesCount: bestPractices.length,
            bestPracticesHealthy: bestPractices.filter((bp: { status: string }) => bp.status === 'healthy').length,
            communityStandardsCount: communityStandards.length,
            communityStandardsHealthy: communityStandards.filter((cs: { status: string }) => cs.status === 'healthy').length,
            hasCI,
            lastCommitDays: daysSinceCommit,
            openIssuesCount: repo.openIssues,
            openPRsCount: openPrs,
        });
        
        await db`
            UPDATE repos 
            SET health_score = ${healthScore.total}
            WHERE id = ${repoId}
        `;
        
        console.log(`✓ Health score for ${repo.name}: ${healthScore.total}/100`);
    } catch (e) {
        console.warn(`Failed to calculate health score for ${repo.fullName}`, e);
    }
}

// Wrapper function to sync a single repo by name
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncSingleRepo(github: GitHubClient, repoName: string) {
    const { getNeonClient } = await import('./db');
    const db = getNeonClient();

    // Get the repo metadata from GitHub
    const repos = await github.getUserRepos();
    const repo = repos.find((r: RepoMetadata) => r.name === repoName);
    
    if (!repo) {
        throw new Error(`Repository ${repoName} not found in user's repos`);
    }

    await syncRepo(repo, github, db);
    console.log(`✓ Synced ${repoName}`);
}
