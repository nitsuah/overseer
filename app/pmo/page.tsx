"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2, Circle,
    GitPullRequest, GitBranch, Zap, ChevronRight, Bot,
} from 'lucide-react';
import type { PmoRepoSummary, PmoPortfolio, PmoInProgressItem } from '@/app/api/pmo/overview/route';

// ─── helpers ────────────────────────────────────────────────────────────────

function healthGrade(score: number | null): { label: string; color: string } {
    if (score === null) return { label: '?', color: 'text-slate-400' };
    if (score >= 90) return { label: 'A', color: 'text-emerald-400' };
    if (score >= 80) return { label: 'B', color: 'text-green-400' };
    if (score >= 70) return { label: 'C', color: 'text-yellow-400' };
    if (score >= 60) return { label: 'D', color: 'text-orange-400' };
    return { label: 'F', color: 'text-red-400' };
}

function ciColor(status: string | null) {
    if (status === 'passing') return 'text-emerald-400';
    if (status === 'failing') return 'text-red-400';
    return 'text-slate-500';
}

function roadmapPct(rm: PmoRepoSummary['roadmap']): number {
    if (rm.total === 0) return 0;
    return Math.round((rm.done / rm.total) * 100);
}

// ─── pipeline stage count cell ───────────────────────────────────────────────

function StageCell({ label, count, color, sub }: { label: string; count: number; color: string; sub?: string }) {
    return (
        <div className="flex flex-col items-center gap-1 flex-1 py-4 px-3 border-r last:border-r-0 border-white/5">
            <span className={`text-3xl font-black tabular-nums ${color}`}>{count}</span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</span>
            {sub && <span className="text-[10px] text-slate-500">{sub}</span>}
        </div>
    );
}

// ─── handoff button ──────────────────────────────────────────────────────────

