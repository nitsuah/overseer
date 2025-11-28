"use client";

import { Shield } from 'lucide-react';
import { BestPractice, Metric } from '@/types/repo';

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
    if (!metric.unit || metric.unit.length > 10) {
      return `${metric.value}`;
    }
    
    // Add space between value and unit for readability
    return `${metric.value}${metric.unit}`;
  };

  // Helper to get detail text (unit column when it's descriptive)
  const getMetricDetail = (metric: Metric) => {
    // If unit is long (like a note/description), return it as detail text
    if (metric.unit && metric.unit.length > 10) {
      return metric.unit;
    }
    return null;
  };

  return (
    <div className="bg-slate-800/30 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-blue-400" />
        <span>Testing</span>
      </h4>
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
  );
}
