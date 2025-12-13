import { NextResponse } from 'next/server';
import logger from '@/lib/log';
import { auth } from '@/auth';
import { GitHubClient } from '@/lib/github';
import { getNeonClient } from '@/lib/db';
import { DEFAULT_REPOS } from '@/lib/default-repos';
import { syncRepo } from '@/lib/sync';

export async function POST() {
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

        // Fetch the authenticated user's GitHub username
        // Fetch the authenticated user's GitHub username
        const { createOctokitClient } = await import('@/lib/githubClient');
        const octokit = createOctokitClient(accessToken);
        const { data: user } = await octokit.rest.users.getAuthenticated();
        const githubUsername = user.login;

        const github = new GitHubClient(accessToken, githubUsername);
        const db = getNeonClient();

        const repos = await github.listRepos();
        const totalRepos = repos.length + DEFAULT_REPOS.length;

        // Start background sync without awaiting to avoid timeout
         
        (async () => {
            let successCount = 0;
            let errorCount = 0;

            // Sync user repos using the centralized syncRepo function
            for (const repo of repos) {
                try {
                    await syncRepo(repo, github, db);
                    successCount++;
                } catch (repoError: unknown) {
                    const message = repoError instanceof Error ? repoError.message : 'Unknown error';
                    logger.warn(`Error syncing repo ${repo.name}:`, message);
                    errorCount++;
                    // Continue with next repo instead of failing entire sync
                    continue;
                }
            }

            // Always sync default repos (using system token from environment)
            const systemToken = process.env.GITHUB_TOKEN;
            const systemUsername = process.env.GITHUB_SYSTEM_USERNAME || 'nitsuah';
            if (systemToken) {
                const systemGithub = new GitHubClient(systemToken, systemUsername);
                for (const defaultRepo of DEFAULT_REPOS) {
                    try {
                        logger.info(`Syncing default repo: ${defaultRepo.fullName}`);
                        const repoMeta = await systemGithub.getRepo(defaultRepo.owner, defaultRepo.name);
                        await syncRepo(repoMeta, systemGithub, db);
                        successCount++;
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        logger.warn(`Failed to sync default repo ${defaultRepo.fullName}:`, errorMessage);
                        errorCount++;
                    }
                }
            } else {
                // If no system token, try to sync using user's token (may fail for repos they don't own)
                logger.info('No GITHUB_TOKEN found - attempting to sync default repos with user token');
                for (const defaultRepo of DEFAULT_REPOS) {
                    try {
                        const repoMeta = await github.getRepo(defaultRepo.owner, defaultRepo.name);
                        await syncRepo(repoMeta, github, db);
                        successCount++;
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        logger.info(`Could not sync default repo ${defaultRepo.fullName} with user token:`, errorMessage);
                        // Don't count as error since this is expected for public repos
                    }
                }
            }

            logger.info(`Background sync completed: ${successCount}/${successCount + errorCount} repos synced successfully`);
        })();

        // Return immediately to avoid timeout
        return NextResponse.json({
            success: true,
            message: 'Sync started in background',
            totalRepos
        });
    } catch (error: unknown) {
    logger.warn('Sync error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

