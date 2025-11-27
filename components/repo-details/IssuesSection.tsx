"use client";

import { AlertCircle } from 'lucide-react';
import { Metric } from '@/types/repo';

interface IssuesSectionProps {
  metrics: Metric[];
}

export function IssuesSection({ metrics }: IssuesSectionProps) {
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
    <div className="bg-slate-800/30 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <span>Issues</span>
      </h4>
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
  );
}
