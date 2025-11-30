"use client";

import { Feature } from '@/types/repo';
import { getDisplayedItems } from '@/lib/expandable-row-utils';
import { useState } from 'react';

interface FeaturesSectionProps {
  features: Feature[];
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

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

  return (
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
          {getDisplayedItems(features, 'features', expandedSections, 3).map((feature, i) => {
            const cardKey = `card-${i}`;
            const isCardExpanded = expandedCards.has(cardKey);
            
            return (
              <div key={i} className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                <button
                  onClick={() => toggleCard(cardKey)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700/40 transition-colors border-b border-slate-700/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-orange-400">{feature.category}</span>
                    </div>
                    <span className="text-slate-500 text-xs">{isCardExpanded ? '▼' : '▶'}</span>
                  </div>
                </button>
                {isCardExpanded && (
                  <div className="px-4 py-3">
                    {feature.description && (
                      <p className="text-[10px] text-slate-400 mb-2">{feature.description}</p>
                    )}
                    <ul className="space-y-1">
                {(expandedSections.has(`feature-${i}`)
                  ? feature.items
                  : feature.items.slice(0, 3)
                ).map((item, j) => (
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
                          : `+${feature.items.length - 3} more`}
                      </button>
                    )}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
          {features.length > 3 && (
            <button
              onClick={() => toggleSection('features')}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              {expandedSections.has('features')
                ? 'Show less'
                : `+${features.length - 3} more categories`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
