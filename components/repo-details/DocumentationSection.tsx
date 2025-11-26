"use client";

import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { DocStatus } from '@/types/repo';
import { getReadmeFreshness } from '@/lib/expandable-row-utils';

interface DocumentationSectionProps {
  docStatuses: DocStatus[];
  readmeLastUpdated?: string | null;
}

export function DocumentationSection({ docStatuses, readmeLastUpdated }: DocumentationSectionProps) {
  const coreDocs = docStatuses.filter((d) =>
    ['roadmap', 'tasks', 'metrics', 'features'].includes(d.doc_type)
  );
  const standardDocs = docStatuses.filter((d) => ['readme', 'contributing'].includes(d.doc_type));
  const otherDocs = docStatuses.filter(
    (d) =>
      !['roadmap', 'tasks', 'metrics', 'readme', 'features', 'contributing'].includes(d.doc_type)
  );

  const freshness = getReadmeFreshness(readmeLastUpdated);

  return (
    <div className="bg-slate-800/30 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
        <span className="text-lg">📄</span>
        <span>Documentation</span>
      </h4>

      {/* Core Docs */}
      <div className="mb-4">
        <h5 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Core</h5>
        <div className="space-y-2">
          {coreDocs.map((d) => (
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
  );
}
