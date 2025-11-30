"use client";

import { AlertCircle } from 'lucide-react';
import { Metric } from '@/types/repo';
import { useState } from 'react';

interface IssuesSectionProps {
  metrics: Metric[];
}

export function IssuesSection({ metrics }: IssuesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
    <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 hover:bg-slate-700/40 transition-colors border-b border-slate-700/30 cursor-pointer"
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
