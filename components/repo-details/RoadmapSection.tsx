"use client";

import { Map } from 'lucide-react';
import { RoadmapItem } from '@/types/repo';
import { groupByQuarter, getDisplayedItems } from '@/lib/expandable-row-utils';
import { parseBoldText } from '@/lib/markdown-utils.tsx';
import { useState } from 'react';

interface RoadmapSectionProps {
  roadmapItems: RoadmapItem[];
}

// Helper to get status icon and color
function getStatusDisplay(status: string) {
  switch (status) {
    case 'in-progress':
      return { icon: '🔵', label: 'In Progress', color: 'text-blue-400' };
    case 'completed':
      return { icon: '✅', label: 'Completed', color: 'text-green-400' };
    default:
      return { icon: '⭕', label: 'Planned', color: 'text-slate-400' };
  }
}

export function RoadmapSection({ roadmapItems }: RoadmapSectionProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(false);
  const [showAllPlanned, setShowAllPlanned] = useState(false);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Filter out completed items unless showCompleted is true
  const filteredItems = showCompleted 
    ? roadmapItems 
    : roadmapItems.filter(item => item.status !== 'completed');

  const completedCount = roadmapItems.filter(item => item.status === 'completed').length;

  // Group by quarter across all statuses
  const quarterGroups: Record<string, RoadmapItem[]> = {};
  filteredItems.forEach(item => {
    const quarter = item.quarter || 'No Quarter';
    if (!quarterGroups[quarter]) {
      quarterGroups[quarter] = [];
    }
    quarterGroups[quarter].push(item);
  });

  const quarters = Object.keys(quarterGroups);
  
  // When showing completed, show all quarters by default
  const displayedQuarters = (showAllPlanned || showCompleted) ? quarters : quarters.slice(0, 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Map className="h-4 w-4 text-blue-400" />
          <span>Roadmap</span>
          <span className="text-xs text-slate-500 font-normal">({filteredItems.length} items)</span>
        </h4>
        <div className="flex items-center gap-2">
          {quarters.length > 1 && !showCompleted && (
            <button
              onClick={() => setShowAllPlanned(!showAllPlanned)}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              {showAllPlanned ? 'Show less' : `Show all (${quarters.length - 1} more)`}
            </button>
          )}
          {completedCount > 0 && (
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            >
              {showCompleted ? 'Hide completed' : `Completed (${completedCount})`}
            </button>
          )}
        </div>
      </div>
      {roadmapItems.length === 0 ? (
        <div className="bg-slate-800/30 rounded-lg p-4">
          <p className="text-xs text-slate-500 italic">No roadmap items</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedQuarters.map(q => ({ quarter: q, items: quarterGroups[q] })).map((group, i) => (
            <div key={i} className="bg-slate-800/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-blue-400">{group.quarter}</span>
                <span className="text-[10px] text-slate-500">({group.items.length} items)</span>
              </div>
              <ul className="space-y-1">
                {(expandedSections.has(`quarter-${i}`)
                  ? group.items
                  : group.items.slice(0, 5)
                ).map((item, j) => {
                  const statusDisplay = getStatusDisplay(item.status);
                  return (
                    <li key={j} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="mt-1 text-[10px]" title={statusDisplay.label}>
                        {statusDisplay.icon}
                      </span>
                      <span className={item.status === 'completed' ? 'line-through text-slate-500' : ''}>
                        {parseBoldText(item.title)}
                      </span>
                    </li>
                  );
                })}
                {group.items.length > 5 && (
                  <button
                    onClick={() => toggleSection(`quarter-${i}`)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 pl-3"
                  >
                    {expandedSections.has(`quarter-${i}`)
                      ? 'Show less'
                      : `+${group.items.length - 5} more`}
                  </button>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}