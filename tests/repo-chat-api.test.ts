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
vi.mock('@/lib/db', () => ({ getNeonClient: vi.fn() }));
vi.mock('@/lib/log', () => ({ default: { warn: vi.fn(), info: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/default-repos', () => ({ DEFAULT_REPOS: [{ name: 'overseer' }] }));
vi.mock('@/lib/ai', () => ({ generateAIContent: vi.fn() }));

import { auth } from '@/auth';
import { getNeonClient } from '@/lib/db';
import { generateAIContent } from '@/lib/ai';

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

function makeDb(repoResult: unknown[] = [fakeRepo]) {
    const db = vi.fn().mockResolvedValue(repoResult);
    (db as unknown as Record<string, unknown>).transaction = vi.fn().mockResolvedValue([
        [{ title: 'Add conversational interface', status: 'todo', section: 'P2 - Medium' }], // tasks
        [{ title: 'PMO mode', quarter: 'Q3', status: 'planned' }],                           // roadmap_items
        [{ doc_type: 'metrics', exists: false, health_state: 'missing' }],                   // doc_status
    ]);
    return db;
}

const makeRequest = (body: unknown, name = 'overseer') =>
    new NextRequest(`http://localhost:3000/api/repos/${name}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });

const params = (name = 'overseer') => ({ params: Promise.resolve({ name }) });

const validBody = { messages: [{ role: 'user', content: 'What should I work on next?' }] };

describe('POST /api/repos/[name]/chat', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuth.mockResolvedValue({
            user: { name: 'testuser', email: 'test@example.com' },
            expires: new Date(Date.now() + 86400000).toISOString(),
        } as Session);
        mockGetNeonClient.mockReturnValue(makeDb() as never);
        mockGenerate.mockResolvedValue('You should finish the conversational interface first.');
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

        const res = await POST(makeRequest(validBody), params());
        expect(res.status).toBe(200);
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

    it('returns 500 for unexpected errors', async () => {
        mockGenerate.mockRejectedValue(new Error('unexpected explosion'));

        const res = await POST(makeRequest(validBody), params());
        expect(res.status).toBe(500);
    });
});
