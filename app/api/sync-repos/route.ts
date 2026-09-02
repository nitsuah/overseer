import { NextResponse } from 'next/server';
import logger from '@/lib/log';
import { auth } from '@/auth';
import { GitHubClient, RepoMetadata } from '@/lib/github';
import { getNeonClient, ensureSchema } from '@/lib/db';
import { DEFAULT_REPOS } from '@/lib/default-repos';
import { syncRepo, syncRepoMetadata } from '@/lib/sync';
import { filterReposForSync, SyncFilters } from '@/lib/sync-filters';

const GITHUB_API_TIMEOUT_MS = 10000;
const SYNC_DELAY_MS = 1000; // Reduced delay — rate limit check handles throttling
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_BASE_DELAY_MS = 1000;
const CONCURRENCY_LIMIT = 3; // Max parallel repo syncs
const RATE_LIMIT_THRESHOLD = 200; // Pause syncs below this remaining

export async function POST(request: Request): Promise<NextResponse> {
    try {
        // Filters come from the dashboard's current filter state so the sync
        // refreshes exactly the repos currently displayed.
        let filters: SyncFilters = {};
        try {
            const body = await request.json();
            filters = {
                filterType: body?.filterType,
                filterLanguage: body?.filterLanguage,
                filterFork: body?.filterFork,
            };
        } catch {
            // No body — sync all displayed repos (no filters applied)
        }

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

        try {
            await ensureSchema(db);
        } catch (schemaError) {
            logger.error('Sync-repos: Schema initialization failed:', schemaError);
            return NextResponse.json({ error: 'Database schema initialization failed' }, { status: 503 });
        }

        logger.info('Sync-repos: Fetching repos list...');
        // Upsert the user record inside a transaction so set_config is transaction-local
        // and the RLS policy (FORCE ROW LEVEL SECURITY on users) is satisfied.
        const txResults = await db.transaction([
            db`SELECT set_config('app.current_github_id', ${String(githubUserId)}, true)`,
            db`
                INSERT INTO users (github_id, github_username)
                VALUES (${String(githubUserId)}, ${githubUsername})
                ON CONFLICT (github_id) DO UPDATE
                    SET github_username = EXCLUDED.github_username,
                        updated_at = NOW()
                RETURNING id, last_sync_at
            `,
        ]);
        const userRow = txResults[1][0];
        const userId = userRow.id as string;

        // Always do a full refresh — the Sync button must refresh every
        // displayed repo, not just ones GitHub reports as recently updated.
        const syncStartTime = new Date().toISOString();
        const repos = await github.listRepos();
        logger.info(`Sync-repos: Found ${repos.length} repos from GitHub`);

        // Load DB state (is_hidden, is_archived, repo_type) so filtering matches
        // what the dashboard displays. repos table has an "allow all" RLS policy.
        const dbRepoRows = await db`SELECT name, is_hidden, is_archived, repo_type FROM repos` as unknown as Array<{
            name: string;
            is_hidden?: boolean;
            is_archived?: boolean;
            repo_type?: string | null;
        }>;
        const dbRepoMap = new Map<string, { name: string; is_hidden?: boolean; is_archived?: boolean; repo_type?: string | null }>(
            dbRepoRows.map((r) => [r.name, r])
        );

        const reposToSync = filterReposForSync(repos, filters, dbRepoMap);
        const totalRepos = reposToSync.length + DEFAULT_REPOS.length;
        logger.info(`Sync-repos: ${reposToSync.length}/${repos.length} repos match current filters`);

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
            const failedRepos: RepoMetadata[] = [];

            // 1. FAST METADATA SYNC (First Pass)
            // This ensures all repos appear in the dashboard immediately
            logger.info('Starting Phase 1: Fast Metadata Sync');
            for (const repo of reposToSync) {
                try {
                    await syncRepoMetadata(repo, db);
                    successCount++;
                } catch (repoError: unknown) {
                    const message = repoError instanceof Error ? repoError.message : 'Unknown error';
                    logger.warn(`Error syncing metadata for ${repo.name}:`, message);
                    errorCount++;
                    failedRepos.push(repo);
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
            const queue = [...reposToSync];
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
                        const idx = reposToSync.indexOf(repoMeta);
                        await syncDetailsWithDelay(repoMeta, github, idx === 0);
                    }
                })());
            }
            await Promise.all(workers);

            // Re-queue repos that failed in Phase 1 for a second pass — they may
            // have failed due to a transient rate limit or network blip.
            if (failedRepos.length > 0) {
                logger.info(`Re-queueing ${failedRepos.length} repos that failed metadata sync`);
                const retryQueue = [...failedRepos];
                const retryWorkers: Promise<void>[] = [];
                for (let w = 0; w < Math.min(CONCURRENCY_LIMIT, retryQueue.length); w++) {
                    retryWorkers.push((async () => {
                        while (retryQueue.length > 0) {
                            const repoMeta = retryQueue.shift()!;
                            try {
                                await syncRepoMetadata(repoMeta, db);
                                successCount++;
                                errorCount--;
                            } catch (repoError: unknown) {
                                const message = repoError instanceof Error ? repoError.message : 'Unknown error';
                                logger.warn(`Retry failed for ${repoMeta.name}:`, message);
                            }
                        }
                    })());
                }
                await Promise.all(retryWorkers);
            }

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
                        await syncDetailsWithDelay(repoMeta, systemGithub, i === 0 && reposToSync.length === 0);
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
                        await syncDetailsWithDelay(repoMeta, github, i === 0 && reposToSync.length === 0);
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

            // Update last_sync_at — needs set_config so FORCE RLS policy is satisfied
            await db.transaction([
                db`SELECT set_config('app.current_github_id', ${String(githubUserId)}, true)`,
                db`UPDATE users SET last_sync_at = ${syncStartTime} WHERE id = ${userId}`,
            ]);
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

