"use client";

import { Map } from 'lucide-react';
import { RoadmapItem } from '@/types/repo';
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
      return { icon: '●', label: 'Completed', color: 'text-green-400' };
    default:
      return { icon: '○', label: 'Planned', color: 'text-purple-400' };
  }
}

export function RoadmapSection({ roadmapItems }: RoadmapSectionProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(false);
  const [showAllPlanned, setShowAllPlanned] = useState(false);

  const toggleCard = (cardKey: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardKey)) {
      newExpanded.delete(cardKey);
    } else {
      newExpanded.add(cardKey);
    }
    setExpandedCards(newExpanded);
  };

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

  const quarters = Object.keys(quarterGroups).reverse();
  
  // When showing completed, show all quarters by default
  const displayedQuarters = (showAllPlanned || showCompleted) ? quarters : quarters.slice(0, 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Map className="h-4 w-4 text-purple-400" />
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
          {displayedQuarters.map(q => ({ quarter: q, items: quarterGroups[q] })).map((group, i) => {
            const cardKey = `card-${i}`;
            const isCardExpanded = expandedCards.has(cardKey);
            const isCompleted = group.items.every(item => item.status === 'completed');
            const headerColor = isCompleted ? 'text-green-400' : 'text-purple-400';
            const linkColor = isCompleted ? 'text-green-400 hover:text-green-300' : 'text-blue-400 hover:text-blue-300';
            
            return (
              <div key={i} className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                <button
                  onClick={() => toggleCard(cardKey)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700/40 transition-colors border-b border-slate-700/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${headerColor}`}>{group.quarter}</span>
                      <span className="text-[11px] text-slate-500">({group.items.length} items)</span>
                    </div>
                    <span className="text-slate-500 text-xs">{isCardExpanded ? '▼' : '▶'}</span>
                  </div>
                </button>
                {isCardExpanded && (
                  <div className="px-4 py-3">
                    <ul className="space-y-1">
                {(expandedSections.has(`quarter-${i}`)
                  ? group.items
                  : group.items.slice(0, 5)
                ).map((item, j) => {
                  const statusDisplay = getStatusDisplay(item.status);
                  return (
                    <li key={j} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className={`mt-1 text-[10px] ${statusDisplay.color}`} title={statusDisplay.label}>
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
                        className={`text-[10px] ${linkColor} pl-3`}
                      >
                        {expandedSections.has(`quarter-${i}`)
                          ? 'Show less'
                          : `+${group.items.length - 5} more`}
                      </button>
                    )}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}