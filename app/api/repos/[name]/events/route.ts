import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getNeonClient } from '@/lib/db';
import logger from '@/lib/log';
import { createOctokitClient } from '@/lib/githubClient';

export async function GET(
    _req: NextRequest,
    props: { params: Promise<{ name: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const accessToken = session.accessToken;
        if (!accessToken) {
            return NextResponse.json({ error: 'No GitHub access token' }, { status: 401 });
        }

        const params = await props.params;
        const repoName = params.name;

        const db = getNeonClient();
        const rows = await db`SELECT full_name, last_synced FROM repos WHERE name = ${repoName} LIMIT 1`;
        if (rows.length === 0) {
            return NextResponse.json({ hasNewEvents: false });
        }

        const { full_name, last_synced } = rows[0];
        const [owner, repo] = (full_name as string).split('/');

        const octokit = createOctokitClient(accessToken);

        // Fetch only the single most-recent event — cheap conditional GET via ETag
        const { data: events } = await octokit.activity.listRepoEvents({
            owner,
            repo,
            per_page: 1,
        });

        if (events.length === 0) {
            return NextResponse.json({ hasNewEvents: false });
        }

        const latestEventAt = events[0].created_at;
        const hasNewEvents = !last_synced || new Date(latestEventAt!) > new Date(last_synced as string);

        return NextResponse.json({ hasNewEvents, latestEventAt });
    } catch (error) {
        logger.warn('[events] Failed to check repo events:', error);
        return NextResponse.json({ error: 'Failed to check events' }, { status: 503 });
    }
}
