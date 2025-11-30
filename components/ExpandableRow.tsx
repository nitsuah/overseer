"use client";

import { X, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Task, RoadmapItem, DocStatus, Metric, Feature, BestPractice, CommunityStandard } from '@/types/repo';
import { RepositoryStatsSectionStatic } from './repo-details/RepositoryStatsSectionStatic';
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
  isAuthenticated?: boolean;
  onFixStandard?: (repoName: string, standardType: string) => void;
  onFixAllStandards?: (repoName: string) => void;
  onFixDoc?: (repoName: string, docType: string) => void;
  onFixAllDocs?: (repoName: string) => void;
  onFixPractice?: (repoName: string, practiceType: string) => void;
  onFixAllPractices?: (repoName: string) => void;
  totalLoc?: number;
  locLanguageBreakdown?: Record<string, number>;
  testCaseCount?: number;
  vulnAlertCount?: number;
  vulnCriticalCount?: number;
  vulnHighCount?: number;
  contributorCount?: number;
  commitFrequency?: number;
  busFactor?: number;
  avgPrMergeTimeHours?: number;
  onSyncSingleRepo?: () => void;
  syncingRepo?: string | null;
  repoNameForSync?: string;
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
  isAuthenticated = true,
  onFixStandard,
  onFixAllStandards,
  onFixDoc,
  onFixAllDocs,
  onFixPractice,
  onFixAllPractices,
  totalLoc,
  locLanguageBreakdown,
  testCaseCount,
  vulnAlertCount,
  vulnCriticalCount,
  vulnHighCount,
  contributorCount,
  commitFrequency,
  busFactor,
  avgPrMergeTimeHours,
  onSyncSingleRepo,
  syncingRepo,
  repoNameForSync,
}: ExpandableRowProps) {
  const [aiSummaryDismissed, setAiSummaryDismissed] = useState(false);
  
  const isSyncing = syncingRepo === repoNameForSync;
  const hasNoData = roadmapItems.length === 0 && tasks.length === 0 && features.length === 0;

  return (
    <div className="p-6">
      {/* Main Layout: Repository Stats (left sidebar) + Content Grid (right) */}
      <div className="flex gap-6">
        {/* Left Sidebar: Repository Stats - Always Visible */}
        <div className="w-64 shrink-0">
          <RepositoryStatsSectionStatic
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
            onSyncSingleRepo={onSyncSingleRepo}
            isSyncing={isSyncing}
            isAuthenticated={isAuthenticated}
            hasNoData={hasNoData}
          />
        </div>

        {/* Right Content Grid */}
        <div className="flex-1 space-y-6">
          {/* First Row: Roadmap, Tasks, Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Roadmap */}
            <RoadmapSection roadmapItems={roadmapItems} />

            {/* Tasks */}
            <TasksSection tasks={tasks} />

            {/* Features */}
            <FeaturesSection features={features} />
          </div>

          {/* Second Row: Documentation, Community Standards, Best Practices, Testing, Issues */}
          <div className="grid grid-cols-5 gap-4">
            {/* Documentation Status */}
            <DocumentationSection 
              docStatuses={docStatuses} 
              readmeLastUpdated={readmeLastUpdated}
              repoName={repoName}
              isAuthenticated={isAuthenticated}
              onFixDoc={onFixDoc}
              onFixAllDocs={onFixAllDocs}
            />

            {/* Community Standards */}
            <CommunityStandardsSection
              communityStandards={communityStandards}
              repoName={repoName}
              isAuthenticated={isAuthenticated}
              onFixStandard={onFixStandard}
              onFixAllStandards={onFixAllStandards}
            />

            {/* Best Practices */}
            <BestPracticesSection
              bestPractices={bestPractices}
              repoName={repoName}
              isAuthenticated={isAuthenticated}
              onFixPractice={onFixPractice}
              onFixAllPractices={onFixAllPractices}
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
          </div>

          {/* Third Row: Metrics + AI Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Metrics */}
            {metrics && metrics.length > 0 && (
              <MetricsSection metrics={metrics} />
            )}

            {/* AI Summary */}
            {aiSummary && 
             aiSummary.trim() &&
             !aiSummary.startsWith('Summary unavailable') &&
             !aiSummaryDismissed && (
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-5 relative">
                <button
                  onClick={() => setAiSummaryDismissed(true)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Dismiss AI summary"
                >
                  <X className="h-4 w-4" />
                </button>
                <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <span>AI Summary</span>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed pr-6">{aiSummary}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
