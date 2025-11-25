"use client";

import { CheckCircle2, XCircle, Clock, Circle, GitPullRequest, AlertCircle, TrendingUp } from 'lucide-react';

interface Task {
    id: string;
    title: string;
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

interface ExpandableRowProps {
    tasks: Task[];
    roadmapItems: RoadmapItem[];
    docStatuses: DocStatus[];
    metrics?: Metric[];
}

export default function ExpandableRow({ tasks, roadmapItems, docStatuses, metrics = [] }: ExpandableRowProps) {
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

    return (
        <div className="px-6 py-6 bg-slate-900/50 border-t border-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Tasks & Roadmap (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Tasks Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
                            <span className="text-lg">📋</span>
                            <span>Tasks</span>
                            <span className="text-xs text-slate-500 font-normal">({tasks.length} total)</span>
                        </h4>
                        {tasks.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No tasks defined</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* In Progress */}
                                {tasksByStatus['in-progress'].length > 0 && (
                                    <div className="bg-slate-800/30 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-3 w-3 text-yellow-400" />
                                            <span className="text-xs font-medium text-yellow-400">In Progress ({tasksByStatus['in-progress'].length})</span>
                                        </div>
                                        <div className="space-y-1">
                                            {tasksByStatus['in-progress'].map((task) => (
                                                <div key={task.id} className="text-xs text-slate-300 flex items-start gap-2">
                                                    <span className="text-yellow-400 mt-0.5">•</span>
                                                    <span className="line-clamp-2 flex-1">{task.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Backlog */}
                                {tasksByStatus.todo.length > 0 && (
                                    <div className="bg-slate-800/30 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Circle className="h-3 w-3 text-slate-400" />
                                            <span className="text-xs font-medium text-slate-400">Backlog ({tasksByStatus.todo.length})</span>
                                        </div>
                                        <div className="space-y-1">
                                            {tasksByStatus.todo.slice(0, 5).map((task) => (
                                                <div key={task.id} className="text-xs text-slate-400 flex items-start gap-2">
                                                    <span className="mt-0.5">•</span>
                                                    <span className="line-clamp-1 flex-1">{task.title}</span>
                                                </div>
                                            ))}
                                            {tasksByStatus.todo.length > 5 && (
                                                <div className="text-xs text-slate-600 pl-3">+{tasksByStatus.todo.length - 5} more</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* Done */}
                                {tasksByStatus.done.length > 0 && (
                                    <div className="bg-slate-800/30 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                                            <span className="text-xs font-medium text-green-400">Done ({tasksByStatus.done.length})</span>
                                        </div>
                                        <div className="space-y-1">
                                            {tasksByStatus.done.slice(0, 3).map((task) => (
                                                <div key={task.id} className="text-xs text-slate-500 flex items-start gap-2 line-through">
                                                    <span className="mt-0.5">•</span>
                                                    <span className="line-clamp-1 flex-1">{task.title}</span>
                                                </div>
                                            ))}
                                            {tasksByStatus.done.length > 3 && (
                                                <div className="text-xs text-slate-600 pl-3">+{tasksByStatus.done.length - 3} more</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Roadmap Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
                            <span className="text-lg">🗺️</span>
                            <span>Roadmap</span>
                            <span className="text-xs text-slate-500 font-normal">({roadmapItems.length} items)</span>
                        </h4>
                        {roadmapItems.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No roadmap defined</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* In Progress */}
                                {roadmapByStatus['in-progress'].length > 0 && (
                                    <div className="bg-slate-800/30 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-3 w-3 text-blue-400" />
                                            <span className="text-xs font-medium text-blue-400">In Progress ({roadmapByStatus['in-progress'].length})</span>
                                        </div>
                                        <div className="space-y-2">
                                            {roadmapByStatus['in-progress'].map((item) => (
                                                <div key={item.id} className="text-xs">
                                                    <div className="text-slate-300 flex items-start gap-2">
                                                        <span className="text-blue-400 mt-0.5">•</span>
                                                        <div className="flex-1">
                                                            <div className="line-clamp-2">{item.title}</div>
                                                            {item.quarter && <div className="text-slate-600 text-[10px] mt-0.5">{item.quarter}</div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Planned */}
                                {roadmapByStatus.planned.length > 0 && (
                                    <div className="bg-slate-800/30 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Circle className="h-3 w-3 text-slate-400" />
                                            <span className="text-xs font-medium text-slate-400">Planned ({roadmapByStatus.planned.length})</span>
                                        </div>
                                        <div className="space-y-2">
                                            {roadmapByStatus.planned.slice(0, 5).map((item) => (
                                                <div key={item.id} className="text-xs">
                                                    <div className="text-slate-400 flex items-start gap-2">
                                                        <span className="mt-0.5">•</span>
                                                        <div className="flex-1">
                                                            <div className="line-clamp-1">{item.title}</div>
                                                            {item.quarter && <div className="text-slate-600 text-[10px] mt-0.5">{item.quarter}</div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {roadmapByStatus.planned.length > 5 && (
                                                <div className="text-xs text-slate-600 pl-3">+{roadmapByStatus.planned.length - 5} more</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* Completed */}
                                {roadmapByStatus.completed.length > 0 && (
                                    <div className="bg-slate-800/30 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                                            <span className="text-xs font-medium text-green-400">Completed ({roadmapByStatus.completed.length})</span>
                                        </div>
                                        <div className="space-y-2">
                                            {roadmapByStatus.completed.slice(0, 3).map((item) => (
                                                <div key={item.id} className="text-xs text-slate-500 line-through">
                                                    <div className="flex items-start gap-2">
                                                        <span className="mt-0.5">•</span>
                                                        <span className="line-clamp-1 flex-1">{item.title}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {roadmapByStatus.completed.length > 3 && (
                                                <div className="text-xs text-slate-600 pl-3">+{roadmapByStatus.completed.length - 3} more</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Docs & Metrics (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Documentation Status */}
                    <div className="bg-slate-800/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                            <span className="text-lg">📄</span>
                            <span>Documentation</span>
                        </h4>
                        <div className="space-y-2">
                            {docStatuses.map((d) => (
                                <div key={d.doc_type} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        {d.exists ? (
                                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                                        ) : (
                                            <XCircle className="h-3 w-3 text-red-400" />
                                        )}
                                        <span className={d.exists ? 'text-slate-300' : 'text-slate-500'}>{d.doc_type.toUpperCase()}</span>
                                    </div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${d.exists ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {d.exists ? 'Present' : 'Missing'}
                                    </span>
                                </div>
                            ))}
                        </div>
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
