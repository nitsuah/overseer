"use client";

import { Toast } from '@/components/Toast';
import React, { Fragment, useEffect, useState } from "react";
import {
  RefreshCw,
  X,
  Filter,
  Clock,
  GitPullRequest,
  AlertCircle,
  Activity,
  Map,
  ListTodo,
  Sparkles,
  Play,
  Github,
  ExternalLink,
} from "lucide-react";
import ExpandableRow from "@/components/ExpandableRow";
import { detectRepoType, getTypeColor, RepoType } from "@/lib/repo-type";
import { calculateDocHealth, getDocHealthColor } from "@/lib/doc-health";
import { getLanguageColor } from "@/lib/language-colors";
import { formatTimeAgo, getCommitFreshnessColor } from "@/lib/date-utils";

interface Repo {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
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
  ai_summary?: string;
  last_commit_date?: string | null;
  open_prs?: number;
  open_issues_count?: number;
  readme_last_updated?: string | null;
}

interface RepoDetails {
  tasks: Array<{ id: string; title: string; status: "todo" | "in-progress" | "done"; section: string | null; subsection?: string | null }>;
  roadmapItems: Array<{ id: string; title: string; quarter: string | null; status: "planned" | "in-progress" | "completed" }>;
  docStatuses: Array<{ doc_type: string; exists: boolean; health_state?: string }>;
  metrics: Array<{ name: string; value: number; unit: string | null }>;
  features: Array<{ id: string; category: string; title: string; description: string; items: string[] }>;
  bestPractices: Array<{ practice_type: string; status: string; details: Record<string, unknown> }>;
  communityStandards: Array<{ standard_type: string; status: string; details: Record<string, unknown> }>;
}

function getHealthGrade(score: number = 0): { grade: string; color: string } {
  if (score >= 90) return { grade: "A", color: "text-green-400" };
  if (score >= 80) return { grade: "B", color: "text-blue-400" };
  if (score >= 70) return { grade: "C", color: "text-yellow-400" };
  if (score >= 60) return { grade: "D", color: "text-orange-400" };
  return { grade: "F", color: "text-red-400" };
}

