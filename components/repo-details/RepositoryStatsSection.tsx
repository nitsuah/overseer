"use client";

import { formatLocNumber } from '@/lib/expandable-row-utils';
import { Metric } from '@/types/repo';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

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
  onSyncSingleRepo?: () => void;
  isSyncing?: boolean;
  isAuthenticated?: boolean;
  hasNoData?: boolean;
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
  onSyncSingleRepo,
  isSyncing = false,
  isAuthenticated = false,
  hasNoData = false,
}: RepositoryStatsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
    <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div
        className="w-full px-4 py-3 hover:bg-slate-700/40 transition-colors border-b border-slate-700/30 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={() => setIsExpanded(!isExpanded)}>
            <span>📊</span>
            <h3 className="text-sm font-semibold text-slate-200">Repository Stats</h3>
            <span className="text-slate-500 text-xs ml-2">{isExpanded ? '▼' : '▶'}</span>
          </div>
          <div className="flex items-center gap-2">
            {onSyncSingleRepo && (hasNoData || isAuthenticated) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSyncSingleRepo();
                }}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded transition-colors disabled:opacity-50 text-xs"
                title="Refresh repository data"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Refresh'}
              </button>
            )}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 py-3">
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
      )}
    </div>
  );
}
