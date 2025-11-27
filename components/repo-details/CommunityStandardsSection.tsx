"use client";

import { ShieldCheck, CheckCircle2, XCircle, Circle } from 'lucide-react';
import { CommunityStandard } from '@/types/repo';

interface CommunityStandardsSectionProps {
  communityStandards: CommunityStandard[];
  repoName?: string;
  isAuthenticated?: boolean;
  onFixStandard?: (repoName: string, standardType: string) => void;
  onFixAllStandards?: (repoName: string) => void;
}

export function CommunityStandardsSection({
  communityStandards,
  repoName,
  isAuthenticated = true,
  onFixStandard,
  onFixAllStandards,
}: CommunityStandardsSectionProps) {
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
    };
    return labels[type] || type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const missingWithTemplates = communityStandards.filter(
    (s) => s.status === 'missing' && [
      'code_of_conduct',
      'security',
      'license',
      'changelog',
      'issue_template',
      'pr_template',
      'codeowners',
      'copilot_instructions'
    ].includes(s.standard_type)
  );

  return (
    <div className="bg-slate-800/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-green-400" />
          <span>Community Standards</span>
          <span className="text-xs text-slate-500 font-normal">
            ({communityStandards.length})
          </span>
        </h4>
        {isAuthenticated && missingWithTemplates.length > 0 && onFixAllStandards && repoName && (
          <button
            onClick={() => onFixAllStandards(repoName)}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium transition-colors"
            title="Create PR for all missing community standards"
          >
            Fix All ({missingWithTemplates.length})
          </button>
        )}
      </div>
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
              'code_of_conduct',
              'security',
              'license',
              'changelog',
              'issue_template',
              'pr_template',
              'codeowners',
              'copilot_instructions'
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
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      standard.status === 'healthy'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {standard.status === 'healthy' ? 'Present' : 'Missing'}
                  </span>
                  {isAuthenticated && hasTemplate && isMissing && onFixStandard && repoName && (
                    <button
                      onClick={() => onFixStandard(repoName, standard.standard_type)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium transition-colors"
                      title={`Create PR for ${getLabel(standard.standard_type)}`}
                    >
                      Fix
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
