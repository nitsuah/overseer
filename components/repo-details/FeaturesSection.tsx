"use client";

import { Feature } from '@/types/repo';
import { useState } from 'react';

interface FeaturesSectionProps {
  features: Feature[];
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export function FeaturesSection({ features, isExpanded: isExpandedProp, onToggleExpanded }: FeaturesSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isMainExpanded = isExpandedProp !== undefined ? isExpandedProp : internalExpanded;
  const setIsMainExpanded = onToggleExpanded || (() => setInternalExpanded(!internalExpanded));
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAllCards, setShowAllCards] = useState(false);

  // Hide section if no features
  if (!features || features.length === 0) {
    return null;
  }

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

  // Helper to extract emoji from category name if present
  const getCategoryParts = (category: string): { emoji: string | null; text: string } => {
    // Match emoji at the start of the string
    const emojiMatch = category.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*/u);
    if (emojiMatch) {
      return {
        emoji: emojiMatch[0].trim(),
        text: category.slice(emojiMatch[0].length).trim()
      };
    }
    return { emoji: null, text: category };
  };

  // Display first 9 cards in 3x3 grid by default
  const displayedFeatures = showAllCards ? features : features.slice(0, 9);

  const expandAll = () => {
    const allCardKeys = displayedFeatures.map((_, i) => `card-${i}`);
    setExpandedCards(new Set(allCardKeys));
  };

  const collapseAll = () => {
    setExpandedCards(new Set());
  };

  return (
    <div className="bg-gradient-to-br from-orange-900/30 via-slate-800/50 to-orange-800/20 rounded-lg overflow-hidden border border-orange-500/40 shadow-lg shadow-orange-500/10 hover:border-orange-400/50 transition-colors">
      <div
        onClick={setIsMainExpanded}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-orange-900/20 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <h4 className="text-sm font-semibold text-slate-200">Features</h4>
          <span
            title={`Features: ${features.length} categories`}
            className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-500/20 text-orange-400 ml-1"
          >
            {features.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (expandedCards.size === displayedFeatures.length) {
                collapseAll();
              } else {
                expandAll();
              }
            }}
            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-500/20 text-slate-400 hover:bg-slate-500/30 transition-colors"
          >
            {expandedCards.size === displayedFeatures.length ? 'Collapse all' : 'Expand all'}
          </button>
          {features.length > 9 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAllCards(!showAllCards);
              }}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
            >
              {showAllCards
                ? 'Show less'
                : `Show more (${features.length - 9})`}
            </button>
          )}
          <span className="text-slate-500 text-xs">{isMainExpanded ? '▼' : '▶'}</span>
        </div>
      </div>
      {isMainExpanded && (
        <div className="p-4">
          {features.length === 0 ? (
            <div className="bg-slate-800/30 rounded-lg p-4">
              <p className="text-xs text-slate-500 italic">No features documented</p>
            </div>
          ) : (
            <>
              {/* 3x3 Grid with expanded cards in place */}
              <div className="grid grid-cols-3 gap-2">
                {displayedFeatures.map((feature, i) => {
                  const cardKey = `card-${i}`;
                  const isCardExpanded = expandedCards.has(cardKey);
                  const { emoji, text: categoryText } = getCategoryParts(feature.category);
                  
                  // Collapsed square card
                  if (!isCardExpanded) {
                    return (
                      <button
                        key={i}
                        onClick={() => toggleCard(cardKey)}
                        className="w-full aspect-square bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-700/40 transition-colors p-3 flex flex-col items-center justify-center text-center"
                      >
                        {emoji && (
                          <span className="text-3xl mb-2">{emoji}</span>
                        )}
                        <span className="text-xs font-semibold text-orange-400 line-clamp-2">{categoryText}</span>
                      </button>
                    );
                  }
                  
                  // Expanded card - takes full width across columns
                  return (
                    <div key={i} className="col-span-3 bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden">
                      <button
                        onClick={() => toggleCard(cardKey)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-700/40 transition-colors border-b border-slate-700/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {emoji && <span className="text-xl">{emoji}</span>}
                            <span className="text-sm font-semibold text-orange-400">{categoryText}</span>
                          </div>
                          <span className="text-slate-500 text-xs">▼</span>
                        </div>
                      </button>
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
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-orange-500 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                          {feature.items.length > 3 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSection(`feature-${i}`);
                              }}
                              className="text-[10px] text-orange-400 hover:text-orange-300 pl-3"
                            >
                              {expandedSections.has(`feature-${i}`)
                                ? 'Show less'
                                : `+${feature.items.length - 3} more`}
                            </button>
                          )}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