function HandoffButton({ repoName, item, onHandoff }: {
    repoName: string;
    item: PmoInProgressItem;
    onHandoff: (repoName: string, item: PmoInProgressItem, taskId: string) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(!!item.agent_task_id);
    const [err, setErr] = useState<string | null>(null);

    const handle = async () => {
        setLoading(true);
        setErr(null);
        try {
            // 1. Enqueue the agent task
            const taskRes = await fetch('/api/agent/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'roadmap-handoff',
                    priority: 'normal',
                    payload: {
                        repoName,
                        itemId: item.id,
                        title: item.title,
                        quarter: item.quarter,
                    },
                }),
            });
            if (!taskRes.ok) throw new Error('Agent task queue error');
            const { task } = await taskRes.json();

            // 2. Link the agent task id back to the roadmap item
            const patchRes = await fetch(`/api/repos/${repoName}/roadmap-items/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentTaskId: task.id }),
            });
            if (!patchRes.ok) throw new Error('Failed to link agent task');

            onHandoff(repoName, item, task.id);
            setDone(true);
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Error');
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Queued
            </span>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {err && <span className="text-xs text-red-400">{err}</span>}
            <button
                onClick={handle}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 hover:text-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                    <Bot className="h-3 w-3" />
                )}
                {loading ? 'Queuing…' : 'Hand off'}
                {!loading && <ChevronRight className="h-3 w-3 opacity-60" />}
            </button>
        </div>
    );
}

// ─── per-repo card ────────────────────────────────────────────────────────────

function RepoCard({ repo, onHandoff }: {
    repo: PmoRepoSummary;
    onHandoff: (repoName: string, item: PmoInProgressItem, taskId: string) => void;
}) {
    const grade = healthGrade(repo.health_score);
    const pct = roadmapPct(repo.roadmap);
    const hasActivity = repo.roadmap.total > 0 || repo.tasks.total > 0;
    const hasStale = repo.roadmap.stale_count > 0;

    return (
        <div className={`rounded-xl border bg-slate-900/60 backdrop-blur-sm transition-all duration-200
            ${hasStale
                ? 'border-amber-500/30 shadow-sm shadow-amber-500/10'
                : 'border-white/8 hover:border-white/15'}`}
        >
            {/* Card header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-slate-100 hover:text-sky-300 transition-colors"
                    >
                        {repo.full_name}
                    </a>
                    {hasStale && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded px-1.5 py-0.5">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {repo.roadmap.stale_count} without PR
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className={`font-black text-base ${grade.color}`} title={`Health: ${repo.health_score ?? 'unknown'}`}>
                        {grade.label}
                        {repo.health_score !== null && (
                            <span className="text-[10px] font-normal ml-0.5 opacity-60">{repo.health_score}</span>
                        )}
                    </span>
                    <span className={`flex items-center gap-1 ${ciColor(repo.ci_status)}`}>
                        <Zap className="h-3 w-3" />
                        {repo.ci_status ?? 'unknown'}
                    </span>
                    {repo.open_prs > 0 && (
                        <span className="flex items-center gap-1 text-sky-400">
                            <GitPullRequest className="h-3 w-3" />
                            {repo.open_prs}
                        </span>
                    )}
                </div>
            </div>

            {/* Roadmap progress */}
            {repo.roadmap.total > 0 ? (
                <div className="px-4 py-3 border-b border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-medium text-slate-300">Roadmap</span>
                        <span>{repo.roadmap.done}/{repo.roadmap.total} done ({pct}%)</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    {/* Stage mini-pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {repo.roadmap.planned > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                <Circle className="h-2.5 w-2.5" />
                                {repo.roadmap.planned} planned
                            </span>
                        )}
                        {repo.roadmap.in_progress > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-blue-400">
                                <GitBranch className="h-2.5 w-2.5" />
                                {repo.roadmap.in_progress} in progress
                            </span>
                        )}
                        {repo.roadmap.in_review > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-violet-400">
                                <GitPullRequest className="h-2.5 w-2.5" />
                                {repo.roadmap.in_review} in review
                            </span>
                        )}
                    </div>
                </div>
            ) : (
                <div className="px-4 py-2 border-b border-white/5">
                    <span className="text-xs text-slate-600 italic">No roadmap items tracked</span>
                </div>
            )}

            {/* In-progress items with handoff buttons */}
            {repo.in_progress_items.length > 0 && (
                <div className="px-4 py-2 space-y-1.5">
                    {repo.in_progress_items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 py-1">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className={`shrink-0 h-1.5 w-1.5 rounded-full ${item.linked_pr_number ? 'bg-violet-400' : 'bg-blue-400'}`} />
                                <span className="text-xs text-slate-300 truncate">{item.title}</span>
                                {item.linked_pr_number && (
                                    <span className="shrink-0 text-[10px] text-violet-400">#{item.linked_pr_number}</span>
                                )}
                            </div>
                            <HandoffButton repoName={repo.name} item={item} onHandoff={onHandoff} />
                        </div>
                    ))}
                </div>
            )}

            {/* Tasks footer */}
            {repo.tasks.total > 0 && (
                <div className="px-4 py-2 flex items-center gap-3 text-[11px] text-slate-500 border-t border-white/5">
                    <span>Tasks:</span>
                    {repo.tasks.todo > 0 && <span>{repo.tasks.todo} todo</span>}
                    {repo.tasks.in_progress > 0 && (
                        <span className="text-blue-400">{repo.tasks.in_progress} in progress</span>
                    )}
                    {repo.tasks.done > 0 && <span className="text-emerald-400">{repo.tasks.done} done</span>}
                </div>
            )}

            {!hasActivity && (
                <div className="px-4 py-3 text-xs text-slate-600 italic">No tasks or roadmap items synced yet</div>
            )}
        </div>
    );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function PmoDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [repos, setRepos] = useState<PmoRepoSummary[]>([]);
    const [portfolio, setPortfolio] = useState<PmoPortfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/');
        }
    }, [status, router]);

    const fetchOverview = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/pmo/overview');
            if (res.status === 401) { router.replace('/'); return; }
            if (!res.ok) throw new Error('Failed to load PMO data');
            const data = await res.json();
            setRepos(data.repos);
            setPortfolio(data.portfolio);
            setLastFetched(new Date());
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (status === 'authenticated') fetchOverview();
    }, [status, fetchOverview]);

    const handleHandoff = useCallback((repoName: string, item: PmoInProgressItem, taskId: string) => {
        setRepos(prev => prev.map(r => {
            if (r.name !== repoName) return r;
            return {
                ...r,
                in_progress_items: r.in_progress_items.map(i =>
                    i.id === item.id ? { ...i, agent_task_id: taskId } : i
                ),
            };
        }));
    }, []);

    if (status === 'loading' || (status === 'authenticated' && loading && !portfolio)) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex items-center gap-3 text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Loading PMO data…</span>
                </div>
            </div>
        );
    }

    if (!session) return null;

    const totalRoadmap = portfolio
        ? portfolio.roadmap_planned + portfolio.roadmap_in_progress + portfolio.roadmap_in_review + portfolio.roadmap_done
        : 0;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Top bar */}
            <header className="sticky top-0 z-10 border-b border-white/8 bg-slate-950/90 backdrop-blur-md px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <span className="text-slate-700">|</span>
                    <h1 className="text-base font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                        PMO Dashboard
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {lastFetched && (
                        <span className="text-[11px] text-slate-600">
                            Updated {lastFetched.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={fetchOverview}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-slate-200 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {error && (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Portfolio pipeline summary */}
                {portfolio && (
                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                Portfolio Pipeline
                            </h2>
                            <span className="text-xs text-slate-500">
                                {portfolio.repo_count} repo{portfolio.repo_count !== 1 ? 's' : ''} · {totalRoadmap} roadmap items
                            </span>
                        </div>

                        <div className="rounded-xl border border-white/8 bg-slate-900/60 flex overflow-hidden">
                            <StageCell label="Planned"    count={portfolio.roadmap_planned}     color="text-slate-300"  sub="not started" />
                            <StageCell label="In Progress" count={portfolio.roadmap_in_progress} color="text-blue-400"   sub="no PR yet" />
                            <StageCell label="In Review"  count={portfolio.roadmap_in_review}   color="text-violet-400" sub="PR open" />
                            <StageCell label="Done"       count={portfolio.roadmap_done}         color="text-emerald-400" sub="completed" />
                        </div>

                        {/* Alert row */}
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            {portfolio.tasks_in_progress > 0 && (
                                <span className="flex items-center gap-1 text-blue-400/80">
                                    <Circle className="h-2.5 w-2.5 fill-blue-400" />
                                    {portfolio.tasks_in_progress} task{portfolio.tasks_in_progress !== 1 ? 's' : ''} in progress
                                </span>
                            )}
                            {portfolio.stale_count > 0 && (
                                <span className="flex items-center gap-1 text-amber-400/80">
                                    <AlertTriangle className="h-3 w-3" />
                                    {portfolio.stale_count} in-progress item{portfolio.stale_count !== 1 ? 's' : ''} without a linked PR
                                </span>
                            )}
                            {portfolio.stale_count === 0 && portfolio.roadmap_in_progress === 0 && (
                                <span className="flex items-center gap-1 text-emerald-400/70">
                                    <CheckCircle2 className="h-3 w-3" />
                                    All in-progress items have linked PRs
                                </span>
                            )}
                        </div>
                    </section>
                )}

                {/* Per-repo cards */}
                {repos.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                            Repos
                        </h2>
                        <div className="space-y-3">
                            {repos.map((repo) => (
                                <RepoCard key={repo.id} repo={repo} onHandoff={handleHandoff} />
                            ))}
                        </div>
                    </section>
                )}

                {!loading && repos.length === 0 && !error && (
                    <div className="text-center py-16 text-slate-600">
                        <p>No repos tracked yet.</p>
                        <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
                            Add repos from the dashboard →
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
