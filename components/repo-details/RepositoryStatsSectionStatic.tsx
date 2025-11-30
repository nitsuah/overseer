"use client";

import { formatLocNumber } from '@/lib/expandable-row-utils';
import { Metric } from '@/types/repo';
import { RefreshCw } from 'lucide-react';

interface RepositoryStatsSectionStaticProps {
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

export function RepositoryStatsSectionStatic({
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
}: RepositoryStatsSectionStaticProps) {
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
    <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 h-full">
      <div className="w-full px-4 py-3 border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>📊</span>
            <h3 className="text-sm font-semibold text-slate-200">Repository Stats</h3>
          </div>
          {onSyncSingleRepo && (hasNoData || isAuthenticated) && (
            <button
              onClick={onSyncSingleRepo}
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
      <div className="px-4 py-3">
        <div className="space-y-3">
          {/* Stars */}
          {stars !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Stars</span>
              <span className="text-slate-200 font-medium">{stars.toLocaleString()}</span>
            </div>
          )}

          {/* Forks */}
          {forks !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Forks</span>
              <span className="text-slate-200 font-medium">{forks.toLocaleString()}</span>
            </div>
          )}

          {/* Branches */}
          {branches !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Branches</span>
              <span className="text-slate-200 font-medium">{branches}</span>
            </div>
          )}

          {/* Total Lines of Code */}
          {totalLoc !== undefined && totalLoc > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Lines of Code</span>
              <span className="text-slate-200 font-medium">{formatLocNumber(totalLoc)}</span>
            </div>
          )}

          {/* Language Breakdown */}
          {locLanguageBreakdown && Object.keys(locLanguageBreakdown).length > 0 && (
            <div className="pt-2 border-t border-slate-700/50">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                Languages
              </div>
              {Object.entries(locLanguageBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([lang, loc]) => (
                  <div key={lang} className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">{lang}</span>
                    <span className="text-slate-200 font-medium">{formatLocNumber(loc)}</span>
                  </div>
                ))}
            </div>
          )}

          {/* Contributors */}
          {contributorCount !== undefined && contributorCount > 0 && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/50">
              <span className="text-slate-400">Contributors</span>
              <span className="text-slate-200 font-medium">{contributorCount}</span>
            </div>
          )}

          {/* Commit Frequency */}
          {commitFrequency !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Commits/Month</span>
              <span className="text-slate-200 font-medium">{typeof commitFrequency === 'number' ? commitFrequency.toFixed(1) : commitFrequency}</span>
            </div>
          )}

          {/* Bus Factor */}
          {busFactor !== undefined && busFactor > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Bus Factor</span>
              <span className="text-slate-200 font-medium">{busFactor}</span>
            </div>
          )}

          {/* PR Merge Time */}
          {avgPrMergeTimeHours !== undefined && avgPrMergeTimeHours > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Avg PR Merge Time</span>
              <span className="text-slate-200 font-medium">{typeof avgPrMergeTimeHours === 'number' ? avgPrMergeTimeHours.toFixed(1) : avgPrMergeTimeHours}h</span>
            </div>
          )}

          {/* Vulnerabilities */}
          {(vulnAlertCount !== undefined && vulnAlertCount > 0) && (
            <div className="pt-2 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Vulnerabilities</span>
                <span className="text-red-400 font-medium">{vulnAlertCount}</span>
              </div>
              {vulnCriticalCount !== undefined && vulnCriticalCount > 0 && (
                <div className="flex items-center justify-between text-xs ml-2">
                  <span className="text-slate-500 text-[10px]">Critical</span>
                  <span className="text-red-400 font-medium">{vulnCriticalCount}</span>
                </div>
              )}
              {vulnHighCount !== undefined && vulnHighCount > 0 && (
                <div className="flex items-center justify-between text-xs ml-2">
                  <span className="text-slate-500 text-[10px]">High</span>
                  <span className="text-orange-400 font-medium">{vulnHighCount}</span>
                </div>
              )}
            </div>
          )}

          {/* Additional Metrics */}
          {repoStatsMetrics.length > 0 && (
            <div className="pt-2 border-t border-slate-700/50 space-y-1">
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
          )}
        </div>
      </div>
    </div>
  );
}
