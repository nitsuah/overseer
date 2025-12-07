// lib/health-score.ts

export interface HealthScoreInputs {
    docHealth: number; // 0-100 from doc-health calculation
    hasTests: boolean;
    codeCoverage?: number; // 0-100
    bestPracticesCount: number;
    bestPracticesHealthy: number;
    communityStandardsCount: number;
    communityStandardsHealthy: number;
    hasCI: boolean;
    lastCommitDays: number;
    openIssuesCount: number;
    openPRsCount: number;
}

export interface HealthScoreBreakdown {
    total: number; // 0-100
    documentation: number;
    testing: number;
    bestPractices: number;
    community: number;
    activity: number;
}

/**
 * Calculate overall repository health score (0-100)
 * 
 * Weights:
 * - Best Practices: 25%
 * - Testing: 25%
 * - Documentation: 20%
 * - Community Standards: 10%
 * - Activity: 10%
 */
export function calculateHealthScore(inputs: HealthScoreInputs): HealthScoreBreakdown {
    // Documentation Score (0-100)
    const docScore = inputs.docHealth; // Already 0-100

    // Testing Score (0-100)
    let testScore = 0;
    if (inputs.hasTests) {
        testScore = 40; // Base for having tests
        if (inputs.codeCoverage !== undefined) {
            testScore += Math.min(inputs.codeCoverage * 0.6, 60); // Up to 60 points for coverage
        }
    }

    // Best Practices Score (0-100)
    let bestPracticesScore = 0;
    if (inputs.bestPracticesCount > 0) {
        const ratio = inputs.bestPracticesHealthy / inputs.bestPracticesCount;
        bestPracticesScore = ratio * 100;
        
        // Bonus for CI/CD
        if (inputs.hasCI) {
            bestPracticesScore = Math.min(bestPracticesScore + 10, 100);
        }
    }

    // Community Standards Score (0-100)
    let communityScore = 0;
    if (inputs.communityStandardsCount > 0) {
        const ratio = inputs.communityStandardsHealthy / inputs.communityStandardsCount;
        communityScore = ratio * 100;
    }

    // Activity Score (0-100)
    let activityScore = 100;
    
    // Deduct points for staleness
    if (inputs.lastCommitDays > 90) {
        activityScore -= Math.min((inputs.lastCommitDays - 90) / 3, 40); // Up to -40 for being very stale
    }
    
    // Deduct points for many open issues
    if (inputs.openIssuesCount > 10) {
        activityScore -= Math.min((inputs.openIssuesCount - 10) * 2, 20); // Up to -20 for many issues
    }
    
    // Deduct points for stale PRs
    if (inputs.openPRsCount > 5) {
        activityScore -= Math.min((inputs.openPRsCount - 5) * 3, 20); // Up to -20 for many open PRs
    }
    
    activityScore = Math.max(activityScore, 0);

    // Weighted Total
    const total = Math.round(
        docScore * 0.20 +
        testScore * 0.25 +
        bestPracticesScore * 0.25 +
        communityScore * 0.10 +
        activityScore * 0.10
    );

    return {
        total,
        documentation: Math.round(docScore),
        testing: Math.round(testScore),
        bestPractices: Math.round(bestPracticesScore),
        community: Math.round(communityScore),
        activity: Math.round(activityScore),
    };
}

export function getHealthGrade(score: number): { grade: string; color: string } {
    if (score >= 90) return { grade: 'A', color: 'text-green-400' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-400' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-400' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-400' };
    return { grade: 'F', color: 'text-red-400' };
}
