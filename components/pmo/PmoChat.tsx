"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Check, Copy, Send, Sparkles, X } from 'lucide-react';
import type { PmoChatAction, PmoChatMessage } from '@/app/api/pmo/chat/route';
import type { PmoPortfolio, PmoRepoSummary } from '@/app/api/pmo/overview/route';

// ─── shared types ─────────────────────────────────────────────────────────────

export interface ChatMessage extends PmoChatMessage {
    actions?: PmoChatAction[];
}

// ─── action sub-components ────────────────────────────────────────────────────

function AgentPromptBlock({ prompt }: { prompt: string }): React.JSX.Element {
    const [copied, setCopied] = useState(false);
    const [copyFailed, setCopyFailed] = useState(false);

    const copy = (): void => {
        navigator.clipboard.writeText(prompt).then(
            () => { setCopied(true); setTimeout(() => setCopied(false), 2000); },
            () => setCopyFailed(true),
        );
    };

    return (
        <div className="mt-2 rounded-lg border border-indigo-500/30 bg-indigo-500/5">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-indigo-500/20">
                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Agent Prompt</span>
                <button
                    type="button"
                    onClick={copy}
                    aria-label="Copy agent prompt"
                    className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-200 transition-colors"
                >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copyFailed ? 'Failed' : copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <pre className="px-3 py-2 text-[11px] text-slate-300 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">{prompt}</pre>
        </div>
    );
}

function RoadmapSuggestionCard({ action }: { action: PmoChatAction }): React.JSX.Element {
    const [copied, setCopied] = useState(false);
    const [copyFailed, setCopyFailed] = useState(false);

    const markdown = `- [ ] ${action.title ?? ''}  <!-- ${action.repoName} · ${action.quarter} -->`;

    const copy = (): void => {
        navigator.clipboard.writeText(markdown).then(
            () => { setCopied(true); setTimeout(() => setCopied(false), 2000); },
            () => setCopyFailed(true),
        );
    };

    return (
        <div className="mt-2 rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 space-y-1">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-purple-300">{action.title}</p>
                    <p className="text-[10px] text-slate-400">{action.repoName} · {action.quarter}</p>
                    {action.rationale && <p className="text-[11px] text-slate-500 mt-0.5">{action.rationale}</p>}
                </div>
                <button
                    type="button"
                    onClick={copy}
                    aria-label="Copy roadmap suggestion as Markdown"
                    className="shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30 transition-all"
                >
                    {copied ? <Check className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                    {copyFailed ? 'Failed' : copied ? 'Copied' : 'Copy MD'}
                </button>
            </div>
        </div>
    );
}

// ─── main chat panel ──────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
    'Which repos need the most attention right now?',
    'Suggest roadmap items based on health signals',
    'Generate a Claude prompt to improve test coverage',
];

export function PmoChat({
    repos,
    portfolio,
    onClose,
}: {
    repos: PmoRepoSummary[];
    portfolio: PmoPortfolio;
    onClose: () => void;
}): React.JSX.Element {
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

    const send = useCallback(async (text?: string): Promise<void> => {
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
                const data = await res.json().catch(() => ({})) as { error?: string };
                throw new Error(data.error ?? `HTTP ${res.status}`);
            }
            const data = await res.json() as { reply: string; actions: PmoChatAction[] };
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply, actions: data.actions }]);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Request failed');
            setMessages(prev => prev.slice(0, -1));
            setInput(msg); // restore so the user can retry
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [input, loading, messages, repos, portfolio]);

    const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void send();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 shrink-0">
                <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm font-semibold text-slate-200">PMO Assistant</span>
                    <span className="text-[10px] text-slate-500 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">Gemini</span>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close assistant"
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                >
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
                                    <RoadmapSuggestionCard key={ai} action={action} />
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

            {/* Quick prompts shown only before any user message */}
            {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
                    {QUICK_PROMPTS.map(p => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => void send(p)}
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
                        className="flex-1 min-w-0 resize-y rounded-lg bg-slate-800/60 border border-white/10 focus:border-indigo-500/50 focus:outline-none text-base sm:text-xs text-slate-200 placeholder-slate-600 px-3 py-2 leading-relaxed disabled:opacity-50 transition-colors"
                        style={{ maxHeight: '200px' }}
                        onInput={e => {
                            const el = e.currentTarget;
                            el.style.height = 'auto';
                            el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => void send()}
                        disabled={loading || !input.trim()}
                        aria-label="Send message"
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
