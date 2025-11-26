"use client";

import { CheckCircle2, XCircle, Clock, Circle, TrendingUp, Shield, ShieldCheck, Map, ListTodo, X } from 'lucide-react';
import { useState } from 'react';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    section: string | null;
    subsection?: string | null;
}

interface RoadmapItem {
    id: string;
    title: string;
    quarter: string | null;
    status: 'planned' | 'in-progress' | 'completed';
}

interface DocStatus {
    doc_type: string;
    exists: boolean;
}

interface Metric {
    name: string;
    value: number;
    unit: string | null;
}

interface Feature {
    id: string;
    category: string;
    title: string;
    description: string;
    items: string[];
}

interface BestPractice {
    practice_type: string;
    status: string;
    details: Record<string, unknown>;
}

interface CommunityStandard {
    standard_type: string;
    status: string;
    details: Record<string, unknown>;
}

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
    testDescribeCount?: number;
    ciStatus?: string;
    ciLastRun?: string | null;
    ciWorkflowName?: string | null;
    vulnAlertCount?: number;
    vulnCriticalCount?: number;
    vulnHighCount?: number;
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
    testDescribeCount,
    ciStatus,
    ciLastRun,
    ciWorkflowName,
    vulnAlertCount,
    vulnCriticalCount,
    vulnHighCount,
}: ExpandableRowProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [aiSummaryDismissed, setAiSummaryDismissed] = useState(false);

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const tasksByStatus = {
        'in-progress': tasks.filter((t) => t.status === 'in-progress'),
        todo: tasks.filter((t) => t.status === 'todo'),
        done: tasks.filter((t) => t.status === 'done'),
    };

    const roadmapByStatus = {
        'in-progress': roadmapItems.filter((r) => r.status === 'in-progress'),
        planned: roadmapItems.filter((r) => r.status === 'planned'),
        completed: roadmapItems.filter((r) => r.status === 'completed'),
    };

    // Group roadmap items by quarter within each status
    const groupByQuarter = (items: RoadmapItem[]) => {
        const grouped: Record<string, RoadmapItem[]> = {};
        items.forEach((item) => {
            const quarter = item.quarter || 'Other';
            if (!grouped[quarter]) {
                grouped[quarter] = [];
            }
            grouped[quarter].push(item);
        });
        return grouped;
    };

    // Group tasks by subsection
    const groupBySubsection = (items: Task[]) => {
        const grouped: Record<string, Task[]> = {};
        items.forEach((item) => {
            const subsection = item.subsection || 'Other';
            if (!grouped[subsection]) {
                grouped[subsection] = [];
            }
            grouped[subsection].push(item);
        });
        return grouped;
    };

    // Helper to limit items unless expanded
    const getDisplayedItems = <T,>(items: T[], section: string, limit: number = 5): T[] => {
        return expandedSections.has(section) ? items : items.slice(0, limit);
    };

    return (
        <div className="px-6 py-6 bg-slate-900/50 border-t border-slate-800">
            {/* AI Summary Section */}
            {aiSummary && !aiSummaryDismissed && (
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

            {/* First Row: Tasks, Roadmap, Features + Repo Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Tasks, Roadmap, Features (9 cols) */}
                <div className="lg:col-span-9 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Roadmap */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                <Map className="h-4 w-4 text-blue-400" />
                                <span>Roadmap</span>
                                <span className="text-xs text-slate-500 font-normal">({roadmapItems.length} items)</span>
                            </h4>
                            {roadmapItems.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No roadmap items</p>
                            ) : (
                                <div className="space-y-4">
                                    {/* In Progress */}
                                    {roadmapByStatus['in-progress'].length > 0 && (
                                        <div className="bg-slate-800/30 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Clock className="h-3 w-3 text-blue-400" />
                                                <h5 className="text-xs font-medium text-blue-400">In Progress ({roadmapByStatus['in-progress'].length})</h5>
                                            </div>
                                            {Object.entries(groupByQuarter(roadmapByStatus['in-progress'])).map(([quarter, items]) => (
                                                <div key={quarter} className="mb-4 last:mb-0">
                                                    <h6 className="text-[10px] font-semibold text-slate-400 uppercase mb-2">{quarter}</h6>
                                                    <ul className="space-y-2">
                                                        {items.map((item, i) => (
                                                            <li key={i} className="text-xs text-slate-300">
                                                                <div className="flex items-start gap-2">
                                                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                                                                    <span className="font-medium">{item.title}</span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Planned */}
                                    <div className="bg-slate-800/30 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Circle className="h-3 w-3 text-slate-500" />
                                            <h5 className="text-xs font-medium text-slate-300">Planned ({roadmapByStatus.planned.length})</h5>
                                        </div>
                                        {Object.entries(groupByQuarter(getDisplayedItems(roadmapByStatus.planned, 'planned'))).map(([quarter, items]) => (
                                            <div key={quarter} className="mb-4 last:mb-0">
                                                <h6 className="text-[10px] font-semibold text-slate-400 uppercase mb-2">{quarter}</h6>
                                                <ul className="space-y-2">
                                                    {items.map((item, i) => (
                                                        <li key={i} className="text-xs text-slate-400">
                                                            <div className="flex items-start gap-2">
                                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-600 shrink-0" />
                                                                <span className="font-medium">{item.title}</span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                        {roadmapByStatus.planned.length > 5 && (
                                            <button
                                                onClick={() => toggleSection('planned')}
                                                className="text-[10px] text-blue-400 hover:text-blue-300 mt-2 pl-3"
                                            >
                                                {expandedSections.has('planned')
                                                    ? 'Show less'
                                                    : `+${roadmapByStatus.planned.length - 5} more`}
                                            </button>
                                        )}
                                    </div>

                                    {/* Completed */}
                                    {roadmapByStatus.completed.length > 0 && (
                                        <div className="bg-slate-800/30 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                <h5 className="text-xs font-medium text-slate-300">Completed ({roadmapByStatus.completed.length})</h5>
                                            </div>
                                            <ul className="space-y-2">
                                                {getDisplayedItems(roadmapByStatus.completed, 'completed', 3).map((item, i) => (
                                                    <li key={i} className="text-xs text-slate-500 line-through">
                                                        <div className="flex items-start gap-2">
                                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-700 shrink-0" />
                                                            <span className="font-medium">{item.title}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            {roadmapByStatus.completed.length > 3 && (
                                                <button
                                                    onClick={() => toggleSection('completed')}
                                                    className="text-[10px] text-blue-400 hover:text-blue-300 mt-2 pl-3"
                                                >
                                                    {expandedSections.has('completed')
                                                        ? 'Show less'
                                                        : `+${roadmapByStatus.completed.length - 3} more`}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Tasks */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                <ListTodo className="h-4 w-4 text-purple-400" />
                                <span>Tasks</span>
                                <span className="text-xs text-slate-500 font-normal">({tasks.length} total)</span>
                            </h4>
                            {tasks.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No tasks defined</p>
                            ) : (
                                <div className="space-y-4">
                                    {/* In Progress */}
                                    {tasksByStatus['in-progress'].length > 0 && (
                                        <div className="bg-slate-800/30 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Clock className="h-3 w-3 text-yellow-500" />
                                                <h5 className="text-xs font-medium text-yellow-500">In Progress ({tasksByStatus['in-progress'].length})</h5>
                                            </div>
                                            <ul className="space-y-2">
                                                {tasksByStatus['in-progress'].map((task, i) => (
                                                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-yellow-500 shrink-0" />
                                                        <span>{task.title}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Backlog */}
                                    <div className="bg-slate-800/30 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Circle className="h-3 w-3 text-slate-500" />
                                            <h5 className="text-xs font-medium text-slate-300">Backlog ({tasksByStatus.todo.length})</h5>
                                        </div>
                                        {Object.entries(groupBySubsection(getDisplayedItems(tasksByStatus.todo, 'backlog'))).map(([subsection, items]) => (
                                            <div key={subsection} className="mb-4 last:mb-0">
                                                {subsection !== 'Other' && (
                                                    <h6 className="text-[10px] font-semibold text-slate-400 uppercase mb-2">{subsection}</h6>
                                                )}
                                                <ul className="space-y-2">
                                                    {items.map((task, i) => (
                                                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-600 shrink-0" />
                                                            <span>{task.title}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                        {tasksByStatus.todo.length > 5 && (
                                            <button
                                                onClick={() => toggleSection('backlog')}
                                                className="text-[10px] text-blue-400 hover:text-blue-300 mt-2 pl-3"
                                            >
                                                {expandedSections.has('backlog')
                                                    ? 'Show less'
                                                    : `+${tasksByStatus.todo.length - 5} more`}
                                            </button>
                                        )}
                                    </div>

                                    {/* Done */}
                                    {tasksByStatus.done.length > 0 && (
                                        <div className="bg-slate-800/30 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                <h5 className="text-xs font-medium text-slate-300">Done ({tasksByStatus.done.length})</h5>
                                            </div>
                                            <ul className="space-y-2">
                                                {getDisplayedItems(tasksByStatus.done, 'done', 3).map((task, i) => (
                                                    <li key={i} className="text-xs text-slate-500 line-through flex items-start gap-2">
                                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-700 shrink-0" />
                                                        <span>{task.title}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            {tasksByStatus.done.length > 3 && (
                                                <button
                                                    onClick={() => toggleSection('done')}
                                                    className="text-[10px] text-blue-400 hover:text-blue-300 mt-2 pl-3"
                                                >
                                                    {expandedSections.has('done')
                                                        ? 'Show less'
                                                        : `+${tasksByStatus.done.length - 3} more`}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                <span className="text-lg">✨</span>
                                <span>Features</span>
                                <span className="text-xs text-slate-500 font-normal">({features.length} categories)</span>
                            </h4>
                            {features.length === 0 ? (
                                <div className="bg-slate-800/30 rounded-lg p-4">
                                    <p className="text-xs text-slate-500 italic">No features documented</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {getDisplayedItems(features, 'features', 3).map((feature, i) => (
                                        <div key={i} className="bg-slate-800/30 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-medium text-blue-400">{feature.category}</span>
                                            </div>
                                            {feature.description && (
                                                <p className="text-[10px] text-slate-400 mb-2">{feature.description}</p>
                                            )}
                                            <ul className="space-y-1">
                                                {(expandedSections.has(`feature-${i}`) ? feature.items : feature.items.slice(0, 3)).map((item, j) => (
                                                    <li key={j} className="text-xs text-slate-300 flex items-start gap-2">
                                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                                {feature.items.length > 3 && (
                                                    <button
                                                        onClick={() => toggleSection(`feature-${i}`)}
                                                        className="text-[10px] text-blue-400 hover:text-blue-300 pl-3"
                                                    >
                                                        {expandedSections.has(`feature-${i}`)
                                                            ? 'Show less'
                                                            : `+${feature.items.length - 3} more items`}
                                                    </button>
                                                )}
                                            </ul>
                                        </div>
                                    ))}
                                    {features.length > 3 && (
                                        <button
                                            onClick={() => toggleSection('features')}
                                            className="text-[10px] text-blue-400 hover:text-blue-300 pl-3"
                                        >
                                            {expandedSections.has('features')
                                                ? 'Show less'
                                                : `+${features.length - 3} more categories`}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Repository Stats & Testing/Metrics (3 cols) */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Repository Stats */}
                    {(stars !== undefined || forks !== undefined || branches !== undefined || totalLoc !== undefined) && (
                        <div className="bg-slate-800/30 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                                <span className="text-lg">📊</span>
                                <span>Repository Stats</span>
                            </h4>
                            <div className="space-y-2">
                                {stars !== undefined && (
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-yellow-500">⭐</span>
                                            <span className="text-slate-400">Stars</span>
                                        </div>
                                        <span className="text-slate-200 font-medium">{stars}</span>
                                    </div>
                                )}
                                {forks !== undefined && (
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-500">🔱</span>
                                            <span className="text-slate-400">Forks</span>
                                        </div>
                                        <span className="text-slate-200 font-medium">{forks}</span>
                                    </div>
                                )}
                                {branches !== undefined && (
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-500">🌿</span>
                                            <span className="text-slate-400">Branches</span>
                                        </div>
                                        <span className="text-slate-200 font-medium">{branches}</span>
                                    </div>
                                )}
                                {totalLoc !== undefined && (
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-purple-500">📝</span>
                                            <span className="text-slate-400">Lines of Code</span>
                                        </div>
                                        <span className="text-slate-200 font-medium">
                                            {totalLoc >= 1000 ? `${(totalLoc / 1000).toFixed(1)}K` : totalLoc}
                                        </span>
                                    </div>
                                )}
                                {vulnAlertCount !== undefined && vulnAlertCount > 0 && (
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-500">⚠️</span>
                                            <span className="text-slate-400">Vulnerabilities</span>
                                        </div>
                                        <span className={`font-medium ${
                                            vulnCriticalCount && vulnCriticalCount > 0 ? 'text-red-400' :
                                            vulnHighCount && vulnHighCount > 0 ? 'text-orange-400' : 'text-yellow-400'
                                        }`}>
                                            {vulnAlertCount}
                                            {vulnCriticalCount && vulnCriticalCount > 0 && ` (${vulnCriticalCount} critical)`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Testing */}
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
                                    {/* Show test file count prominently */}
                                    {(() => {
                                        const testingPractice = bestPractices.find(p => p.practice_type === 'testing_framework');
                                        const testFileCount = testingPractice?.details?.test_file_count as number | undefined;
                                        
                                        return typeof testFileCount === 'number' && (
                                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-blue-300">Test Files</span>
                                                    <span className="text-2xl font-bold text-blue-400">{testFileCount}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    {/* Show test case count if available */}
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
                        </div>
                    </div>

                    {/* Metrics */}
                    {metrics.length > 0 && (() => {
                        const otherMetrics = metrics.filter(m => !m.name.toLowerCase().includes('coverage'));
                        
                        return otherMetrics.length > 0 && (
                            <div className="bg-slate-800/30 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Metrics</span>
                                </h4>
                                <div className="space-y-2">
                                    {otherMetrics.map((metric, index) => (
                                        <div key={`${metric.name}-${index}`} className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">{metric.name}</span>
                                            <span className="text-slate-200 font-medium">{metric.value}{metric.unit ?? ''}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Second Row: Documentation, Best Practices, Community Standards (3 equal columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* Documentation Status */}
                <div className="bg-slate-800/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                        <span className="text-lg">📄</span>
                        <span>Documentation</span>
                    </h4>

                    {/* Core Docs */}
                    <div className="mb-4">
                        <h5 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Core</h5>
                        <div className="space-y-2">
                            {docStatuses.filter(d => ['roadmap', 'tasks', 'metrics', 'features'].includes(d.doc_type)).map((d) => (
                                <div key={d.doc_type} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        {d.exists ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
                                        <span className={d.exists ? 'text-slate-300' : 'text-slate-500'}>{d.doc_type.toUpperCase()}</span>
                                    </div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${d.exists ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {d.exists ? 'Present' : 'Missing'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Standard Docs */}
                    <div className="mb-4">
                        <h5 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Standard</h5>
                        <div className="space-y-2">
                            {docStatuses.filter(d => ['readme', 'contributing'].includes(d.doc_type)).map((d) => (
                                <div key={d.doc_type} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        {d.exists ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
                                        <span className={d.exists ? 'text-slate-300' : 'text-slate-500'}>{d.doc_type.toUpperCase()}</span>
                                    </div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${d.exists ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {d.exists ? 'Present' : 'Missing'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Other Docs */}
                    <div>
                        <h5 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Other</h5>
                        <div className="space-y-2">
                            {docStatuses.filter(d => !['roadmap', 'tasks', 'metrics', 'readme', 'features', 'contributing'].includes(d.doc_type)).map((d) => (
                                <div key={d.doc_type} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        {d.exists ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
                                        <span className={d.exists ? 'text-slate-300' : 'text-slate-500'}>{d.doc_type.toUpperCase()}</span>
                                    </div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${d.exists ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {d.exists ? 'Present' : 'Missing'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* README Freshness */}
                    {readmeLastUpdated && (() => {
                        const daysSinceUpdate = Math.floor(
                            (new Date().getTime() - new Date(readmeLastUpdated).getTime()) / (1000 * 60 * 60 * 24)
                        );
                        const freshnessColor = 
                            daysSinceUpdate < 30 ? 'text-green-400' :
                            daysSinceUpdate < 90 ? 'text-yellow-400' :
                            daysSinceUpdate < 180 ? 'text-orange-400' :
                            'text-red-400';
                        const freshnessLabel = 
                            daysSinceUpdate < 30 ? 'Fresh' :
                            daysSinceUpdate < 90 ? 'Recent' :
                            daysSinceUpdate < 180 ? 'Aging' :
                            'Stale';
                        return (
                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">README Updated</span>
                                    <span className={`${freshnessColor} font-medium flex items-center gap-1`}>
                                        <Clock className="h-3 w-3" />
                                        {daysSinceUpdate}d ago ({freshnessLabel})
                                    </span>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Best Practices */}
                <div className="bg-slate-800/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                        <Shield className="h-4 w-4 text-purple-400" />
                        <span>Best Practices</span>
                        <span className="text-xs text-slate-500 font-normal">({bestPractices.length})</span>
                    </h4>
                    
                    {/* CI/CD Status Badge */}
                    {ciStatus && ciStatus !== 'unknown' && (
                        <div className={`mb-3 p-3 rounded-lg border ${
                            ciStatus === 'passing' 
                                ? 'bg-green-500/10 border-green-500/30' 
                                : 'bg-red-500/10 border-red-500/30'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`text-lg ${ciStatus === 'passing' ? '✓' : '✗'}`}>
                                        {ciStatus === 'passing' ? '✓' : '✗'}
                                    </span>
                                    <div>
                                        <div className={`text-sm font-semibold ${
                                            ciStatus === 'passing' ? 'text-green-300' : 'text-red-300'
                                        }`}>
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
                        <div className="space-y-2">{bestPractices.map((practice, i) => {
                                const getStatusIcon = (status: string) => {
                                    switch (status) {
                                        case 'healthy': return <CheckCircle2 className="h-3 w-3 text-green-400" />;
                                        case 'dormant': return <Circle className="h-3 w-3 text-yellow-400" />;
                                        case 'malformed': return <XCircle className="h-3 w-3 text-orange-400" />;
                                        case 'missing': return <XCircle className="h-3 w-3 text-red-400" />;
                                        default: return <Circle className="h-3 w-3 text-slate-500" />;
                                    }
                                };

                                const getStatusColor = (status: string) => {
                                    switch (status) {
                                        case 'healthy': return 'text-green-400';
                                        case 'dormant': return 'text-yellow-400';
                                        case 'malformed': return 'text-orange-400';
                                        case 'missing': return 'text-red-400';
                                        default: return 'text-slate-500';
                                    }
                                };

                                const getLabel = (type: string) => {
                                    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                };

                                return (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(practice.status)}
                                            <span className={getStatusColor(practice.status)}>{getLabel(practice.practice_type)}</span>
                                        </div>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${getStatusColor(practice.status)}`}>
                                            {practice.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Community Standards */}
                <div className="bg-slate-800/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-green-400" />
                            <span>Community Standards</span>
                            <span className="text-xs text-slate-500 font-normal">({communityStandards.length})</span>
                        </h4>
                        {(() => {
                            const missingWithTemplates = communityStandards.filter(s => 
                                s.status === 'missing' && ['code_of_conduct', 'security'].includes(s.standard_type)
                            );
                            return missingWithTemplates.length > 0 && onFixAllStandards && repoName && (
                                <button
                                    onClick={() => onFixAllStandards(repoName)}
                                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium transition-colors"
                                    title="Create PR for all missing community standards"
                                >
                                    Fix All ({missingWithTemplates.length})
                                </button>
                            );
                        })()}
                    </div>
                    {communityStandards.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No data available</p>
                    ) : (
                        <div className="space-y-2">
                            {communityStandards.map((standard, i) => {
                                const getStatusIcon = (status: string) => {
                                    switch (status) {
                                        case 'healthy': return <CheckCircle2 className="h-3 w-3 text-green-400" />;
                                        case 'missing': return <XCircle className="h-3 w-3 text-red-400" />;
                                        default: return <Circle className="h-3 w-3 text-slate-500" />;
                                    }
                                };

                                const getLabel = (type: string) => {
                                    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                };

                                // Check if this standard has a template available
                                const hasTemplate = ['code_of_conduct', 'security'].includes(standard.standard_type);
                                const isMissing = standard.status === 'missing';

                                return (
                                    <div key={i} className="flex items-center justify-between text-xs gap-2">
                                        <div className="flex items-center gap-2 flex-1">
                                            {getStatusIcon(standard.status)}
                                            <span className={standard.status === 'healthy' ? 'text-slate-300' : 'text-slate-500'}>
                                                {getLabel(standard.standard_type)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${standard.status === 'healthy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {standard.status === 'healthy' ? 'Present' : 'Missing'}
                                            </span>
                                            {hasTemplate && isMissing && onFixStandard && repoName && (
                                                <button
                                                    onClick={() => onFixStandard(repoName, standard.standard_type)}
                                                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium transition-colors"
                                                    title={`Create PR for ${getLabel(standard.standard_type)}`}
                                                >
                                                    Fix
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
