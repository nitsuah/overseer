"use client";

import { CheckCircle2, XCircle, Clock, Circle, TrendingUp, Shield, ShieldCheck, ShieldAlert, Map, ListTodo } from 'lucide-react';
import { useState } from 'react';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    section: string | null;
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
    coverageScore
}: ExpandableRowProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

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

    // Extract specific metrics for display
    const coverageMetric = metrics.find(m => m.name?.toLowerCase().includes('coverage'));
    const otherMetrics = metrics.filter(m => m.name && !m.name.toLowerCase().includes('coverage'));

    // Helper to limit items unless expanded
    const getDisplayedItems = <T,>(items: T[], section: string, limit: number = 5): T[] => {
        return expandedSections.has(section) ? items : items.slice(0, limit);
    };

    return (
        <div className="px-6 py-6 bg-slate-900/50 border-t border-slate-800">
            {/* AI Summary Section */}
            {aiSummary && (
                <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                        <span className="text-lg">🤖</span>
                        <span>AI Summary</span>
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{aiSummary}</p>
                </div>
            )}

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
                                            <ul className="space-y-2">
                                                {roadmapByStatus['in-progress'].map((item, i) => (
                                                    <li key={i} className="text-xs text-slate-300">
                                                        <div className="flex items-start gap-2">
                                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                                                            <span className="font-medium">{item.title}</span>
                                                        </div>
                                                        {item.quarter && (
                                                            <div className="ml-3 text-[10px] text-slate-500 mt-0.5">
                                                                {item.quarter}
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Planned */}
                                    <div className="bg-slate-800/30 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Circle className="h-3 w-3 text-slate-500" />
                                            <h5 className="text-xs font-medium text-slate-300">Planned ({roadmapByStatus.planned.length})</h5>
                                        </div>
                                        <ul className="space-y-2">
                                            {getDisplayedItems(roadmapByStatus.planned, 'planned').map((item, i) => (
                                                <li key={i} className="text-xs text-slate-400">
                                                    <div className="flex items-start gap-2">
                                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-600 shrink-0" />
                                                        <span className="font-medium">{item.title}</span>
                                                    </div>
                                                    {item.quarter && (
                                                        <div className="ml-3 text-[10px] text-slate-500 mt-0.5">
                                                            {item.quarter}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
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
                                        <ul className="space-y-2">
                                            {getDisplayedItems(tasksByStatus.todo, 'backlog').map((task, i) => (
                                                <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-600 shrink-0" />
                                                    <span>{task.title}</span>
                                                </li>
                                            ))}
                                        </ul>
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
                                    {getDisplayedItems(features, 'features', 5).map((feature, i) => (
                                        <div key={i} className="bg-slate-800/30 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-medium text-blue-400">{feature.category}</span>
                                            </div>
                                            {feature.description && (
                                                <p className="text-[10px] text-slate-400 mb-2">{feature.description}</p>
                                            )}
                                            <ul className="space-y-1">
                                                {feature.items.slice(0, 3).map((item, j) => (
                                                    <li key={j} className="text-xs text-slate-300 flex items-start gap-2">
                                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                                {feature.items.length > 3 && (
                                                    <li className="text-[10px] text-slate-500 pl-3">
                                                        +{feature.items.length - 3} more items
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    ))}
                                    {features.length > 5 && (
                                        <button
                                            onClick={() => toggleSection('features')}
                                            className="text-[10px] text-blue-400 hover:text-blue-300 pl-3"
                                        >
                                            {expandedSections.has('features')
                                                ? 'Show less'
                                                : `+${features.length - 5} more categories`}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Docs & Metrics (3 cols) */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Repository Stats */}
                    {(stars !== undefined || forks !== undefined || branches !== undefined) && (
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
                                            <span className="text-slate-400">🔀</span>
                                            <span className="text-slate-400">Forks</span>
                                        </div>
                                        <span className="text-slate-200 font-medium">{forks}</span>
                                    </div>
                                )}
                                {branches !== undefined && branches > 0 && (
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400">🌿</span>
                                            <span className="text-slate-400">Branches</span>
                                        </div>
                                        <span className="text-slate-200 font-medium">{branches}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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
                    </div>

                    {/* Testing */}
                    <div className="bg-slate-800/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                            <Shield className="h-4 w-4 text-blue-400" />
                            <span>Testing</span>
                        </h4>
                        <div className="space-y-3">
                            {(() => {
                                const testingFramework = bestPractices.find(bp => bp.practice_type === 'testing_framework');
                                const hasFramework = testingFramework?.status === 'healthy';
                                const detectedFrameworks = hasFramework && testingFramework.details?.detected 
                                    ? (testingFramework.details.detected as string[])
                                    : [];
                                const testFileCount = testingFramework?.details?.testFileCount as number | undefined;
                                
                                return (
                                    <>
                                        {/* Framework Detection */}
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">Framework</span>
                                            {hasFramework ? (
                                                <div className="flex flex-wrap gap-1 justify-end">
                                                    {detectedFrameworks.map((fw, idx) => {
                                                        const frameworkName = fw.split('.')[0].split('/').pop() || fw;
                                                        return (
                                                            <span key={idx} className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px] font-medium">
                                                                {frameworkName}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 italic">No framework detected</span>
                                            )}
                                        </div>

                                        {/* Test File Count */}
                                        {hasFramework && testFileCount != null && testFileCount > 0 && (
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-400">Test Files</span>
                                                <span className="text-blue-400 font-medium">{testFileCount} {testFileCount === 1 ? 'file' : 'files'}</span>
                                            </div>
                                        )}

                                        {/* Test Status */}
                                        {hasFramework && (
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-400">Status</span>
                                                {testingStatus === 'passing' ? (
                                                    <span className="flex items-center gap-1 text-green-400">
                                                        <ShieldCheck className="h-3 w-3" /> Passing
                                                    </span>
                                                ) : testingStatus === 'failing' ? (
                                                    <span className="flex items-center gap-1 text-red-400">
                                                        <ShieldAlert className="h-3 w-3" /> Failing
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500 italic">Not run yet</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Coverage */}
                                        {coverageScore != null && (
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs text-slate-400">Coverage</span>
                                                    <span className="text-sm font-bold text-blue-400">{coverageScore}%</span>
                                                </div>
                                                <div className="w-full bg-slate-700 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                                                        style={{ width: `${Math.min(coverageScore, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* No Testing Setup Message */}
                                        {!hasFramework && !coverageScore && (
                                            <p className="text-xs text-slate-500 italic mt-2">
                                                No testing framework detected. Consider adding Vitest, Jest, Playwright, or Cypress.
                                            </p>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Best Practices */}
                    <div className="bg-slate-800/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                            <Shield className="h-4 w-4 text-purple-400" />
                            <span>Best Practices</span>
                            <span className="text-xs text-slate-500 font-normal">({bestPractices.length})</span>
                        </h4>
                        {bestPractices.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No data available</p>
                        ) : (
                            <div className="space-y-2">
                                {bestPractices.map((practice, i) => {
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
                        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                            <ShieldCheck className="h-4 w-4 text-green-400" />
                            <span>Community Standards</span>
                            <span className="text-xs text-slate-500 font-normal">({communityStandards.length})</span>
                        </h4>
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

                                    return (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(standard.status)}
                                                <span className={standard.status === 'healthy' ? 'text-slate-300' : 'text-slate-500'}>
                                                    {getLabel(standard.standard_type)}
                                                </span>
                                            </div>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${standard.status === 'healthy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {standard.status === 'healthy' ? 'Present' : 'Missing'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Metrics */}
                    {metrics.length > 0 && (
                        <div className="bg-slate-800/30 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                                <TrendingUp className="h-4 w-4" />
                                <span>Metrics</span>
                            </h4>
                            <div className="space-y-3">
                                {/* Code Coverage - Featured */}
                                {coverageMetric && (
                                    <div className="pb-3 border-b border-slate-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-slate-400">Code Coverage</span>
                                            <span className="text-sm font-bold text-blue-400">{coverageMetric.value}{coverageMetric.unit ?? '%'}</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                                                style={{ width: `${Math.min(coverageMetric.value, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {/* Other Metrics */}
                                {otherMetrics.map((metric, index) => (
                                    <div key={`${metric.name}-${index}`} className="flex items-center justify-between text-xs">
                                        <span className="text-slate-400">{metric.name}</span>
                                        <span className="text-slate-200 font-medium">{metric.value}{metric.unit ?? ''}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
