// Pure repo signal computations — no I/O, fully testable.

export const MAINTENANCE_MODE_DAYS = 90; // No commits for 90+ days => maintenance mode

/**
 * Classify a repo's activity state from its last commit date.
 * - 'active': committed within the last 30 days
 * - 'stale': 30-90 days since last commit
 * - 'maintenance': 90+ days since last commit (dormant)
 */
export type ActivityState = 'active' | 'stale' | 'maintenance';

export function detectActivityState(lastCommitDate: string | null | undefined): ActivityState {
  if (!lastCommitDate) return 'maintenance'; // unknown => treat conservatively
  const days = Math.floor((Date.now() - new Date(lastCommitDate).getTime()) / 86400000);
  if (days <= 30) return 'active';
  if (days <= MAINTENANCE_MODE_DAYS) return 'stale';
  return 'maintenance';
}

export interface VelocityInputs {
  commitFrequency?: number | null; // commits per week (approx)
  avgPrMergeTimeHours?: number | null;
  openPRsCount?: number;
}

/**
 * Compute a 0-100 velocity score from commit frequency and PR merge time.
 * Higher is faster/more active. Returns null when no signal is available.
 */
export function calculateVelocityScore(inputs: VelocityInputs): number | null {
  const { commitFrequency, avgPrMergeTimeHours } = inputs;
  if (commitFrequency == null && avgPrMergeTimeHours == null) return null;

  let score = 50; // neutral baseline

  // Commit frequency: 0-10+ commits/week maps to 0-40 points
  if (commitFrequency != null) {
    score += Math.max(0, Math.min(commitFrequency, 10)) * 4;
  }

  // PR merge time: faster merges add points, slow merges subtract
  if (avgPrMergeTimeHours != null) {
    if (avgPrMergeTimeHours <= 24) score += 10;
    else if (avgPrMergeTimeHours <= 72) score += 5;
    else if (avgPrMergeTimeHours <= 168) score += 0;
    else score -= 10;
  }

  return Math.max(0, Math.min(score, 100));
}