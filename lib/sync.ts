
import { GitHubClient, RepoMetadata } from './github';
import { parseRoadmap } from './parsers/roadmap';
import { parseTasks } from './parsers/tasks';
import { parseMetrics } from './parsers/metrics';
import { parseFeatures } from './parsers/features';
import { calculateDocHealthState, hashContent, calculateDocHealth } from './doc-health';
import { checkBestPractices } from './best-practices';
import { checkCommunityStandards } from './community-standards';
import { calculateHealthScore } from './health-score';
import { isTestFile, parseTestFile } from './parsers/test-cases';
import logger from './log';


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

    // Fetch README last updated
    let readmeLastUpdated: string | null = null;
    try {
        readmeLastUpdated = await github.getFileLastModified(repo.name, 'README.md', owner);
    } catch (e) {
        console.warn(`Could not get README last modified for ${repo.name}:`, (e as Error).message);
    }

    // Fetch LOC (Lines of Code) metrics
    let totalLoc = 0;
    let locLanguageBreakdown: Record<string, number> = {};
    try {
        const languageStats = await github.getLanguageStats(repo.name, owner);
        locLanguageBreakdown = languageStats;
        // GitHub returns bytes, rough estimate: 1 LOC ~= 50 bytes (average line length)
        totalLoc = Math.round(Object.values(languageStats).reduce((sum, bytes) => sum + bytes, 0) / 50);
    } catch (e) {
        console.warn(`Could not get language stats for ${repo.name}:`, (e as Error).message);
    }

    // Fetch CI/CD status from GitHub Actions
    let ciStatus = 'unknown';
    let ciLastRun: string | null = null;
    let ciWorkflowName: string | null = null;
    try {
        const workflowData = await github.getWorkflowRuns(repo.name, owner);
        ciStatus = workflowData.status;
        ciLastRun = workflowData.lastRun;
        ciWorkflowName = workflowData.workflowName;
    } catch (e) {
        console.warn(`Could not get workflow runs for ${repo.name}:`, (e as Error).message);
    }

    // Fetch vulnerability alerts
    let vulnAlertCount = 0;
    let vulnCriticalCount = 0;
    let vulnHighCount = 0;
    try {
        const vulnData = await github.getVulnerabilityAlerts(repo.name, owner);
        vulnAlertCount = vulnData.total;
        vulnCriticalCount = vulnData.critical;
        vulnHighCount = vulnData.high;
    } catch (e) {
        console.warn(`Could not get vulnerability alerts for ${repo.name}:`, (e as Error).message);
    }

    // Fetch contributor metrics
    let contributorCount = 0;
    let commitFrequency = 0;
    let busFactor = 0;
    try {
        const contributorStats = await github.getContributorStats(repo.name, owner);
        contributorCount = contributorStats.contributorCount;
        commitFrequency = contributorStats.commitFrequency;
        busFactor = contributorStats.busFactor;
    } catch (e) {
        console.warn(`Could not get contributor stats for ${repo.name}:`, (e as Error).message);
    }

    // Fetch PR merge time
    let avgPrMergeTimeHours = 0;
    try {
        const prStats = await github.getPullRequestStats(repo.name, owner);
        avgPrMergeTimeHours = prStats.avgMergeTimeHours;
    } catch (e) {
        console.warn(`Could not get PR stats for ${repo.name}:`, (e as Error).message);
    }

    // Upsert repo with new metrics
    const repoRows = await db`
        INSERT INTO repos (
            name, full_name, description, language, stars, forks, open_issues, url, homepage, topics, 
            last_synced, updated_at, last_commit_date, open_prs, branches_count, readme_last_updated,
            total_loc, loc_language_breakdown, ci_status, ci_last_run, ci_workflow_name,
            vuln_alert_count, vuln_critical_count, vuln_high_count, vuln_last_checked,
            contributor_count, commit_frequency, bus_factor, avg_pr_merge_time_hours, contributors_last_checked
        )
        VALUES (
            ${repo.name}, ${repo.fullName}, ${repo.description}, ${repo.language}, ${repo.stars}, 
            ${repo.forks}, ${repo.openIssues}, ${repo.url}, ${repo.homepage}, ${repo.topics}, 
            NOW(), NOW(), ${lastCommitDate}, ${openPrs}, ${branchesCount}, ${readmeLastUpdated},
            ${totalLoc}, ${JSON.stringify(locLanguageBreakdown)}, ${ciStatus}, ${ciLastRun}, ${ciWorkflowName},
            ${vulnAlertCount}, ${vulnCriticalCount}, ${vulnHighCount}, NOW(),
            ${contributorCount}, ${commitFrequency}, ${busFactor}, ${avgPrMergeTimeHours}, NOW()
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
          branches_count = EXCLUDED.branches_count,
          readme_last_updated = EXCLUDED.readme_last_updated,
          total_loc = EXCLUDED.total_loc,
          loc_language_breakdown = EXCLUDED.loc_language_breakdown,
          ci_status = EXCLUDED.ci_status,
          ci_last_run = EXCLUDED.ci_last_run,
          ci_workflow_name = EXCLUDED.ci_workflow_name,
          vuln_alert_count = EXCLUDED.vuln_alert_count,
          vuln_critical_count = EXCLUDED.vuln_critical_count,
          vuln_high_count = EXCLUDED.vuln_high_count,
          vuln_last_checked = EXCLUDED.vuln_last_checked,
          contributor_count = EXCLUDED.contributor_count,
          commit_frequency = EXCLUDED.commit_frequency,
          bus_factor = EXCLUDED.bus_factor,
          avg_pr_merge_time_hours = EXCLUDED.avg_pr_merge_time_hours,
          contributors_last_checked = EXCLUDED.contributors_last_checked
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

    // Count test cases from test files
    let testCaseCount = 0;
    let testDescribeCount = 0;
    try {
        const testFiles = fileList.filter(isTestFile);
        for (const testFile of testFiles) {
            try {
                const content = await github.getFileContent(repo.name, testFile, owner);
                if (content) {
                    const stats = parseTestFile(content);
                    testCaseCount += stats.tests;
                    testDescribeCount += stats.describes;
                }
            } catch {
                // Skip files that can't be fetched
                console.warn(`Failed to fetch test file ${testFile} for ${repo.fullName}`);
            }
        }
    } catch (e) {
        console.warn(`Failed to count test cases for ${repo.fullName}`, e);
    }

    // Update repo with test case counts
    await db`
        UPDATE repos 
        SET test_case_count = ${testCaseCount}, test_describe_count = ${testDescribeCount}
        WHERE id = ${repoId}
    `;

    // ROADMAP.md (try uppercase then lowercase) - root only
    let roadmapContent = await github.getFileContent(repo.name, 'ROADMAP.md', owner).catch(() => null);
    if (!roadmapContent) {
        roadmapContent = await github.getFileContent(repo.name, 'roadmap.md', owner).catch(() => null);
    }
    // Core docs should be in root - no template comparison
    const roadmapHealthState = calculateDocHealthState(!!roadmapContent, roadmapContent, null);
    if (roadmapContent) {
        const roadmapData = parseRoadmap(roadmapContent);
        logger.debug(`[SYNC] ${repo.name} - Roadmap items parsed: ${roadmapData.items.length}`);
        if (roadmapData.items.length === 0) {
            logger.debug(`[SYNC] ${repo.name} - Roadmap content preview:`, roadmapContent.substring(0, 200));
        }
        await db`DELETE FROM roadmap_items WHERE repo_id = ${repoId}`;
        for (const item of roadmapData.items) {
            await db`
                INSERT INTO roadmap_items (repo_id, title, quarter, status)
                VALUES (${repoId}, ${item.title}, ${item.quarter}, ${item.status})
            `;
        }
    }
    await db`
        INSERT INTO doc_status (repo_id, doc_type, exists, health_state, content_hash, template_version, last_checked)
        VALUES (
            ${repoId}, 'roadmap', ${!!roadmapContent}, ${roadmapHealthState}, ${roadmapContent ? hashContent(roadmapContent) : null}, NULL, NOW()
        )
        ON CONFLICT (repo_id, doc_type) DO UPDATE SET 
            exists = EXCLUDED.exists, 
            health_state = EXCLUDED.health_state,
            content_hash = EXCLUDED.content_hash,
            template_version = EXCLUDED.template_version,
            last_checked = EXCLUDED.last_checked
    `;

    // TASKS.md - root only
    const tasksContent = await github.getFileContent(repo.name, 'TASKS.md', owner);
    // Core docs should be in root - no template comparison
    const tasksHealthState = calculateDocHealthState(!!tasksContent, tasksContent, null);
    if (tasksContent) {
        const tasksData = parseTasks(tasksContent);
        logger.debug(`[SYNC] ${repo.name} - Tasks parsed: ${tasksData.tasks.length}`);
        if (tasksData.tasks.length === 0) {
            logger.debug(`[SYNC] ${repo.name} - Tasks content preview:`, tasksContent.substring(0, 200));
        }
        await db`DELETE FROM tasks WHERE repo_id = ${repoId}`;
        
        // Track seen task IDs to handle duplicates
        const seenTaskIds = new Set<string>();
        
        for (const task of tasksData.tasks) {
            let taskId = task.id;
            let counter = 1;
            
            // If duplicate task_id, append counter to make it unique
            while (seenTaskIds.has(taskId)) {
                taskId = `${task.id}-${counter}`;
                counter++;
            }
            seenTaskIds.add(taskId);
            
            await db`
                INSERT INTO tasks (repo_id, task_id, title, status, section, subsection)
                VALUES (${repoId}, ${taskId}, ${task.title}, ${task.status}, ${task.section}, ${task.subsection})
            `;
        }
    }
    await db`
        INSERT INTO doc_status (repo_id, doc_type, exists, health_state, content_hash, template_version, last_checked)
        VALUES (
            ${repoId}, 'tasks', ${!!tasksContent}, ${tasksHealthState}, ${tasksContent ? hashContent(tasksContent) : null}, NULL, NOW()
        )
        ON CONFLICT (repo_id, doc_type) DO UPDATE SET 
            exists = EXCLUDED.exists, 
            health_state = EXCLUDED.health_state,
            content_hash = EXCLUDED.content_hash,
            template_version = EXCLUDED.template_version,
            last_checked = EXCLUDED.last_checked
    `;

    // METRICS.md
    const metricsContent = await github.getFileContent(repo.name, 'METRICS.md', owner);
    const metricsHealthState = calculateDocHealthState(!!metricsContent, metricsContent, null);
    let coverageScore: number | null = null;
    if (metricsContent) {
        const metricsData = parseMetrics(metricsContent);
        // Use logger.debug so these parser logs can be gated in production
        logger.debug(`[SYNC] ${repo.name} - Metrics parsed: ${metricsData.metrics.length}`);
        if (metricsData.metrics.length === 0) {
            logger.debug(`[SYNC] ${repo.name} - Metrics content preview:`, metricsContent.substring(0, 200));
        }
        await db`DELETE FROM metrics WHERE repo_id = ${repoId}`;
        for (const metric of metricsData.metrics) {
            await db`
                INSERT INTO metrics (repo_id, metric_name, value, unit, timestamp)
                VALUES (${repoId}, ${metric.name}, ${metric.value}, ${metric.unit}, NOW())
            `;
            // Extract coverage metric for repos table
            if (metric.name.toLowerCase().includes('coverage') && metric.unit === '%') {
                // Value is already normalized to 0-100 range by parser
                coverageScore = metric.value;
            }
        }
    }
    
    // Always update coverage_score (set to NULL if no coverage found)
    await db`
        UPDATE repos 
        SET coverage_score = ${coverageScore}
        WHERE id = ${repoId}
    `;
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
        logger.debug(`[SYNC] ${repo.name} - Features categories parsed: ${featuresData.categories.length}`);
        if (featuresData.categories.length === 0) {
            logger.debug(`[SYNC] ${repo.name} - Features content preview:`, featuresContent.substring(0, 200));
        }
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
        const bestPracticesResult = await checkBestPractices(owner, repo.name, github.getOctokit(), fileList, readmeContent || undefined);

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
            bp.practice_type === 'ci_cd' && bp.status === 'healthy'
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

        logger.info(`✓ Health score for ${repo.name}: ${healthScore.total}/100`);
    } catch (e) {
        console.warn(`Failed to calculate health score for ${repo.fullName}`, e);
    }
}

// Wrapper function to sync a single repo by name
export async function syncSingleRepo(github: GitHubClient, repoName: string) {
    const { getNeonClient } = await import('./db');
    const db = getNeonClient();

    // Get the repo metadata from GitHub
    const repos = await github.listRepos();
    const repo = repos.find((r: RepoMetadata) => r.name === repoName);

    if (!repo) {
        throw new Error(`Repository ${repoName} not found in user's repos`);
    }

    await syncRepo(repo, github, db);
    logger.info(`✓ Synced ${repoName}`);
}
