"use client";

import { Map, CheckCircle2, Clock, Circle } from 'lucide-react';
import { RoadmapItem } from '@/types/repo';
import { groupByQuarter, getDisplayedItems } from '@/lib/expandable-row-utils';
import { useState } from 'react';

interface RoadmapSectionProps {
  roadmapItems: RoadmapItem[];
}

export function RoadmapSection({ roadmapItems }: RoadmapSectionProps) {
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

  const roadmapByStatus = {
    planned: roadmapItems.filter((item) => item.status === 'planned'),
    'in-progress': roadmapItems.filter((item) => item.status === 'in-progress'),
    completed: roadmapItems.filter((item) => item.status === 'completed'),
  };

  return (
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
                <h5 className="text-xs font-medium text-blue-400">
                  In Progress ({roadmapByStatus['in-progress'].length})
                </h5>
              </div>
              {Object.entries(groupByQuarter(roadmapByStatus['in-progress'])).map(
                ([quarter, items]) => (
                  <div key={quarter} className="mb-4 last:mb-0">
                    <h6 className="text-[10px] font-semibold text-slate-400 uppercase mb-2">
                      {quarter}
                    </h6>
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
                )
              )}
            </div>
          )}

          {/* Planned */}
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Circle className="h-3 w-3 text-slate-500" />
              <h5 className="text-xs font-medium text-slate-300">
                Planned ({roadmapByStatus.planned.length})
              </h5>
            </div>
            {Object.entries(
              groupByQuarter(
                getDisplayedItems(roadmapByStatus.planned, 'planned', expandedSections)
              )
            ).map(([quarter, items]) => (
              <div key={quarter} className="mb-4 last:mb-0">
                <h6 className="text-[10px] font-semibold text-slate-400 uppercase mb-2">
                  {quarter}
                </h6>
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
                <h5 className="text-xs font-medium text-slate-300">
                  Completed ({roadmapByStatus.completed.length})
                </h5>
              </div>
              <ul className="space-y-2">
                {getDisplayedItems(
                  roadmapByStatus.completed,
                  'completed',
                  expandedSections,
                  3
                ).map((item, i) => (
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
  );
}
