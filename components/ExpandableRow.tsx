"use client";

import { useState } from 'react';
import { Task, RoadmapItem, DocStatus, Metric, Feature, BestPractice, CommunityStandard } from '@/types/repo';
import { RepositoryStatsSectionStatic } from './repo-details/RepositoryStatsSectionStatic';
import { TestingSection } from './repo-details/TestingSection';
import { MetricsSection } from './repo-details/MetricsSection';
import { IssuesSection } from './repo-details/IssuesSection';
import { AISummarySection } from './repo-details/AISummarySection';
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
  onGenerateSummary?: () => void;
  generatingSummary?: boolean;
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
  onGenerateSummary,
  generatingSummary = false,
}: ExpandableRowProps) {
  const [aiSummaryDismissed, setAiSummaryDismissed] = useState(false);
  const [aiSummaryKey, setAiSummaryKey] = useState(aiSummary);
  const [projectSectionsExpanded, setProjectSectionsExpanded] = useState(true);
  const [row2Expanded, setRow2Expanded] = useState(false); // Documentation, Best Practices, Testing
  const [row3Expanded, setRow3Expanded] = useState(false); // Standards, Metrics, Issues
  
  // Reset dismissed state when a new AI summary is generated
  if (aiSummary !== aiSummaryKey) {
    setAiSummaryDismissed(false);
    setAiSummaryKey(aiSummary);
  }
  
  const isSyncing = syncingRepo === repoNameForSync;
  const hasNoData = roadmapItems.length === 0 && tasks.length === 0 && features.length === 0;

  return (
    <div className="p-6 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-slate-950/80 border-t border-slate-700/50">
      {/* Main Layout: Repository Stats + Issues (left sidebar) + Content Grid (right) */}
      <div className="flex gap-6">
        {/* Left Sidebar: AI Summary + Repository Stats + Issues + Metrics */}
        <div className="w-96 shrink-0 space-y-6">
          {/* AI Summary - First in sidebar */}
          <AISummarySection
            aiSummary={aiSummaryDismissed ? undefined : aiSummary}
            repoName={repoName}
            isAuthenticated={isAuthenticated}
            generatingSummary={generatingSummary}
            onGenerateSummary={onGenerateSummary}
            onDismiss={() => setAiSummaryDismissed(true)}
          />
          
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
          {/* First Row: Features, Roadmap, Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Features */}
            <FeaturesSection 
              features={features}
              isExpanded={projectSectionsExpanded}
              onToggleExpanded={() => setProjectSectionsExpanded(!projectSectionsExpanded)}
            />

            {/* Roadmap */}
            <RoadmapSection 
              roadmapItems={roadmapItems}
              isExpanded={projectSectionsExpanded}
              onToggleExpanded={() => setProjectSectionsExpanded(!projectSectionsExpanded)}
            />

            {/* Tasks */}
            <TasksSection 
              tasks={tasks}
              isExpanded={projectSectionsExpanded}
              onToggleExpanded={() => setProjectSectionsExpanded(!projectSectionsExpanded)}
            />
          </div>

          {/* Second Row: Documentation, Best Practices, Testing */}
          <div className="grid grid-cols-3 gap-6">
            {/* Documentation Status */}
            <DocumentationSection 
              docStatuses={docStatuses} 
              readmeLastUpdated={readmeLastUpdated}
              repoName={repoName}
              isAuthenticated={isAuthenticated}
              onFixDoc={onFixDoc}
              onFixAllDocs={onFixAllDocs}
              isExpanded={row2Expanded}
              onToggleExpanded={() => setRow2Expanded(!row2Expanded)}
            />

            {/* Best Practices */}
            <BestPracticesSection
              bestPractices={bestPractices}
              repoName={repoName}
              isAuthenticated={isAuthenticated}
              onFixPractice={onFixPractice}
              onFixAllPractices={onFixAllPractices}
              isExpanded={row2Expanded}
              onToggleExpanded={() => setRow2Expanded(!row2Expanded)}
            />

            {/* Testing */}
            <TestingSection
              testingStatus={testingStatus}
              coverageScore={coverageScore}
              testCaseCount={testCaseCount}
              bestPractices={bestPractices}
              metrics={metrics}
              isExpanded={row2Expanded}
              onToggleExpanded={() => setRow2Expanded(!row2Expanded)}
            />
          </div>

          {/* Third Row: Standards, Metrics, Issues */}
          <div className="grid grid-cols-3 gap-6">
            {/* Community Standards */}
            <CommunityStandardsSection
              communityStandards={communityStandards}
              repoName={repoName}
              isAuthenticated={isAuthenticated}
              onFixStandard={onFixStandard}
              onFixAllStandards={onFixAllStandards}
              isExpanded={row3Expanded}
              onToggleExpanded={() => setRow3Expanded(!row3Expanded)}
            />

            {/* Metrics */}
            {metrics && metrics.length > 0 && (
              <MetricsSection 
                metrics={metrics}
                isExpanded={row3Expanded}
                onToggleExpanded={() => setRow3Expanded(!row3Expanded)}
              />
            )}

            {/* Issues */}
            <IssuesSection 
              metrics={metrics}
              isExpanded={row3Expanded}
              onToggleExpanded={() => setRow3Expanded(!row3Expanded)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
