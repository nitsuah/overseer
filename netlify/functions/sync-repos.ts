// netlify/functions/sync-repos.ts
import type { Handler } from '@netlify/functions';
import { GitHubClient } from '../../lib/github';
import { getNeonClient } from '../../lib/db';
import { parseRoadmap } from '../../lib/parsers/roadmap';
import { parseTasks } from '../../lib/parsers/tasks';
import { parseMetrics } from '../../lib/parsers/metrics';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) throw new Error('GITHUB_TOKEN not configured');
        const github = new GitHubClient(githubToken, 'nitsuah');
        const db = getNeonClient();

        const repos = await github.listRepos();

        for (const repo of repos) {
            // Upsert repo
            const { rows: repoRows } = await db`
        INSERT INTO repos (name, full_name, description, language, stars, forks, open_issues, url, homepage, topics, last_synced, updated_at)
        VALUES (${repo.name}, ${repo.fullName}, ${repo.description}, ${repo.language}, ${repo.stars}, ${repo.forks}, ${repo.openIssues}, ${repo.url}, ${repo.homepage}, ${repo.topics}, NOW(), NOW())
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
          updated_at = NOW()
        RETURNING id;
      `;
            const repoId = repoRows[0].id;

            // Branches count
            const branches = await github.getBranches(repo.name);
            await db`
        UPDATE repos SET branches_count = ${branches.length} WHERE id = ${repoId}
      `;

            // ROADMAP.md
            const roadmapContent = await github.getFileContent(repo.name, 'ROADMAP.md');
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
            const tasksContent = await github.getFileContent(repo.name, 'TASKS.md');
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
            const metricsContent = await github.getFileContent(repo.name, 'METRICS.md');
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
                const content = await github.getFileContent(repo.name, docFile);
                const docType = docFile.replace('.md', '').toLowerCase();
                await db`
          INSERT INTO doc_status (repo_id, doc_type, exists, last_checked)
          VALUES (${repoId}, ${docType}, ${content !== null}, NOW())
          ON CONFLICT (repo_id, doc_type) DO UPDATE SET exists = EXCLUDED.exists, last_checked = EXCLUDED.last_checked
        `;
            }
        }

        return { statusCode: 200, body: JSON.stringify({ success: true, count: repos.length }) };
    } catch (error: any) {
        console.error('Sync error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
