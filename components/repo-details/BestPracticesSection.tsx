"use client";

import { Shield, CheckCircle2, XCircle, Circle } from 'lucide-react';
import { BestPractice } from '@/types/repo';
import { getStatusColor } from '@/lib/expandable-row-utils';

interface BestPracticesSectionProps {
  bestPractices: BestPractice[];
  ciStatus?: string;
  ciLastRun?: string | null;
  ciWorkflowName?: string | null;
}

export function BestPracticesSection({
  bestPractices,
  ciStatus,
  ciLastRun,
  ciWorkflowName,
}: BestPracticesSectionProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-3 w-3 text-green-400" />;
      case 'dormant':
        return <Circle className="h-3 w-3 text-yellow-400" />;
      case 'malformed':
        return <XCircle className="h-3 w-3 text-orange-400" />;
      case 'missing':
        return <XCircle className="h-3 w-3 text-red-400" />;
      default:
        return <Circle className="h-3 w-3 text-slate-500" />;
    }
  };

  const getLabel = (type: string) => {
    return type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-slate-800/30 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-purple-400" />
        <span>Best Practices</span>
        <span className="text-xs text-slate-500 font-normal">({bestPractices.length})</span>
      </h4>

      {/* CI/CD Status Badge */}
      {ciStatus && ciStatus !== 'unknown' && (
        <div
          className={`mb-3 p-3 rounded-lg border ${
            ciStatus === 'passing'
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-lg ${ciStatus === 'passing' ? '✓' : '✗'}`}>
                {ciStatus === 'passing' ? '✓' : '✗'}
              </span>
              <div>
                <div
                  className={`text-sm font-semibold ${
                    ciStatus === 'passing' ? 'text-green-300' : 'text-red-300'
                  }`}
                >
                  CI/CD {ciStatus === 'passing' ? 'Passing' : 'Failing'}
                </div>
                {ciWorkflowName && (
                  <div className="text-xs text-slate-400 mt-0.5">{ciWorkflowName}</div>
                )}
              </div>
            </div>
            {ciLastRun && (
              <div className="text-xs text-slate-400">
                {new Date(ciLastRun).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}

      {bestPractices.length === 0 ? (
        <p className="text-xs text-slate-500 italic">No data available</p>
      ) : (
        <div className="space-y-2">
          {bestPractices.map((practice, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {getStatusIcon(practice.status)}
                <span className={getStatusColor(practice.status)}>
                  {getLabel(practice.practice_type)}
                </span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${getStatusColor(
                  practice.status
                )}`}
              >
                {practice.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
