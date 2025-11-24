'use client';

import { Fragment, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ExpandableRow } from '@/components/ExpandableRow';
import { detectRepoType, getTypeColor } from '@/lib/repo-type';
import { calculateDocHealth, getDocHealthColor } from '@/lib/doc-health';

interface Repo {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  branches_count: number;
  url: string;
  homepage: string | null;
  topics: string[];
  last_synced: string;
}

interface RepoDetails {
  tasks: Array<{
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    section: string | null;
  }>;
  roadmapItems: Array<{
    id: string;
    title: string;
    quarter: string | null;
    status: 'planned' | 'in-progress' | 'completed';
  }>;
  docStatuses: Array<{
    doc_type: string;
    exists: boolean;
  }>;
}

export default function DashboardPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repoDetails, setRepoDetails] = useState<Record<string, RepoDetails>>({});
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchRepos();
  }, []);

  async function fetchRepos() {
    try {
      setLoading(true);
      const res = await fetch('/api/repos');
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
      }
    } catch (error) {
      console.error('Failed to fetch repos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRepoDetails(repoName: string) {
    if (repoDetails[repoName]) return; // Already fetched

    try {
      const res = await fetch(`/api/repo-details/${repoName}`);
      if (res.ok) {
        const data = await res.json();
        setRepoDetails((prev) => ({
          ...prev,
          [repoName]: {
            tasks: data.tasks,
            roadmapItems: data.roadmapItems,
            docStatuses: data.docStatuses,
          },
        }));
      }
    } catch (error) {
      console.error('Failed to fetch repo details:', error);
    }
  }

  async function handleSync() {
    try {
      setSyncing(true);
      const res = await fetch('/api/sync-repos', { method: 'POST' });
      if (res.ok) {
        await fetchRepos();
        // Clear cached details
        setRepoDetails({});
        setExpandedRepos(new Set());
      }
    } catch (error) {
      console.error('Failed to sync repos:', error);
    } finally {
      setSyncing(false);
    }
  }

  function toggleExpanded(repoName: string) {
    const newExpanded = new Set(expandedRepos);
    if (newExpanded.has(repoName)) {
      newExpanded.delete(repoName);
    } else {
      newExpanded.add(repoName);
      fetchRepoDetails(repoName);
    }
    setExpandedRepos(newExpanded);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400">Loading repositories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Repositories</h2>
          <p className="text-slate-400 mt-1">
            {repos.length} {repos.length === 1 ? 'repository' : 'repositories'} tracked
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Repos'}
        </button>
      </div>

      {repos.length === 0 ? (
        <div className="glass rounded-lg p-12 text-center">
          <p className="text-slate-400 text-lg">No repositories found</p>
          <p className="text-slate-500 text-sm mt-2">
            Click "Sync Repos" to fetch your GitHub repositories
          </p>
        </div>
      ) : (
        <div className="glass rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Repository</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Language</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Stars</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Docs</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {repos.map((repo) => {
                const typeInfo = detectRepoType(repo.name, repo.description, repo.language, repo.topics);
                const details = repoDetails[repo.name];
                const docHealth = details
                  ? calculateDocHealth(details.docStatuses, typeInfo.type)
                  : null;
                const isExpanded = expandedRepos.has(repo.name);

                return (
                  <Fragment key={repo.id}>
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleExpanded(repo.name)}
                          className="font-medium text-blue-400 hover:text-blue-300 transition-colors text-left"
                        >
                          {repo.name}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(typeInfo.type)}`}>
                          <span>{typeInfo.icon}</span>
                          <span className="capitalize">{typeInfo.type.replace('-', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 max-w-md truncate">
                        {repo.description || '—'}
                      </td>
                      <td className="px-6 py-4">
                        {repo.language ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800">
                            {repo.language}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{repo.stars}</td>
                      <td className="px-6 py-4">
                        {docHealth ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${getDocHealthColor(docHealth.score)}`}>
                              {docHealth.score}%
                            </span>
                            <span className="text-xs text-slate-500">
                              ({docHealth.present}/{docHealth.expected})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white transition-colors"
                            title="GitHub"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </a>
                          {repo.homepage && (
                            <a
                              href={repo.homepage}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-white transition-colors"
                              title="Homepage"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && details && (
                      <tr>
                        <td colSpan={7} className="p-0">
                          <ExpandableRow
                            repoName={repo.name}
                            tasks={details.tasks}
                            roadmapItems={details.roadmapItems}
                            docStatuses={details.docStatuses}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
