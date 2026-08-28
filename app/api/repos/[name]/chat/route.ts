import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getNeonClient } from '@/lib/db';
import { DEFAULT_REPOS } from '@/lib/default-repos';
import { generateAIContent } from '@/lib/ai';
import {
    buildChatPrompt,
    findStaleDocs,
    parseChatMessages,
    type RepoChatSnapshot,
} from '@/lib/repo-chat';
import logger from '@/lib/log';

export const runtime = 'nodejs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

function toSnapshot(repo: Row, tasks: Row[], roadmapItems: Row[], docStatuses: Row[]): RepoChatSnapshot {
    return {
        name: repo.name,
        fullName: repo.full_name ?? null,
        description: repo.description ?? null,
        language: repo.language ?? null,
        repoType: repo.repo_type ?? null,
        healthScore: repo.health_score ?? null,
        aiSummary: repo.ai_summary ?? null,
        lastCommitDate: repo.last_commit_date ? String(repo.last_commit_date) : null,
        readmeLastUpdated: repo.readme_last_updated ? String(repo.readme_last_updated) : null,
        lastSynced: repo.last_synced ? String(repo.last_synced) : null,
        openPrs: repo.open_prs ?? null,
        openIssues: repo.open_issues_count ?? null,
        vulnAlertCount: repo.vuln_alert_count ?? null,
        ciStatus: repo.ci_status ?? null,
        testingStatus: repo.testing_status ?? null,
        coverageScore: repo.coverage_score ?? null,
        docStatuses: (docStatuses ?? []).map((d: Row) => ({
            doc_type: d.doc_type,
            exists: d.exists,
            health_state: d.health_state,
            updated_at: d.updated_at ? String(d.updated_at) : null,
        })),
        tasks: (tasks ?? []).map((t: Row) => ({
            title: t.title,
            status: t.status,
            section: t.section,
            subsection: t.subsection,
            description: t.description,
        })),
        roadmapItems: (roadmapItems ?? []).map((r: Row) => ({
            title: r.title,
            quarter: r.quarter,
            status: r.status,
        })),
    };
}

/**
 * POST /api/repos/[name]/chat
 *
 * The per-repo conversational endpoint. Each repo is its own chat thread
 * ("friend"); the client sends the full transcript and the server rebuilds the
 * dashboard context server-side so the model can only see real data.
 */
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ name: string }> }
) {
    const params = await props.params;
    const repoName = params.name;

    if (!repoName) {
        return NextResponse.json({ error: 'Repo name required' }, { status: 400 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Malformed request body' }, { status: 400 });
    }

    const parsed = parseChatMessages((body as Record<string, unknown> | null)?.messages);
    if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    try {
        const session = await auth();
        const db = getNeonClient();

        const repoRows = await db`SELECT * FROM repos WHERE name = ${repoName} LIMIT 1`;
        if (repoRows.length === 0) {
            return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
        }
        const repo = repoRows[0];

        // Unauthenticated visitors may only chat about the public default repos,
        // matching the read access granted by /api/repo-details/[name].
        if (!session) {
            const defaultRepoNames = DEFAULT_REPOS.map((r) => r.name);
            if (!defaultRepoNames.includes(repo.name)) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const [tasks, roadmapItems, docStatuses] = await db.transaction([
            db`SELECT * FROM tasks WHERE repo_id = ${repo.id} ORDER BY created_at DESC`,
            db`SELECT * FROM roadmap_items WHERE repo_id = ${repo.id} ORDER BY created_at DESC`,
            db`SELECT * FROM doc_status WHERE repo_id = ${repo.id}`,
        ]);

        const snapshot = toSnapshot(repo, tasks, roadmapItems, docStatuses);
        const prompt = buildChatPrompt(snapshot, parsed.messages!);

        const reply = await generateAIContent(prompt);

        return NextResponse.json({
            success: true,
            reply,
            context: {
                repo: snapshot.name,
                healthScore: snapshot.healthScore,
                openTaskCount: snapshot.tasks.filter((t) => t.status !== 'done').length,
                roadmapItemCount: snapshot.roadmapItems.length,
                staleDocCount: findStaleDocs(snapshot).length,
            },
        });
    } catch (error: unknown) {
        logger.warn('Repo chat failed:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';

        // AI provider outages are a service condition, not a client mistake.
        if (
            message.includes('No AI Provider Configured') ||
            message.includes('quota') ||
            message.includes('providers failed') ||
            message.includes('temporarily unavailable')
        ) {
            return NextResponse.json({ error: message }, { status: 503 });
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
