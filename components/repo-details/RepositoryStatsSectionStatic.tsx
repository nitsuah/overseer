"use client";

import { formatLocNumber } from '@/lib/expandable-row-utils';
import { Metric } from '@/types/repo';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface RepositoryStatsSectionStaticProps {
  stars?: number;
  forks?: number;
  branches?: number;
  totalLoc?: number;
  locLanguageBreakdown?: Record<string, number>;
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
  contributorCount,
  commitFrequency,
  busFactor,
  avgPrMergeTimeHours,
  onSyncSingleRepo,
  isSyncing = false,
  isAuthenticated = false,
  hasNoData = false,
}: RepositoryStatsSectionStaticProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Expanded by default
  
  return (
    <div className="bg-gradient-to-br from-cyan-900/30 via-slate-800/50 to-cyan-800/20 rounded-lg overflow-hidden border border-cyan-500/40 shadow-lg shadow-cyan-500/10 hover:border-cyan-400/50 transition-colors">
      <div
        className="w-full px-4 py-3 border-b border-cyan-500/20 cursor-pointer hover:bg-cyan-900/20 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <span>📊</span>
            <h3 className="text-sm font-semibold text-slate-200">Repository Stats</h3>
            <span className="text-slate-500 text-xs ml-2">{isExpanded ? '▼' : '▶'}</span>
          </div>
          {/* Refresh Button - Always Visible */}
          {onSyncSingleRepo && (hasNoData || isAuthenticated) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSyncSingleRepo();
              }}
              disabled={isSyncing}
              className="flex items-center justify-center gap-1.5 px-2 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded transition-colors disabled:opacity-50 text-xs font-medium ml-2"
              title="Refresh repository data"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 py-3">
          <div className="space-y-3">
            {/* Stars */}
            {stars !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1"><span>⭐</span>Stars</span>
                <span className="text-slate-200 font-medium">{stars.toLocaleString()}</span>
              </div>
            )}

          {/* Forks */}
          {forks !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1"><span>🔀</span>Forks</span>
              <span className="text-slate-200 font-medium">{forks.toLocaleString()}</span>
            </div>
          )}

          {/* Branches */}
          {branches !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1"><span>🌿</span>Branches</span>
              <span className="text-slate-200 font-medium">{branches}</span>
            </div>
          )}

          {/* Total Lines of Code */}
          {totalLoc !== undefined && totalLoc > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1"><span>📝</span>Lines of Code</span>
              <span className="text-slate-200 font-medium">{formatLocNumber(totalLoc)}</span>
            </div>
          )}

          {/* Language Breakdown */}
          {locLanguageBreakdown && Object.keys(locLanguageBreakdown).length > 0 && (
            <div className="pt-2 border-t border-slate-700/50">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1">
                <span>💬</span>Languages
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
              <span className="text-slate-400 flex items-center gap-1"><span>🧑‍💻</span>Contributors</span>
              <span className="text-slate-200 font-medium">{contributorCount}</span>
            </div>
          )}

          {/* Commit Frequency */}
          {commitFrequency !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1"><span>📅</span>Commits/Month</span>
              <span className="text-slate-200 font-medium">{typeof commitFrequency === 'number' ? commitFrequency.toFixed(1) : commitFrequency}</span>
            </div>
          )}

          {/* Bus Factor */}
          {busFactor !== undefined && busFactor > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1"><span>🚌</span>Bus Factor</span>
              <span className="text-slate-200 font-medium">{busFactor}</span>
            </div>
          )}

          {/* PR Merge Time */}
          {avgPrMergeTimeHours !== undefined && avgPrMergeTimeHours > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1"><span>⏱️</span>Avg PR Merge Time</span>
              <span className="text-slate-200 font-medium">{typeof avgPrMergeTimeHours === 'number' ? avgPrMergeTimeHours.toFixed(1) : avgPrMergeTimeHours}h</span>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
