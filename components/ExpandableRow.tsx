"use client";

import { X } from 'lucide-react';
import { useState } from 'react';
import { Task, RoadmapItem, DocStatus, Metric, Feature, BestPractice, CommunityStandard } from '@/types/repo';
import { RepositoryStatsSection } from './repo-details/RepositoryStatsSection';
import { TestingSection } from './repo-details/TestingSection';
import { MetricsSection } from './repo-details/MetricsSection';
import { IssuesSection } from './repo-details/IssuesSection';
import { DocumentationSection } from './repo-details/DocumentationSection';
import { BestPracticesSection } from './repo-details/BestPracticesSection';
import { CommunityStandardsSection } from './repo-details/CommunityStandardsSection';
import { RoadmapSection } from './repo-details/RoadmapSection';
import { TasksSection } from './repo-details/TasksSection';
import { FeaturesSection } from './repo-details/FeaturesSection';

interface ExpandableRowProps {
  tasks: Task[];
  roadmapItems: RoadmapItem[];
  docStatuses: DocStatus[];
  metrics?: Metric[];
  features?: Feature[];
  bestPractices?: BestPractice[];
  communityStandards?: CommunityStandard[];
  aiSummary?: string;
  stars?: number;
  forks?: number;
  branches?: number;
  testingStatus?: string;
  coverageScore?: number;
  readmeLastUpdated?: string | null;
  repoName?: string;
  onFixStandard?: (repoName: string, standardType: string) => void;
  onFixAllStandards?: (repoName: string) => void;
  totalLoc?: number;
  locLanguageBreakdown?: Record<string, number>;
  testCaseCount?: number;
  ciStatus?: string;
  ciLastRun?: string | null;
  ciWorkflowName?: string | null;
  vulnAlertCount?: number;
  vulnCriticalCount?: number;
  vulnHighCount?: number;
  contributorCount?: number;
  commitFrequency?: number;
  busFactor?: number;
  avgPrMergeTimeHours?: number;
}

export default function ExpandableRow({
  tasks,
  roadmapItems,
  docStatuses,
  metrics = [],
  features = [],
  bestPractices = [],
  communityStandards = [],
  aiSummary,
  stars,
  forks,
  branches,
  testingStatus,
  coverageScore,
  readmeLastUpdated,
  repoName,
  onFixStandard,
  onFixAllStandards,
  totalLoc,
  locLanguageBreakdown,
  testCaseCount,
  ciStatus,
  ciLastRun,
  ciWorkflowName,
  vulnAlertCount,
  vulnCriticalCount,
  vulnHighCount,
  contributorCount,
  commitFrequency,
  busFactor,
  avgPrMergeTimeHours,
}: ExpandableRowProps) {
  const [aiSummaryDismissed, setAiSummaryDismissed] = useState(false);

  return (
    <div className="p-6">
      {/* AI Summary */}
      {aiSummary && 
       aiSummary.trim() && 
       !aiSummary.includes('unavailable') &&
       !aiSummary.includes('Service Error') &&
       !aiSummaryDismissed && (
        <div className="mb-6 bg-linear-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4 relative">
          <button
            onClick={() => setAiSummaryDismissed(true)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 transition-colors"
            title="Dismiss AI summary"
          >
            <X className="h-4 w-4" />
          </button>
          <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <span>AI Summary</span>
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed pr-6">{aiSummary}</p>
        </div>
      )}

      {/* First Row: Roadmap, Tasks, Features + Repo Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Roadmap, Tasks, Features (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Roadmap */}
            <RoadmapSection roadmapItems={roadmapItems} />

            {/* Tasks */}
            <TasksSection tasks={tasks} />

            {/* Features */}
            <FeaturesSection features={features} />
          </div>
        </div>

        {/* Right Column: Repository Stats (3 cols) */}
        <div className="lg:col-span-3">
          <RepositoryStatsSection
            stars={stars}
            forks={forks}
            branches={branches}
            totalLoc={totalLoc}
            locLanguageBreakdown={locLanguageBreakdown}
            vulnAlertCount={vulnAlertCount}
            vulnCriticalCount={vulnCriticalCount}
            vulnHighCount={vulnHighCount}
            contributorCount={contributorCount}
            commitFrequency={commitFrequency}
            busFactor={busFactor}
            avgPrMergeTimeHours={avgPrMergeTimeHours}
            metrics={metrics}
          />
        </div>
      </div>

      {/* Second Row: Documentation, Community Standards, Best Practices, Testing, Issues, Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Documentation Status */}
        <DocumentationSection docStatuses={docStatuses} readmeLastUpdated={readmeLastUpdated} />

        {/* Community Standards */}
        <CommunityStandardsSection
          communityStandards={communityStandards}
          repoName={repoName}
          onFixStandard={onFixStandard}
          onFixAllStandards={onFixAllStandards}
        />

        {/* Best Practices */}
        <BestPracticesSection
          bestPractices={bestPractices}
          ciStatus={ciStatus}
          ciLastRun={ciLastRun}
          ciWorkflowName={ciWorkflowName}
        />

        {/* Testing */}
        <TestingSection
          testingStatus={testingStatus}
          coverageScore={coverageScore}
          testCaseCount={testCaseCount}
          bestPractices={bestPractices}
          metrics={metrics}
        />

        {/* Issues */}
        <IssuesSection metrics={metrics} />

        {/* Metrics */}
        <MetricsSection metrics={metrics} />
      </div>
    </div>
  );
}
