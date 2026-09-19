import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getNeonClient, ensureSchema } from '@/lib/db';
import { DEFAULT_REPOS } from '@/lib/default-repos';
import { canAccessRepo, type RepoAccessCheck } from '@/lib/repo-access';
import { normalizeSnapshotRow } from '@/lib/numeric';

export const runtime = 'nodejs';

/**
 * GET /api/repo-details/[name]/trend
 * Returns time-series snapshots for a repo so velocity and tech-debt can be
 * trended over rolling quarters.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse> {
  const { name } = await params;
  if (!name) {
    return NextResponse.json({ error: 'Repo name required' }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user) {
    const defaultRepoNames = DEFAULT_REPOS.map((r) => r.name);
    if (!defaultRepoNames.includes(name)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const db = getNeonClient();
    await ensureSchema(db);

    // Look up the repo first (rather than joining by name below) so access
    // can be checked before any snapshot data is returned. Signed in is not
    // itself proof of access to *this* repo (CWE-639): `repos` has no
    // per-row owner. 404 (not 403) so a private repo's existence isn't
    // confirmed to a caller who can't see it.
    const [repo] = await db`
      SELECT id, full_name, private_repo, visibility_verified FROM repos WHERE name = ${name} LIMIT 1
    ` as unknown as RepoAccessCheck[];
    if (!repo) {
      return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
    }
    if (session?.user && !(await canAccessRepo(db, repo, session.userId))) {
      return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
    }

    // Fetch the most recent 200 snapshots (DESC + LIMIT), then reverse to
    // chronological order for the chart. The previous ASC + LIMIT 200 always
    // returned the *oldest* 200 rows once a repo passed 200 snapshots, so the
    // sparkline silently stopped picking up new data.
    const rows = await db`
      SELECT commit_frequency, avg_pr_merge_time_hours, health_score,
             open_prs, total_loc, captured_at
      FROM repo_snapshots
      WHERE repo_id = ${repo.id}
      ORDER BY captured_at DESC
      LIMIT 200
    `;
    return NextResponse.json({ success: true, snapshots: rows.reverse().map(normalizeSnapshotRow) }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}