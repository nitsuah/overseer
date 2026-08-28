"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_CHAT_MESSAGES, type ChatMessage } from '@/lib/repo-chat';

const STORAGE_PREFIX = 'overseer.repo-chat.v1';
/** Storage namespace used when no authenticated identity is available. */
const ANON_NAMESPACE = 'anon';
/** Keep persisted threads bounded so localStorage cannot grow without limit. */
const MAX_PERSISTED_MESSAGES = 40;

export interface ChatThreadMessage extends ChatMessage {
    id: string;
    createdAt: string;
    /** Set when the request for this turn failed; lets the UI mark it. */
    failed?: boolean;
}

export type ChatThreads = Record<string, ChatThreadMessage[]>;

export interface UseRepoChatResult {
    threads: ChatThreads;
    getThread: (repoName: string) => ChatThreadMessage[];
    sendMessage: (repoName: string, text: string) => Promise<void>;
    clearThread: (repoName: string) => void;
    sendingRepo: string | null;
    error: string | null;
}

function newId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** localStorage is shared per-origin: without namespacing, a second person on
 * the same browser profile could load the first user's transcripts. Keying by
 * the authenticated identity (falling back to a fixed anonymous namespace)
 * isolates threads per-account without needing to wipe storage on sign-out. */
function storageKeyFor(namespace: string): string {
    return `${STORAGE_PREFIX}.${encodeURIComponent(namespace)}`;
}

function isValidThreadMessage(value: unknown): value is ChatThreadMessage {
    if (typeof value !== 'object' || value === null) return false;
    const m = value as Record<string, unknown>;
    return (
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        typeof m.id === 'string' &&
        typeof m.createdAt === 'string'
    );
}

/** Parses persisted JSON defensively: any repo entry that is not an array of
 * well-formed messages is dropped rather than kept, so a corrupted or
 * hand-edited localStorage value can never reach `sendMessage` and throw when
 * it is spread into a new array (which would otherwise skip the try/finally
 * that resets `sendingRepo`). */
function loadThreads(namespace: string): ChatThreads {
    if (typeof window === 'undefined') return {};
    try {
        const raw = window.localStorage.getItem(storageKeyFor(namespace));
        if (!raw) return {};
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};

        const result: ChatThreads = {};
        for (const [repo, messages] of Object.entries(parsed as Record<string, unknown>)) {
            if (Array.isArray(messages) && messages.every(isValidThreadMessage)) {
                result[repo] = messages;
            }
        }
        return result;
    } catch {
        return {};
    }
}

function persistThreads(namespace: string, threads: ChatThreads): void {
    if (typeof window === 'undefined') return;
    try {
        const trimmed: ChatThreads = {};
        for (const [repo, messages] of Object.entries(threads)) {
            trimmed[repo] = messages.slice(-MAX_PERSISTED_MESSAGES);
        }
        window.localStorage.setItem(storageKeyFor(namespace), JSON.stringify(trimmed));
    } catch {
        // Storage may be unavailable (private mode, quota); chat still works in-memory.
    }
}

/**
 * Per-repo chat threads. Every repo gets its own persistent conversation
 * ("one friend per repo"), restored across page loads from localStorage.
 *
 * @param identity A stable per-account key (e.g. the signed-in user's email).
 *   Threads are namespaced by this value so switching accounts on a shared
 *   browser profile never surfaces another account's conversation; omit it
 *   (or pass undefined while a session is still loading) to use a fixed
 *   anonymous namespace.
 */
export function useRepoChat(identity?: string | null): UseRepoChatResult {
    const namespace = identity && identity.trim().length > 0 ? identity : ANON_NAMESPACE;
    const [threads, setThreads] = useState<ChatThreads>({});
    const [sendingRepo, setSendingRepo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const hydratedNamespace = useRef<string | null>(null);

    // Mirrors `namespace` synchronously on every render (unlike a ref written
    // from an effect, which would only catch up after paint) so an in-flight
    // sendMessage can tell, at completion time, whether the identity it was
    // issued under is still current.
    const namespaceRef = useRef(namespace);
    namespaceRef.current = namespace;

    // (Re)hydrate whenever the namespace changes — including the very first
    // render and any later sign-in/sign-out — so the in-memory threads always
    // match the identity they are being displayed for. A request in flight
    // under the previous identity belongs to that identity, not this one, so
    // its pending state is cleared here rather than left to resolve into the
    // new namespace (CWE-200: it would otherwise leak that identity's reply
    // into the new identity's persisted thread).
    useEffect(() => {
        setThreads(loadThreads(namespace));
        setSendingRepo(null);
        setError(null);
        hydratedNamespace.current = namespace;
    }, [namespace]);

    useEffect(() => {
        if (hydratedNamespace.current === namespace) persistThreads(namespace, threads);
    }, [threads, namespace]);

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

            // Captured at request time: if the identity changes before this
            // request resolves, its result belongs to a namespace that is no
            // longer current and must not be applied.
            const requestNamespace = namespaceRef.current;
            const isStale = () => namespaceRef.current !== requestNamespace;

            setError(null);
            setSendingRepo(repoName);

            const userMessage: ChatThreadMessage = {
                id: newId(),
                role: 'user',
                content: trimmed,
                createdAt: new Date().toISOString(),
            };

            // Snapshot the transcript we are about to send, including this turn.
            // The `?? []` guard is defense in depth: loadThreads() already
            // discards malformed persisted entries, so this should always be
            // an array, but a corrupted entry reaching the spread below would
            // throw before the try block and leave sendingRepo stuck forever.
            const existing = Array.isArray(threads[repoName]) ? threads[repoName] : [];
            const history = [...existing, userMessage];
            setThreads((prev) => ({ ...prev, [repoName]: history }));

            try {
                // Persistence keeps up to MAX_PERSISTED_MESSAGES for display,
                // but the wire payload is capped to the same window the server
                // keeps (MAX_CHAT_MESSAGES) — sending more just inflates the
                // request and gets truncated server-side anyway.
                const outgoing = history.filter((m) => !m.failed).slice(-MAX_CHAT_MESSAGES);

                const res = await fetch(`/api/repos/${encodeURIComponent(repoName)}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: outgoing.map(({ role, content }) => ({ role, content })),
                    }),
                });

                const data = await res.json().catch(() => ({}));

                // The identity changed while this request was in flight (e.g.
                // sign-in/sign-out); the rehydrate effect already reset this
                // hook's state for the new identity, so applying a result
                // computed for the old one would misattribute it.
                if (isStale()) return;

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
                if (isStale()) return;
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
                if (!isStale()) setSendingRepo(null);
            }
        },
        [threads, sendingRepo]
    );

    return { threads, getThread, sendMessage, clearThread, sendingRepo, error };
}
