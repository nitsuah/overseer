/**
 * Tests for POST /api/repos/[name]/chat.
 * Covers validation, auth scoping, context assembly, and AI failure handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { POST } from '@/app/api/repos/[name]/chat/route';
import { NextRequest } from 'next/server';
import type { Session } from 'next-auth';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db', () => ({ getNeonClient: vi.fn(), ensureSchema: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/log', () => ({ default: { warn: vi.fn(), info: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/default-repos', () => ({ DEFAULT_REPOS: [{ name: 'overseer' }] }));
vi.mock('@/lib/ai', () => ({ generateAIContent: vi.fn() }));
// Real crypto/env config isn't under test here; the route only needs a
// stand-in plaintext key back for a well-formed encrypted row.
vi.mock('@/lib/byok-crypto', () => ({ decryptApiKey: vi.fn().mockReturnValue('sk-fake-personal-key') }));

import { auth } from '@/auth';
import { getNeonClient } from '@/lib/db';
import { generateAIContent } from '@/lib/ai';
// Real (unmocked) module: resets the in-memory anonymous rate limiter between
// tests. The authed shared-key limiter is now Neon-backed (no module-level
// state to reset) -- makeDb below provides a fresh fake table per test.
import { _resetAnonChatRateLimitForTests, ANON_CHAT_RATE_LIMIT, AUTHED_SHARED_KEY_RATE_LIMIT } from '@/lib/repo-chat';

const mockAuth = vi.mocked(auth) as unknown as Mock<() => Promise<Session | null>>;
const mockGetNeonClient = vi.mocked(getNeonClient);
const mockGenerate = vi.mocked(generateAIContent);

const fakeRepo = {
    id: 'repo-1',
    name: 'overseer',
    full_name: 'nitsuah/overseer',
    description: 'Portfolio dashboard',
    language: 'TypeScript',
    repo_type: 'web-app',
    health_score: 82,
    ai_summary: 'A Next.js portfolio dashboard.',
    last_commit_date: '2026-07-30T00:00:00Z',
    readme_last_updated: '2026-07-20T00:00:00Z',
    open_prs: 2,
    open_issues_count: 1,
    vuln_alert_count: 0,
    ci_status: 'passing',
};

type MockDb = Mock<(...args: unknown[]) => Promise<unknown[]>> & { transaction: Mock };
type RouteParams = { params: Promise<{ name: string }> };

/**
 * Builds a fake Neon client good enough to drive the route end to end,
 * including a real (in-memory) implementation of the
 * `shared_key_rate_limits` reserve/release queries -- see
 * lib/repo-chat.ts's reserveAuthedSharedKeySlot/releaseAuthedSharedKeySlot
 * for the real SQL this mirrors. `userKeyRows` stands in for the
 * `user_ai_keys` lookup (empty by default: no personal key configured).
 */
function makeDb(repoResult: unknown[] = [fakeRepo], userKeyRows: unknown[] = []): MockDb {
    const rateLimitRows = new Map<string, { count: number; reset_at_ms: number }>();

    const db = vi.fn(async (strings: TemplateStringsArray, ...values: unknown[]) => {
        const text = strings.join(' ');

        if (text.includes('FROM user_ai_keys')) {
            return userKeyRows;
        }
        if (text.includes('INSERT INTO shared_key_rate_limits')) {
            const [userId, freshResetAt, now] = values as [string, number, number];
            const existing = rateLimitRows.get(userId);
            const row = !existing || existing.reset_at_ms <= now
                ? { count: 1, reset_at_ms: freshResetAt }
                : { count: existing.count + 1, reset_at_ms: existing.reset_at_ms };
            rateLimitRows.set(userId, row);
            return [{ count: row.count, reset_at_ms: row.reset_at_ms }];
        }
        if (text.includes('UPDATE shared_key_rate_limits')) {
            const [userId, windowResetAt] = values as [string, number];
            const existing = rateLimitRows.get(userId);
            if (existing && existing.reset_at_ms === windowResetAt) {
                existing.count = Math.max(existing.count - 1, 0);
            }
            return [];
        }

        return repoResult;
    }) as unknown as MockDb;

    db.transaction = vi.fn().mockResolvedValue([
        [{ title: 'Add conversational interface', status: 'todo', section: 'P2 - Medium' }], // tasks
        [{ title: 'PMO mode', quarter: 'Q3', status: 'planned' }],                           // roadmap_items
        [{ doc_type: 'metrics', exists: false, health_state: 'missing' }],                   // doc_status
    ]);
    return db;
}