export default function DashboardPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repoDetails, setRepoDetails] = useState<Record<string, RepoDetails>>({});
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingRepo, setSyncingRepo] = useState<string | null>(null);
  const [fixingDoc, setFixingDoc] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);
  const [showAddRepo, setShowAddRepo] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addRepoUrl, setAddRepoUrl] = useState("");
  const [addRepoType, setAddRepoType] = useState<RepoType>("unknown");
  const [addingRepo, setAddingRepo] = useState(false);
  const [filterType, setFilterType] = useState<RepoType | "all">("all");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [filterFork, setFilterFork] = useState<"all" | "no-forks" | "forks-only">("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRepos();
  }, []);

  async function fetchRepos() {
    try {
      setLoading(true);
      const res = await fetch("/api/repos");
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
      }
    } catch (error) {
      console.error("Failed to fetch repos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRepoDetails(repoName: string) {
    if (repoDetails[repoName]) return;
    try {
      const res = await fetch(`/api/repo-details/${repoName}`);
      if (res.ok) {
        const data = await res.json();
        setRepoDetails(prev => ({
          ...prev,
          [repoName]: {
            tasks: data.tasks || [],
            roadmapItems: data.roadmapItems || [],
            docStatuses: data.docStatuses || [],
            metrics: data.metrics || [],
            features: data.features || [],
            bestPractices: data.bestPractices || [],
            communityStandards: data.communityStandards || [],
          },
        }));
      }
    } catch (error) {
      console.error("Failed to fetch repo details:", error);
    }
  }

  async function handleAddRepo(e: React.FormEvent) {
    e.preventDefault();
    if (!addRepoUrl.trim()) return;
    try {
      setAddingRepo(true);
      const res = await fetch("/api/repos/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: addRepoUrl, type: addRepoType }),
      });
      if (res.ok) {
        const data = await res.json();
        setToastMessage(`Successfully added ${data.repo.fullName}`);
        setAddRepoUrl("");
        setAddRepoType("unknown");
        setShowAddRepo(false);
        await fetchRepos();
      } else {
        const err = await res.json();
        setToastMessage(`Failed to add repo: ${err.error}`);
      }
    } catch (error) {
      console.error("Failed to add repo:", error);
      setToastMessage(`Failed to add repo`);
    } finally {
      setAddingRepo(false);
    }
  }

  async function handleSync() {
    try {
      setSyncing(true);
      const res = await fetch("/api/sync-repos", { method: "POST" });
      if (res.ok) {
        await fetchRepos();
        setRepoDetails({});
        setExpandedRepos(new Set());
      }
    } catch (error) {
      console.error("Failed to sync repos:", error);
    } finally {
      setSyncing(false);
    }
  }

  function toggleExpanded(repoName: string) {
    const newSet = new Set(expandedRepos);
    if (newSet.has(repoName)) {
      newSet.delete(repoName);
    } else {
      newSet.add(repoName);
      fetchRepoDetails(repoName);
    }
    setExpandedRepos(newSet);
  }

  async function handleRemoveRepo(repoName: string) {
    try {
      const res = await fetch(`/api/repos/${repoName}/hide`, { method: "POST" });
      if (res.ok) {
        await fetchRepos();
        const newExpanded = new Set(expandedRepos);
        newExpanded.delete(repoName);
        setExpandedRepos(newExpanded);
        const newDetails = { ...repoDetails };
        delete newDetails[repoName];
        setRepoDetails(newDetails);
        setToastMessage(`Successfully hid ${repoName}`);
      } else {
        const err = await res.json();
        setToastMessage(`Failed to hide repo: ${err.error}`);
      }
    } catch (error) {
      console.error("Failed to hide repo:", error);
      setToastMessage(`Failed to hide repo`);
    }
  }

  async function handleFixAllDocs(repoName: string) {
    if (!confirm(`Create a single PR to add ALL missing docs to ${repoName}?`)) return;
    try {
      setFixingDoc(true);
      const res = await fetch(`/api/repos/${repoName}/fix-all-docs`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.prUrl) {
          window.open(data.prUrl, '_blank');
        }
        setToastMessage(`PR created! Added ${data.count} files.`);
      } else {
        const err = await res.json();
        setToastMessage(err.message || `Failed to create PR: ${err.error}`);
      }
    } catch (error) {
      console.error("Failed to fix all docs:", error);
      setToastMessage("Failed to create PR");
    } finally {
      setFixingDoc(false);
    }
  }

  async function handleGenerateSummary(repoName: string) {
    try {
      setGeneratingSummary(repoName);
      const res = await fetch(`/api/repos/${repoName}/generate-summary`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setRepos(prev =>
          prev.map(r => (r.name === repoName ? { ...r, ai_summary: data.summary } : r))
        );
        setToastMessage(`AI summary generated for ${repoName}.`);
      } else {
        const err = await res.json();
        setToastMessage(`Failed to generate summary: ${err.error}`);
      }
    } catch (error) {
      console.error("Failed to generate summary:", error);
      setToastMessage(`Failed to generate summary`);
    } finally {
      setGeneratingSummary(null);
    }
  }

  async function handleSyncSingleRepo(repoName: string) {
    try {
      setSyncingRepo(repoName);
      const res = await fetch(`/api/repos/${repoName}/sync`, { method: "POST" });
      if (res.ok) {
        await fetchRepos();
        // Refresh details if expanded
        if (expandedRepos.has(repoName)) {
          setRepoDetails(prev => {
            const newDetails = { ...prev };
            delete newDetails[repoName];
            return newDetails;
          });
          await fetchRepoDetails(repoName);
        }
        setToastMessage(`Successfully synced ${repoName}!`);
      } else {
        const err = await res.json();
        setToastMessage(`Failed to sync: ${err.error}`);
      }
    } catch (error) {
      console.error("Failed to sync repo:", error);
      setToastMessage(`Failed to sync repo`);
    } finally {
      setSyncingRepo(null);
    }
  }

  const languages = Array.from(new Set(repos.map(r => r.language).filter(Boolean))) as string[];
  const repoTypes: RepoType[] = ["web-app", "game", "tool", "library", "bot", "research", "unknown"];

  const filteredRepos = repos.filter(repo => {
    const type = (repo.repo_type as RepoType) || detectRepoType(repo.name, repo.description, repo.language, repo.topics).type;
    if (filterType !== "all" && type !== filterType) return false;
    if (filterLanguage !== "all" && repo.language !== filterLanguage) return false;
    if (filterFork === "no-forks" && repo.is_fork) return false;
    if (filterFork === "forks-only" && !repo.is_fork) return false;
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
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Repositories</h2>
              <p className="text-slate-400 mt-1">
                {filteredRepos.length} of {repos.length} {repos.length === 1 ? "repository" : "repositories"}
                {filteredRepos.length !== repos.length ? " (filtered)" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {showAddRepo ? (
                <form onSubmit={handleAddRepo} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={addRepoUrl}
                    onChange={e => setAddRepoUrl(e.target.value)}
                    placeholder="owner/repo or URL"
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                    autoFocus
                  />
                  <select
                    value={addRepoType}
                    onChange={e => setAddRepoType(e.target.value as RepoType)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="unknown">Unknown</option>
                    <option value="web-app">Web App</option>
                    <option value="game">Game</option>
                    <option value="tool">Tool</option>
                    <option value="library">Library</option>
                    <option value="bot">Bot</option>
                    <option value="research">Research</option>
                  </select>
                  <button
                    type="submit"
                    disabled={addingRepo}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {addingRepo ? "Adding..." : "Add"}
                  </button>
                  <button type="button" onClick={() => setShowAddRepo(false)} className="p-2 text-slate-400 hover:text-slate-200">
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <>
                  <button
                    onClick={() => setShowAddRepo(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                  >
                    <span className="text-xl leading-none">+</span> Add Repo
                  </button>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-200"}`}
                  >
                    <Filter className="h-4 w-4" /> Filters
                  </button>
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                    {syncing ? "Syncing..." : "Sync Repos"}
                  </button>
                </>
              )}
            </div>
          </div>
          {showFilters && (
            <div className="glass rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => { setFilterType("all"); setFilterLanguage("all"); setFilterFork("all"); }} className="text-sm text-slate-400 hover:text-slate-200">
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value as RepoType | "all")}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    {repoTypes.map(t => (
                      <option key={t} value={t}>{t.replace("-", " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                  <select
                    value={filterLanguage}
                    onChange={e => setFilterLanguage(e.target.value)}
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
                    onChange={e => setFilterFork(e.target.value as "all" | "no-forks" | "forks-only")}
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
            <p className="text-slate-500 text-sm mt-2">Click &quot;Sync Repos&quot; to fetch your GitHub repositories</p>
          </div>
        ) : (
          <div className="glass rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Repository</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 hidden xl:table-cell">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Language</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Health</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Activity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Links</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    <div className="flex items-center gap-2">Docs</div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRepos.map(repo => {
                  const typeInfo = detectRepoType(repo.name, repo.description, repo.language, repo.topics);
                  const repoType = (repo.repo_type as RepoType) || typeInfo.type;
                  const details = repoDetails[repo.name];
                  const docHealth = details ? calculateDocHealth(details.docStatuses, repoType) : null;
                  const isExpanded = expandedRepos.has(repo.name);
                  const health = getHealthGrade(repo.health_score || 0);
                  return (
                    <Fragment key={repo.id}>
                      <tr
                        className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                        onClick={() => toggleExpanded(repo.name)}
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                            {repo.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(repoType)}`}>
                <span>{typeInfo.icon}</span>
                <span className="capitalize">{repoType.replace("-", " ")}</span>
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-slate-400 hidden xl:table-cell">
              <div className="truncate max-w-md" title={repo.description || ""}>
                {repo.description || "—"}
              </div>
            </td>
            <td className="px-6 py-4">
              {repo.language ? (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLanguageColor(repo.language)}`}> {repo.language} </span>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </td>
            <td className="px-6 py-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${health.color}`}>{health.grade}</span>
                  {details && (
                    <>
                      {/* Testing Shield - Blue */}
                      {(() => {
                        const testingPractice = details.bestPractices.find(p => p.practice_type === 'testing_framework');
                        const testingCount = details.bestPractices.filter(p => 
                          ['testing_framework', 'ci_cd'].includes(p.practice_type) && p.status === 'healthy'
                        ).length;
                        const testingTotal = details.bestPractices.filter(p => 
                          ['testing_framework', 'ci_cd'].includes(p.practice_type)
                        ).length;
                        const hasTests = testingPractice && testingPractice.status === 'healthy';
                        return (
                          <span 
                            title={`Testing: ${testingCount}/${testingTotal} checks`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              hasTests ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-500'
                            }`}
                          >
                            {testingCount}/{testingTotal}
                          </span>
                        );
                      })()}
                      {/* Best Practices Shield - Purple */}
                      {(() => {
                        const healthyCount = details.bestPractices.filter(p => p.status === 'healthy').length;
                        const totalCount = details.bestPractices.length;
                        const percentage = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 0;
                        return (
                          <span 
                            title={`Best Practices: ${healthyCount}/${totalCount} (${percentage}%)`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              percentage >= 70 ? 'bg-purple-500/20 text-purple-400' : 
                              percentage >= 40 ? 'bg-yellow-500/20 text-yellow-400' : 
                              'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {healthyCount}/{totalCount}
                          </span>
                        );
                      })()}
                      {/* Community Standards Shield - Green */}
                      {(() => {
                        const healthyCount = details.communityStandards.filter(s => s.status === 'healthy').length;
                        const totalCount = details.communityStandards.length;
                        const percentage = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 0;
                        return (
                          <span 
                            title={`Community Standards: ${healthyCount}/${totalCount} (${percentage}%)`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              percentage >= 70 ? 'bg-green-500/20 text-green-400' : 
                              percentage >= 40 ? 'bg-yellow-500/20 text-yellow-400' : 
                              'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {healthyCount}/{totalCount}
                          </span>
                        );
                      })()}
                    </>
                  )}
                </div>
                {repo.coverage_score != null && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-1.5 w-16">
                      <div
                        className="bg-linear-to-r from-blue-500 to-blue-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(repo.coverage_score, 100)}%` }}
                        title={`${repo.coverage_score}% coverage`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 w-8">{repo.coverage_score}%</span>
                  </div>
                )}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex flex-col gap-1 text-xs">
                <div className={`flex items-center gap-1 ${getCommitFreshnessColor(repo.last_commit_date)}`} title={repo.last_commit_date || "No commits"}>
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(repo.last_commit_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  {repo.open_prs && repo.open_prs > 0 && (
                    <span className="flex items-center gap-1" title={`${repo.open_prs} open PRs`}>
                      <GitPullRequest className="h-3 w-3" /> {repo.open_prs}
                    </span>
                  )}
                  {repo.open_issues_count && repo.open_issues_count > 0 && (
                    <span className="flex items-center gap-1" title={`${repo.open_issues_count} open issues`}>
                      <AlertCircle className="h-3 w-3" /> {repo.open_issues_count}
                    </span>
                  )}
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="p-1 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded transition-colors" title="View on GitHub">
                  <Github className="h-4 w-4" />
                </a>
                {repo.homepage && (
                  <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="p-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded transition-colors" title="Visit Homepage">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </td>
            <td className="px-6 py-4">
              {details ? (
                <div className="flex items-center gap-2">
                  {/* Roadmap */}
                  {(() => {
                    const doc = details.docStatuses.find(d => d.doc_type === "roadmap");
                    const exists = doc && doc.exists;
                    const healthState = doc?.health_state || (exists ? 'healthy' : 'missing');
                    const iconColor = healthState === 'healthy' ? 'text-blue-400' : healthState === 'dormant' ? 'text-yellow-400' : healthState === 'malformed' ? 'text-orange-400' : 'text-slate-600';
                    return exists ? (
                      <span title="ROADMAP"><Map className={`h-4 w-4 ${iconColor}`} /></span>
                    ) : (
                      <span title="ROADMAP missing"><Map className="h-4 w-4 opacity-20" /></span>
                    );
                  })()}
                  {/* Tasks */}
                  {(() => {
                    const doc = details.docStatuses.find(d => d.doc_type === "tasks");
                    const exists = doc && doc.exists;
                    const healthState = doc?.health_state || (exists ? 'healthy' : 'missing');
                    const iconColor = healthState === 'healthy' ? 'text-purple-400' : healthState === 'dormant' ? 'text-yellow-400' : healthState === 'malformed' ? 'text-orange-400' : 'text-slate-600';
                    return exists ? (
                      <span title="TASKS"><ListTodo className={`h-4 w-4 ${iconColor}`} /></span>
                    ) : (
                      <span title="TASKS missing"><ListTodo className="h-4 w-4 opacity-20" /></span>
                    );
                  })()}
                  {/* Metrics */}
                  {(() => {
                    const doc = details.docStatuses.find(d => d.doc_type === "metrics");
                    const exists = doc && doc.exists;
                    const healthState = doc?.health_state || (exists ? 'healthy' : 'missing');
                    const iconColor = healthState === 'healthy' ? 'text-green-400' : healthState === 'dormant' ? 'text-yellow-400' : healthState === 'malformed' ? 'text-orange-400' : 'text-slate-600';
                    return exists ? (
                      <span title="METRICS"><Activity className={`h-4 w-4 ${iconColor}`} /></span>
                    ) : (
                      <span title="METRICS missing"><Activity className="h-4 w-4 opacity-20" /></span>
                    );
                  })()}
                  {/* Features */}
                  {(() => {
                    const doc = details.docStatuses.find(d => d.doc_type === "features");
                    const exists = doc && doc.exists;
                    const healthState = doc?.health_state || (exists ? 'healthy' : 'missing');
                    const iconColor = healthState === 'healthy' ? 'text-indigo-400' : healthState === 'dormant' ? 'text-yellow-400' : healthState === 'malformed' ? 'text-orange-400' : 'text-slate-600';
                    return exists ? (
                      <span title="FEATURES"><Sparkles className={`h-4 w-4 ${iconColor}`} /></span>
                    ) : (
                      <span title="FEATURES missing"><Sparkles className="h-4 w-4 opacity-20" /></span>
                    );
                  })()}
                  <span className={`text-xs font-medium ml-1 ${getDocHealthColor(docHealth?.score || 0)}`}>{docHealth?.score}%</span>
                  {(() => {
                    const coreDocs = ['roadmap', 'tasks', 'metrics', 'features'];
                    const allDocsPresent = coreDocs.every(docType => details.docStatuses.find(d => d.doc_type === docType && d.exists));
                    return !allDocsPresent && docHealth && docHealth.score < 100 && (
                      <button 
                        onClick={() => handleFixAllDocs(repo.name)} 
                        className="ml-2 p-1 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded transition-colors" 
                        title="Fix all missing docs" 
                        disabled={fixingDoc}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>
                    );
                  })()}
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSyncSingleRepo(repo.name);
                  }}
                  disabled={syncingRepo === repo.name}
                  className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 disabled:opacity-50"
                  title="Click to sync and load docs"
                >
                  <RefreshCw className={`h-3 w-3 ${syncingRepo === repo.name ? 'animate-spin' : ''}`} />
                  {syncingRepo === repo.name ? 'Syncing...' : formatTimeAgo(repo.last_synced)}
                </button>
              )}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateSummary(repo.name);
                  }}
                  className="p-1.5 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded transition-colors disabled:opacity-50"
                  title={generatingSummary === repo.name ? "Generating AI summary..." : "Generate AI summary"}
                  disabled={generatingSummary === repo.name}
                >
                  <Sparkles className={`h-4 w-4 ${generatingSummary === repo.name ? 'animate-pulse' : ''}`} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleRemoveRepo(repo.name); 
                  }} 
                  className="p-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors" 
                  title="Hide this repository"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
          {isExpanded && details && (
            <tr>
              <td colSpan={9} className="p-0">
                <ExpandableRow
                  tasks={details.tasks}
                  roadmapItems={details.roadmapItems}
                  docStatuses={details.docStatuses}
                  metrics={details.metrics}
                  features={details.features}
                  bestPractices={details.bestPractices}
                  communityStandards={details.communityStandards}
                  aiSummary={repo.ai_summary}
                  stars={repo.stars}
                  forks={repo.forks}
                  branches={repo.branches_count}
                  testingStatus={repo.testing_status}
                  coverageScore={repo.coverage_score}
                  readmeLastUpdated={repo.readme_last_updated}
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
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
}
