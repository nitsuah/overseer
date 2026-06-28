import { NextResponse } from 'next/server';
import logger from '@/lib/log';
import { auth } from '@/auth';
import { GitHubClient, RepoMetadata } from '@/lib/github';
import { getNeonClient } from '@/lib/db';
import { DEFAULT_REPOS } from '@/lib/default-repos';
import { syncRepo, syncRepoMetadata } from '@/lib/sync';

const GITHUB_API_TIMEOUT_MS = 10000;
const SYNC_DELAY_MS = 1000; // Reduced delay — rate limit check handles throttling
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_BASE_DELAY_MS = 1000;
const CONCURRENCY_LIMIT = 3; // Max parallel repo syncs
const RATE_LIMIT_THRESHOLD = 200; // Pause syncs below this remaining

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
        let githubUserId: number;
        try {
            const userPromise = octokit.rest.users.getAuthenticated();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('GitHub API timeout')), GITHUB_API_TIMEOUT_MS)
            );
            const { data: user } = await Promise.race([userPromise, timeoutPromise]) as Awaited<ReturnType<typeof octokit.rest.users.getAuthenticated>>;
            githubUsername = user.login;
            githubUserId = user.id;
            logger.info('Sync-repos: Got GitHub user');
        } catch (error) {
            logger.error('Sync-repos: Failed to get GitHub user:', error);
            return NextResponse.json({ error: 'Failed to authenticate with GitHub' }, { status: 401 });
        }

        const github = new GitHubClient(accessToken, githubUsername);
        const db = getNeonClient();

        logger.info('Sync-repos: Fetching repos list...');
        // Get user record or create if not exists (use numeric github_id for stable PK)
        const userRecord = await db`SELECT * FROM users WHERE github_id = ${githubUserId}`;

        let userId: string;
        if (userRecord.length === 0) {
            const newUser = await db`INSERT INTO users (github_id, github_username) VALUES (${String(githubUserId)}, ${githubUsername}) RETURNING id`;
            userId = newUser[0].id;
        } else {
            userId = userRecord[0].id;
            // Keep username fresh (user may have changed their handle)
            if (userRecord[0].github_username !== githubUsername) {
                await db`UPDATE users SET github_username = ${githubUsername} WHERE id = ${userId}`;
            }
        }

        // Check if we should do a full sync or delta sync
        const lastSyncAt = userRecord[0]?.last_sync_at;
        const shouldDoFullSync = !lastSyncAt || (new Date().getTime() - new Date(lastSyncAt).getTime()) > 24 * 60 * 60 * 1000; // 24 hours

        logger.info(`Sync-repos: Starting sync for ${githubUsername}`, {
            lastSyncAt,
            shouldDoFullSync,
            userId
        });

        // Get repos with since parameter for delta sync
        // GitHub's 'since' is an ISO 8601 timestamp; our last_sync_at is stored as timestamptz
        const sinceIso = lastSyncAt
            ? (typeof lastSyncAt === 'string' ? lastSyncAt : new Date(lastSyncAt).toISOString())
            : undefined;

        const syncStartTime = new Date().toISOString();
        const repos = shouldDoFullSync || !sinceIso
            ? await github.listRepos()
            : await github.listRepos(sinceIso);
        const totalRepos = repos.length + DEFAULT_REPOS.length;
        logger.info(`Sync-repos: Found ${totalRepos} repos to sync`);

        // Check rate limits before starting background sync
        try {
            const rateLimit = await github.getRateLimit();
            if (rateLimit.remaining < RATE_LIMIT_THRESHOLD) {
                logger.warn(`Sync-repos: Rate limit low (${rateLimit.remaining})`);
                return NextResponse.json({ error: 'Rate limit low' }, { status: 429 });
            }
        } catch (e) {
            logger.warn('Sync-repos: Failed to check rate limits, proceeding anyway');
        }

        // Start background sync without awaiting to avoid timeout
        (async () => {
            // Check rate limits periodically during sync
            const checkRateLimit = async () => {
                try {
                    const rl = await github.getRateLimit();
                    return rl.remaining;
                } catch {
                    return Infinity; // Proceed if we can't check
                }
            };


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
            const syncDetailsWithDelay = async (repoMeta: RepoMetadata, client: GitHubClient, isFirstRepo: boolean) => {
                let lastError: Error | null = null;
                for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
                    try {
                        await syncRepo(repoMeta, client, db);
                        logger.info(`✓ Detailed sync completed for ${repoMeta.name}${attempt > 0 ? ` (attempt ${attempt + 1})` : ''}`);
                        
                        // Delay after successful sync (except for first repo)
                        if (!isFirstRepo) {
                            await new Promise(resolve => setTimeout(resolve, SYNC_DELAY_MS));
                        }
                        return; // Success, exit the retry loop
                    } catch (error) {
                        lastError = error instanceof Error ? error : new Error('Unknown error');

                        const errorWithStatus = error as { status?: number; response?: { status?: number } };
                        const status = errorWithStatus?.status ?? errorWithStatus?.response?.status;
                        const isRateLimit = status === 403 || status === 429 ||
                            lastError.message.includes('rate limit') ||
                            lastError.message.includes('secondary rate limit');
                        const isServerError = status !== undefined && status >= 500;
                        const isNetworkError = lastError.message.includes('ETIMEDOUT') ||
                            lastError.message.includes('ECONNRESET') ||
                            lastError.message.includes('network');

                        if ((isRateLimit || isServerError || isNetworkError) && attempt < MAX_RETRY_ATTEMPTS - 1) {
                            // Exponential backoff with jitter: 1s, 2s, 4s, 8s, 16s + random 0-1s
                            const backoffDelay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;
                            const reason = isRateLimit ? 'rate limit' : isServerError ? 'server error' : 'network error';
                            logger.warn(`${reason} for ${repoMeta.name} (${status || '?'}), retrying in ${Math.round(backoffDelay)}ms (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS})`);
                            await new Promise(resolve => setTimeout(resolve, backoffDelay));
                        } else if (attempt === MAX_RETRY_ATTEMPTS - 1) {
                            logger.warn(`Failed detailed sync for ${repoMeta.name} after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError.message}`);
                        }
                    }
                }
            };

            // Sync user repos details with concurrency control
            const queue = [...repos];
            const workers: Promise<void>[] = [];
            for (let w = 0; w < Math.min(CONCURRENCY_LIMIT, queue.length); w++) {
                workers.push((async () => {
                    while (queue.length > 0) {
                        const repoMeta = queue.shift()!;
                        // Check rate limit before each repo
                        const remaining = await checkRateLimit();
                        if (remaining < RATE_LIMIT_THRESHOLD) {
                            logger.warn(`Sync pausing: rate limit low (${remaining})`);
                            // Wait until reset
                            const rl = await github.getRateLimit();
                            const waitMs = Math.max(0, rl.reset * 1000 - Date.now()) + 1000;
                            logger.info(`Waiting ${Math.round(waitMs / 1000)}s for rate limit reset`);
                            await new Promise(r => setTimeout(r, waitMs));
                        }
                        const idx = repos.indexOf(repoMeta);
                        await syncDetailsWithDelay(repoMeta, github, idx === 0);
                    }
                })());
            }
            await Promise.all(workers);

            // Always sync default repos (using system token from environment)
            const systemToken = process.env.GITHUB_TOKEN;
            const systemUsername = process.env.GITHUB_SYSTEM_USERNAME || 'nitsuah';
            if (systemToken) {
                const systemGithub = new GitHubClient(systemToken, systemUsername);
                for (let i = 0; i < DEFAULT_REPOS.length; i++) {
                    const defaultRepo = DEFAULT_REPOS[i];
                    try {
                        logger.info(`Syncing default repo metadata: ${defaultRepo.fullName}`);
                        const repoMeta = await systemGithub.getRepo(defaultRepo.owner, defaultRepo.name);
                        // Metadata first
                        await syncRepoMetadata(repoMeta, db);
                        // Then details
                        await syncDetailsWithDelay(repoMeta, systemGithub, i === 0 && repos.length === 0);
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
                for (let i = 0; i < DEFAULT_REPOS.length; i++) {
                    const defaultRepo = DEFAULT_REPOS[i];
                    try {
                        const repoMeta = await github.getRepo(defaultRepo.owner, defaultRepo.name);
                        // Metadata first
                        await syncRepoMetadata(repoMeta, db);
                        // Then details
                        await syncDetailsWithDelay(repoMeta, github, i === 0 && repos.length === 0);
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

            // Update last_sync_at timestamp
            await db`UPDATE users SET last_sync_at = ${syncStartTime} WHERE id = ${userId}`;
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

