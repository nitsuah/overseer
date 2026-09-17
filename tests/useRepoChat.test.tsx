import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRepoChat } from '@/hooks/useRepoChat';

/**
 * Regression coverage for the identity-change race: a `sendMessage` request
 * issued under one identity must not write its result into a different
 * identity's threads if that identity changes before the request resolves
 * (CWE-200 — it would otherwise leak one account's reply into another's
 * persisted, localStorage-backed thread on a shared browser profile).
 */
describe('useRepoChat', () => {
    let resolveFetch: (value: Response) => void;

    beforeEach(() => {
        window.localStorage.clear();
        vi.stubGlobal(
            'fetch',
            vi.fn(
                () =>
                    new Promise<Response>((resolve) => {
                        resolveFetch = resolve;
                    })
            )
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function jsonResponse(body: unknown, ok = true): Response {
        return {
            ok,
            status: ok ? 200 : 500,
            json: async () => body,
        } as Response;
    }

    it('does not apply a reply to the new identity after the identity changes mid-request', async () => {
        const { result, rerender } = renderHook(({ identity }: { identity: string }) => useRepoChat(identity), {
            initialProps: { identity: 'anon' },
        });

        act(() => {
            void result.current.sendMessage('repo-a', 'hello');
        });

        await waitFor(() => expect(result.current.sendingRepo).toBe('repo-a'));

        // Identity changes (e.g. sign-in) while the request is still pending.
        rerender({ identity: 'user@example.com' });

        await waitFor(() => expect(result.current.sendingRepo).toBeNull());
        expect(result.current.threads['repo-a']).toBeUndefined();

        // The stale request now resolves. Its reply must not land in the
        // new identity's threads.
        act(() => {
            resolveFetch(jsonResponse({ reply: 'stale reply from anon session' }));
        });

        // Give the microtask queue a turn; no assertion should ever observe
        // the stale reply appearing.
        await new Promise((r) => setTimeout(r, 0));

        expect(result.current.threads['repo-a']).toBeUndefined();
        expect(result.current.sendingRepo).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it('clears sendingRepo on identity change so the new identity is never stuck mid-send', async () => {
        const { result, rerender } = renderHook(({ identity }: { identity: string }) => useRepoChat(identity), {
            initialProps: { identity: 'anon' },
        });

        act(() => {
            void result.current.sendMessage('repo-a', 'hello');
        });
        await waitFor(() => expect(result.current.sendingRepo).toBe('repo-a'));

        rerender({ identity: 'user@example.com' });

        expect(result.current.sendingRepo).toBeNull();
    });

    it('applies a reply normally when the identity does not change', async () => {
        const { result } = renderHook(() => useRepoChat('user@example.com'));

        act(() => {
            void result.current.sendMessage('repo-a', 'hello');
        });
        await waitFor(() => expect(result.current.sendingRepo).toBe('repo-a'));

        act(() => {
            resolveFetch(jsonResponse({ reply: 'a real reply' }));
        });

        await waitFor(() =>
            expect(result.current.threads['repo-a']?.some((m) => m.content === 'a real reply')).toBe(true)
        );
        expect(result.current.sendingRepo).toBeNull();
    });

    it('migrates threads from the pre-rebrand storage key on first load', () => {
        const identity = 'user@example.com';
        const legacyKey = `overseer.repo-chat.v1.${encodeURIComponent(identity)}`;
        const newKey = `vigil.repo-chat.v1.${encodeURIComponent(identity)}`;
        const legacyThread = [
            { id: 'm1', role: 'user', content: 'hi from before the rename', createdAt: new Date().toISOString() },
        ];
        window.localStorage.setItem(legacyKey, JSON.stringify({ 'repo-a': legacyThread }));

        const { result } = renderHook(() => useRepoChat(identity));

        expect(result.current.getThread('repo-a')).toEqual(legacyThread);
        expect(window.localStorage.getItem(legacyKey)).toBeNull();
        expect(JSON.parse(window.localStorage.getItem(newKey)!)).toEqual({ 'repo-a': legacyThread });
    });

    it('ignores the legacy key once the new key already has threads', () => {
        const identity = 'user@example.com';
        const legacyKey = `overseer.repo-chat.v1.${encodeURIComponent(identity)}`;
        const newKey = `vigil.repo-chat.v1.${encodeURIComponent(identity)}`;
        const legacyThread = [
            { id: 'old', role: 'user', content: 'legacy message', createdAt: new Date().toISOString() },
        ];
        const currentThread = [
            { id: 'new', role: 'user', content: 'current message', createdAt: new Date().toISOString() },
        ];
        window.localStorage.setItem(legacyKey, JSON.stringify({ 'repo-a': legacyThread }));
        window.localStorage.setItem(newKey, JSON.stringify({ 'repo-a': currentThread }));

        const { result } = renderHook(() => useRepoChat(identity));

        expect(result.current.getThread('repo-a')).toEqual(currentThread);
        // Left alone rather than merged -- the new key already has data.
        expect(window.localStorage.getItem(legacyKey)).not.toBeNull();
    });
});
