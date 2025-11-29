"use client";

import { ListTodo, CheckCircle2, Clock, Circle } from 'lucide-react';
import { Task } from '@/types/repo';
import { groupBySubsection, getDisplayedItems } from '@/lib/expandable-row-utils';
import { parseBoldText } from '@/lib/markdown-utils.tsx';
import { useState } from 'react';

interface TasksSectionProps {
  tasks: Task[];
}

export function TasksSection({ tasks }: TasksSectionProps) {
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
    todo: tasks.filter((t) => t.status === 'todo'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  return (
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
                <h5 className="text-xs font-medium text-yellow-500">
                  In Progress ({tasksByStatus['in-progress'].length})
                </h5>
              </div>
              <ul className="space-y-2">
                {tasksByStatus['in-progress'].map((task, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-yellow-500 shrink-0" />
                    <span>{parseBoldText(task.title)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Backlog */}
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Circle className="h-3 w-3 text-slate-500" />
              <h5 className="text-xs font-medium text-slate-300">
                Backlog ({tasksByStatus.todo.length})
              </h5>
            </div>
            {Object.entries(
              groupBySubsection(getDisplayedItems(tasksByStatus.todo, 'backlog', expandedSections))
            ).map(([subsection, items]) => (
              <div key={subsection} className="mb-4 last:mb-0">
                {subsection !== 'Other' && (
                  <h6 className="text-[10px] font-semibold text-slate-400 uppercase mb-2">
                    {subsection}
                  </h6>
                )}
                <ul className="space-y-2">
                  {items.map((task, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-600 shrink-0" />
                      <span>{parseBoldText(task.title)}</span>
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
                <h5 className="text-xs font-medium text-slate-300">
                  Done ({tasksByStatus.done.length})
                </h5>
              </div>
              <ul className="space-y-2">
                {getDisplayedItems(tasksByStatus.done, 'done', expandedSections, 3).map(
                  (task, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-500 line-through flex items-start gap-2"
                    >
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-700 shrink-0" />
                      <span>{parseBoldText(task.title)}</span>
                    </li>
                  )
                )}
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
  );
}
