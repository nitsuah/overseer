"use client";

import { AlertCircle } from 'lucide-react';
import { Metric } from '@/types/repo';
import { useState } from 'react';

interface IssuesSectionProps {
  metrics: Metric[];
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export function IssuesSection({ metrics, isExpanded: isExpandedProp, onToggleExpanded }: IssuesSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = isExpandedProp !== undefined ? isExpandedProp : internalExpanded;
  const setIsExpanded = onToggleExpanded || (() => setInternalExpanded(!internalExpanded));
  
  // Filter issue-related metrics
  const issueMetrics = metrics.filter((m) => {
    const lowerName = m.name.toLowerCase();
    return (
      lowerName.includes('open issues') ||
      lowerName.includes('critical issue') ||
      lowerName.includes('high priority issue') ||
      lowerName.includes('failed build')
    );
  });

  if (issueMetrics.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-red-900/30 via-slate-800/50 to-red-800/20 rounded-lg overflow-hidden border border-red-500/40 shadow-lg shadow-red-500/10 hover:border-red-400/50 transition-colors">
      <div
        onClick={setIsExpanded}
        className="w-full px-4 py-3 hover:bg-red-900/20 transition-colors border-b border-red-500/20 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <h4 className="text-sm font-semibold text-slate-200">Issues</h4>
            <span className="text-slate-500 text-xs ml-2">{isExpanded ? '▼' : '▶'}</span>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 py-3">
          <div className="space-y-2">
            {issueMetrics.map((metric, index) => (
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
