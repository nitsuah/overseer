import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getNeonClient } from '@/lib/db';
import logger from '@/lib/log';

export interface PmoInProgressItem {
    id: string;
    repo_id: string;
    title: string;
    quarter: string | null;
    linked_pr_number: number | null;
    agent_task_id: string | null;
}

export interface PmoRepoSummary {
    id: string;
    name: string;
    full_name: string;
    url: string;
    health_score: number | null;
    ci_status: string | null;
    last_commit_date: string | null;
    open_prs: number;
    roadmap: {
        total: number;
        planned: number;
        in_progress: number;
        in_review: number;
        done: number;
        stale_count: number;
    };
    tasks: {
        total: number;
        todo: number;
        in_progress: number;
        done: number;
    };
    in_progress_items: PmoInProgressItem[];
}

export interface PmoPortfolio {
    repo_count: number;
    roadmap_planned: number;
    roadmap_in_progress: number;
    roadmap_in_review: number;
    roadmap_done: number;
    tasks_in_progress: number;
    stale_count: number;
}

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = getNeonClient();

        const [repos, roadmapAgg, taskAgg, inProgressItems] = await db.transaction([
            db`
                SELECT id, name, full_name, url, health_score, ci_status, last_commit_date, open_prs
                FROM repos
                WHERE is_hidden = false OR is_hidden IS NULL
                ORDER BY health_score DESC NULLS LAST
            `,
            db`
                SELECT
                    repo_id,
                    COUNT(*)::int                                                         AS total,
                    COUNT(*) FILTER (WHERE status = 'planned')::int                      AS planned,
                    COUNT(*) FILTER (WHERE status = 'in-progress'
                                    AND linked_pr_number IS NULL)::int                   AS in_progress,
                    COUNT(*) FILTER (WHERE status = 'in-progress'
                                    AND linked_pr_number IS NOT NULL)::int               AS in_review,
                    COUNT(*) FILTER (WHERE status = 'completed')::int                    AS done,
                    COUNT(*) FILTER (WHERE status = 'in-progress'
                                    AND linked_pr_number IS NULL)::int                   AS stale_count
                FROM roadmap_items
                GROUP BY repo_id
            `,
            db`
                SELECT
                    repo_id,
                    COUNT(*)::int                                        AS total,
                    COUNT(*) FILTER (WHERE status = 'todo')::int        AS todo,
                    COUNT(*) FILTER (WHERE status = 'in-progress')::int AS in_progress,
                    COUNT(*) FILTER (WHERE status = 'done')::int        AS done
                FROM tasks
                GROUP BY repo_id
            `,
            db`
                SELECT id, repo_id, title, quarter, linked_pr_number, agent_task_id
                FROM roadmap_items
                WHERE status = 'in-progress'
                ORDER BY updated_at DESC
            `,
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const roadmapByRepo = new Map(roadmapAgg.map((r: any) => [r.repo_id, r]));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tasksByRepo = new Map(taskAgg.map((t: any) => [t.repo_id, t]));
         
        const itemsByRepo = new Map<string, PmoInProgressItem[]>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const item of inProgressItems as any[]) {
            const arr = itemsByRepo.get(item.repo_id) ?? [];
            arr.push(item as PmoInProgressItem);
            itemsByRepo.set(item.repo_id, arr);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const repoSummaries: PmoRepoSummary[] = (repos as any[]).map((r) => {
            const rm = roadmapByRepo.get(r.id) as Record<string, number> | undefined;
            const tk = tasksByRepo.get(r.id) as Record<string, number> | undefined;
            return {
                id: r.id,
                name: r.name,
                full_name: r.full_name,
                url: r.url,
                health_score: r.health_score,
                ci_status: r.ci_status,
                last_commit_date: r.last_commit_date,
                open_prs: r.open_prs ?? 0,
                roadmap: {
                    total:        rm ? Number(rm.total)        : 0,
                    planned:      rm ? Number(rm.planned)      : 0,
                    in_progress:  rm ? Number(rm.in_progress)  : 0,
                    in_review:    rm ? Number(rm.in_review)    : 0,
                    done:         rm ? Number(rm.done)         : 0,
                    stale_count:  rm ? Number(rm.stale_count)  : 0,
                },
                tasks: {
                    total:       tk ? Number(tk.total)       : 0,
                    todo:        tk ? Number(tk.todo)        : 0,
                    in_progress: tk ? Number(tk.in_progress) : 0,
                    done:        tk ? Number(tk.done)        : 0,
                },
                in_progress_items: itemsByRepo.get(r.id) ?? [],
            };
        });

        const portfolio: PmoPortfolio = repoSummaries.reduce<PmoPortfolio>(
            (acc, r) => ({
                repo_count:          acc.repo_count + 1,
                roadmap_planned:     acc.roadmap_planned     + r.roadmap.planned,
                roadmap_in_progress: acc.roadmap_in_progress + r.roadmap.in_progress,
                roadmap_in_review:   acc.roadmap_in_review   + r.roadmap.in_review,
                roadmap_done:        acc.roadmap_done        + r.roadmap.done,
                tasks_in_progress:   acc.tasks_in_progress   + r.tasks.in_progress,
                stale_count:         acc.stale_count         + r.roadmap.stale_count,
            }),
            { repo_count: 0, roadmap_planned: 0, roadmap_in_progress: 0, roadmap_in_review: 0, roadmap_done: 0, tasks_in_progress: 0, stale_count: 0 }
        );

        return NextResponse.json({ repos: repoSummaries, portfolio });
    } catch (error: unknown) {
        logger.warn('Error fetching PMO overview:', error);
        return NextResponse.json({ error: 'Failed to fetch PMO overview' }, { status: 500 });
    }
}
