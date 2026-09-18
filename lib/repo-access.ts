// Per-repo authorization for the shared `repos` table.
//
// `repos` has no per-row owner: every synced repo is a single global row,
// upserted by whichever signed-in user last synced or added it (see
// lib/sync.ts). That's fine for public repos, but a private repo's data
// (tasks, roadmap, health, chat context) must not be visible to a signed-in
// user who simply knows or guesses its name (CWE-639) -- GitHub sign-in in
// this app is not restricted to a single account, so a stranger can get a
// valid session and, without this check, read anyone's previously-synced
// private repo data.
//
// The model: `repos.private_repo` mirrors GitHub's `private` flag as of the
// last sync. Public repos are visible to any signed-in user (unchanged from
// today's behavior). Private repos additionally require a `repo_access` row
// for the caller's GitHub user id, granted only by routes that just fetched
// that repo through the caller's own GitHub token (grantRepoAccess below) --
// never inferred from the repo merely existing.

/** Minimal shape of the tagged-template SQL function this module needs. */
export type RepoAccessDb = (
    strings: TemplateStringsArray,
    ...values: unknown[]
) => Promise<unknown[]>;

export interface RepoAccessCheck {
    id: string;
    private_repo?: boolean | null;
}

/**
 * Returns true if `githubUserId` may view `repo`'s data: unconditionally for
 * a public repo, or if a repo_access row confirms this user's GitHub token
 * has previously resolved this specific repo.
 */
export async function canAccessRepo(
    db: RepoAccessDb,
    repo: RepoAccessCheck,
    githubUserId: string | undefined
): Promise<boolean> {
    if (!repo.private_repo) return true;
    if (!githubUserId) return false;

    const rows = await db`
        SELECT 1 FROM repo_access WHERE repo_id = ${repo.id} AND github_user_id = ${githubUserId} LIMIT 1
    `;
    return rows.length > 0;
}

/**
 * Records that `githubUserId`'s own GitHub token has just resolved
 * `fullName` (via listRepos/getRepo, which only ever return repos that
 * token can see). Call this after a successful sync/add, never speculatively
 * -- it is the only source of truth canAccessRepo reads from. A no-op if the
 * repo row doesn't exist yet (nothing to reference) or the grant already
 * exists.
 */
export async function grantRepoAccess(
    db: RepoAccessDb,
    fullName: string,
    githubUserId: string | undefined
): Promise<void> {
    if (!githubUserId) return;

    await db`
        INSERT INTO repo_access (repo_id, github_user_id)
        SELECT id, ${githubUserId} FROM repos WHERE full_name = ${fullName}
        ON CONFLICT (repo_id, github_user_id) DO NOTHING
    `;
}
