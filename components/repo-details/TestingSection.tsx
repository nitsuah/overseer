"use client";

import { Shield } from 'lucide-react';
import { BestPractice, Metric } from '@/types/repo';
import { useState } from 'react';

import { MAX_UNIT_LENGTH } from '../../lib/constants';

interface TestingSectionProps {
  testingStatus?: string;
  coverageScore?: number;
  testCaseCount?: number;
  bestPractices: BestPractice[];
  metrics?: Metric[];
}

export function TestingSection({
  testingStatus,
  coverageScore,
  testCaseCount,
  bestPractices,
  metrics = [],
}: TestingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const testingPractice = bestPractices.find((p) => p.practice_type === 'testing_framework');
  const testFileCount =
    testingPractice?.details &&
    typeof testingPractice.details.test_file_count === 'number'
      ? testingPractice.details.test_file_count
      : undefined;

  // Filter testing-related metrics
  const testingKeywords = [
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
  ];

  const testingMetrics = metrics.filter((m) => {
    const lowerName = m.name.toLowerCase();
    return testingKeywords.some((keyword) => lowerName.includes(keyword));
  });

  // Helper to format metric display value
  const formatMetricValue = (metric: Metric) => {
    // If unit is already included or is a long description, just show the value
    if (!metric.unit || metric.unit.length > MAX_UNIT_LENGTH) {
      return `${metric.value}`;
    }
    
    // Add space between value and unit for readability
    return `${metric.value}${metric.unit}`;
  };

  // Helper to get detail text (unit column when it's descriptive)
  const getMetricDetail = (metric: Metric) => {
    // If unit is long (like a note/description), return it as detail text
    if (metric.unit && metric.unit.length > MAX_UNIT_LENGTH) {
      return metric.unit;
    }
    return null;
  };

  return (
    <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left hover:bg-slate-700/40 transition-colors border-b border-slate-700/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-400" />
            <h4 className="text-sm font-semibold text-slate-200">Testing</h4>
          </div>
          <span className="text-slate-500 text-xs">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 py-3">
          <div className="space-y-3">
        {testingStatus && (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span className="text-slate-200 font-medium capitalize">{testingStatus}</span>
            </div>

            {/* Test File Count */}
            {typeof testFileCount === 'number' && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-300">Test Files</span>
                  <span className="text-2xl font-bold text-blue-400">{testFileCount}</span>
                </div>
              </div>
            )}

            {/* Test Case Count */}
            {testCaseCount !== undefined && testCaseCount > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-300">Test Cases</span>
                  <span className="text-2xl font-bold text-blue-400">{testCaseCount}</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Coverage Score */}
        {coverageScore !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-slate-400">Coverage</span>
              <span className="text-sm font-bold text-blue-400">{coverageScore}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-linear-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(coverageScore, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Additional Testing Metrics from METRICS.md */}
        {testingMetrics.map((metric, index) => {
          const detail = getMetricDetail(metric);
          return (
            <div key={`${metric.name}-${index}`} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{metric.name}</span>
                <span className="text-slate-200 font-medium">
                  {formatMetricValue(metric)}
                </span>
              </div>
              {detail && (
                <div className="text-[10px] text-slate-500 italic pl-2">
                  {detail}
                </div>
              )}
            </div>
          );
        })}
          </div>
        </div>
      )}
    </div>
  );
}
