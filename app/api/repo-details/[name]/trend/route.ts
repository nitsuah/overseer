import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getNeonClient } from '@/lib/db';
import { DEFAULT_REPOS } from '@/lib/default-repos';

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
    // Fetch the most recent 200 snapshots (DESC + LIMIT), then reverse to
    // chronological order for the chart. The previous ASC + LIMIT 200 always
    // returned the *oldest* 200 rows once a repo passed 200 snapshots, so the
    // sparkline silently stopped picking up new data.
    const rows = await db`
      SELECT s.commit_frequency, s.avg_pr_merge_time_hours, s.health_score,
             s.open_prs, s.total_loc, s.captured_at
      FROM repo_snapshots s
      JOIN repos r ON r.id = s.repo_id
      WHERE r.name = ${name}
      ORDER BY s.captured_at DESC
      LIMIT 200
    `;
    return NextResponse.json({ success: true, snapshots: rows.reverse() }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}