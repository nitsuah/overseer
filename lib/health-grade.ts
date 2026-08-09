// Shared health-grade helpers — used by /api/mcp and /api/context routes.
// Centralises the grade thresholds so a change in one place stays consistent.

export interface HealthRow {
  health_score?: number | null;
  ci_status?: string | null;
}

export function healthGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function buildGradeDist(rows: HealthRow[]): Record<string, number> {
  const d: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  rows.forEach(r => { d[healthGrade(r.health_score ?? 0)]++; });
  return d;
}

export function buildCiDist(rows: HealthRow[]): { passing: number; failing: number; unknown: number } {
  const d = { passing: 0, failing: 0, unknown: 0 };
  rows.forEach(r => {
    if (r.ci_status === 'passing')                       d.passing++;
    else if (r.ci_status && r.ci_status !== 'unknown')   d.failing++;
    else                                                  d.unknown++;
  });
  return d;
}
