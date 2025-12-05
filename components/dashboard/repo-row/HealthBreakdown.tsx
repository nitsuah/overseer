// Health breakdown popup component showing detailed score breakdown

import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, FlaskConical, Shield, Clock } from 'lucide-react';
import { Repo, RepoDetails } from '@/types/repo';
import { detectRepoType, RepoType } from '@/lib/repo-type';
import { calculateDocHealth } from '@/lib/doc-health';

interface HealthBreakdownProps {
  repo: Repo;
  details: RepoDetails;
  health: { grade: string; color: string };
  expanded: boolean;
  onToggle: () => void;
}

export function HealthBreakdown({ repo, details, health, expanded, onToggle }: HealthBreakdownProps) {
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
      { label: 'Community', score: csScore, color: 'green', weight: '10%' },
      { label: 'Best Practices', score: bpScore, color: 'purple', weight: '25%' },
      { label: 'Testing', score: testScore, color: 'blue', weight: '25%' },
      { label: 'Documentation', score: docScore, color: 'slate', weight: '20%' },
      { label: 'Activity', score: activityScore, color: activityColor, weight: '10%' },
 
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
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`text-lg font-bold ${health.color} cursor-pointer hover:opacity-80 transition-opacity`}
        title="Click to toggle health details"
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
