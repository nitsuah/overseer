// Repository table row component

import React, { Fragment } from 'react';
import {
  Clock,
  GitPullRequest,
  AlertCircle,
  Activity,
  Map,
  ListTodo,
  Sparkles,
  Play,
  Github,
  ExternalLink,
  X,
  RefreshCw,
} from 'lucide-react';
import ExpandableRow from '@/components/ExpandableRow';
import { Repo, RepoDetails } from '@/types/repo';
import { detectRepoType, getTypeColor, RepoType } from '@/lib/repo-type';
import { calculateDocHealth } from '@/lib/doc-health';
import {
  getHealthGrade,
  formatTimeAgo,
  getCommitFreshnessColor,
  getDocHealthColor,
  getLanguageColor,
} from '@/lib/dashboard-utils';

interface RepoTableRowProps {
  repo: Repo;
  details: RepoDetails | undefined;
  isExpanded: boolean;
  fixingDoc: boolean;
  syncingRepo: string | null;
  generatingSummary: string | null;
  onToggleExpanded: () => void;
  onRemove: () => void;
  onFixAllDocs: () => void;
  onFixStandard: (standardType: string) => void;
  onFixAllStandards: () => void;
  onGenerateSummary: () => void;
  onSyncSingleRepo: () => void;
}

export function RepoTableRow({
  repo,
  details,
  isExpanded,
  fixingDoc,
  syncingRepo,
  generatingSummary,
  onToggleExpanded,
  onRemove,
  onFixAllDocs,
  onFixStandard,
  onFixAllStandards,
  onGenerateSummary,
  onSyncSingleRepo,
}: RepoTableRowProps) {
  const typeInfo = detectRepoType(repo.name, repo.description, repo.language, repo.topics);
  const repoType = (repo.repo_type as RepoType) || typeInfo.type;
  const docHealth = details ? calculateDocHealth(details.docStatuses, repoType) : null;
  const health = getHealthGrade(repo.health_score || 0);

  return (
    <Fragment key={repo.id}>
      <tr
        className="hover:bg-slate-800/30 transition-colors cursor-pointer"
        onClick={onToggleExpanded}
      >
        <td className="px-6 py-4">
          <span className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
            {repo.name}
          </span>
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(
              repoType
            )}`}
          >
            <span>{typeInfo.icon}</span>
            <span className="capitalize">{repoType.replace('-', ' ')}</span>
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-slate-400 hidden xl:table-cell">
          <div className="truncate max-w-md" title={repo.description || ''}>
            {repo.description || '—'}
          </div>
        </td>
        <td className="px-6 py-4">
          {repo.language ? (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLanguageColor(
                repo.language
              )}`}
            >
              {repo.language}
            </span>
          ) : (
            <span className="text-slate-500">—</span>
          )}
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 relative group">
              <span className={`text-lg font-bold ${health.color}`}>{health.grade}</span>
              {details && (
                <>
                  {/* Health Breakdown Popup */}
                  <HealthBreakdown repo={repo} details={details} />
                  {/* Health Shields */}
                  <HealthShields details={details} />
                </>
              )}
            </div>
            {repo.coverage_score != null && (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-700 rounded-full h-1.5 w-16">
                  <div
                    className="bg-linear-to-r from-blue-500 to-blue-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(repo.coverage_score, 100)}%` }}
                    title={`${repo.coverage_score}% coverage`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 w-8">{repo.coverage_score}%</span>
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col gap-1 text-xs">
            <div
              className={`flex items-center gap-1 ${getCommitFreshnessColor(
                repo.last_commit_date || null
              )}`}
              title={repo.last_commit_date || 'No commits'}
            >
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(repo.last_commit_date || null)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              {repo.open_prs && repo.open_prs > 0 && (
                <span className="flex items-center gap-1" title={`${repo.open_prs} open PRs`}>
                  <GitPullRequest className="h-3 w-3" /> {repo.open_prs}
                </span>
              )}
              {repo.open_issues_count && repo.open_issues_count > 0 && (
                <span
                  className="flex items-center gap-1"
                  title={`${repo.open_issues_count} open issues`}
                >
                  <AlertCircle className="h-3 w-3" /> {repo.open_issues_count}
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded transition-colors"
              title="View on GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            {repo.homepage && (
              <a
                href={repo.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded transition-colors"
                title="Visit Homepage"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <DocStatusDisplay
            details={details}
            docHealth={docHealth}
            repoName={repo.name}
            lastSynced={repo.last_synced}
            fixingDoc={fixingDoc}
            syncingRepo={syncingRepo}
            onFixAllDocs={onFixAllDocs}
            onSyncSingleRepo={onSyncSingleRepo}
          />
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGenerateSummary();
              }}
              className="p-1.5 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded transition-colors disabled:opacity-50"
              title={
                generatingSummary === repo.name
                  ? 'Generating AI summary...'
                  : 'Generate AI summary'
              }
              disabled={generatingSummary === repo.name}
            >
              <Sparkles
                className={`h-4 w-4 ${generatingSummary === repo.name ? 'animate-pulse' : ''}`}
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
              title="Hide this repository"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && details && (
        <tr>
          <td colSpan={9} className="p-0">
            <ExpandableRow
              tasks={details.tasks}
              roadmapItems={details.roadmapItems}
              docStatuses={details.docStatuses}
              metrics={details.metrics}
              features={details.features}
              bestPractices={details.bestPractices}
              communityStandards={details.communityStandards}
              aiSummary={repo.ai_summary}
              stars={repo.stars}
              forks={repo.forks}
              branches={repo.branches_count}
              testingStatus={repo.testing_status}
              coverageScore={repo.coverage_score}
              readmeLastUpdated={repo.readme_last_updated}
              repoName={repo.name}
              onFixStandard={onFixStandard}
              onFixAllStandards={onFixAllStandards}
              totalLoc={repo.total_loc}
              locLanguageBreakdown={repo.loc_language_breakdown}
              testCaseCount={repo.test_case_count}
              ciStatus={repo.ci_status}
              ciLastRun={repo.ci_last_run}
              ciWorkflowName={repo.ci_workflow_name}
              vulnAlertCount={repo.vuln_alert_count}
              vulnCriticalCount={repo.vuln_critical_count}
              vulnHighCount={repo.vuln_high_count}
              contributorCount={repo.contributor_count}
              commitFrequency={repo.commit_frequency}
              busFactor={repo.bus_factor}
              avgPrMergeTimeHours={repo.avg_pr_merge_time_hours}
            />
          </td>
        </tr>
      )}
    </Fragment>
  );
}

// Helper components for cleaner code
function HealthBreakdown({ repo, details }: { repo: Repo; details: RepoDetails }) {
  const coreDocs = ['roadmap', 'tasks', 'metrics', 'features'];
  const coreDocsPresent = details.docStatuses.filter(
    (d) => coreDocs.includes(d.doc_type) && d.exists
  ).length;
  const docScore = Math.round((coreDocsPresent / coreDocs.length) * 100);

  const hasTests = details.bestPractices.some(
    (bp) => bp.practice_type === 'testing_framework' && bp.status === 'healthy'
  );
  let testScore = hasTests ? 40 : 0;
  if (repo.coverage_score !== undefined && hasTests) {
    testScore += Math.min(repo.coverage_score * 0.6, 60);
  }
  testScore = Math.round(testScore);

  const bpHealthy = details.bestPractices.filter((bp) => bp.status === 'healthy').length;
  const bpTotal = details.bestPractices.length;
  const bpScore = bpTotal > 0 ? Math.round((bpHealthy / bpTotal) * 100) : 0;

  const csHealthy = details.communityStandards.filter((cs) => cs.status === 'healthy').length;
  const csTotal = details.communityStandards.length;
  const csScore = csTotal > 0 ? Math.round((csHealthy / csTotal) * 100) : 0;

  const scores = [
    { label: 'Documentation', score: docScore, color: 'blue', weight: '30%' },
    { label: 'Testing', score: testScore, color: 'purple', weight: '20%' },
    { label: 'Best Practices', score: bpScore, color: 'indigo', weight: '20%' },
    { label: 'Community', score: csScore, color: 'green', weight: '15%' },
  ];

  return (
    <div className="absolute left-0 top-8 z-50 hidden group-hover:block w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4">
      <h4 className="text-sm font-semibold text-slate-200 mb-3">Health Breakdown</h4>
      <div className="space-y-3">
        {scores.map(({ label, score, color, weight }) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-${color}-400 font-medium`}>{score}%</span>
                <span className="text-slate-500 text-[10px]">({weight})</span>
              </div>
            </div>
            <div className="bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full bg-${color}-500 transition-all`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HealthShields({ details }: { details: RepoDetails }) {
  const coreDocs = ['roadmap', 'tasks', 'metrics', 'features', 'readme'];
  const coreDocsPresent = details.docStatuses.filter(
    (d) => coreDocs.includes(d.doc_type) && d.exists
  ).length;
  const docPercentage = Math.round((coreDocsPresent / coreDocs.length) * 100);

  const testingCount = details.bestPractices.filter(
    (p) => ['testing_framework', 'ci_cd'].includes(p.practice_type) && p.status === 'healthy'
  ).length;
  const testingTotal = details.bestPractices.filter((p) =>
    ['testing_framework', 'ci_cd'].includes(p.practice_type)
  ).length;
  const hasTests = details.bestPractices.some(
    (p) => p.practice_type === 'testing_framework' && p.status === 'healthy'
  );

  const bpHealthy = details.bestPractices.filter((p) => p.status === 'healthy').length;
  const bpTotal = details.bestPractices.length;
  const bpPercentage = bpTotal > 0 ? Math.round((bpHealthy / bpTotal) * 100) : 0;

  const csHealthy = details.communityStandards.filter((s) => s.status === 'healthy').length;
  const csTotal = details.communityStandards.length;
  const csPercentage = csTotal > 0 ? Math.round((csHealthy / csTotal) * 100) : 0;

  return (
    <>
      <span
        title={`Documentation: ${coreDocsPresent}/${coreDocs.length} core docs (${docPercentage}%)`}
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
          docPercentage >= 80
            ? 'bg-slate-500/20 text-slate-300'
            : docPercentage >= 50
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-red-500/20 text-red-400'
        }`}
      >
        {coreDocsPresent}/{coreDocs.length}
      </span>
      <span
        title={`Testing: ${testingCount}/${testingTotal} checks`}
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
          hasTests ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-500'
        }`}
      >
        {testingCount}/{testingTotal}
      </span>
      <span
        title={`Best Practices: ${bpHealthy}/${bpTotal} (${bpPercentage}%)`}
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
          bpPercentage >= 70
            ? 'bg-purple-500/20 text-purple-400'
            : bpPercentage >= 40
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-red-500/20 text-red-400'
        }`}
      >
        {bpHealthy}/{bpTotal}
      </span>
      <span
        title={`Community Standards: ${csHealthy}/${csTotal} (${csPercentage}%)`}
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
          csPercentage >= 70
            ? 'bg-green-500/20 text-green-400'
            : csPercentage >= 40
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-red-500/20 text-red-400'
        }`}
      >
        {csHealthy}/{csTotal}
      </span>
    </>
  );
}

function DocStatusDisplay({
  details,
  docHealth,
  repoName,
  lastSynced,
  fixingDoc,
  syncingRepo,
  onFixAllDocs,
  onSyncSingleRepo,
}: {
  details: RepoDetails | undefined;
  docHealth: { score: number } | null;
  repoName: string;
  lastSynced: string | null;
  fixingDoc: boolean;
  syncingRepo: string | null;
  onFixAllDocs: () => void;
  onSyncSingleRepo: () => void;
}) {
  if (!details) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSyncSingleRepo();
        }}
        disabled={syncingRepo === repoName}
        className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 disabled:opacity-50"
        title="Click to sync and load docs"
      >
        <RefreshCw className={`h-3 w-3 ${syncingRepo === repoName ? 'animate-spin' : ''}`} />
        {syncingRepo === repoName ? 'Syncing...' : formatTimeAgo(lastSynced)}
      </button>
    );
  }

  const getIconInfo = (docType: string) => {
    const doc = details.docStatuses.find((d) => d.doc_type === docType);
    const exists = doc && doc.exists;
    const healthState = doc?.health_state || (exists ? 'healthy' : 'missing');
    const colorMap: Record<string, string> = {
      roadmap: 'blue',
      tasks: 'purple',
      metrics: 'green',
      features: 'indigo',
    };
    const color = colorMap[docType] || 'slate';
    const iconColor =
      healthState === 'healthy'
        ? `text-${color}-400`
        : healthState === 'dormant'
        ? 'text-yellow-400'
        : healthState === 'malformed'
        ? 'text-orange-400'
        : 'text-slate-600';
    return { exists, iconColor, title: docType.toUpperCase() };
  };

  const roadmap = getIconInfo('roadmap');
  const tasks = getIconInfo('tasks');
  const metrics = getIconInfo('metrics');
  const features = getIconInfo('features');

  const coreDocs = ['roadmap', 'tasks', 'metrics', 'features'];
  const allDocsPresent = coreDocs.every((docType) =>
    details.docStatuses.find((d) => d.doc_type === docType && d.exists)
  );

  return (
    <div className="flex items-center gap-2">
      <span title={roadmap.title}>
        <Map className={`h-4 w-4 ${roadmap.exists ? roadmap.iconColor : 'opacity-20'}`} />
      </span>
      <span title={tasks.title}>
        <ListTodo className={`h-4 w-4 ${tasks.exists ? tasks.iconColor : 'opacity-20'}`} />
      </span>
      <span title={metrics.title}>
        <Activity className={`h-4 w-4 ${metrics.exists ? metrics.iconColor : 'opacity-20'}`} />
      </span>
      <span title={features.title}>
        <Sparkles className={`h-4 w-4 ${features.exists ? features.iconColor : 'opacity-20'}`} />
      </span>
      <span className={`text-xs font-medium ml-1 ${getDocHealthColor(docHealth?.score || 0)}`}>
        {docHealth?.score}%
      </span>
      {!allDocsPresent && docHealth && docHealth.score < 100 && (
        <button
          onClick={onFixAllDocs}
          className="ml-2 p-1 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded transition-colors"
          title="Fix all missing docs"
          disabled={fixingDoc}
        >
          <Play className="h-3.5 w-3.5 fill-current" />
        </button>
      )}
    </div>
  );
}
