"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2, Circle,
    GitPullRequest, GitBranch, Zap, ChevronRight, Bot,
    ChevronDown, ChevronUp, MessageSquare, X, Send, Copy, Check,
    Sparkles, ClipboardList,
} from 'lucide-react';
import type { PmoRepoSummary, PmoPortfolio, PmoInProgressItem } from '@/app/api/pmo/overview/route';
import type { PmoChatMessage, PmoChatAction } from '@/app/api/pmo/chat/route';

// ─── health visualization ─────────────────────────────────────────────────────

interface HealthViz {
    label: string;
    textColor: string;
    badgeCls: string; // background + border for badge pill
    ringCls: string;  // card border override for low-health repos
}

function getHealthViz(score: number | null): HealthViz {
    if (score === null) {
        return { label: '?', textColor: 'text-slate-400', badgeCls: 'bg-slate-800/60 border-slate-600/40', ringCls: '' };
    }
    // Progressive scale: each 10-point band has its own ring intensity
    // Good scores get a subtle positive ring; bad scores escalate in redness + glow
    if (score >= 90) return {
        label: 'A',
        textColor: 'text-emerald-300',
        badgeCls: 'bg-emerald-500/20 border-emerald-400/60 shadow-[0_0_8px_rgba(52,211,153,0.25)]',
        ringCls: '',
    };
    if (score >= 80) return {
        label: 'B',
        textColor: 'text-green-400',
        badgeCls: 'bg-green-500/15 border-green-500/40',
        ringCls: '',
    };
    if (score >= 70) return {
        label: 'C',
        textColor: 'text-yellow-400',
        badgeCls: 'bg-yellow-500/10 border-yellow-500/35',
        ringCls: 'border-yellow-500/15',
    };
    if (score >= 60) return {
        label: 'D',
        textColor: 'text-orange-400',
        badgeCls: 'bg-orange-500/10 border-orange-500/40',
        ringCls: 'border-orange-500/25',
    };
    if (score >= 50) return {
        label: 'F',
        textColor: 'text-red-400',
        badgeCls: 'bg-red-500/10 border-red-400/40',
        ringCls: 'border-red-400/30',
    };
    if (score >= 40) return {
        label: 'F',
        textColor: 'text-red-400',
        badgeCls: 'bg-red-500/15 border-red-500/50 shadow-[0_0_6px_rgba(239,68,68,0.15)]',
        ringCls: 'border-red-500/40',
    };
    if (score >= 30) return {
        label: 'F',
        textColor: 'text-red-500',
        badgeCls: 'bg-red-500/20 border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.25)]',
        ringCls: 'border-red-500/55',
    };
    if (score >= 20) return {
        label: 'F',
        textColor: 'text-red-500',
        badgeCls: 'bg-red-600/25 border-red-600/70 shadow-[0_0_10px_rgba(220,38,38,0.3)]',
        ringCls: 'border-red-600/65',
    };
    return {
        label: 'F',
        textColor: 'text-red-600',
        badgeCls: 'bg-red-700/30 border-red-700/80 shadow-[0_0_12px_rgba(185,28,28,0.4)]',
        ringCls: 'border-red-700/75',
    };
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

// ─── pipeline stage count cell ────────────────────────────────────────────────

function StageCell({ label, count, color, sub }: { label: string; count: number; color: string; sub?: string }) {
    return (
        <div className="flex flex-col items-center gap-1 flex-1 py-4 px-2 sm:px-3 border-r last:border-r-0 border-white/5">
            <span className={`text-2xl sm:text-3xl font-black tabular-nums ${color}`}>{count}</span>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider text-center">{label}</span>
            {sub && <span className="text-[9px] sm:text-[10px] text-slate-500 text-center">{sub}</span>}
        </div>
    );
}

// ─── handoff button ───────────────────────────────────────────────────────────

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
            const taskRes = await fetch('/api/agent/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'roadmap-handoff',
                    priority: 'normal',
                    payload: { repoName, itemId: item.id, title: item.title, quarter: item.quarter },
                }),
            });
            if (!taskRes.ok) throw new Error('Agent task queue error');
            const { task } = await taskRes.json();

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
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Queued
            </span>
        );
    }

    return (
        <div className="flex items-center gap-2 shrink-0">
            {err && <span className="text-xs text-red-400">{err}</span>}
            <button
                onClick={handle}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 hover:text-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Bot className="h-3 w-3" />}
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
    const [expanded, setExpanded] = useState(false);
    const viz = getHealthViz(repo.health_score);
    const pct = roadmapPct(repo.roadmap);
    const hasActivity = repo.roadmap.total > 0 || repo.tasks.total > 0;
    const hasStale = repo.roadmap.stale_count > 0;
    const hasInProgress = repo.in_progress_items.length > 0;

    const cardBorder = hasStale
        ? 'border-amber-500/30 shadow-sm shadow-amber-500/10'
        : viz.ringCls || 'border-white/8 hover:border-white/15';

    return (
        <div className={`rounded-xl border bg-slate-900/60 backdrop-blur-sm transition-all duration-200 ${cardBorder}`}>
            {/* ── Card header (always visible) ── */}
            <button
                className="w-full text-left px-3 sm:px-4 py-3 flex items-center gap-3 hover:bg-white/2 transition-colors rounded-t-xl"
                onClick={() => setExpanded(e => !e)}
            >
                {/* Repo name + stale badge */}
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                    <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-sm font-bold text-slate-100 hover:text-sky-300 transition-colors truncate"
                    >
                        {repo.full_name}
                    </a>
                    {hasStale && (
                        <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded px-1.5 py-0.5">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {repo.roadmap.stale_count} no PR
                        </span>
                    )}
                </div>

                {/* Right-side stats */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Health badge */}
                    <span
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs font-black ${viz.textColor} ${viz.badgeCls}`}
                        title={`Health: ${repo.health_score ?? 'unknown'}/100`}
                    >
                        {viz.label}
                        {repo.health_score !== null && (
                            <span className="text-[9px] font-normal opacity-70 tabular-nums">{repo.health_score}</span>
                        )}
                    </span>

                    {/* CI status */}
                    <span className={`flex items-center gap-1 text-xs ${ciColor(repo.ci_status)}`}>
                        <Zap className="h-3 w-3" />
                        <span className="hidden sm:inline">{repo.ci_status ?? 'unknown'}</span>
                    </span>

                    {repo.open_prs > 0 && (
                        <span className="flex items-center gap-1 text-xs text-sky-400">
                            <GitPullRequest className="h-3 w-3" />
                            {repo.open_prs}
                        </span>
                    )}

                    {/* Expand toggle */}
                    <span className="text-slate-600">
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                </div>
            </button>

            {/* ── Roadmap progress bar (always visible) ── */}
            {repo.roadmap.total > 0 && (
                <div className="px-3 sm:px-4 pb-2.5 pt-0 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-2 flex-wrap">
                            {repo.roadmap.planned > 0 && (
                                <span className="flex items-center gap-1">
                                    <Circle className="h-2 w-2" />
                                    {repo.roadmap.planned}
                                </span>
                            )}
                            {repo.roadmap.in_progress > 0 && (
                                <span className="flex items-center gap-1 text-blue-400">
                                    <GitBranch className="h-2 w-2" />
                                    {repo.roadmap.in_progress}
                                </span>
                            )}
                            {repo.roadmap.in_review > 0 && (
                                <span className="flex items-center gap-1 text-violet-400">
                                    <GitPullRequest className="h-2 w-2" />
                                    {repo.roadmap.in_review}
                                </span>
                            )}
                        </div>
                        <span className="tabular-nums">{pct}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>
            )}

            {/* ── Expanded section ── */}
            {expanded && (
                <div className="border-t border-white/5">
                    {/* In-progress items */}
                    {hasInProgress && (
                        <div className="px-3 sm:px-4 py-2 space-y-1.5">
                            {repo.in_progress_items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-2 py-1 flex-wrap sm:flex-nowrap">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
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

                    {/* Tasks summary footer */}
                    {repo.tasks.total > 0 && (
                        <div className="px-3 sm:px-4 py-2 flex items-center gap-3 text-[11px] text-slate-500 border-t border-white/5 flex-wrap">
                            <ClipboardList className="h-3 w-3 shrink-0" />
                            {repo.tasks.todo > 0 && <span>{repo.tasks.todo} todo</span>}
                            {repo.tasks.in_progress > 0 && (
                                <span className="text-blue-400">{repo.tasks.in_progress} in progress</span>
                            )}
                            {repo.tasks.done > 0 && <span className="text-emerald-400">{repo.tasks.done} done</span>}
                        </div>
                    )}

                    {!hasActivity && !hasInProgress && (
                        <div className="px-3 sm:px-4 py-3 text-xs text-slate-600 italic">
                            No tasks or roadmap items synced yet
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── PMO Chat panel ───────────────────────────────────────────────────────────

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    actions?: PmoChatAction[];
}

function AgentPromptBlock({ prompt }: { prompt: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(prompt).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <div className="mt-2 rounded-lg border border-indigo-500/30 bg-indigo-500/5">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-indigo-500/20">
                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Agent Prompt</span>
                <button onClick={copy} className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-200 transition-colors">
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <pre className="px-3 py-2 text-[11px] text-slate-300 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">{prompt}</pre>
        </div>
    );
}

function RoadmapSuggestionCard({ action, onAdd }: { action: PmoChatAction; onAdd: () => void }) {
    const [added, setAdded] = useState(false);
    const handleAdd = () => { setAdded(true); onAdd(); };
    return (
        <div className="mt-2 rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 space-y-1">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-purple-300">{action.title}</p>
                    <p className="text-[10px] text-slate-400">{action.repoName} · {action.quarter}</p>
                    {action.rationale && <p className="text-[11px] text-slate-500 mt-0.5">{action.rationale}</p>}
                </div>
                <button
                    onClick={handleAdd}
                    disabled={added}
                    className="shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30 transition-all disabled:opacity-60"
                >
                    {added ? <Check className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                    {added ? 'Added' : 'Add to roadmap'}
                </button>
            </div>
        </div>
    );
}

function PmoChat({
    repos,
    portfolio,
    onClose,
}: {
    repos: PmoRepoSummary[];
    portfolio: PmoPortfolio;
    onClose: () => void;
}) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: `Hi! I'm your PMO assistant. I can help you:\n• Identify repos needing attention\n• Suggest roadmap items based on health signals\n• Generate prompts for Claude or Copilot to implement improvements\n\nWhat would you like to work on?`,
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = useCallback(async (text?: string) => {
        const msg = (text ?? input).trim();
        if (!msg || loading) return;
        setInput('');
        setError(null);

        const userMsg: ChatMessage = { role: 'user', content: msg };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const res = await fetch('/api/pmo/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, repos, portfolio, history }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? `HTTP ${res.status}`);
            }
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply, actions: data.actions }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Request failed');
            setMessages(prev => prev.slice(0, -1)); // remove optimistic user message
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [input, loading, messages, repos, portfolio]);

    const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const quickPrompts = [
        'Which repos need the most attention right now?',
        'Suggest roadmap items based on health signals',
        'Generate a Claude prompt to improve test coverage',
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 shrink-0">
                <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm font-semibold text-slate-200">PMO Assistant</span>
                    <span className="text-[10px] text-slate-500 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">Gemini</span>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] ${msg.role === 'user'
                            ? 'bg-indigo-600/25 border border-indigo-500/30 text-slate-200'
                            : 'bg-slate-800/60 border border-white/8 text-slate-300'
                            } rounded-xl px-3 py-2.5 text-xs leading-relaxed`}
                        >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            {msg.actions?.map((action, ai) => (
                                action.type === 'generate_agent_prompt' && action.prompt ? (
                                    <AgentPromptBlock key={ai} prompt={action.prompt} />
                                ) : action.type === 'suggest_roadmap_item' ? (
                                    <RoadmapSuggestionCard key={ai} action={action} onAdd={() => {}} />
                                ) : null
                            ))}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800/60 border border-white/8 rounded-xl px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Quick prompts (only when no user messages yet) */}
            {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
                    {quickPrompts.map(p => (
                        <button
                            key={p}
                            onClick={() => send(p)}
                            disabled={loading}
                            className="text-[10px] text-slate-400 bg-slate-800/60 border border-white/10 hover:border-indigo-500/40 hover:text-indigo-300 rounded-lg px-2.5 py-1.5 transition-all text-left leading-snug"
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2 shrink-0 border-t border-white/5">
                <div className="flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        disabled={loading}
                        rows={1}
                        placeholder="Ask about portfolio health, suggest roadmap items…"
                        className="flex-1 min-w-0 resize-none rounded-lg bg-slate-800/60 border border-white/10 focus:border-indigo-500/50 focus:outline-none text-xs text-slate-200 placeholder-slate-600 px-3 py-2 leading-relaxed disabled:opacity-50 transition-colors"
                        style={{ maxHeight: '120px' }}
                        onInput={e => {
                            const el = e.currentTarget;
                            el.style.height = 'auto';
                            el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                        }}
                    />
                    <button
                        onClick={() => send()}
                        disabled={loading || !input.trim()}
                        className="shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="h-3.5 w-3.5 text-white" />
                    </button>
                </div>
                <p className="text-[10px] text-slate-700 mt-1.5">Enter to send · Shift+Enter for newline</p>
            </div>
        </div>
    );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function PmoDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [repos, setRepos] = useState<PmoRepoSummary[]>([]);
    const [portfolio, setPortfolio] = useState<PmoPortfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);
    const [chatOpen, setChatOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') router.replace('/');
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
            <header className="sticky top-0 z-10 border-b border-white/8 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                    <span className="text-slate-700 hidden sm:inline">|</span>
                    <h1 className="text-sm font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent truncate">
                        PMO
                    </h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {lastFetched && (
                        <span className="text-[11px] text-slate-600 hidden sm:inline">
                            {lastFetched.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={() => setChatOpen(o => !o)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${chatOpen
                            ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-slate-200'
                            }`}
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Assistant</span>
                    </button>
                    <button
                        onClick={fetchOverview}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-slate-200 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </header>

            {/* Two-column layout when chat is open */}
            <div className={`flex h-[calc(100vh-52px)] ${chatOpen ? 'overflow-hidden' : ''}`}>
                {/* Main content */}
                <main className={`flex-1 min-w-0 overflow-y-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 transition-all ${chatOpen ? 'max-w-none' : ''}`}>
                    {error && (
                        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Portfolio pipeline summary */}
                    {portfolio && (
                        <section className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Portfolio Pipeline
                                </h2>
                                <span className="text-xs text-slate-500 shrink-0">
                                    {portfolio.repo_count} repo{portfolio.repo_count !== 1 ? 's' : ''} · {totalRoadmap} items
                                </span>
                            </div>

                            <div className="rounded-xl border border-white/8 bg-slate-900/60 flex overflow-hidden">
                                <StageCell label="Planned"    count={portfolio.roadmap_planned}     color="text-slate-300"   sub="not started" />
                                <StageCell label="In Progress" count={portfolio.roadmap_in_progress} color="text-blue-400"    sub="no PR yet" />
                                <StageCell label="In Review"  count={portfolio.roadmap_in_review}   color="text-violet-400"  sub="PR open" />
                                <StageCell label="Done"       count={portfolio.roadmap_done}         color="text-emerald-400" sub="completed" />
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                                {portfolio.tasks_in_progress > 0 && (
                                    <span className="flex items-center gap-1 text-blue-400/80">
                                        <Circle className="h-2.5 w-2.5 fill-blue-400" />
                                        {portfolio.tasks_in_progress} task{portfolio.tasks_in_progress !== 1 ? 's' : ''} in progress
                                    </span>
                                )}
                                {portfolio.stale_count > 0 && (
                                    <span className="flex items-center gap-1 text-amber-400/80">
                                        <AlertTriangle className="h-3 w-3" />
                                        {portfolio.stale_count} item{portfolio.stale_count !== 1 ? 's' : ''} without a linked PR
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
                            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Repos</h2>
                            <div className="space-y-2.5">
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

                {/* Chat side panel */}
                {chatOpen && portfolio && (
                    <aside className="w-full max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg shrink-0 border-l border-white/8 bg-slate-950/95 flex flex-col">
                        <PmoChat repos={repos} portfolio={portfolio} onClose={() => setChatOpen(false)} />
                    </aside>
                )}
            </div>
        </div>
    );
}
