import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createOctokitClient } from '@/lib/githubClient';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const octokit = createOctokitClient(session.accessToken);
        const { data } = await octokit.rateLimit.get();

        const graphql = data.resources?.graphql;
        if (!graphql) {
            return NextResponse.json(
                { error: 'GraphQL rate limit data unavailable' },
                { status: 502 }
            );
        }

        return NextResponse.json({
            core: {
                limit: data.resources.core.limit,
                remaining: data.resources.core.remaining,
                reset: new Date(data.resources.core.reset * 1000).toISOString(),
                used: data.resources.core.used,
            },
            graphql: {
                limit: graphql.limit,
                remaining: graphql.remaining,
                reset: new Date(graphql.reset * 1000).toISOString(),
                used: graphql.used,
            },
        });
    } catch (error: unknown) {
        console.error('Rate limit check error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
