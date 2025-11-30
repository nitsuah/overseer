// Repository table row component

import React, { Fragment, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
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
  Shield,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  FlaskConical,
  Clock,
  BookOpen,
} from 'lucide-react';
import ExpandableRow from '@/components/ExpandableRow';
import { Repo, RepoDetails } from '@/types/repo';
import { detectRepoType, RepoType } from '@/lib/repo-type';
import { calculateDocHealth } from '@/lib/doc-health';
import {
  getHealthGrade,
  formatTimeAgo,
  getLanguageColor,
} from '@/lib/dashboard-utils';
import { getLanguageIcon } from '@/lib/language-colors';

interface RepoTableRowProps {
  repo: Repo;
  details: RepoDetails | undefined;
  isExpanded: boolean;
  fixingDoc: boolean;
  syncingRepo: string | null;
  generatingSummary: string | null;
  isAuthenticated?: boolean;
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
}

export function RepoTableRow({
  repo,
  details,
  isExpanded,
  fixingDoc,
  syncingRepo,
  generatingSummary,
  isAuthenticated = true,
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
}: RepoTableRowProps) {
  // Centralized repo type resolution - use stored type or detect from metadata
  const getRepoType = (): RepoType => {
    if (repo.repo_type) {
      return repo.repo_type as RepoType;
    }
    const detected = detectRepoType(repo.name, repo.description, repo.language, repo.topics);
    return detected.type;
  };
  
  const repoType = getRepoType();
  
  // Get icon based on repo type
  const getTypeIcon = (type: RepoType): string => {
    const iconMap: Record<RepoType, string> = {
      'web-app': '🌐',
      'game': '🎮',
      'tool': '🔧',
      'library': '📦',
      'bot': '🤖',
      'research': '🔬',
      'unknown': '📄',
    };
    return iconMap[type];
  };
  
  const docHealth = details ? calculateDocHealth(details.docStatuses, repoType) : null;
  const health = getHealthGrade(repo.health_score || 0);

  const [editingType, setEditingType] = useState(false);
  const [updatingType, setUpdatingType] = useState(false);

  const handleTypeChange = async (newType: RepoType) => {
    try {
      setUpdatingType(true);
      const res = await fetch(`/api/repos/${repo.name}/update-type`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newType }),
      });

      if (res.ok) {
        // Refresh the page to show updated type
        window.location.reload();
      } else {
        console.error('Failed to update repo type');
      }
    } catch (error) {
      console.error('Error updating repo type:', error);
    } finally {
      setUpdatingType(false);
      setEditingType(false);
    }
  };

  return (
    <Fragment key={repo.id}>
      <tr
        className="bg-gradient-to-r from-slate-900/60 via-slate-800/40 to-slate-900/60 hover:from-slate-800/70 hover:via-slate-700/50 hover:to-slate-800/70 transition-all duration-200 cursor-pointer border-b border-slate-700/30"
        onClick={onToggleExpanded}
      >
        {/* Links Column - NOW FIRST */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSyncSingleRepo();
                }}
                className="p-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded transition-colors disabled:opacity-50"
                title={syncingRepo === repo.name ? 'Syncing...' : 'Refresh repository data'}
                disabled={syncingRepo === repo.name}
              >
                <RefreshCw
                  className={`h-4 w-4 ${syncingRepo === repo.name ? 'animate-spin' : ''}`}
                />
              </button>
            )}
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded transition-colors"
              title="View on GitHub"
              onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {repo.open_prs !== undefined && repo.open_prs > 0 && (
              <a
                href={`${repo.url}/pulls`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded transition-colors"
                title={`${repo.open_prs} open PRs`}
                onClick={(e) => e.stopPropagation()}
              >
                <GitPullRequest className="h-4 w-4" />
              </a>
            )}
            {repo.open_issues_count !== undefined && repo.open_issues_count > 0 && (
              <a
                href={`${repo.url}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative p-1 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded transition-colors"
                title={`${repo.open_issues_count} open issues`}
                onClick={(e) => e.stopPropagation()}
              >
                <AlertCircle className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {repo.open_issues_count}
                </span>
              </a>
            )}
            {repo.vuln_alert_count !== undefined && repo.vuln_alert_count > 0 && (
              <a
                href={`${repo.url}/security/dependabot`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative p-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                title={`${repo.vuln_alert_count} Dependabot alerts`}
                onClick={(e) => e.stopPropagation()}
              >
                <Shield className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {repo.vuln_alert_count}
                </span>
              </a>
            )}
            {/* CI/CD Status Icon */}
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
                title={`CI/CD ${repo.ci_status === 'passing' ? 'Passing' : 'Failing'}${
                  repo.ci_workflow_name ? ` - ${repo.ci_workflow_name}` : ''
                }${repo.ci_last_run ? ` (${new Date(repo.ci_last_run).toLocaleDateString()})` : ''}`}
                onClick={(e) => e.stopPropagation()}
              >
                {repo.ci_status === 'passing' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
              </a>
            )}
            {repo.ci_status === 'unknown' && (
              <div
                className="p-1 bg-slate-500/20 text-slate-400 rounded"
                title="CI/CD status unknown"
              >
                <HelpCircle className="h-4 w-4" />
              </div>
            )}
          </div>
        </td>
        {/* Repository Name with Type and Language */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            {/* Type Icon */}
            {isAuthenticated && editingType ? (
              <select
                value={repoType}
                onChange={(e) => handleTypeChange(e.target.value as RepoType)}
                disabled={updatingType}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                onBlur={() => setEditingType(false)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              >
                <option value="web-app">🌐 Web App</option>
                <option value="game">🎮 Game</option>
                <option value="tool">🔧 Tool</option>
                <option value="library">📦 Library</option>
                <option value="bot">🤖 Bot</option>
                <option value="research">🔬 Research</option>
                <option value="unknown">📄 Unknown</option>
              </select>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAuthenticated) setEditingType(true);
                }}
                disabled={!isAuthenticated}
                className="text-lg hover:scale-110 transition-transform"
                title={isAuthenticated ? `Click to edit type (${repoType})` : repoType}
              >
                {getTypeIcon(repoType)}
              </button>
            )}
            {/* Repository Name */}
            <span className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
              {repo.name}
            </span>
          </div>
        </td>
        {/* Description */}
        <td className="px-6 py-4 text-sm text-slate-400 hidden xl:table-cell">
          <div className="flex items-center gap-2">
            <div className="truncate max-w-md" title={repo.description || ''}>
              {repo.description || '—'}
            </div>
            {/* Language Icon/Label */}
            {repo.language && (
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${getLanguageColor(
                  repo.language
                )}`}
                title={repo.language}
              >
                {getLanguageIcon(repo.language)}
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {details && <HealthBreakdown repo={repo} details={details} health={health} />}
              {details && (
                <>
                  {/* Health Shields */}
                  <HealthShields details={details} repo={repo} docHealth={docHealth} />
                </>
              )}
            </div>
          </div>
        </td>
        {/* Docs Column */}
        <td className="px-6 py-4">
          <DocStatusDisplay
            repo={repo}
            details={details}
            docHealth={docHealth}
            repoName={repo.name}
            lastSynced={repo.last_synced}
            fixingDoc={fixingDoc}
            syncingRepo={syncingRepo}
            isAuthenticated={isAuthenticated}
            onFixAllDocs={onFixAllDocs}
            onSyncSingleRepo={onSyncSingleRepo}
          />
        </td>
        {/* Actions Column - Remove */}
        <td className="px-6 py-4">
          {isAuthenticated ? (
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
          ) : (
            <div className="text-slate-500 text-sm">—</div>
          )}
        </td>
      </tr>
      {isExpanded && details && (
        <tr>
          <td colSpan={8} className="p-0 bg-slate-950/90">
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
              // Adapt single-arg handlers to two-arg signatures expected downstream
              onFixDoc={(repoNameArg: string, docType: string) => onFixDoc(docType)}
              onFixAllDocs={() => onFixAllDocs()}
              onFixStandard={(repoNameArg: string, standardType: string) => onFixStandard(standardType)}
              onFixAllStandards={() => onFixAllStandards()}
              onFixPractice={(repoNameArg: string, practiceType: string) => onFixPractice(practiceType)}
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
            />
          </td>
        </tr>
      )}
    </Fragment>
  );
}

// Helper components for cleaner code
function HealthBreakdown({ repo, details, health }: { repo: Repo; details: RepoDetails; health: { grade: string; color: string } }) {
  const [showPopup, setShowPopup] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const spanRef = React.useRef<HTMLSpanElement>(null);
  
  const handleMouseEnter = () => {
    if (!spanRef.current) return;
    const rect = spanRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
    setShowPopup(true);
  };
  
  const handleMouseLeave = () => {
    setShowPopup(false);
  };
  
  // Use state to capture timestamp once on mount
  const [now] = useState(() => Date.now());
  
  // Calculate all scores using useMemo
  const scores = useMemo(() => {
    // Get repo type for calculations (same logic as component level)
    const calcRepoType = repo.repo_type 
      ? (repo.repo_type as RepoType)
      : detectRepoType(repo.name, repo.description, repo.language, repo.topics).type;
      
    // Calculate documentation score using the same logic as sync
    const docHealthCalc = calculateDocHealth(details.docStatuses, calcRepoType);
    const docScore = Math.round(docHealthCalc.score);

    // Calculate testing score with 3 components:
    // 1. Testing framework (25 points)
    // 2. CI/CD exists (15 points)
    // 3. CI/CD is passing (20 points)
    // 4. Coverage (up to 40 points)
    const hasTestFramework = details.bestPractices.some(
      (bp) => bp.practice_type === 'testing_framework' && bp.status === 'healthy'
    );
    const hasCICD = repo.ci_status && repo.ci_status !== 'unknown';
    const cicdPassing = repo.ci_status === 'passing';
    
    let testScore = 0;
    if (hasTestFramework) testScore += 25;
    if (hasCICD) testScore += 15;
    if (cicdPassing) testScore += 20;
    if (repo.coverage_score !== undefined) {
      testScore += Math.min(repo.coverage_score * 0.4, 40); // Up to 40 points for coverage
    }
    testScore = Math.round(testScore);

    // Calculate best practices score (simple percentage, no bonuses for health breakdown display)
    const bpHealthy = details.bestPractices.filter((bp) => bp.status === 'healthy').length;
    const bpTotal = details.bestPractices.length;
    const bpScore = bpTotal > 0 ? Math.round((bpHealthy / bpTotal) * 100) : 0;

    // Calculate community standards score
    const csHealthy = details.communityStandards.filter((cs) => cs.status === 'healthy').length;
    const csTotal = details.communityStandards.length;
    const csScore = csTotal > 0 ? Math.round((csHealthy / csTotal) * 100) : 0;

    // Calculate activity score with penalties
    const lastCommitDate = repo.last_commit_date;
    const daysSinceCommit = lastCommitDate
      ? Math.floor((now - new Date(lastCommitDate).getTime()) / (1000 * 60 * 60 * 24))
      : 365;
    
    let activityScore = 100;
    
    // Deduct points for staleness
    if (daysSinceCommit > 90) {
      activityScore -= Math.min((daysSinceCommit - 90) / 3, 40);
    }
    
    // Deduct points for many open issues
    const openIssues = repo.open_issues_count || 0;
    if (openIssues > 10) {
      activityScore -= Math.min((openIssues - 10) * 2, 20);
    }
    
    // Deduct points for stale PRs
    const openPRs = repo.open_prs || 0;
    if (openPRs > 5) {
      activityScore -= Math.min((openPRs - 5) * 3, 20);
    }
    
    activityScore = Math.max(0, Math.round(activityScore));

    // Determine activity color based on score (green to red scale)
    let activityColor = 'green';
    if (activityScore < 40) activityColor = 'red';
    else if (activityScore < 60) activityColor = 'orange';
    else if (activityScore < 80) activityColor = 'yellow';

    return [
      { label: 'Community', score: csScore, color: 'green', weight: '15%' },
      { label: 'Best Practices', score: bpScore, color: 'purple', weight: '20%' },
      { label: 'Testing', score: testScore, color: 'blue', weight: '20%' },
      { label: 'Activity', score: activityScore, color: activityColor, weight: '15%' },
      { label: 'Documentation', score: docScore, color: 'slate', weight: '30%' },
    ];
  }, [repo, details, now]);

  // Color mapping for proper Tailwind JIT compilation
  const colorMap: Record<string, { text: string; bg: string; hex: string }> = {
    slate: { text: 'text-slate-400', bg: 'bg-slate-500', hex: '#64748b' },
    blue: { text: 'text-blue-400', bg: 'bg-blue-500', hex: '#3b82f6' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500', hex: '#a855f7' },
    green: { text: 'text-green-400', bg: 'bg-green-500', hex: '#22c55e' },
    yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500', hex: '#eab308' },
    orange: { text: 'text-orange-400', bg: 'bg-orange-500', hex: '#f97316' },
    red: { text: 'text-red-400', bg: 'bg-red-500', hex: '#ef4444' },
  };

  return (
    <>
      <span 
        ref={spanRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`text-lg font-bold ${health.color} cursor-help`}
      >
        {health.grade}
      </span>
      {showPopup && position && createPortal(
        <div 
          className="fixed -translate-x-1/2 w-[400px] bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-4 pointer-events-none"
          style={{ 
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 9999,
          }}
        >
          <h4 className="text-sm font-semibold text-slate-200 mb-3">Health Breakdown</h4>
          <div className="space-y-2.5">
            {scores.map(({ label, score, color, weight }) => {
              const colors = colorMap[color] || colorMap.blue;
              // Use red for scores below 50%
              const barColor = score < 50 ? '#ef4444' : colors.hex;
              
              // Icon mapping for each section
              const iconMap: Record<string, React.ReactNode> = {
                'Documentation': <FileText className="h-3.5 w-3.5 text-slate-400" />,
                'Testing': <FlaskConical className="h-3.5 w-3.5 text-blue-400" />,
                'Best Practices': <Shield className="h-3.5 w-3.5 text-purple-400" />,
                'Community': <Shield className="h-3.5 w-3.5 text-green-400" />,
                'Activity': <Clock className="h-3.5 w-3.5 text-green-400" />,
              };
              
              return (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    {iconMap[label]}
                    <span className="text-slate-400 truncate">{label}</span>
                  </div>
                  <div className="flex-1 relative bg-slate-700 rounded-full h-1.5 overflow-visible">
                    {/* 50% threshold indicator */}
                    <div 
                      className="absolute top-0 bottom-0 w-px bg-yellow-400/50"
                      style={{ left: '50%' }}
                      title="50% threshold"
                    />
                    <div
                      className="h-full transition-all rounded-full"
                      style={{ 
                        width: `${score}%`,
                        backgroundColor: barColor
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 w-16 shrink-0 justify-end">
                    <span className={`${score < 50 ? 'text-red-400' : colors.text} font-medium tabular-nums`}>{score}%</span>
                    <span className="text-slate-500 text-[10px]">({weight})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function HealthShields({ details, repo, docHealth }: { details: RepoDetails; repo: Repo; docHealth: { score: number } | null }) {
  // Capture timestamp once
  const [now] = useState(() => Date.now());

  // Testing checks: framework, CI/CD exists, CI/CD health
  const hasTestFramework = details.bestPractices.some(
    (p) => p.practice_type === 'testing_framework' && p.status === 'healthy'
  );
  const hasCICD = repo.ci_status && repo.ci_status !== 'unknown';
  const cicdPassing = repo.ci_status === 'passing';
  
  const testingChecks = [];
  if (hasTestFramework) testingChecks.push('framework');
  if (hasCICD) testingChecks.push('ci_exists');
  if (cicdPassing) testingChecks.push('ci_healthy');
  
  const testingCount = testingChecks.length;
  const testingTotal = 3;

  // Build testing tooltip with details
  const testingTooltip = [
    `Testing: ${testingCount}/${testingTotal} checks`,
    '',
    `${hasTestFramework ? '✓' : '✗'} Testing Framework: ${hasTestFramework ? 'healthy' : 'missing'}`,
    `${hasCICD ? '✓' : '✗'} CI/CD Configured: ${hasCICD ? 'yes' : 'no'}`,
    `${cicdPassing ? '✓' : '✗'} CI/CD Status: ${repo.ci_status || 'unknown'}`,
  ].join('\n');

  const bpHealthy = details.bestPractices.filter((p) => p.status === 'healthy').length;
  const bpTotal = details.bestPractices.length;
  const bpPercentage = bpTotal > 0 ? Math.round((bpHealthy / bpTotal) * 100) : 0;

  const csHealthy = details.communityStandards.filter((s) => s.status === 'healthy').length;
  const csTotal = details.communityStandards.length;
  const csPercentage = csTotal > 0 ? Math.round((csHealthy / csTotal) * 100) : 0;
  
  // Build detailed Community Standards tooltip
  const csTooltip = [
    `Community Standards: ${csHealthy}/${csTotal} (${csPercentage}%)`,
    '',
    ...details.communityStandards.map((s) => {
      const status = s.status === 'healthy' ? '✓' : '✗';
      const name = s.standard_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return `${status} ${name}: ${s.status}`;
    })
  ].join('\n');
  
  // Build detailed Best Practices tooltip
  const bpTooltip = [
    `Best Practices: ${bpHealthy}/${bpTotal} (${bpPercentage}%)`,
    '',
    ...details.bestPractices.map((p) => {
      const status = p.status === 'healthy' ? '✓' : '✗';
      const name = p.practice_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return `${status} ${name}: ${p.status}`;
    })
  ].join('\n');
  
  // Build detailed Doc Health tooltip
  const repoType = repo.repo_type || 'unknown';
  const expectedDocsMap: Record<string, string[]> = {
    'web-app': ['readme', 'features', 'roadmap', 'tasks', 'metrics'],
    'game': ['readme', 'features', 'roadmap', 'tasks', 'metrics'],
    'library': ['readme', 'features', 'changelog', 'metrics'],
    'tool': ['readme', 'features', 'roadmap', 'tasks', 'metrics'],
    'bot': ['readme', 'features', 'roadmap', 'tasks', 'metrics'],
    'research': ['readme', 'features', 'metrics'],
    'unknown': ['readme', 'features', 'roadmap', 'metrics']
  };
  const expectedDocs = expectedDocsMap[repoType] || expectedDocsMap['unknown'];
  const existingDocs = new Set(details.docStatuses.filter(d => d.exists).map(d => d.doc_type));
  const presentCount = expectedDocs.filter((docType: string) => existingDocs.has(docType)).length;

  const docHealthTooltip = [
    `Repo Type: ${repoType}`,
    `Score: ${presentCount}/${expectedDocs.length} docs present = ${docHealth?.score}%`,
    '',
    'Expected Documents:',
    ...expectedDocs.map((docType: string) => {
      const doc = details.docStatuses.find((d) => d.doc_type === docType);
      const exists = doc && doc.exists;
      const healthState = doc?.health_state || (exists ? 'healthy' : 'missing');
      const status = exists ? (healthState === 'healthy' ? '✓' : healthState === 'dormant' ? '~' : '!') : '✗';
      return `  ${status} ${docType.toUpperCase()}: ${healthState}`;
    })
  ].join('\n');
  
  // Activity freshness calculation
  const getActivityColor = (dateString: string | null | undefined) => {
    if (!dateString) return 'bg-slate-700/50 text-slate-500';
    const date = new Date(dateString);
    const diffDays = Math.floor((now - date.getTime()) / 86400000);
    
    if (diffDays <= 7) return 'bg-green-500/20 text-green-400';
    if (diffDays <= 30) return 'bg-yellow-500/20 text-yellow-400';
    if (diffDays <= 90) return 'bg-orange-500/20 text-orange-400';
    return 'bg-red-500/20 text-red-400';
  };
  
  const formatActivityTime = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Never';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffHours < 1) return '< 1h';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 30) return `${diffDays}d`;
    if (diffMonths < 12) return `${diffMonths}mo`;
    return `${Math.floor(diffDays / 365)}y`;
  };

  return (
    <>
      <span
        title={csTooltip}
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
      <span
        title={bpTooltip}
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
        title={testingTooltip}
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
          testingCount === 3
            ? 'bg-blue-500/20 text-blue-400'
            : testingCount >= 2
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-red-500/20 text-red-400'
        }`}
      >
        {testingCount}/{testingTotal}
      </span>
      {repo.coverage_score != null && (
        <span
          title={`Test Coverage: ${repo.coverage_score}%`}
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
            repo.coverage_score >= 80
              ? 'bg-blue-500/20 text-blue-400'
              : repo.coverage_score >= 50
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {repo.coverage_score}%
        </span>
      )}
      {docHealth && (
        <span
          title={docHealthTooltip}
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
            docHealth.score === 100
              ? 'bg-slate-500/20 text-slate-400'
              : docHealth.score >= 50
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {docHealth.score}%
        </span>
      )}
      <span
        title={repo.last_commit_date ? `Last commit: ${repo.last_commit_date}` : 'No commits'}
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getActivityColor(repo.last_commit_date)}`}
      >
        {formatActivityTime(repo.last_commit_date)}
      </span>
    </>
  );
}

function DocStatusDisplay({
  repo,
  details,
  docHealth,
  repoName,
  lastSynced,
  fixingDoc,
  syncingRepo,
  isAuthenticated = true,
  onFixAllDocs,
  onSyncSingleRepo,
}: {
  repo: Repo;
  details: RepoDetails | undefined;
  docHealth: { score: number } | null;
  repoName: string;
  lastSynced: string | null;
  fixingDoc: boolean;
  syncingRepo: string | null;
  isAuthenticated?: boolean;
  onFixAllDocs: () => void;
  onSyncSingleRepo: () => void;
}) {
  // Calculate repo type within this component
  const repoType = repo.repo_type
    ? (repo.repo_type as RepoType)
    : detectRepoType(repo.name, repo.description, repo.language, repo.topics).type;
  
  // Calculate existingDocs set (must be before conditional return to satisfy hooks rules)
  const existingDocs = useMemo(
    () => details ? new Set(details.docStatuses.filter(d => d.exists).map(d => d.doc_type)) : new Set(),
    [details]
  );
  
  if (!details) {
    if (!isAuthenticated) {
      return (
        <span className="text-xs text-slate-400">{formatTimeAgo(lastSynced)}</span>
      );
    }
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
      roadmap: 'purple',
      tasks: 'blue',
      metrics: 'green',
      features: 'yellow',
      readme: 'cyan',
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
    
    // Build tooltip with health status
    const healthLabel = healthState.charAt(0).toUpperCase() + healthState.slice(1);
    const tooltip = `${docType.toUpperCase()}: ${healthLabel}`;
    
    return { exists, iconColor, title: tooltip };
  };

  const roadmap = getIconInfo('roadmap');
  const tasks = getIconInfo('tasks');
  const metrics = getIconInfo('metrics');
  const features = getIconInfo('features');
  const readme = getIconInfo('readme');

  const coreDocs = ['readme', 'roadmap', 'tasks', 'metrics', 'features'];
  const allDocsPresent = coreDocs.every((docType) =>
    details.docStatuses.find((d) => d.doc_type === docType && d.exists)
  );

  // Build doc health tooltip
  const expectedDocsMap: Record<string, string[]> = {
    'web-app': ['readme', 'features', 'roadmap', 'tasks', 'metrics'],
    'game': ['readme', 'features', 'roadmap', 'tasks', 'metrics'],
    'library': ['readme', 'features', 'changelog', 'metrics'],
    'tool': ['readme', 'features', 'roadmap', 'tasks', 'metrics'],
    'bot': ['readme', 'features', 'roadmap', 'tasks', 'metrics'],
    'research': ['readme', 'features', 'metrics'],
    'unknown': ['readme', 'features', 'roadmap', 'metrics']
  };
  const expectedDocs = expectedDocsMap[repoType] || expectedDocsMap['unknown'];
  const presentCount = expectedDocs.filter((docType: string) => existingDocs.has(docType)).length;

  const docHealthTooltip = [
    `Repo Type: ${repoType}`,
    `Score: ${presentCount}/${expectedDocs.length} docs present = ${docHealth?.score}%`,
    '',
    'Expected Documents:',
    ...expectedDocs.map((docType: string) => {
      const doc = details.docStatuses.find((d) => d.doc_type === docType);
      const exists = doc && doc.exists;
      const healthState = doc?.health_state || (exists ? 'healthy' : 'missing');
      const status = exists ? (healthState === 'healthy' ? '✓' : healthState === 'dormant' ? '~' : '!') : '✗';
      return `  ${status} ${docType.toUpperCase()}: ${healthState}`;
    })
  ].join('\n');

  return (
    <div className="flex items-center gap-2" title={docHealthTooltip}>
      <span title={readme.title}>
        <BookOpen className={`h-4 w-4 ${readme.exists ? readme.iconColor : 'opacity-20'}`} />
      </span>
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
      {isAuthenticated && !allDocsPresent && docHealth && docHealth.score < 100 && (
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
