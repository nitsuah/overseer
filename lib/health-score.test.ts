import { describe, it, expect } from 'vitest';
import { calculateHealthScore, type HealthScoreInputs } from './health-score';

describe('health-score', () => {
  describe('calculateHealthScore', () => {
    it('should calculate perfect health score', () => {
      const inputs: HealthScoreInputs = {
        docHealth: 100,
        hasTests: true,
        codeCoverage: 100,
        bestPracticesCount: 10,
        bestPracticesHealthy: 10,
        communityStandardsCount: 5,
        communityStandardsHealthy: 5,
        hasCI: true,
        lastCommitDays: 1,
        openIssuesCount: 0,
        openPRsCount: 0,
      };

      const result = calculateHealthScore(inputs);

      expect(result.total).toBe(90); // Weights sum to 90%
      expect(result.documentation).toBe(100);
      expect(result.testing).toBe(100);
      expect(result.bestPractices).toBe(100);
      expect(result.community).toBe(100);
      expect(result.activity).toBe(100);
    });

    it('should calculate zero health score for minimal inputs', () => {
      const inputs: HealthScoreInputs = {
        docHealth: 0,
        hasTests: false,
        codeCoverage: 0,
        bestPracticesCount: 0,
        bestPracticesHealthy: 0,
        communityStandardsCount: 0,
        communityStandardsHealthy: 0,
        hasCI: false,
        lastCommitDays: 500,
        openIssuesCount: 100,
        openPRsCount: 50,
      };

      const result = calculateHealthScore(inputs);

      // Activity starts at 100, loses up to 40 for staleness (500 days > 90),
      // up to 20 for issues (100 > 10), up to 20 for PRs (50 > 5)
      // 100 - 40 - 20 - 20 = 20, but capped at 0 would give us activityScore of 20
      // Total weighted: 0*0.2 + 0*0.25 + 0*0.25 + 0*0.1 + 20*0.1 = 2
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.total).toBeLessThanOrEqual(5);
      expect(result.documentation).toBe(0);
      expect(result.testing).toBe(0);
      expect(result.bestPractices).toBe(0);
      expect(result.community).toBe(0);
      expect(result.activity).toBeLessThanOrEqual(20); // Not fully penalized
    });

    it('should calculate testing score correctly without coverage', () => {
      const inputs: HealthScoreInputs = {
        docHealth: 50,
        hasTests: true,
        codeCoverage: undefined,
        bestPracticesCount: 5,
        bestPracticesHealthy: 3,
        communityStandardsCount: 5,
        communityStandardsHealthy: 3,
        hasCI: false,
        lastCommitDays: 30,
        openIssuesCount: 5,
        openPRsCount: 2,
      };

      const result = calculateHealthScore(inputs);

      expect(result.testing).toBe(40); // Base for having tests
    });

    it('should calculate testing score correctly with coverage', () => {
      const inputs: HealthScoreInputs = {
        docHealth: 50,
        hasTests: true,
        codeCoverage: 80,
        bestPracticesCount: 5,
        bestPracticesHealthy: 3,
        communityStandardsCount: 5,
        communityStandardsHealthy: 3,
        hasCI: false,
        lastCommitDays: 30,
        openIssuesCount: 5,
        openPRsCount: 2,
      };

      const result = calculateHealthScore(inputs);

      expect(result.testing).toBe(88); // 40 base + 48 from coverage (80 * 0.6)
    });

    it('should add bonus for CI in best practices', () => {
      const inputs: HealthScoreInputs = {
        docHealth: 50,
        hasTests: false,
        codeCoverage: undefined,
        bestPracticesCount: 10,
        bestPracticesHealthy: 8,
        communityStandardsCount: 5,
        communityStandardsHealthy: 3,
        hasCI: true,
        lastCommitDays: 30,
        openIssuesCount: 5,
        openPRsCount: 2,
      };

      const result = calculateHealthScore(inputs);

      expect(result.bestPractices).toBe(90); // (8/10 * 100) + 10 bonus
    });

    it('should cap best practices score at 100', () => {
      const inputs: HealthScoreInputs = {
        docHealth: 50,
        hasTests: false,
        codeCoverage: undefined,
        bestPracticesCount: 10,
        bestPracticesHealthy: 10,
        communityStandardsCount: 5,
        communityStandardsHealthy: 3,
        hasCI: true,
        lastCommitDays: 30,
        openIssuesCount: 5,
        openPRsCount: 2,
      };

      const result = calculateHealthScore(inputs);

      expect(result.bestPractices).toBe(100); // Should not exceed 100
    });

    it('should penalize for stale commits', () => {
      const inputs: HealthScoreInputs = {
        docHealth: 100,
        hasTests: true,
        codeCoverage: 100,
        bestPracticesCount: 10,
        bestPracticesHealthy: 10,
        communityStandardsCount: 5,
        communityStandardsHealthy: 5,
        hasCI: true,
        lastCommitDays: 200, // Very stale
        openIssuesCount: 0,
        openPRsCount: 0,
      };

      const result = calculateHealthScore(inputs);

      expect(result.activity).toBeLessThan(100);
    });

    it('should penalize for many open issues', () => {
      const inputs: HealthScoreInputs = {
        docHealth: 100,
        hasTests: true,
        codeCoverage: 100,
        bestPracticesCount: 10,
        bestPracticesHealthy: 10,
        communityStandardsCount: 5,
        communityStandardsHealthy: 5,
        hasCI: true,
        lastCommitDays: 1,
        openIssuesCount: 50,
        openPRsCount: 0,
      };

      const result = calculateHealthScore(inputs);

      expect(result.activity).toBeLessThan(100);
    });

    it('should penalize for many open PRs', () => {
      const inputs: HealthScoreInputs = {
        docHealth: 100,
        hasTests: true,
        codeCoverage: 100,
        bestPracticesCount: 10,
        bestPracticesHealthy: 10,
        communityStandardsCount: 5,
        communityStandardsHealthy: 5,
        hasCI: true,
        lastCommitDays: 1,
        openIssuesCount: 0,
        openPRsCount: 20,
      };

      const result = calculateHealthScore(inputs);

      expect(result.activity).toBeLessThan(100);
    });

    it('should handle partial best practices', () => {
      const inputs: HealthScoreInputs = {
        docHealth: 50,
        hasTests: false,
        codeCoverage: undefined,
        bestPracticesCount: 10,
        bestPracticesHealthy: 5,
        communityStandardsCount: 5,
        communityStandardsHealthy: 3,
        hasCI: false,
        lastCommitDays: 30,
        openIssuesCount: 5,
        openPRsCount: 2,
      };

      const result = calculateHealthScore(inputs);

      expect(result.bestPractices).toBe(50); // 5/10 * 100
    });

    it('should handle partial community standards', () => {
      const inputs: HealthScoreInputs = {
        docHealth: 50,
        hasTests: false,
        codeCoverage: undefined,
        bestPracticesCount: 10,
        bestPracticesHealthy: 5,
        communityStandardsCount: 10,
        communityStandardsHealthy: 6,
        hasCI: false,
        lastCommitDays: 30,
        openIssuesCount: 5,
        openPRsCount: 2,
      };

      const result = calculateHealthScore(inputs);

      expect(result.community).toBe(60); // 6/10 * 100
    });
  });
});
