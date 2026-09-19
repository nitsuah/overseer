import { NextResponse } from 'next/server';
import { getNeonClient, ensureSchema } from '@/lib/db';
import { canAccessRepo, type RepoAccessCheck } from '@/lib/repo-access';

interface SessionLike {
    userId?: string;
}

/**
 * One-line authorization for the /api/repos/[name]/* routes: returns a 404
 * response if the signed-in caller may not see the repo named `repoName`,
 * or null to let the route continue.
 *
 * 404 (not 403) so a private repo's existence isn't confirmed to a caller who
 * can't see it. If no repo has that name this also returns null -- each route
 * already has its own "not found" handling, and there is nothing to protect.
 *
 * `name` is not unique across owners, so a caller must have access to EVERY
 * repo carrying that short name; the routes below act on whichever row a
 * `WHERE name = ...` happens to hit (or update all of them), so checking only
 * one would leave a gap.
 */
export async function denyIfNoRepoAccess(
    repoName: string,
    session: SessionLike | null
): Promise<NextResponse | null> {
    const db = getNeonClient();
    await ensureSchema(db);

    const rows = (await db`
        SELECT id, full_name, private_repo, visibility_verified FROM repos WHERE name = ${repoName}
    `) as unknown as RepoAccessCheck[];

    for (const repo of rows) {
        if (!(await canAccessRepo(db, repo, session?.userId))) {
            return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
        }
    }
    return null;
}
