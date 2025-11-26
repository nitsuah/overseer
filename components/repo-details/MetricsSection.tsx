"use client";

import { TrendingUp } from 'lucide-react';
import { Metric } from '@/types/repo';

interface MetricsSectionProps {
  metrics: Metric[];
}

export function MetricsSection({ metrics }: MetricsSectionProps) {
  // Filter out coverage metrics (shown in Testing section)
  const otherMetrics = metrics.filter((m) => !m.name.toLowerCase().includes('coverage'));

  if (otherMetrics.length === 0) return null;

  return (
    <div className="bg-slate-800/30 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4" />
        <span>Metrics</span>
      </h4>
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
  );
}
