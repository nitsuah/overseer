import { NextResponse } from 'next/server';
import logger from '@/lib/log';
import { auth } from '@/auth';
import { GitHubClient, RepoMetadata } from '@/lib/github';
import { getNeonClient } from '@/lib/db';
import { DEFAULT_REPOS } from '@/lib/default-repos';
import { syncRepo, syncRepoMetadata } from '@/lib/sync';

const GITHUB_API_TIMEOUT_MS = 10000;
const SYNC_DELAY_MS = 2000; // Delay between repo syncs to reduce rate limit pressure
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1000; // Base delay for exponential backoff

export async function POST() {
    try {
        const session = await auth();
        logger.info('Sync-repos: Auth check', { hasSession: !!session, hasUser: !!session?.user });

        if (!session?.user) {
            logger.warn('Sync-repos: No user in session');
            return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const accessToken = (session as any).accessToken;
        logger.info('Sync-repos: Token check', { hasToken: !!accessToken });
        if (!accessToken) {
            logger.warn('Sync-repos: No access token found');
            return NextResponse.json({ error: 'No GitHub access token found - Please sign out and sign in again' }, { status: 401 });
        }

        logger.info('Sync-repos: Fetching GitHub user...');
        // Fetch the authenticated user's GitHub username with timeout
        const { createOctokitClient } = await import('@/lib/githubClient');
        const octokit = createOctokitClient(accessToken);

        let githubUsername: string;
        try {
            const userPromise = octokit.rest.users.getAuthenticated();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('GitHub API timeout')), GITHUB_API_TIMEOUT_MS)
            );
            const { data: user } = await Promise.race([userPromise, timeoutPromise]) as Awaited<ReturnType<typeof octokit.rest.users.getAuthenticated>>;
            githubUsername = user.login;
            logger.info('Sync-repos: Got GitHub user:', githubUsername);
        } catch (error) {
            logger.error('Sync-repos: Failed to get GitHub user:', error);
            return NextResponse.json({ error: 'Failed to authenticate with GitHub' }, { status: 401 });
        }

        const github = new GitHubClient(accessToken, githubUsername);
        const db = getNeonClient();

        logger.info('Sync-repos: Fetching repos list...');
        const repos = await github.listRepos();
        const totalRepos = repos.length + DEFAULT_REPOS.length;
        logger.info(`Sync-repos: Found ${totalRepos} repos to sync`);

        // Start background sync without awaiting to avoid timeout
        (async () => {
            let successCount = 0;
            let errorCount = 0;

            // 1. FAST METADATA SYNC (First Pass)
            // This ensures all repos appear in the dashboard immediately
            logger.info('Starting Phase 1: Fast Metadata Sync');
            for (const repo of repos) {
                try {
                    await syncRepoMetadata(repo, db);
                    successCount++;
                } catch (repoError: unknown) {
                    const message = repoError instanceof Error ? repoError.message : 'Unknown error';
                    logger.warn(`Error syncing metadata for ${repo.name}:`, message);
                    errorCount++;
                }
            }

            // 2. DETAILED HEALTH SYNC (Second Pass - Background)
            // This fills in the health scores, issues, PRs, etc. slowly to avoid rate limits
            logger.info('Starting Phase 2: Detailed Health Sync (Background)');

            // Helper to sync details with delay and exponential backoff retry
            const syncDetailsWithDelay = async (repoMeta: RepoMetadata, client: GitHubClient) => {
                // Delay between repos to be gentle on rate limits
                await new Promise(resolve => setTimeout(resolve, SYNC_DELAY_MS));
                
                let lastError: Error | null = null;
                for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
                    try {
                        await syncRepo(repoMeta, client, db);
                        logger.info(`✓ Detailed sync completed for ${repoMeta.name}${attempt > 0 ? ` (attempt ${attempt + 1})` : ''}`);
                        return; // Success, exit the retry loop
                    } catch (error) {
                        lastError = error instanceof Error ? error : new Error('Unknown error');
                        const isRateLimit = lastError.message.includes('rate limit') || lastError.message.includes('secondary rate limit');
                        
                        if (isRateLimit && attempt < MAX_RETRY_ATTEMPTS - 1) {
                            // Exponential backoff: 1s, 2s, 4s
                            const backoffDelay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
                            logger.warn(`Rate limit hit for ${repoMeta.name}, retrying in ${backoffDelay}ms (attempt ${attempt + 1} of ${MAX_RETRY_ATTEMPTS})`);
                            await new Promise(resolve => setTimeout(resolve, backoffDelay));
                        } else if (attempt === MAX_RETRY_ATTEMPTS - 1) {
                            logger.warn(`Failed detailed sync for ${repoMeta.name} after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError.message}`);
                        }
                    }
                }
            };

            // Sync user repos details
            for (const repo of repos) {
                await syncDetailsWithDelay(repo, github);
            }

            // Always sync default repos (using system token from environment)
            const systemToken = process.env.GITHUB_TOKEN;
            const systemUsername = process.env.GITHUB_SYSTEM_USERNAME || 'nitsuah';
            if (systemToken) {
                const systemGithub = new GitHubClient(systemToken, systemUsername);
                for (const defaultRepo of DEFAULT_REPOS) {
                    try {
                        logger.info(`Syncing default repo metadata: ${defaultRepo.fullName}`);
                        const repoMeta = await systemGithub.getRepo(defaultRepo.owner, defaultRepo.name);
                        // Metadata first
                        await syncRepoMetadata(repoMeta, db);
                        // Then details
                        await syncDetailsWithDelay(repoMeta, systemGithub);
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
                        // Metadata first
                        await syncRepoMetadata(repoMeta, db);
                        // Then details
                        await syncDetailsWithDelay(repoMeta, github);
                        successCount++;
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        logger.info(`Could not sync default repo ${defaultRepo.fullName} with user token:`, errorMessage);
                        // Don't count as error since this is expected for public repos
                    }
                }
            }

            const totalProcessed = successCount + errorCount;
            logger.info(`Background sync process completed: ${successCount}/${totalProcessed} repos processed`);
        })().catch(error => logger.error('Background sync failed:', error));

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

