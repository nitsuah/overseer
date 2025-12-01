"use client";

import { ShieldCheck, CheckCircle2, XCircle, Circle } from 'lucide-react';
import { CommunityStandard } from '@/types/repo';
import { useState } from 'react';

interface CommunityStandardsSectionProps {
  communityStandards: CommunityStandard[];
  repoName?: string;
  isAuthenticated?: boolean;
  onFixStandard?: (repoName: string, standardType: string) => void;
  onFixAllStandards?: (repoName: string) => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export function CommunityStandardsSection({
  communityStandards,
  repoName,
  isAuthenticated = true,
  onFixStandard,
  onFixAllStandards,
  isExpanded: isExpandedProp,
  onToggleExpanded,
}: CommunityStandardsSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = isExpandedProp !== undefined ? isExpandedProp : internalExpanded;
  const setIsExpanded = onToggleExpanded || (() => setInternalExpanded(!internalExpanded));
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-3 w-3 text-green-400" />;
      case 'missing':
        return <XCircle className="h-3 w-3 text-red-400" />;
      default:
        return <Circle className="h-3 w-3 text-slate-500" />;
    }
  };

  const getLabel = (type: string) => {
    // Use explicit filenames for community standards
    const labels: Record<string, string> = {
      'contributing': 'CONTRIBUTING',
      'security': 'SECURITY',
      'license': 'LICENSE',
      'changelog': 'CHANGELOG',
      'code_of_conduct': 'Code of Conduct',
      'issue_template': 'Issue Template',
      'pr_template': 'PR Template',
      'codeowners': 'CODEOWNERS',
      'copilot_instructions': 'COPILOT',
      'funding': 'FUNDING',
    };
    return labels[type] || type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const missingWithTemplates = communityStandards.filter(
    (s) => s.status === 'missing' && [
      'contributing',
      'code_of_conduct',
      'security',
      'license',
      'changelog',
      'issue_template',
      'pr_template',
      'codeowners',
      'copilot_instructions',
      'funding'
    ].includes(s.standard_type)
  );

  return (
    <div className="bg-gradient-to-br from-green-900/30 via-slate-800/50 to-green-800/20 rounded-lg overflow-hidden border border-green-500/40 shadow-lg shadow-green-500/10 hover:border-green-400/50 transition-colors">
      <div
        className="w-full px-4 py-3 hover:bg-green-900/20 transition-colors border-b border-green-500/20 cursor-pointer"
        onClick={setIsExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-400" />
            <h4 className="text-sm font-semibold text-slate-200">Community Standards</h4>
            <span
              title={`Community Standards: ${communityStandards.filter(s => s.status === 'healthy').length}/${communityStandards.length} healthy`}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ml-1 ${
                communityStandards.filter(s => s.status === 'healthy').length / communityStandards.length >= 0.7
                  ? 'bg-green-500/20 text-green-400'
                  : communityStandards.filter(s => s.status === 'healthy').length / communityStandards.length >= 0.4
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {communityStandards.filter(s => s.status === 'healthy').length}/{communityStandards.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && missingWithTemplates.length > 0 && onFixAllStandards && repoName && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFixAllStandards(repoName);
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium transition-colors"
                title="Fix all missing community standards"
              >
                Fix All ({missingWithTemplates.length})
              </button>
            )}
            <span className="text-slate-500 text-xs">{isExpanded ? '▼' : '▶'}</span>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 py-3">
          {communityStandards.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No data available</p>
          ) : (
            <div className="space-y-2">
          {communityStandards
            .sort((a, b) => {
              // Define custom order
              const order = [
                'contributing',
                'changelog',
                'codeowners',
                'security',
                'copilot_instructions',
                'funding',
                'license',
                'issue_template',
                'pr_template',
                'code_of_conduct'
              ];
              const aIndex = order.indexOf(a.standard_type);
              const bIndex = order.indexOf(b.standard_type);
              // If not in order array, put at end
              const aPos = aIndex === -1 ? 999 : aIndex;
              const bPos = bIndex === -1 ? 999 : bIndex;
              return aPos - bPos;
            })
            .map((standard, i) => {
            const hasTemplate = [
              'contributing',
              'code_of_conduct',
              'security',
              'license',
              'changelog',
              'issue_template',
              'pr_template',
              'codeowners',
              'copilot_instructions',
              'funding'
            ].includes(standard.standard_type);
            const isMissing = standard.status === 'missing';

            return (
              <div key={i} className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 flex-1">
                  {getStatusIcon(standard.status)}
                  <span
                    className={
                      standard.status === 'healthy' ? 'text-slate-300' : 'text-slate-500'
                    }
                  >
                    {getLabel(standard.standard_type)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isAuthenticated && hasTemplate && isMissing && onFixStandard && repoName && (
                    <button
                      onClick={() => onFixStandard(repoName, standard.standard_type)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium transition-colors"
                      title={`Create PR for ${getLabel(standard.standard_type)}`}
                    >
                      Fix
                    </button>
                  )}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      standard.status === 'healthy'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {standard.status === 'healthy' ? 'Present' : 'Missing'}
                  </span>
                </div>
              </div>
            );
            })}
        </div>
      )}
        </div>
      )}
    </div>
  );
}