const makeRequest = (
    body: unknown,
    name = 'overseer',
    headers: Record<string, string> = {}
): NextRequest =>
    new NextRequest(`http://localhost:3000/api/repos/${name}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });

const params = (name = 'overseer'): RouteParams => ({ params: Promise.resolve({ name }) });

const validBody = { messages: [{ role: 'user', content: 'What should I work on next?' }] };

describe('POST /api/repos/[name]/chat', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        _resetAnonChatRateLimitForTests();
        mockAuth.mockResolvedValue({
            user: { name: 'testuser', email: 'test@example.com' },
            expires: new Date(Date.now() + 86400000).toISOString(),
        } as Session);
        mockGetNeonClient.mockReturnValue(makeDb() as never);
        mockGenerate.mockResolvedValue({
            text: 'You should finish the conversational interface first.',
            usingOwnKey: false,
        });
    });

    it('returns 400 for a malformed JSON body', async () => {
        const res = await POST(makeRequest('not json'), params());
        expect(res.status).toBe(400);
    });

    it('returns 400 when messages are missing or invalid', async () => {
        const res = await POST(makeRequest({ messages: [] }), params());
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toContain('at least one entry');
    });

    it('returns 400 when the transcript does not end with a user turn', async () => {
        const res = await POST(
            makeRequest({
                messages: [
                    { role: 'user', content: 'hi' },
                    { role: 'assistant', content: 'hello' },
                ],
            }),
            params()
        );

        expect(res.status).toBe(400);
    });

    it('returns 404 when the repo does not exist', async () => {
        mockGetNeonClient.mockReturnValue(makeDb([]) as never);

        const res = await POST(makeRequest(validBody, 'ghost'), params('ghost'));
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data.error).toBe('Repo not found');
    });

    it('returns 401 when unauthenticated and the repo is not a public default', async () => {
        mockAuth.mockResolvedValue(null);
        mockGetNeonClient.mockReturnValue(makeDb([{ ...fakeRepo, name: 'private-repo' }]) as never);

        const res = await POST(makeRequest(validBody, 'private-repo'), params('private-repo'));
        expect(res.status).toBe(401);
    });

    it('allows unauthenticated chat about a default repo', async () => {
        mockAuth.mockResolvedValue(null);

        const res = await POST(makeRequest(validBody, 'overseer', { 'x-nf-client-connection-ip': '9.9.9.1' }), params());
        expect(res.status).toBe(200);
    });

    it('rate-limits an anonymous caller once its budget is exhausted (CWE-770)', async () => {
        mockAuth.mockResolvedValue(null);
        const headers = { 'x-nf-client-connection-ip': '9.9.9.2' };

        for (let i = 0; i < ANON_CHAT_RATE_LIMIT; i++) {
            const ok = await POST(makeRequest(validBody, 'overseer', headers), params());
            expect(ok.status).toBe(200);
        }

        const limited = await POST(makeRequest(validBody, 'overseer', headers), params());
        const data = await limited.json();

        expect(limited.status).toBe(429);
        expect(data.error).toMatch(/rate limit/i);
        // The budget is exhausted before the DB/model are ever reached.
        expect(mockGenerate).toHaveBeenCalledTimes(ANON_CHAT_RATE_LIMIT);
    });

    it('tracks anonymous rate limits per client, not globally', async () => {
        mockAuth.mockResolvedValue(null);

        for (let i = 0; i < ANON_CHAT_RATE_LIMIT; i++) {
            const res = await POST(
                makeRequest(validBody, 'overseer', { 'x-nf-client-connection-ip': '9.9.9.3' }),
                params()
            );
            expect(res.status).toBe(200);
        }

        // A different client IP still has its own budget.
        const res = await POST(
            makeRequest(validBody, 'overseer', { 'x-nf-client-connection-ip': '9.9.9.4' }),
            params()
        );
        expect(res.status).toBe(200);
    });

    it('does not rate-limit authenticated callers', async () => {
        // Authenticated session is the beforeEach default; no client-IP header
        // needed since the limiter only runs in the unauthenticated branch.
        for (let i = 0; i < ANON_CHAT_RATE_LIMIT + 3; i++) {
            const res = await POST(makeRequest(validBody), params());
            expect(res.status).toBe(200);
        }
    });

    it('replies with the model output and a context summary', async () => {
        const res = await POST(makeRequest(validBody), params());
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.reply).toBe('You should finish the conversational interface first.');
        expect(data.context).toMatchObject({
            repo: 'overseer',
            healthScore: 82,
            openTaskCount: 1,
            roadmapItemCount: 1,
        });
        expect(data.context.staleDocCount).toBeGreaterThan(0);
    });

    it('sends dashboard data to the model as grounded context', async () => {
        await POST(makeRequest(validBody), params());

        expect(mockGenerate).toHaveBeenCalledTimes(1);
        const prompt = mockGenerate.mock.calls[0][0];

        expect(prompt).toContain('Repository: overseer');
        expect(prompt).toContain('Add conversational interface'); // TASKS.md
        expect(prompt).toContain('PMO mode');                     // ROADMAP.md
        expect(prompt).toContain('Health score: 82/100');
        expect(prompt).toContain('What should I work on next?');
    });

    it('returns 503 when no AI provider is configured', async () => {
        mockGenerate.mockRejectedValue(new Error('No AI Provider Configured'));

        const res = await POST(makeRequest(validBody), params());
        expect(res.status).toBe(503);
    });

    it('returns 503 when every provider fails', async () => {
        mockGenerate.mockRejectedValue(new Error('All AI providers failed. Last error: boom'));

        const res = await POST(makeRequest(validBody), params());
        expect(res.status).toBe(503);
    });

    it('returns 503 (not 500) when the configured model is not found', async () => {
        // generateAIContent (lib/ai.ts) throws this exact message for a 404/
        // "not found" upstream error — it is an unavailable-provider condition,
        // not a client mistake, so it belongs in the 503 branch alongside the
        // other mapped failures.
        mockGenerate.mockRejectedValue(new Error('AI model not found'));

        const res = await POST(makeRequest(validBody), params());
        expect(res.status).toBe(503);
    });

    it('returns 500 for unexpected errors', async () => {
        mockGenerate.mockRejectedValue(new Error('unexpected explosion'));

        const res = await POST(makeRequest(validBody), params());
        expect(res.status).toBe(500);
    });

    describe('authenticated shared-key rate limiting (Neon-backed reserve/release)', () => {
        const personalKeyRow = [{ provider: 'openai', api_key_encrypted: 'iv.tag.data' }];

        it('rate-limits an authenticated user with no personal key once the shared budget is exhausted', async () => {
            for (let i = 0; i < AUTHED_SHARED_KEY_RATE_LIMIT; i++) {
                const res = await POST(makeRequest(validBody), params());
                expect(res.status).toBe(200);
            }

            const limited = await POST(makeRequest(validBody), params());
            const data = await limited.json();

            expect(limited.status).toBe(429);
            expect(data.error).toMatch(/shared AI key's rate limit/i);
            // Budget is exhausted before the model is reached for the final call.
            expect(mockGenerate).toHaveBeenCalledTimes(AUTHED_SHARED_KEY_RATE_LIMIT);
        });

        it('does not consume shared-key budget when a working personal key serves every request', async () => {
            mockGetNeonClient.mockReturnValue(makeDb([fakeRepo], personalKeyRow) as never);
            mockGenerate.mockResolvedValue({ text: 'ok', usingOwnKey: true });

            // Comfortably more requests than the shared budget: none should be
            // throttled, because each reservation taken before the call is
            // released once the personal key is confirmed to have served the
            // reply.
            for (let i = 0; i < AUTHED_SHARED_KEY_RATE_LIMIT * 3; i++) {
                const res = await POST(makeRequest(validBody), params());
                expect(res.status).toBe(200);
                const data = await res.json();
                expect(data.rateLimitWarning).toBeUndefined();
            }
        });

        it('reserves the shared-key slot before the AI call, so consecutive personal-key failures cannot exceed the shared budget (CWE-770)', async () => {
            mockGetNeonClient.mockReturnValue(makeDb([fakeRepo], personalKeyRow) as never);
            // Personal key is configured but fails at call time on every
            // request; generateAIContent's real fallback behavior for that
            // case is usingOwnKey: false (see lib/ai.ts).
            mockGenerate.mockResolvedValue({ text: 'served by shared key', usingOwnKey: false });

            for (let i = 0; i < AUTHED_SHARED_KEY_RATE_LIMIT; i++) {
                const res = await POST(makeRequest(validBody), params());
                expect(res.status).toBe(200);
                const data = await res.json();
                expect(data.rateLimitWarning).toMatch(/saved API key failed/i);
            }

            const limited = await POST(makeRequest(validBody), params());
            const data = await limited.json();
            expect(limited.status).toBe(429);
            expect(data.error).toMatch(/shared AI key's rate limit/i);
        });

        it('interleaves personal-key successes and failures without the successes eroding the shared budget', async () => {
            mockGetNeonClient.mockReturnValue(makeDb([fakeRepo], personalKeyRow) as never);

            // Five successful personal-key calls up front must not count
            // against the shared budget at all -- each reservation taken for
            // them is released once success is confirmed.
            mockGenerate.mockResolvedValue({ text: 'ok', usingOwnKey: true });
            for (let i = 0; i < 5; i++) {
                const res = await POST(makeRequest(validBody), params());
                expect(res.status).toBe(200);
            }

            // The personal key now fails on every call: exactly the full
            // shared budget's worth of these should still succeed (served by
            // the shared key) before being throttled -- proving the earlier
            // successes left the budget untouched.
            mockGenerate.mockResolvedValue({ text: 'served by shared key', usingOwnKey: false });
            for (let i = 0; i < AUTHED_SHARED_KEY_RATE_LIMIT; i++) {
                const res = await POST(makeRequest(validBody), params());
                expect(res.status).toBe(200);
            }
            const limited = await POST(makeRequest(validBody), params());
            expect(limited.status).toBe(429);
        });
    });
});
