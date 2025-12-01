"use client";

import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { DocStatus } from '@/types/repo';
import { getReadmeFreshness } from '@/lib/expandable-row-utils';
import { useState } from 'react';

interface DocumentationSectionProps {
  docStatuses: DocStatus[];
  readmeLastUpdated?: string | null;
  repoName?: string;
  isAuthenticated?: boolean;
  onFixDoc?: (repoName: string, docType: string) => void;
  onFixAllDocs?: (repoName: string) => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export function DocumentationSection({ 
  docStatuses, 
  readmeLastUpdated,
  repoName,
  isAuthenticated = true,
  onFixDoc,
  onFixAllDocs,
  isExpanded: isExpandedProp,
  onToggleExpanded,
}: DocumentationSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = isExpandedProp !== undefined ? isExpandedProp : internalExpanded;
  const setIsExpanded = onToggleExpanded || (() => setInternalExpanded(!internalExpanded));
  
  const coreDocs = docStatuses.filter((d) =>
    ['roadmap', 'tasks', 'metrics', 'features'].includes(d.doc_type)
  );
  const standardDocs = docStatuses.filter((d) => ['readme'].includes(d.doc_type));
  // Removed contributing, changelog and license - they're covered in Community Standards
  const otherDocs = docStatuses.filter(
    (d) =>
      !['roadmap', 'tasks', 'metrics', 'readme', 'features', 'contributing', 'changelog', 'license'].includes(d.doc_type)
  );

  const missingWithTemplates = docStatuses.filter(
    (d) => !d.exists && ['roadmap', 'tasks', 'metrics', 'features', 'readme'].includes(d.doc_type)
  );

  const freshness = getReadmeFreshness(readmeLastUpdated);

  const supportedFixTypes = new Set([
    'roadmap', 'tasks', 'features', 'metrics', 'readme',
    'code_of_conduct', 'contributing', 'security'
  ]);

  return (
    <div className="bg-gradient-to-br from-amber-900/30 via-slate-800/50 to-amber-800/20 rounded-lg overflow-hidden border border-amber-500/40 shadow-lg shadow-amber-500/10 hover:border-amber-400/50 transition-colors">
      <div
        className="w-full px-4 py-3 hover:bg-amber-900/20 transition-colors border-b border-amber-500/20 cursor-pointer"
        onClick={setIsExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📄</span>
            <h4 className="text-sm font-semibold text-slate-200">Documentation</h4>
            <span
              title={`Documentation: ${[...coreDocs, ...standardDocs].filter(d => d.exists).length}/5 core docs present`}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ml-1 ${
                [...coreDocs, ...standardDocs].filter(d => d.exists).length === 5
                  ? 'bg-slate-500/20 text-slate-400'
                  : [...coreDocs, ...standardDocs].filter(d => d.exists).length >= 3
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {[...coreDocs, ...standardDocs].filter(d => d.exists).length}/5
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && missingWithTemplates.length > 0 && onFixAllDocs && repoName && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFixAllDocs(repoName);
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium transition-colors"
                title="Create PR for all missing documentation"
              >
                Fix All ({missingWithTemplates.length})
              </button>
            )}
            <span className="text-slate-500 text-xs">{isExpanded ? '▼' : '▶'}</span>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 py-3">
          {/* Core Docs */}
          <div className="mb-4">
        <h5 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Core</h5>
        <div className="space-y-2">
          {coreDocs
            .sort((a, b) => {
              // Define custom order: roadmap, tasks, features, metrics
              const order = ['roadmap', 'tasks', 'features', 'metrics'];
              const aIndex = order.indexOf(a.doc_type);
              const bIndex = order.indexOf(b.doc_type);
              const aPos = aIndex === -1 ? 999 : aIndex;
              const bPos = bIndex === -1 ? 999 : bIndex;
              return aPos - bPos;
            })
            .map((d) => (
            <div key={d.doc_type} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {d.exists ? (
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-400" />
                )}
                <span className={d.exists ? 'text-slate-300' : 'text-slate-500'}>
                  {d.doc_type.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isAuthenticated && !d.exists && onFixDoc && repoName && supportedFixTypes.has(d.doc_type) && (
                  <button
                    onClick={() => onFixDoc(repoName, d.doc_type)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium transition-colors"
                    title={`Create PR for ${d.doc_type.toUpperCase()}`}
                  >
                    Fix
                  </button>
                )}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    d.exists ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {d.exists ? 'Present' : 'Missing'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standard Docs */}
      <div className="mb-4">
        <h5 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
          Standard
        </h5>
        <div className="space-y-2">
          {standardDocs.map((d) => (
            <div key={d.doc_type} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {d.exists ? (
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-400" />
                )}
                <span className={d.exists ? 'text-slate-300' : 'text-slate-500'}>
                  {d.doc_type.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isAuthenticated && !d.exists && onFixDoc && repoName && supportedFixTypes.has(d.doc_type) && (
                  <button
                    onClick={() => onFixDoc(repoName, d.doc_type)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium transition-colors"
                    title={`Create PR for ${d.doc_type.toUpperCase()}`}
                  >
                    Fix
                  </button>
                )}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    d.exists ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {d.exists ? 'Present' : 'Missing'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Docs */}
      {otherDocs.length > 0 && (
        <div>
          <h5 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Other
          </h5>
          <div className="space-y-2">
            {otherDocs.map((d) => (
              <div key={d.doc_type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {d.exists ? (
                    <CheckCircle2 className="h-3 w-3 text-green-400" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-400" />
                  )}
                  <span className={d.exists ? 'text-slate-300' : 'text-slate-500'}>
                    {d.doc_type.toUpperCase()}
                  </span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    d.exists ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {d.exists ? 'Present' : 'Missing'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* README Freshness */}
      {readmeLastUpdated && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">README Updated</span>
            <span className={`${freshness.color} font-medium flex items-center gap-1`}>
              <Clock className="h-3 w-3" />
              {freshness.daysSince}d ago ({freshness.label})
            </span>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
