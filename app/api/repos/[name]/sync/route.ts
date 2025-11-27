import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GitHubClient } from '@/lib/github';
import { getNeonClient } from '@/lib/db';
import { syncRepo } from '@/lib/sync';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ name: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const accessToken = (session as any).accessToken;
        if (!accessToken) {
            return NextResponse.json({ error: 'No GitHub access token found' }, { status: 401 });
        }

        const params = await props.params;
        const repoName = params.name;

        if (!repoName) {
            return NextResponse.json({ error: 'Repo name required' }, { status: 400 });
        }

        // Fetch GitHub user
        // Fetch GitHub user
        const { createOctokitClient } = await import('@/lib/githubClient');
        const octokit = createOctokitClient(accessToken);
        const { data: user } = await octokit.rest.users.getAuthenticated();
        const githubUsername = user.login;

        const github = new GitHubClient(accessToken, githubUsername);
        const db = getNeonClient();

        // Check if repo exists in database first to get full_name (owner/repo)
        const dbRepos = await db`
            SELECT name, full_name FROM repos WHERE name = ${repoName}
        `;

        let repo;
        if (dbRepos.length > 0 && dbRepos[0].full_name) {
            // Repo exists in DB - use full_name to fetch from GitHub
            const [owner, repoShortName] = dbRepos[0].full_name.split('/');
            const repoMeta = await github.getRepo(owner, repoShortName);
            repo = repoMeta;
        } else {
            // Repo not in DB - try to find in user's repos
            const repos = await github.listRepos();
            repo = repos.find(r => r.name === repoName);
        }

        if (!repo) {
            return NextResponse.json({ error: `Repository ${repoName} not found` }, { status: 404 });
        }

        // Sync the repo
        await syncRepo(repo, github, db);

        return NextResponse.json({ success: true, repo: repoName });
    } catch (error: unknown) {
        console.error('Error syncing repo:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
