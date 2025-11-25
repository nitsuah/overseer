'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock } from 'lucide-react';

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

interface ExpandableRowProps {
    repoName: string;
    tasks: Task[];
    roadmapItems: RoadmapItem[];
    docStatuses: DocStatus[];
}

export function ExpandableRow({ tasks, roadmapItems, docStatuses }: Omit<ExpandableRowProps, 'repoName'>) {
    const [isExpanded, setIsExpanded] = useState(false);

    const tasksByStatus = {
        todo: tasks.filter((t) => t.status === 'todo'),
        'in-progress': tasks.filter((t) => t.status === 'in-progress'),
        done: tasks.filter((t) => t.status === 'done'),
    };

    const roadmapByStatus = {
        planned: roadmapItems.filter((r) => r.status === 'planned'),
        'in-progress': roadmapItems.filter((r) => r.status === 'in-progress'),
        completed: roadmapItems.filter((r) => r.status === 'completed'),
    };

    return (
        <>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left hover:bg-slate-800/30 transition-colors"
            >
                <div className="px-6 py-4 flex items-center gap-2">
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                    <span className="text-sm text-slate-400">
                        {isExpanded ? 'Hide details' : 'Show details'}
                    </span>
                </div>
            </button>

            {isExpanded && (
                <div className="px-6 py-6 bg-slate-900/30 border-t border-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Tasks Section */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                📋 Tasks
                                <span className="text-xs text-slate-500">({tasks.length} total)</span>
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Backlog</span>
                                    <span className="text-slate-300">{tasksByStatus.todo.length}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-yellow-400">In Progress</span>
                                    <span className="text-yellow-300">{tasksByStatus['in-progress'].length}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-green-400">Done</span>
                                    <span className="text-green-300">{tasksByStatus.done.length}</span>
                                </div>
                            </div>
                            {tasks.length > 0 && (
                                <div className="mt-3 space-y-1">
                                    {tasks.slice(0, 3).map((task) => (
                                        <div key={task.id} className="flex items-start gap-2 text-xs">
                                            {task.status === 'done' ? (
                                                <CheckCircle2 className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                                            ) : task.status === 'in-progress' ? (
                                                <Clock className="h-3 w-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                            ) : (
                                                <div className="h-3 w-3 border border-slate-600 rounded-sm mt-0.5 flex-shrink-0" />
                                            )}
                                            <span className="text-slate-400 line-clamp-1">{task.title}</span>
                                        </div>
                                    ))}
                                    {tasks.length > 3 && (
                                        <div className="text-xs text-slate-500 pl-5">
                                            +{tasks.length - 3} more
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Roadmap Section */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                🗺️ Roadmap
                                <span className="text-xs text-slate-500">({roadmapItems.length} items)</span>
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Planned</span>
                                    <span className="text-slate-300">{roadmapByStatus.planned.length}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-400">In Progress</span>
                                    <span className="text-blue-300">{roadmapByStatus['in-progress'].length}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-green-400">Completed</span>
                                    <span className="text-green-300">{roadmapByStatus.completed.length}</span>
                                </div>
                            </div>
                            {roadmapItems.length > 0 && (
                                <div className="mt-3 space-y-1">
                                    {roadmapItems.slice(0, 3).map((item) => (
                                        <div key={item.id} className="text-xs">
                                            <div className="flex items-start gap-2">
                                                {item.status === 'completed' ? (
                                                    <CheckCircle2 className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                                                ) : item.status === 'in-progress' ? (
                                                    <Clock className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                                                ) : (
                                                    <div className="h-3 w-3 border border-slate-600 rounded-sm mt-0.5 flex-shrink-0" />
                                                )}
                                                <div>
                                                    <div className="text-slate-400 line-clamp-1">{item.title}</div>
                                                    {item.quarter && (
                                                        <div className="text-slate-600 text-[10px]">{item.quarter}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {roadmapItems.length > 3 && (
                                        <div className="text-xs text-slate-500 pl-5">
                                            +{roadmapItems.length - 3} more
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Docs Section */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                📄 Documentation
                                <span className="text-xs text-slate-500">
                                    ({docStatuses.filter((d) => d.exists).length}/{docStatuses.length})
                                </span>
                            </h4>
                            <div className="space-y-1">
                                {docStatuses.map((doc) => (
                                    <div key={doc.doc_type} className="flex items-center gap-2 text-xs">
                                        {doc.exists ? (
                                            <CheckCircle2 className="h-3 w-3 text-green-400 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="h-3 w-3 text-slate-600 flex-shrink-0" />
                                        )}
                                        <span className={doc.exists ? 'text-slate-400' : 'text-slate-600'}>
                                            {doc.doc_type.toUpperCase()}.md
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
