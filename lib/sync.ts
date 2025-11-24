
import { GitHubClient, RepoMetadata } from './github';
import { parseRoadmap } from './parsers/roadmap';
import { parseTasks } from './parsers/tasks';
import { parseMetrics } from './parsers/metrics';

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

    // Upsert repo with new metrics
    const repoRows = await db`
        INSERT INTO repos (
            name, full_name, description, language, stars, forks, open_issues, url, homepage, topics, 
            last_synced, updated_at, last_commit_date, open_prs, open_issues_count
        )
        VALUES (
            ${repo.name}, ${repo.fullName}, ${repo.description}, ${repo.language}, ${repo.stars}, 
            ${repo.forks}, ${repo.openIssues}, ${repo.url}, ${repo.homepage}, ${repo.topics}, 
            NOW(), NOW(), ${lastCommitDate}, ${openPrs}, ${repo.openIssues}
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
          open_issues_count = EXCLUDED.open_issues_count
        RETURNING id;
    `;
    const repoId = repoRows[0].id;

    // Branches count
    try {
        const branches = await github.getBranches(repo.name, owner);
        await db`
            UPDATE repos SET branches_count = ${branches.length} WHERE id = ${repoId}
        `;
    } catch (e) {
        console.warn(`Failed to fetch branches for ${repo.fullName}`, e);
    }

    // ROADMAP.md
    const roadmapContent = await github.getFileContent(repo.name, 'ROADMAP.md', owner);
    if (roadmapContent) {
        const roadmapData = parseRoadmap(roadmapContent);
        await db`DELETE FROM roadmap_items WHERE repo_id = ${repoId}`;
        for (const item of roadmapData.items) {
            await db`
                INSERT INTO roadmap_items (repo_id, title, quarter, status, priority)
                VALUES (${repoId}, ${item.title}, ${item.quarter}, ${item.status}, ${roadmapData.frontmatter.priority || null})
            `;
        }
        await db`
            INSERT INTO doc_status (repo_id, doc_type, exists, last_checked)
            VALUES (${repoId}, 'roadmap', true, NOW())
            ON CONFLICT (repo_id, doc_type) DO UPDATE SET exists = EXCLUDED.exists, last_checked = EXCLUDED.last_checked
        `;
    }

    // TASKS.md
    const tasksContent = await github.getFileContent(repo.name, 'TASKS.md', owner);
    if (tasksContent) {
        const tasksData = parseTasks(tasksContent);
        await db`DELETE FROM tasks WHERE repo_id = ${repoId}`;
        for (const task of tasksData.tasks) {
            await db`
                INSERT INTO tasks (repo_id, task_id, title, status, section)
                VALUES (${repoId}, ${task.id}, ${task.title}, ${task.status}, ${task.section})
            `;
        }
        await db`
            INSERT INTO doc_status (repo_id, doc_type, exists, last_checked)
            VALUES (${repoId}, 'tasks', true, NOW())
            ON CONFLICT (repo_id, doc_type) DO UPDATE SET exists = EXCLUDED.exists, last_checked = EXCLUDED.last_checked
        `;
    }

    // METRICS.md
    const metricsContent = await github.getFileContent(repo.name, 'METRICS.md', owner);
    if (metricsContent) {
        const metricsData = parseMetrics(metricsContent);
        for (const metric of metricsData.metrics) {
            await db`
                INSERT INTO metrics (repo_id, metric_name, value, unit, timestamp)
                VALUES (${repoId}, ${metric.name}, ${metric.value}, ${metric.unit}, NOW())
            `;
        }
        await db`
            INSERT INTO doc_status (repo_id, doc_type, exists, last_checked)
            VALUES (${repoId}, 'metrics', true, NOW())
            ON CONFLICT (repo_id, doc_type) DO UPDATE SET exists = EXCLUDED.exists, last_checked = EXCLUDED.last_checked
        `;
    }

    // Other docs
    const docTypes = ['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md'];
    for (const docFile of docTypes) {
        const content = await github.getFileContent(repo.name, docFile, owner);
        const docType = docFile.replace('.md', '').toLowerCase();
        await db`
            INSERT INTO doc_status (repo_id, doc_type, exists, last_checked)
            VALUES (${repoId}, ${docType}, ${content !== null}, NOW())
            ON CONFLICT (repo_id, doc_type) DO UPDATE SET exists = EXCLUDED.exists, last_checked = EXCLUDED.last_checked
        `;
    }
}
