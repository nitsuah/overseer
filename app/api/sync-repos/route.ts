import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GitHubClient } from '@/lib/github';
import { getNeonClient } from '@/lib/db';
import { parseRoadmap } from '@/lib/parsers/roadmap';
import { parseTasks } from '@/lib/parsers/tasks';
import { parseMetrics } from '@/lib/parsers/metrics';
import { detectRepoType } from '@/lib/repo-type';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accessToken = (session as any).accessToken;
        if (!accessToken) {
            return NextResponse.json({ error: 'No GitHub access token found' }, { status: 401 });
        }

        // Fetch the authenticated user's GitHub username
        const { Octokit } = await import('@octokit/rest');
        const octokit = new Octokit({ auth: accessToken });
        const { data: user } = await octokit.rest.users.getAuthenticated();
        const githubUsername = user.login;
        
        const github = new GitHubClient(accessToken, githubUsername);
        const db = getNeonClient();

        const repos = await github.listRepos();
        let successCount = 0;
        let errorCount = 0;

        for (const repo of repos) {
            try {
            // Detect repo type
            const repoType = detectRepoType(repo.name, repo.description, repo.language, repo.topics);
            
            // Upsert repo - Neon returns array directly, not { rows: [...] }
            const repoRows = await db`
                INSERT INTO repos (name, full_name, description, language, stars, forks, open_issues, url, homepage, topics, is_fork, repo_type, is_hidden, last_synced, updated_at)
                VALUES (${repo.name}, ${repo.fullName}, ${repo.description}, ${repo.language}, ${repo.stars}, ${repo.forks}, ${repo.openIssues}, ${repo.url}, ${repo.homepage}, ${repo.topics}, ${repo.isFork}, ${repoType.type}, FALSE, NOW(), NOW())
                ON CONFLICT (name) DO UPDATE SET
                  description = EXCLUDED.description,
                  language = EXCLUDED.language,
                  stars = EXCLUDED.stars,
                  forks = EXCLUDED.forks,
                  open_issues = EXCLUDED.open_issues,
                  url = EXCLUDED.url,
                  homepage = EXCLUDED.homepage,
                  topics = EXCLUDED.topics,
                  is_fork = EXCLUDED.is_fork,
                  repo_type = EXCLUDED.repo_type,
                  is_hidden = FALSE,
                  last_synced = NOW(),
                  updated_at = NOW()
                RETURNING id;
            `;
            
            // Get repo ID from result
            let repoId: string;
            if (Array.isArray(repoRows) && repoRows.length > 0 && repoRows[0]) {
                repoId = repoRows[0].id;
            } else {
                // Fallback: query for existing repo
                const existing = await db`
                    SELECT id FROM repos WHERE name = ${repo.name} LIMIT 1
                `;
                if (Array.isArray(existing) && existing.length > 0 && existing[0]) {
                    repoId = existing[0].id;
                } else {
                    console.error(`Failed to get repo ID for ${repo.name}`);
                    continue;
                }
            }

            // Branches count (skip if repo doesn't exist or no access)
            try {
                const branches = await github.getBranches(repo.name);
                await db`
                    UPDATE repos SET branches_count = ${branches.length} WHERE id = ${repoId}
                `;
            } catch (branchError: any) {
                // If we can't get branches, just set to 0 and continue
                console.warn(`Could not get branches for ${repo.name}: ${branchError.message}`);
                await db`
                    UPDATE repos SET branches_count = 0 WHERE id = ${repoId}
                `;
            }

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
            } else {
                await db`
                    INSERT INTO doc_status (repo_id, doc_type, exists, last_checked)
                    VALUES (${repoId}, 'roadmap', false, NOW())
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
            } else {
                await db`
                    INSERT INTO doc_status (repo_id, doc_type, exists, last_checked)
                    VALUES (${repoId}, 'tasks', false, NOW())
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
            } else {
                await db`
                    INSERT INTO doc_status (repo_id, doc_type, exists, last_checked)
                    VALUES (${repoId}, 'metrics', false, NOW())
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
            
            successCount++;
            } catch (repoError: any) {
                console.error(`Error syncing repo ${repo.name}:`, repoError.message);
                errorCount++;
                // Continue with next repo instead of failing entire sync
                continue;
            }
        }

        return NextResponse.json({ 
            success: true, 
            total: repos.length,
            synced: successCount,
            errors: errorCount
        });
    } catch (error: any) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

