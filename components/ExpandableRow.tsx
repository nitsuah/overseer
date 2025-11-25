"use client";

import { CheckCircle2, XCircle, Clock, Circle } from 'lucide-react';

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

    return (
        <div className="px-6 py-6 bg-slate-900/50 border-t border-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        <div className="space-y-4">
                            {/* In Progress */}
                            {tasksByStatus['in-progress'].length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="h-3 w-3 text-yellow-400" />
                                        <span className="text-xs font-medium text-yellow-400">In Progress ({tasksByStatus['in-progress'].length})</span>
                                    </div>
                                    <div className="space-y-1 pl-5">
                                        {tasksByStatus['in-progress'].map((task) => (
                                            <div key={task.id} className="text-xs text-slate-300 flex items-start gap-2">
                                                <span className="text-yellow-400">•</span>
                                                <span className="line-clamp-2">{task.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Backlog */}
                            {tasksByStatus.todo.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Circle className="h-3 w-3 text-slate-400" />
                                        <span className="text-xs font-medium text-slate-400">Backlog ({tasksByStatus.todo.length})</span>
                                    </div>
                                    <div className="space-y-1 pl-5">
                                        {tasksByStatus.todo.slice(0, 5).map((task) => (
                                            <div key={task.id} className="text-xs text-slate-400 flex items-start gap-2">
                                                <span>•</span>
                                                <span className="line-clamp-1">{task.title}</span>
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
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                                        <span className="text-xs font-medium text-green-400">Done ({tasksByStatus.done.length})</span>
                                    </div>
                                    <div className="space-y-1 pl-5">
                                        {tasksByStatus.done.slice(0, 3).map((task) => (
                                            <div key={task.id} className="text-xs text-slate-500 flex items-start gap-2 line-through">
                                                <span>•</span>
                                                <span className="line-clamp-1">{task.title}</span>
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
                        <div className="space-y-4">
                            {/* In Progress */}
                            {roadmapByStatus['in-progress'].length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="h-3 w-3 text-blue-400" />
                                        <span className="text-xs font-medium text-blue-400">In Progress ({roadmapByStatus['in-progress'].length})</span>
                                    </div>
                                    <div className="space-y-2 pl-5">
                                        {roadmapByStatus['in-progress'].map((item) => (
                                            <div key={item.id} className="text-xs">
                                                <div className="text-slate-300 flex items-start gap-2">
                                                    <span className="text-blue-400">•</span>
                                                    <div>
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
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Circle className="h-3 w-3 text-slate-400" />
                                        <span className="text-xs font-medium text-slate-400">Planned ({roadmapByStatus.planned.length})</span>
                                    </div>
                                    <div className="space-y-2 pl-5">
                                        {roadmapByStatus.planned.slice(0, 5).map((item) => (
                                            <div key={item.id} className="text-xs">
                                                <div className="text-slate-400 flex items-start gap-2">
                                                    <span>•</span>
                                                    <div>
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
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                                        <span className="text-xs font-medium text-green-400">Completed ({roadmapByStatus.completed.length})</span>
                                    </div>
                                    <div className="space-y-2 pl-5">
                                        {roadmapByStatus.completed.slice(0, 3).map((item) => (
                                            <div key={item.id} className="text-xs text-slate-500 line-through">
                                                <div className="flex items-start gap-2">
                                                    <span>•</span>
                                                    <span className="line-clamp-1">{item.title}</span>
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

                {/* Docs & Metrics Section */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
                        <span className="text-lg">📄</span>
                        <span>Docs & Metrics</span>
                    </h4>
                    {/* Docs */}
                    <div className="space-y-2">
                        {docStatuses.map((d) => (
                            <div key={d.doc_type} className="flex items-center gap-2 text-xs">
                                {d.exists ? (
                                    <CheckCircle2 className="h-3 w-3 text-green-400" />
                                ) : (
                                    <XCircle className="h-3 w-3 text-red-400" />
                                )}
                                <span>{d.doc_type}</span>
                            </div>
                        ))}
                    </div>
                    {/* Metrics */}
                    {metrics.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {metrics.map((metric) => (
                                <div key={metric.name} className="flex items-center justify-between text-xs">
                                    <span>{metric.name}</span>
                                    <span>{metric.value}{metric.unit ?? ''}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
