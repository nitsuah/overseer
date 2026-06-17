"use client";

import { CheckCircle2, XCircle, Clock, Sparkles, Loader2, X } from 'lucide-react';
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

interface ImproveState {
  docType: string;
  stage: 'prompt' | 'loading' | 'preview';
  userPrompt: string;
  original: string;
  improved: string;
  error: string | null;
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
  const [improve, setImprove] = useState<ImproveState | null>(null);

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

  const improvableTypes = new Set([
    'readme', 'roadmap', 'tasks', 'metrics', 'features',
    'contributing', 'security', 'changelog', 'code_of_conduct',
  ]);

  async function submitImprove(state: ImproveState) {
    if (!repoName) return;
    setImprove({ ...state, stage: 'loading', error: null });
    try {
      const res = await fetch(`/api/repos/${encodeURIComponent(repoName)}/improve-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: state.docType, userPrompt: state.userPrompt || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImprove({ ...state, stage: 'prompt', error: data.error || 'Failed to improve doc' });
        return;
      }
      setImprove({ ...state, stage: 'preview', original: data.original, improved: data.improved, error: null });
    } catch {
      setImprove({ ...state, stage: 'prompt', error: 'Network error' });
    }
  }

  const [acceptingImprove, setAcceptingImprove] = useState(false);

  async function acceptImproved() {
    if (!improve || !repoName) return;
    setAcceptingImprove(true);
    try {
      const docPaths: Record<string, string> = {
        readme: 'README.md', roadmap: 'ROADMAP.md', tasks: 'TASKS.md',
        metrics: 'METRICS.md', features: 'FEATURES.md', contributing: 'CONTRIBUTING.md',
        security: 'SECURITY.md', changelog: 'CHANGELOG.md', code_of_conduct: 'CODE_OF_CONDUCT.md',
      };
      const res = await fetch(`/api/repos/${encodeURIComponent(repoName)}/fix-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType: improve.docType,
          content: improve.improved,
          path: docPaths[improve.docType],
        }),
      });
      const data = await res.json();
      if (res.ok && data.prUrl) {
        window.open(data.prUrl, '_blank');
        setImprove(null);
      } else {
        setImprove({ ...improve, error: data.error || 'Failed to create PR', stage: 'preview' });
      }
    } catch {
      setImprove({ ...improve, error: 'Network error creating PR', stage: 'preview' });
    } finally {
      setAcceptingImprove(false);
    }
  }

  function renderDocRow(d: DocStatus, showImprove: boolean) {
    const isImproving = improve?.docType === d.doc_type;
    const currentImprove = isImproving ? improve! : null;

    return (
      <div key={d.doc_type}>
        <div className="flex items-center justify-between text-xs">
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
          <div className="flex items-center gap-1.5">
            {isAuthenticated && d.exists && showImprove && repoName && improvableTypes.has(d.doc_type) && (
              <button
                onClick={() =>
                  isImproving
                    ? setImprove(null)
                    : setImprove({ docType: d.doc_type, stage: 'prompt', userPrompt: '', original: '', improved: '', error: null })
                }
                className="px-2 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded text-[10px] font-medium transition-colors flex items-center gap-1"
                title={`AI-improve ${d.doc_type.toUpperCase()}`}
              >
                <Sparkles className="h-2.5 w-2.5" />
                Improve
              </button>
            )}
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

        {isImproving && currentImprove && (
          <div className="mt-2 ml-5 rounded-lg border border-purple-500/30 bg-purple-950/20 overflow-hidden">
            {currentImprove.stage === 'prompt' && (
              <div className="p-3 space-y-2">
                <p className="text-[10px] text-slate-400">
                  Optionally describe what to focus on (e.g. &ldquo;add setup instructions, use simpler language&rdquo;):
                </p>
                <input
                  type="text"
                  value={currentImprove.userPrompt}
                  onChange={(e) => setImprove({ ...currentImprove, userPrompt: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitImprove(currentImprove); }}
                  placeholder="Custom instructions (optional)"
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50"
                  autoFocus
                />
                {currentImprove.error && (
                  <p className="text-[10px] text-red-400">{currentImprove.error}</p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => submitImprove(currentImprove)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-medium transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    Generate
                  </button>
                  <button
                    onClick={() => setImprove(null)}
                    className="px-2 py-1 text-slate-500 hover:text-slate-300 rounded text-[10px] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {currentImprove.stage === 'loading' && (
              <div className="p-3 flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="h-3 w-3 animate-spin text-purple-400" />
                Generating improved version…
              </div>
            )}

            {currentImprove.stage === 'preview' && (
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider">
                    AI-Improved Preview
                  </span>
                  <button onClick={() => setImprove(null)} className="text-slate-600 hover:text-slate-400 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Original</p>
                    <pre className="text-[10px] text-slate-400 whitespace-pre-wrap break-words bg-slate-900/40 rounded p-2 max-h-48 overflow-y-auto font-mono leading-relaxed">
                      {currentImprove.original.slice(0, 2000)}{currentImprove.original.length > 2000 ? '\n…' : ''}
                    </pre>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-wider text-purple-400 font-semibold">Improved</p>
                    <pre className="text-[10px] text-slate-200 whitespace-pre-wrap break-words bg-purple-950/30 rounded p-2 max-h-48 overflow-y-auto font-mono leading-relaxed border border-purple-500/20">
                      {currentImprove.improved.slice(0, 2000)}{currentImprove.improved.length > 2000 ? '\n…' : ''}
                    </pre>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentImprove.error && (
                    <p className="text-[10px] text-red-400">{currentImprove.error}</p>
                  )}
                  <button
                    onClick={acceptImproved}
                    disabled={acceptingImprove}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded text-[10px] font-medium transition-colors flex items-center gap-1"
                  >
                    {acceptingImprove ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : null}
                    Accept & Create PR
                  </button>
                  <button
                    onClick={() => setImprove({ ...currentImprove, stage: 'prompt' })}
                    className="px-2 py-1 text-slate-400 hover:text-slate-200 rounded text-[10px] transition-colors"
                  >
                    Refine prompt
                  </button>
                  <button
                    onClick={() => setImprove(null)}
                    className="px-2 py-1 text-slate-500 hover:text-slate-300 rounded text-[10px] transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-900/30 via-slate-800/50 to-amber-800/20 rounded-lg overflow-hidden border border-amber-500/40 shadow-lg shadow-amber-500/10 hover:border-amber-400/50 transition-colors" data-tour="documentation">
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
                  const order = ['roadmap', 'tasks', 'features', 'metrics'];
                  const aIndex = order.indexOf(a.doc_type);
                  const bIndex = order.indexOf(b.doc_type);
                  const aPos = aIndex === -1 ? 999 : aIndex;
                  const bPos = bIndex === -1 ? 999 : bIndex;
                  return aPos - bPos;
                })
                .map((d) => renderDocRow(d, true))}
            </div>
          </div>

          {/* Standard Docs */}
          <div className="mb-4">
            <h5 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              Standard
            </h5>
            <div className="space-y-2">
              {standardDocs.map((d) => renderDocRow(d, true))}
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
