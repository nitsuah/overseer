"use client";

import { formatLocNumber } from '@/lib/expandable-row-utils';
import { Metric } from '@/types/repo';

interface RepositoryStatsSectionProps {
  stars?: number;
  forks?: number;
  branches?: number;
  totalLoc?: number;
  locLanguageBreakdown?: Record<string, number>;
  vulnAlertCount?: number;
  vulnCriticalCount?: number;
  vulnHighCount?: number;
  contributorCount?: number;
  commitFrequency?: number;
  busFactor?: number;
  avgPrMergeTimeHours?: number;
  metrics?: Metric[];
}

export function RepositoryStatsSection({
  stars,
  forks,
  branches,
  totalLoc,
  locLanguageBreakdown,
  vulnAlertCount,
  vulnCriticalCount,
  vulnHighCount,
  contributorCount,
  commitFrequency,
  busFactor,
  avgPrMergeTimeHours,
  metrics = [],
}: RepositoryStatsSectionProps) {
  // Filter metrics that should appear in Repo Stats
  const repoStatsKeywords = [
    'last updated',
    'api routes',
    'database tables',
    'pr turnaround',
    'open prs',
    'outdated dependencies',
    'prettier violations',
    'typescript errors',
    'eslint warnings',
    'eslint errors',
    'health score',
    'lighthouse score',
    'lighthouse a11y score',
  ];

  const repoStatsMetrics = metrics.filter((m) => {
    const lowerName = m.name.toLowerCase();
    return repoStatsKeywords.some((keyword) => lowerName.includes(keyword));
  });
  return (
    <div className="bg-slate-900/50 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <span>📊</span>
        Repository Stats
      </h3>
      <div className="space-y-3">
        {/* Stars, Forks, Branches */}
        {stars !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⭐</span>
              <span className="text-slate-400">Stars</span>
            </div>
            <span className="text-slate-200 font-medium">{stars}</span>
          </div>
        )}
        {forks !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-purple-500">🍴</span>
              <span className="text-slate-400">Forks</span>
            </div>
            <span className="text-slate-200 font-medium">{forks}</span>
          </div>
        )}
        {branches !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-green-500">🌿</span>
              <span className="text-slate-400">Branches</span>
            </div>
            <span className="text-slate-200 font-medium">{branches}</span>
          </div>
        )}

        {/* Lines of Code */}
        {totalLoc !== undefined && totalLoc > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">📝</span>
              <span className="text-slate-400">Lines of Code</span>
            </div>
            <span className="text-slate-200 font-medium">{formatLocNumber(totalLoc)}</span>
          </div>
        )}

        {/* LOC Language Breakdown */}
        {locLanguageBreakdown && Object.keys(locLanguageBreakdown).length > 0 && (
          <div className="pl-7 space-y-1.5">
            {Object.entries(locLanguageBreakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([lang, loc]) => (
                <div key={lang} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{lang}</span>
                  <span className="text-slate-400">{formatLocNumber(loc)}</span>
                </div>
              ))}
          </div>
        )}

        {/* Vulnerabilities */}
        {vulnAlertCount !== undefined && vulnAlertCount > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-slate-400">Vulnerabilities</span>
            </div>
            <span
              className={`font-medium ${
                vulnCriticalCount && vulnCriticalCount > 0
                  ? 'text-red-400'
                  : vulnHighCount && vulnHighCount > 0
                  ? 'text-orange-400'
                  : 'text-yellow-400'
              }`}
            >
              {vulnAlertCount}
              {vulnCriticalCount && vulnCriticalCount > 0 && ` (${vulnCriticalCount} critical)`}
            </span>
          </div>
        )}

        {/* Contributor Metrics */}
        {contributorCount !== undefined && contributorCount > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-indigo-500">👥</span>
              <span className="text-slate-400">Contributors</span>
            </div>
            <span className="text-slate-200 font-medium">{contributorCount}</span>
          </div>
        )}
        {commitFrequency !== undefined && commitFrequency !== null && typeof commitFrequency === 'number' && commitFrequency > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-cyan-500">📈</span>
              <span className="text-slate-400">Commits/Week</span>
            </div>
            <span className="text-slate-200 font-medium">{Number(commitFrequency).toFixed(1)}</span>
          </div>
        )}
        {busFactor !== undefined && busFactor > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-pink-500">🚌</span>
              <span className="text-slate-400">Bus Factor</span>
            </div>
            <span className="text-slate-200 font-medium">{busFactor}</span>
          </div>
        )}
        {avgPrMergeTimeHours !== undefined && avgPrMergeTimeHours !== null && typeof avgPrMergeTimeHours === 'number' && avgPrMergeTimeHours > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">⏱️</span>
              <span className="text-slate-400">Avg PR Merge</span>
            </div>
            <span className="text-slate-200 font-medium">
              {avgPrMergeTimeHours < 24
                ? `${Number(avgPrMergeTimeHours).toFixed(1)}h`
                : `${(Number(avgPrMergeTimeHours) / 24).toFixed(1)}d`}
            </span>
          </div>
        )}

        {/* Additional Repo Stats Metrics from METRICS.md */}
        {repoStatsMetrics.map((metric, index) => (
          <div key={`${metric.name}-${index}`} className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{metric.name}</span>
            <span className="text-slate-200 font-medium">
              {metric.value}
              {metric.unit ?? ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
