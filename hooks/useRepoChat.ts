"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/lib/repo-chat';

const STORAGE_KEY = 'overseer.repo-chat.v1';
/** Keep persisted threads bounded so localStorage cannot grow without limit. */
const MAX_PERSISTED_MESSAGES = 40;

export interface ChatThreadMessage extends ChatMessage {
    id: string;
    createdAt: string;
    /** Set when the request for this turn failed; lets the UI mark it. */
    failed?: boolean;
}

export type ChatThreads = Record<string, ChatThreadMessage[]>;

function newId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadThreads(): ChatThreads {
    if (typeof window === 'undefined') return {};
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return typeof parsed === 'object' && parsed !== null ? (parsed as ChatThreads) : {};
    } catch {
        return {};
    }
}

function persistThreads(threads: ChatThreads): void {
    if (typeof window === 'undefined') return;
    try {
        const trimmed: ChatThreads = {};
        for (const [repo, messages] of Object.entries(threads)) {
            trimmed[repo] = messages.slice(-MAX_PERSISTED_MESSAGES);
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
        // Storage may be unavailable (private mode, quota); chat still works in-memory.
    }
}

/**
 * Per-repo chat threads. Every repo gets its own persistent conversation
 * ("one friend per repo"), restored across page loads from localStorage.
 */
export function useRepoChat() {
    const [threads, setThreads] = useState<ChatThreads>({});
    const [sendingRepo, setSendingRepo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const hydrated = useRef(false);

    // Hydrate after mount so server and client markup match.
    useEffect(() => {
        setThreads(loadThreads());
        hydrated.current = true;
    }, []);

    useEffect(() => {
        if (hydrated.current) persistThreads(threads);
    }, [threads]);

    const getThread = useCallback(
        (repoName: string): ChatThreadMessage[] => threads[repoName] ?? [],
        [threads]
    );

    const clearThread = useCallback((repoName: string) => {
        setError(null);
        setThreads((prev) => {
            const next = { ...prev };
            delete next[repoName];
            return next;
        });
    }, []);

    const sendMessage = useCallback(
        async (repoName: string, text: string): Promise<void> => {
            const trimmed = text.trim();
            if (!trimmed || sendingRepo) return;

            setError(null);
            setSendingRepo(repoName);

            const userMessage: ChatThreadMessage = {
                id: newId(),
                role: 'user',
                content: trimmed,
                createdAt: new Date().toISOString(),
            };

            // Snapshot the transcript we are about to send, including this turn.
            const history = [...(threads[repoName] ?? []), userMessage];
            setThreads((prev) => ({ ...prev, [repoName]: history }));

            try {
                const res = await fetch(`/api/repos/${encodeURIComponent(repoName)}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: history
                            .filter((m) => !m.failed)
                            .map(({ role, content }) => ({ role, content })),
                    }),
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    const message = data?.error || `Chat request failed (${res.status})`;
                    setError(message);
                    setThreads((prev) => ({
                        ...prev,
                        [repoName]: [
                            ...(prev[repoName] ?? []),
                            {
                                id: newId(),
                                role: 'assistant',
                                content: `Could not reach the assistant: ${message}`,
                                createdAt: new Date().toISOString(),
                                failed: true,
                            },
                        ],
                    }));
                    return;
                }

                setThreads((prev) => ({
                    ...prev,
                    [repoName]: [
                        ...(prev[repoName] ?? []),
                        {
                            id: newId(),
                            role: 'assistant',
                            content: data.reply ?? '(empty response)',
                            createdAt: new Date().toISOString(),
                        },
                    ],
                }));
            } catch {
                const message = 'Network error - could not reach the chat endpoint';
                setError(message);
                setThreads((prev) => ({
                    ...prev,
                    [repoName]: [
                        ...(prev[repoName] ?? []),
                        {
                            id: newId(),
                            role: 'assistant',
                            content: message,
                            createdAt: new Date().toISOString(),
                            failed: true,
                        },
                    ],
                }));
            } finally {
                setSendingRepo(null);
            }
        },
        [threads, sendingRepo]
    );

    return { threads, getThread, sendMessage, clearThread, sendingRepo, error };
}
