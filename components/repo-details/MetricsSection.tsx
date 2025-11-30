"use client";

import { TrendingUp } from 'lucide-react';
import { Metric } from '@/types/repo';
import { useState } from 'react';

interface MetricsSectionProps {
  metrics: Metric[];
}

export function MetricsSection({ metrics }: MetricsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Filter out metrics that are shown in other sections
  const excludeKeywords = [
    'coverage',
    'last updated',
    'api routes',
    'database tables',
    'pr turnaround',
    'open prs',
    'outdated dependencies',
    'prettier violations',
    'typescript errors',
    'eslint warnings',
    'eslint errors',
    'health score',
    'lighthouse score',
    'lighthouse a11y score',
    'skipped tests',
    'test cases',
    'test files',
    'build time',
    'bundle size',
    'e2e tests',
    'utilities & effects',
    'shared systems',
    'shared ui components',
    'components',
    'logic',
    'total unit tests',
    'unit tests',
    'open issues',
    'critical issue',
    'high priority issue',
    'failed build',
    'community standards',
    'best practices',
    'testing & quality',
    'documentation health',
  ];

  const otherMetrics = metrics.filter((m) => {
    const lowerName = m.name.toLowerCase();
    return !excludeKeywords.some((keyword) => lowerName.includes(keyword));
  });

  if (otherMetrics.length === 0) return null;

  return (
    <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left hover:bg-slate-700/40 transition-colors border-b border-slate-700/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-slate-200">Metrics</h4>
          </div>
          <span className="text-slate-500 text-xs">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 py-3">
          <div className="space-y-2">
            {otherMetrics.map((metric, index) => (
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
