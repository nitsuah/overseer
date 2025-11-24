'use client';

import { Fragment, useEffect, useState } from 'react';
import { RefreshCw, X, Filter, FileText, Map, ListTodo, Activity, ChevronDown, ChevronUp, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ExpandableRow } from '@/components/ExpandableRow';
import { detectRepoType, getTypeColor, RepoType } from '@/lib/repo-type';
import { calculateDocHealth, getDocHealthColor } from '@/lib/doc-health';
import { getLanguageColor } from '@/lib/language-colors';

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
  is_fork?: boolean;
  repo_type?: string;
  health_score?: number;
  testing_status?: string;
  coverage_score?: number;
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

function getHealthGrade(score: number = 0): { grade: string; color: string } {
  if (score >= 90) return { grade: 'A', color: 'text-green-400' };
  if (score >= 80) return { grade: 'B', color: 'text-blue-400' };
  if (score >= 70) return { grade: 'C', color: 'text-yellow-400' };
  if (score >= 60) return { grade: 'D', color: 'text-orange-400' };
  return { grade: 'F', color: 'text-red-400' };
}

export default function DashboardPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repoDetails, setRepoDetails] = useState<Record<string, RepoDetails>>({});
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [fixingDoc, setFixingDoc] = useState(false);

  // Filter state
  const [filterType, setFilterType] = useState<RepoType | 'all'>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterFork, setFilterFork] = useState<'all' | 'no-forks' | 'forks-only'>('all');
  const [showFilters, setShowFilters] = useState(false);

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

  function toggleDescription(repoName: string) {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(repoName)) {
      newExpanded.delete(repoName);
    } else {
      newExpanded.add(repoName);
    }
    setExpandedDescriptions(newExpanded);
  }

  async function handleRemoveRepo(repoName: string) {
    if (!confirm(`Hide "${repoName}" from the list? You can re-sync to bring it back.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/repos/${repoName}/hide`, { method: 'POST' });
      if (res.ok) {
        await fetchRepos();
        // Remove from expanded and details
        const newExpanded = new Set(expandedRepos);
        newExpanded.delete(repoName);
        setExpandedRepos(newExpanded);
        const newDetails = { ...repoDetails };
        delete newDetails[repoName];
        setRepoDetails(newDetails);
      }
    } catch (error) {
      console.error('Failed to hide repo:', error);
    }
  }

  async function handleFixDoc(repoName: string, docType: string) {
    if (!confirm(`Create a PR to add ${docType.toUpperCase()}.md to ${repoName}?`)) {
      return;
    }

    try {
      setFixingDoc(true); // Set loading state
      const res = await fetch(`/api/repos/${repoName}/fix-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType }),
      });

      if (res.ok) {
        alert('PR created successfully!');
        // Ideally fetch details again or show a link
      } else {
        const err = await res.json();
        alert(`Failed to create PR: ${err.error}`);
      }
    } catch (error) {
      console.error('Failed to fix doc:', error);
      alert('Failed to create PR');
    } finally {
      setFixingDoc(false); // Clear loading state
    }
  }

  // Get unique languages and types for filters
  const languages = Array.from(new Set(repos.map(r => r.language).filter(Boolean))) as string[];
  const repoTypes: RepoType[] = ['web-app', 'game', 'tool', 'library', 'bot', 'research', 'unknown'];

  // Filter repos
  const filteredRepos = repos.filter(repo => {
    // Use stored repo_type if available, otherwise detect it
    const repoType = (repo.repo_type as RepoType) || detectRepoType(repo.name, repo.description, repo.language, repo.topics).type;

    if (filterType !== 'all' && repoType !== filterType) return false;
    if (filterLanguage !== 'all' && repo.language !== filterLanguage) return false;
    if (filterFork === 'no-forks' && repo.is_fork) return false;
    if (filterFork === 'forks-only' && !repo.is_fork) return false;

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400">Loading repositories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Repositories</h2>
            <p className="text-slate-400 mt-1">
              {filteredRepos.length} of {repos.length} {repos.length === 1 ? 'repository' : 'repositories'} {filteredRepos.length !== repos.length ? '(filtered)' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Repos'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="glass rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterLanguage('all');
                  setFilterFork('all');
                }}
                className="text-sm text-slate-400 hover:text-slate-200"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as RepoType | 'all')}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {repoTypes.map(type => (
                    <option key={type} value={type}>{type.replace('-', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Languages</option>
                  {languages.sort().map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Fork Status</label>
                <select
                  value={filterFork}
                  onChange={(e) => setFilterFork(e.target.value as 'all' | 'no-forks' | 'forks-only')}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Repos</option>
                  <option value="no-forks">No Forks</option>
                  <option value="forks-only">Forks Only</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredRepos.length === 0 ? (
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 hidden md:table-cell">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Language</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Health</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Docs</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Links</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRepos.map((repo) => {
                // Use stored repo_type if available, otherwise detect it
                const repoType = (repo.repo_type as RepoType) || detectRepoType(repo.name, repo.description, repo.language, repo.topics).type;
                const typeInfo = detectRepoType(repo.name, repo.description, repo.language, repo.topics);
                // Override type if we have stored type
                if (repo.repo_type) {
                  typeInfo.type = repoType;
                }
                const details = repoDetails[repo.name];
                const docHealth = details
                  ? calculateDocHealth(details.docStatuses, typeInfo.type)
                  : null;
                const isExpanded = expandedRepos.has(repo.name);
                const isDescExpanded = expandedDescriptions.has(repo.name);
                const health = getHealthGrade(repo.health_score || 0);

                return (
                  <Fragment key={repo.id}>
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleExpanded(repo.name)}
                          className="font-medium text-blue-400 hover:text-blue-300 transition-colors text-left flex items-center gap-2"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          {repo.name}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(typeInfo.type)}`}>
                          <span>{typeInfo.icon}</span>
                          <span className="capitalize">{typeInfo.type.replace('-', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 hidden md:table-cell">
                        <div
                          className={`cursor-pointer hover:text-slate-300 transition-colors ${isDescExpanded ? '' : 'truncate max-w-md'}`}
                          onClick={() => toggleDescription(repo.name)}
                          title="Click to expand/collapse"
                        >
                          {repo.description || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {repo.language ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLanguageColor(repo.language)}`}>
                            {repo.language}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${health.color}`}>{health.grade}</span>
                          {repo.testing_status === 'passing' && <span title="Tests Passing"><ShieldCheck className="h-4 w-4 text-green-400" /></span>}
                          {repo.testing_status === 'failing' && <span title="Tests Failing"><ShieldAlert className="h-4 w-4 text-red-400" /></span>}
                          {!repo.testing_status && <span title="No Test Status"><Shield className="h-4 w-4 text-slate-600" /></span>}
                          {repo.coverage_score !== null && repo.coverage_score !== undefined && (
                            <span className="text-xs text-slate-400">{repo.coverage_score}%</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {details ? (
                          <div className="flex items-center gap-2">
                            {details.docStatuses.find(d => d.doc_type === 'readme' && d.exists) ? (
                              <span title="README"><FileText className="h-4 w-4 text-slate-400" /></span>
                            ) : (
                              <button onClick={() => handleFixDoc(repo.name, 'readme')} title="Add README" className="opacity-20 hover:opacity-100 transition-opacity" disabled={fixingDoc}>
                                <FileText className={`h-4 w-4 ${fixingDoc ? 'animate-pulse text-blue-400' : 'text-slate-400'}`} />
                              </button>
                            )}
                            {details.docStatuses.find(d => d.doc_type === 'roadmap' && d.exists) ? (
                              <span title="ROADMAP"><Map className="h-4 w-4 text-blue-400" /></span>
                            ) : (
                              <button onClick={() => handleFixDoc(repo.name, 'roadmap')} title="Add ROADMAP" className="opacity-20 hover:opacity-100 transition-opacity" disabled={fixingDoc}>
                                <Map className={`h-4 w-4 ${fixingDoc ? 'animate-pulse text-blue-400' : 'text-blue-400'}`} />
                              </button>
                            )}
                            {details.docStatuses.find(d => d.doc_type === 'tasks' && d.exists) ? (
                              <span title="TASKS"><ListTodo className="h-4 w-4 text-purple-400" /></span>
                            ) : (
                              <button onClick={() => handleFixDoc(repo.name, 'tasks')} title="Add TASKS" className="opacity-20 hover:opacity-100 transition-opacity" disabled={fixingDoc}>
                                <ListTodo className={`h-4 w-4 ${fixingDoc ? 'animate-pulse text-blue-400' : 'text-purple-400'}`} />
                              </button>
                            )}
                            {details.docStatuses.find(d => d.doc_type === 'metrics' && d.exists) ? (
                              <span title="METRICS"><Activity className="h-4 w-4 text-green-400" /></span>
                            ) : (
                              <button onClick={() => handleFixDoc(repo.name, 'metrics')} title="Add METRICS" className="opacity-20 hover:opacity-100 transition-opacity" disabled={fixingDoc}>
                                <Activity className={`h-4 w-4 ${fixingDoc ? 'animate-pulse text-blue-400' : 'text-green-400'}`} />
                              </button>
                            )}
                            <span className={`text-xs font-medium ml-1 ${getDocHealthColor(docHealth?.score || 0)}`}>
                              {docHealth?.score}%
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
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRemoveRepo(repo.name)}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                          title="Hide this repository"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {isExpanded && details && (
                      <tr>
                        <td colSpan={8} className="p-0">
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
