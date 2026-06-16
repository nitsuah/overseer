import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { GitHubClient } from '@/lib/github';
import { getNeonClient } from '@/lib/db';
import { syncRepo } from '@/lib/sync';
import logger from '@/lib/log';

async function verifySignature(body: string, sigHeader: string | null): Promise<boolean> {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
        logger.warn('[webhook] GITHUB_WEBHOOK_SECRET not set — rejecting all requests');
        return false;
    }
    if (!sigHeader?.startsWith('sha256=')) return false;

    const expected = createHmac('sha256', secret).update(body).digest('hex');
    const received = sigHeader.slice('sha256='.length);

    try {
        return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    const rawBody = await request.text();
    const sig = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');

    if (!await verifySignature(rawBody, sig)) {
        logger.warn('[webhook] Signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Always 200 ping events immediately
    if (event === 'ping') {
        return NextResponse.json({ ok: true, event: 'ping' });
    }

    // Only handle push events for now
    if (event !== 'push') {
        return NextResponse.json({ ok: true, event, skipped: true });
    }

    let payload: {
        repository?: { name: string; full_name: string; owner: { login: string } };
    };
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const repoFullName = payload.repository?.full_name;
    const repoName = payload.repository?.name;
    const owner = payload.repository?.owner?.login;

    if (!repoFullName || !repoName || !owner) {
        return NextResponse.json({ error: 'Missing repository info in payload' }, { status: 400 });
    }

    // Validate names to prevent injection
    const validGitHubName = /^[a-zA-Z0-9._-]+$/;
    if (!validGitHubName.test(owner) || !validGitHubName.test(repoName)) {
        return NextResponse.json({ error: 'Invalid repository name' }, { status: 400 });
    }

    const systemToken = process.env.GITHUB_TOKEN;
    if (!systemToken) {
        logger.warn('[webhook] GITHUB_TOKEN not set — cannot sync');
        return NextResponse.json({ error: 'System token not configured' }, { status: 503 });
    }

    // Check the repo is tracked in our DB before syncing
    const db = getNeonClient();
    const tracked = await db`SELECT name FROM repos WHERE full_name = ${repoFullName} LIMIT 1`;
    if (tracked.length === 0) {
        logger.info(`[webhook] push for untracked repo ${repoFullName} — ignoring`);
        return NextResponse.json({ ok: true, skipped: true, reason: 'repo not tracked' });
    }

    // Fire-and-forget: respond 200 immediately, sync in background
    const syncInBackground = async () => {
        try {
            const github = new GitHubClient(systemToken, owner);
            const repo = await github.getRepo(owner, repoName);
            await syncRepo(repo, github, db);
            logger.info(`[webhook] Synced ${repoFullName} after push event`);
        } catch (err) {
            logger.warn(`[webhook] Background sync failed for ${repoFullName}:`, err);
        }
    };

    // Fire-and-forget: Next.js will keep the function alive until the promise resolves
    // because we return the response before it completes, but the Node.js event loop
    // keeps running until all pending microtasks finish.
    syncInBackground().catch(() => {});

    return NextResponse.json({ ok: true, queued: repoFullName });
}
