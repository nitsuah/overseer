import { NextRequest, NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db';
import { auth } from '@/auth';
import { DEFAULT_REPOS } from '@/lib/default-repos';
import logger from '@/lib/log';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ name: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth();
        const repoName = params.name;

        if (!repoName) {
            return NextResponse.json({ error: 'Repo name required' }, { status: 400 });
        }

        const db = getNeonClient();

        // Round trip 1: get the repo row so we can auth-check and get repo.id.
        const repoRows = await db`SELECT * FROM repos WHERE name = ${repoName} LIMIT 1`;

        if (repoRows.length === 0) {
            return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
        }

        const repo = repoRows[0];

        // If not authenticated, only allow access to default repos
        if (!session) {
            const defaultRepoNames = DEFAULT_REPOS.map(r => r.name);
            if (!defaultRepoNames.includes(repo.name)) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        // Round trip 2: fetch all seven detail tables in a single HTTP transaction
        // so the dashboard panel resolves in one round trip instead of seven.
        const [
            tasks,
            roadmapItems,
            metricsRows,
            features,
            docStatuses,
            bestPractices,
            communityStandards,
        ] = await db.transaction([
            db`SELECT * FROM tasks WHERE repo_id = ${repo.id} ORDER BY created_at DESC`,
            db`SELECT * FROM roadmap_items WHERE repo_id = ${repo.id} ORDER BY created_at DESC`,
            db`SELECT * FROM metrics WHERE repo_id = ${repo.id} ORDER BY timestamp DESC`,
            db`SELECT * FROM features WHERE repo_id = ${repo.id} ORDER BY created_at ASC`,
            db`SELECT * FROM doc_status WHERE repo_id = ${repo.id}`,
            db`SELECT * FROM best_practices WHERE repo_id = ${repo.id}`,
            db`SELECT * FROM community_standards WHERE repo_id = ${repo.id}`,
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const metrics = metricsRows.map((m: any) => ({
            name: m.metric_name,
            value: m.value,
            unit: m.unit
        }));

        // Build security config from repo fields
        let securityConfig = null;
        if (repo.has_security_policy !== undefined) {
            securityConfig = {
                hasSecurityPolicy: repo.has_security_policy || false,
                hasSecurityAdvisories: repo.has_security_advisories || false,
                privateVulnerabilityReportingEnabled: repo.private_vuln_reporting_enabled || false,
                dependabotAlertsEnabled: repo.dependabot_alerts_enabled || false,
                dependabotAlertCount: repo.dependabot_alert_count || 0,
                codeScanningEnabled: repo.code_scanning_enabled || false,
                codeScanningAlertCount: repo.code_scanning_alert_count || 0,
                secretScanningEnabled: repo.secret_scanning_enabled || false,
                secretScanningAlertCount: repo.secret_scanning_alert_count || 0,
            };
        }

        return NextResponse.json({
            repo,
            tasks,
            roadmapItems,
            metrics,
            features,
            docStatuses,
            bestPractices,
            communityStandards,
            securityConfig
        });
    } catch (error: unknown) {
        logger.warn('Error fetching repo details:', error);
        return NextResponse.json({ error: 'Failed to fetch repo details' }, { status: 500 });
    }
}
