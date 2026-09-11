import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getNeonClient, ensureSchema } from '@/lib/db';
import { DEFAULT_REPOS } from '@/lib/default-repos';
import { generateAIContent } from '@/lib/ai';
import { decryptApiKey } from '@/lib/byok-crypto';
import { isKnownProvider, AIProvider } from '@/lib/ai-providers';
import {
    buildChatPrompt,
    checkAnonChatRateLimit,
    reserveAuthedSharedKeySlot,
    releaseAuthedSharedKeySlot,
    findStaleDocs,
    parseChatMessages,
    parseDocEditProposal,
    type RepoChatSnapshot,
} from '@/lib/repo-chat';
import logger from '@/lib/log';

export const runtime = 'nodejs';

// Narrow row shapes for exactly the columns this route reads. The Neon
// tagged-template client returns loosely-typed rows (see the `m: any` cast in
// app/api/repo-details/[name]/route.ts for the existing pattern); these
// interfaces exist so toSnapshot's own field access is checked by the
// compiler even though the query results themselves are not.
interface RepoRow {
    id: string;
    name: string;
    full_name?: string | null;
    description?: string | null;
    language?: string | null;
    repo_type?: string | null;
    health_score?: number | null;
    ai_summary?: string | null;
    last_commit_date?: string | Date | null;
    readme_last_updated?: string | Date | null;
    last_synced?: string | Date | null;
    open_prs?: number | null;
    open_issues_count?: number | null;
    vuln_alert_count?: number | null;
    ci_status?: string | null;
    testing_status?: string | null;
    coverage_score?: number | null;
}

interface TaskRow {
    title: string;
    status?: string | null;
    section?: string | null;
    subsection?: string | null;
    description?: string | null;
}

interface RoadmapItemRow {
    title: string;
    quarter?: string | null;
    status?: string | null;
}

interface DocStatusRow {
    doc_type: string;
    exists?: boolean | null;
    health_state?: string | null;
    updated_at?: string | Date | null;
}

function toSnapshot(
    repo: RepoRow,
    tasks: TaskRow[],
    roadmapItems: RoadmapItemRow[],
    docStatuses: DocStatusRow[]
): RepoChatSnapshot {
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
        docStatuses: (docStatuses ?? []).map((d) => ({
            doc_type: d.doc_type,
            exists: d.exists,
            health_state: d.health_state,
            updated_at: d.updated_at ? String(d.updated_at) : null,
        })),
        tasks: (tasks ?? []).map((t) => ({
            title: t.title,
            status: t.status,
            section: t.section,
            subsection: t.subsection,
            description: t.description,
        })),
        roadmapItems: (roadmapItems ?? []).map((r) => ({
            title: r.title,
            quarter: r.quarter,
            status: r.status,
        })),
    };
}

