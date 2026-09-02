"use client";

import React, { Fragment, useMemo } from 'react';
import {
  GitPullRequest,
  AlertCircle,
  Shield,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  X,
  BookOpen,
  Map,
  ListTodo,
  Activity,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import ExpandableRow from '@/components/ExpandableRow';
import { Repo, RepoDetails } from '@/types/repo';
import { detectRepoType, RepoType } from '@/lib/repo-type';
import { calculateDocHealth } from '@/lib/doc-health';
import { getHealthGrade } from '@/lib/dashboard-utils';
import { detectActivityState, MAINTENANCE_MODE_DAYS } from '@/lib/repo-signals';
import { HealthBreakdown } from './repo-row/HealthBreakdown';
import { TypeEditor } from './repo-row/TypeEditor';
import { getTypeIcon } from './repo-row/repo-row-utils';

interface MobileRepoCardProps {
  repo: Repo;
  details: RepoDetails | undefined;
  isLoadingDetails?: boolean;
  isExpanded: boolean;
  syncingRepo: string | null;
  generatingSummary: string | null;
  isAuthenticated?: boolean;
  onToggleHealth: () => void;
  onToggleExpanded: () => void;
  onRemove: () => void;
  onFixAllDocs: () => void;
  onFixDoc: (docType: string) => void;
  onFixStandard: (standardType: string) => void;
  onFixAllStandards: () => void;
  onFixPractice: (practiceType: string) => void;
  onFixAllPractices: () => void;
  onGenerateSummary: () => void;
  onSyncSingleRepo: () => void;
  onUnhide?: () => void;
  onOpenChat?: () => void;
}

const DOC_ICONS = [
  { type: 'readme',  Icon: BookOpen, label: 'README',  color: 'text-cyan-400' },
  { type: 'roadmap', Icon: Map,      label: 'Roadmap', color: 'text-purple-400' },
  { type: 'tasks',   Icon: ListTodo, label: 'Tasks',   color: 'text-blue-400' },
  { type: 'metrics', Icon: Activity, label: 'Metrics', color: 'text-green-400' },
  { type: 'features',Icon: Sparkles, label: 'Features',color: 'text-yellow-400' },
] as const;

export function MobileRepoCard({
  repo,
  details,
  isLoadingDetails = false,
  isExpanded,
  syncingRepo,
  generatingSummary,
  isAuthenticated = true,
  onToggleHealth,
  onToggleExpanded,
  onRemove,
  onFixAllDocs,
  onFixDoc,
  onFixStandard,
  onFixAllStandards,
  onFixPractice,
  onFixAllPractices,
  onGenerateSummary,
  onSyncSingleRepo,
  onUnhide,
  onOpenChat,
}: MobileRepoCardProps) {
  const repoType = repo.repo_type
    ? (repo.repo_type as RepoType)
    : detectRepoType(repo.name, repo.description, repo.language, repo.topics).type;

  const docHealth = details ? calculateDocHealth(details.docStatuses, repoType) : null;
  const health = getHealthGrade(repo.health_score || 0);

  const docIconState = useMemo(() => {
    if (!details) return null;
    return DOC_ICONS.map(({ type, Icon, label, color }) => {
      const doc = details.docStatuses.find(d => d.doc_type === type);
      const exists = doc?.exists ?? false;
      const healthState = doc?.health_state ?? (exists ? 'healthy' : 'missing');
      return { type, Icon, label, color, exists, healthState };
    });
  }, [details]);

  const blocked = repo.prs_blocked_count ?? 0;

  return (
    <Fragment>
      <div
        className={`cursor-pointer transition-colors border-b border-slate-700/30 ${
          repo.is_hidden
            ? 'bg-slate-900/40 text-slate-500'
            : 'bg-gradient-to-r from-slate-900/60 via-slate-800/40 to-slate-900/60 active:from-slate-800/70 active:via-slate-700/50 active:to-slate-800/70'
        }`}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={`mobile-card-details-${repo.name}`}
        onClick={onToggleExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpanded();
          }
        }}
      >
        <div className="px-3 py-2.5 space-y-1.5">
          {/* Row 1: type + name + live + actions */}
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className={repo.is_hidden ? 'opacity-50 grayscale' : ''}>
                <TypeEditor
                  repoType={repoType}
                  repoName={repo.name}
                  getTypeIcon={getTypeIcon}
                  isAuthenticated={isAuthenticated}
                />
              </div>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-medium text-sm truncate hover:underline ${
                  repo.is_hidden
                    ? 'text-slate-500 hover:text-slate-400'
                    : 'text-blue-400 hover:text-blue-300'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {repo.name}
              </a>
              {repo.homepage && (
                <a
                  href={repo.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${repo.name} homepage`}
                  className={`p-0.5 rounded shrink-0 transition-colors ${
                    repo.is_hidden
                      ? 'bg-slate-800 text-slate-600'
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Play className="h-3 w-3 fill-current" />
                </a>
              )}
              {!repo.is_hidden && detectActivityState(repo.last_commit_date) === 'maintenance' && (
                <span
                  className="px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 text-[10px] font-semibold uppercase tracking-wide shrink-0"
                  title={`No commits in ${MAINTENANCE_MODE_DAYS}+ days — maintenance mode`}
                >
                  maintenance
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {repo.ci_status && repo.ci_status !== 'unknown' && (
                <a
                  href={`${repo.url}/actions`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-1 rounded transition-colors ${
                    repo.ci_status === 'passing'
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  }`}
                  title={`CI: ${repo.ci_status}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {repo.ci_status === 'passing'
                    ? <CheckCircle2 className="h-3.5 w-3.5" />
                    : <XCircle className="h-3.5 w-3.5" />}
                </a>
              )}
              {repo.is_hidden ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onUnhide?.(); }}
                  className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Restore
                </button>
              ) : (
                <>
                  {onOpenChat && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onOpenChat(); }}
                      className="p-1 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded transition-colors"
                      title={`Chat about ${repo.name}`}
                      aria-label={`Chat about ${repo.name}`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onSyncSingleRepo(); }}
                      disabled={syncingRepo === repo.name}
                      className="p-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded transition-colors disabled:opacity-50"
                      title={syncingRepo === repo.name ? 'Syncing…' : 'Sync'}
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${syncingRepo === repo.name ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onRemove(); }}
                      className="p-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                      title="Hide"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Row 2: health + alert badges + doc icons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Health grade */}
            <div className={repo.is_hidden ? 'opacity-50 grayscale' : ''}>
              {details ? (
                <HealthBreakdown
                  repo={repo}
                  details={details}
                  health={health}
                  onToggle={onToggleHealth}
                />
              ) : (
                <span className={`text-base font-bold ${health.color}`}>{health.grade}</span>
              )}
            </div>

            {/* Alert badges */}
            {!repo.is_hidden && (repo.open_prs ?? 0) > 0 && (
              <a
                href={`${repo.url}/pulls`}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative p-1 rounded transition-colors ${
                  blocked > 0
                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                    : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                }`}
                title={`${repo.open_prs} open PRs`}
                onClick={(e) => e.stopPropagation()}
              >
                <GitPullRequest className="h-3.5 w-3.5" />
                {blocked > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-bold rounded-full h-3.5 min-w-3.5 px-0.5 flex items-center justify-center">
                    {blocked}
                  </span>
                )}
              </a>
            )}
            {!repo.is_hidden && (repo.open_issues_count ?? 0) > 0 && (
              <a
                href={`${repo.url}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative p-1 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded transition-colors"
                title={`${repo.open_issues_count} open issues`}
                onClick={(e) => e.stopPropagation()}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-bold rounded-full h-3.5 min-w-3.5 px-0.5 flex items-center justify-center">
                  {repo.open_issues_count}
                </span>
              </a>
            )}
            {!repo.is_hidden && (repo.vuln_alert_count ?? 0) > 0 && (
              <a
                href={`${repo.url}/security/dependabot`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative p-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                title={`${repo.vuln_alert_count} vulnerability alerts`}
                onClick={(e) => e.stopPropagation()}
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full h-3.5 min-w-3.5 px-0.5 flex items-center justify-center">
                  {repo.vuln_alert_count}
                </span>
              </a>
            )}

            {/* Doc status icons */}
            {!details && isLoadingDetails && (
              <div className="flex items-center gap-1 animate-pulse ml-auto" aria-label="Loading docs">
                {DOC_ICONS.map(({ type }) => (
                  <div key={type} className="h-3.5 w-3.5 rounded-full bg-slate-700/60" />
                ))}
              </div>
            )}
            {docIconState && (
              <div
                className="flex items-center gap-1 ml-auto"
                title={docHealth ? `Doc health: ${docHealth.score}%` : 'Doc status'}
              >
                {docIconState.map(({ type, Icon, label, color, exists, healthState }) => (
                  <span key={type} title={`${label}: ${healthState}`}>
                    <Icon className={`h-3.5 w-3.5 ${exists ? color : 'opacity-20'}`} />
                  </span>
                ))}
              </div>
            )}
          </div>

          {repo.description && !repo.is_hidden && (
            <p className="text-xs text-slate-500 truncate">{repo.description}</p>
          )}
        </div>
      </div>

      {isExpanded && details && (
        <div id={`mobile-card-details-${repo.name}`}>
        <ExpandableRow
          tasks={details.tasks}
          roadmapItems={details.roadmapItems}
          docStatuses={details.docStatuses}
          metrics={details.metrics}
          features={details.features}
          bestPractices={details.bestPractices}
          communityStandards={details.communityStandards}
          aiSummary={repo.ai_summary}
          isAuthenticated={isAuthenticated}
          stars={repo.stars}
          forks={repo.forks}
          branches={repo.branches_count}
          testingStatus={repo.testing_status}
          coverageScore={repo.coverage_score}
          readmeLastUpdated={repo.readme_last_updated}
          repoName={repo.name}
          repoUrl={repo.url}
          onFixDoc={(_repoName: string, docType: string) => onFixDoc(docType)}
          onFixAllDocs={() => onFixAllDocs()}
          onFixStandard={(_repoName: string, standardType: string) => onFixStandard(standardType)}
          onFixAllStandards={() => onFixAllStandards()}
          onFixPractice={(_repoName: string, practiceType: string) => onFixPractice(practiceType)}
          onFixAllPractices={() => onFixAllPractices()}
          totalLoc={repo.total_loc}
          locLanguageBreakdown={repo.loc_language_breakdown}
          testCaseCount={repo.test_case_count}
          vulnAlertCount={repo.vuln_alert_count}
          vulnCriticalCount={repo.vuln_critical_count}
          vulnHighCount={repo.vuln_high_count}
          contributorCount={repo.contributor_count}
          commitFrequency={repo.commit_frequency}
          busFactor={repo.bus_factor}
          avgPrMergeTimeHours={repo.avg_pr_merge_time_hours}
          onSyncSingleRepo={onSyncSingleRepo}
          syncingRepo={syncingRepo}
          repoNameForSync={repo.name}
          onGenerateSummary={onGenerateSummary}
          generatingSummary={generatingSummary === repo.name}
          securityConfig={details.securityConfig}
        />
        </div>
      )}
    </Fragment>
  );
}
