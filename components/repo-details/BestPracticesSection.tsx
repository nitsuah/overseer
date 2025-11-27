"use client";

import { Shield, CheckCircle2, XCircle, Circle } from 'lucide-react';
import { BestPractice } from '@/types/repo';
import { getStatusColor } from '@/lib/expandable-row-utils';

interface BestPracticesSectionProps {
  bestPractices: BestPractice[];
  repoName?: string;
  isAuthenticated?: boolean;
  onFixPractice?: (repoName: string, practiceType: string) => void;
  onFixAllPractices?: (repoName: string) => void;
}

export function BestPracticesSection({
  bestPractices,
  repoName,
  isAuthenticated = true,
  onFixPractice,
  onFixAllPractices,
}: BestPracticesSectionProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-3 w-3 text-green-400" />;
      case 'dormant':
        return <Circle className="h-3 w-3 text-yellow-400 fill-yellow-400" />;
      case 'malformed':
        return <XCircle className="h-3 w-3 text-orange-400" />;
      case 'missing':
        return <XCircle className="h-3 w-3 text-red-400" />;
      default:
        return <Circle className="h-3 w-3 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">Healthy</span>;
      case 'dormant':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">Dormant</span>;
      case 'malformed':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">Malformed</span>;
      case 'missing':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">Missing</span>;
      default:
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-500">Unknown</span>;
    }
  };

  const getLabel = (type: string) => {
    return type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // Calculate fixable missing practices
  const fixablePractices = ['dependabot', 'env_template', 'docker', 'netlify_badge'];
  const missingFixable = bestPractices.filter(
    (p) => p.status === 'missing' && fixablePractices.includes(p.practice_type)
  );

  return (
    <div className="bg-slate-800/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-400" />
          <span>Best Practices</span>
          <span className="text-xs text-slate-500 font-normal">({bestPractices.length})</span>
        </h4>
        {isAuthenticated && missingFixable.length > 0 && onFixAllPractices && repoName && (
          <button
            onClick={() => onFixAllPractices(repoName)}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium transition-colors"
            title="Create PRs for all fixable missing practices"
          >
            Fix All ({missingFixable.length})
          </button>
        )}
      </div>

      {bestPractices.length === 0 ? (
        <p className="text-xs text-slate-500 italic">No data available</p>
      ) : (
        <div className="space-y-2">
          {bestPractices
            .sort((a, b) => {
              // Define custom order
              const order = [
                'branch_protection',
                'ci_cd',
                'gitignore',
                'pre_commit_hooks',
                'env_template',
                'dependabot',
                'testing_framework',
                'linting',
                'docker'
              ];
              const aIndex = order.indexOf(a.practice_type);
              const bIndex = order.indexOf(b.practice_type);
              const aPos = aIndex === -1 ? 999 : aIndex;
              const bPos = bIndex === -1 ? 999 : bIndex;
              return aPos - bPos;
            })
            .map((practice, i) => {
            // Determine if this practice can be auto-fixed
            const fixablePractices = ['dependabot', 'env_template', 'docker', 'netlify_badge'];
            const canFix = fixablePractices.includes(practice.practice_type);
            const isMissing = practice.status === 'missing';

            return (
              <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {getStatusIcon(practice.status)}
                <span className={getStatusColor(practice.status)}>
                  {getLabel(practice.practice_type)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isAuthenticated && canFix && isMissing && onFixPractice && repoName && (
                  <button
                    onClick={() => onFixPractice(repoName, practice.practice_type)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium transition-colors"
                    title={`Create PR for ${getLabel(practice.practice_type)}`}
                  >
                    Fix
                  </button>
                )}
                {getStatusBadge(practice.status)}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