function getClientIp(request: NextRequest): string {
    // x-forwarded-for / x-real-ip are caller-supplied and can be rotated by an
    // anonymous client to defeat the per-IP rate limit below.
    // x-nf-client-connection-ip is populated by Netlify's own edge and cannot
    // be spoofed by the request itself.
    return request.headers.get('x-nf-client-connection-ip') || 'unknown';
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
): Promise<NextResponse> {
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

        // Every turn reaches the database and calls the AI provider chain, so
        // an anonymous caller must be budgeted before either happens (CWE-770:
        // unauthenticated requests are otherwise free to generate unlimited
        // inference load against a public default repo). Authenticated
        // requests are unaffected.
        if (!session) {
            const clientIp = getClientIp(request);
            if (!checkAnonChatRateLimit(clientIp)) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded. Please try again in a minute, or sign in for unlimited access.' },
                    { status: 429 }
                );
            }
        }

        const db = getNeonClient();
        await ensureSchema(db);

        // BYOK: a signed-in user with a *working* personal AI key is not
        // subject to the shared-key budget below; everyone else (including a
        // user whose configured key fails at call time) rides the app's
        // shared/default provider chain, which is metered per-user so one
        // heavy user can't starve everyone else on it.
        let userOverride: { provider: AIProvider; apiKey: string } | undefined;
        let rateLimitWarning: string | undefined;
        if (session?.user?.email) {
            const keyRows = (await db`
                SELECT provider, api_key_encrypted FROM user_ai_keys WHERE user_email = ${session.user.email} LIMIT 1
            `) as Array<{ provider: string; api_key_encrypted: string }>;

            if (keyRows.length > 0 && isKnownProvider(keyRows[0].provider)) {
                try {
                    userOverride = {
                        provider: keyRows[0].provider,
                        apiKey: decryptApiKey(keyRows[0].api_key_encrypted),
                    };
                } catch (decryptError) {
                    logger.warn('Failed to decrypt stored BYOK key, falling back to shared provider:', decryptError);
                }
            }
        }

        const repoRows = await db`SELECT * FROM repos WHERE name = ${repoName} LIMIT 1`;
        if (repoRows.length === 0) {
            return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
        }
        const repo = repoRows[0] as RepoRow;

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
        ]) as [TaskRow[], RoadmapItemRow[], DocStatusRow[]];

        const snapshot = toSnapshot(repo, tasks, roadmapItems, docStatuses);
        const prompt = buildChatPrompt(snapshot, parsed.messages!);

        // Set whenever a slot was reserved against the shared budget for
        // this request, whether or not a personal key is configured --
        // released below if a configured personal key ends up serving the
        // reply, so a working key isn't unnecessarily charged. Reserved
        // immediately before the provider call (not earlier) so a request
        // that fails validation or the DB transaction above never consumes
        // budget for an AI call that was never attempted.
        let sharedKeyReservation: { windowResetAt: number } | undefined;
        if (session?.user?.email) {
            // Reserve BEFORE the AI call, not just when no personal key is
            // configured at all -- a configured key can still fail
            // (revoked/expired/out of quota) and generateAIContent silently
            // falls through to the shared key, and by the time that's known
            // it's too late to enforce the budget (CWE-770). Reserving here
            // and releasing below if the personal key actually succeeds
            // keeps both cases correctly metered.
            const reservation = await reserveAuthedSharedKeySlot(db, session.user.email);
            if (!reservation.allowed) {
                return NextResponse.json(
                    {
                        error: `You've hit the shared AI key's rate limit (${reservation.limit} requests / 5 min). Add your own API key in Settings for unlimited use, or try again shortly.`,
                    },
                    { status: 429 }
                );
            }
            sharedKeyReservation = { windowResetAt: reservation.windowResetAt! };
            if (reservation.nearLimit) {
                rateLimitWarning = `You're using the app's shared AI key and are close to its rate limit (${reservation.remaining}/${reservation.limit} requests left this window). Add your own API key in Settings to avoid being throttled.`;
            }
        }

        const { text: reply, usingOwnKey } = await generateAIContent(prompt, userOverride);

        if (session?.user?.email && sharedKeyReservation) {
            if (usingOwnKey) {
                // The personal key actually served the request: give back
                // the speculative reservation taken before the call. Best
                // effort -- the reply is already generated, so a release
                // failure (e.g. a transient Neon blip) must not turn this
                // into a 500; it just means that one reservation isn't
                // refunded, which self-corrects at the next window roll.
                try {
                    await releaseAuthedSharedKeySlot(db, session.user.email, sharedKeyReservation.windowResetAt);
                } catch (releaseError) {
                    logger.warn('Failed to release shared-key reservation:', releaseError);
                }
            } else if (userOverride) {
                // Configured but failed at call time and silently fell
                // through to the shared key -- already correctly charged by
                // the reservation taken before the call.
                rateLimitWarning = `Your saved API key failed, so this request used the app's shared AI key instead. Check your key in Settings.`;
            }
        }

        const proposal = parseDocEditProposal(reply);

        return NextResponse.json({
            success: true,
            reply,
            proposal,
            usingOwnKey,
            rateLimitWarning,
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
        // "AI model not found" is thrown by generateAIContent for the same
        // class of unavailable-provider failure as the other cases here.
        if (
            message.includes('No AI Provider Configured') ||
            message.includes('quota') ||
            message.includes('providers failed') ||
            message.includes('temporarily unavailable') ||
            message.includes('model not found')
        ) {
            return NextResponse.json({ error: message }, { status: 503 });
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
