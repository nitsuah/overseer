import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHmac } from 'crypto';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
    getNeonClient: vi.fn(),
}));

vi.mock('@/lib/github', () => ({
    GitHubClient: vi.fn(),
}));

vi.mock('@/lib/sync', () => ({
    syncRepo: vi.fn(),
}));

vi.mock('@/lib/log', () => ({
    default: { warn: vi.fn(), info: vi.fn() },
}));

import { POST } from '@/app/api/webhooks/github/route';
import { getNeonClient } from '@/lib/db';
import type { Mock } from 'vitest';

const SECRET = 'test-secret-abc123';

function makeSignature(body: string, secret = SECRET): string {
    return 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
}

function makeRequest(body: string, event = 'push', secret = SECRET): NextRequest {
    return new NextRequest('http://localhost/api/webhooks/github', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-github-event': event,
            'x-hub-signature-256': makeSignature(body, secret),
        },
        body,
    });
}

const pushPayload = JSON.stringify({
    repository: {
        name: 'my-repo',
        full_name: 'owner/my-repo',
        owner: { login: 'owner' },
    },
});

describe('GitHub webhook endpoint', () => {
    let originalSecret: string | undefined;
    let originalToken: string | undefined;

    beforeEach(() => {
        originalSecret = process.env.GITHUB_WEBHOOK_SECRET;
        originalToken = process.env.GITHUB_TOKEN;
        process.env.GITHUB_WEBHOOK_SECRET = SECRET;
        process.env.GITHUB_TOKEN = 'ghp_test_token';
        vi.clearAllMocks();
    });

    afterEach(() => {
        process.env.GITHUB_WEBHOOK_SECRET = originalSecret;
        process.env.GITHUB_TOKEN = originalToken;
    });

    it('returns 401 when signature is missing', async () => {
        const req = new NextRequest('http://localhost/api/webhooks/github', {
            method: 'POST',
            headers: { 'x-github-event': 'push' },
            body: pushPayload,
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('returns 401 when signature is wrong', async () => {
        const req = makeRequest(pushPayload, 'push', 'wrong-secret');
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('returns 401 when GITHUB_WEBHOOK_SECRET is not set', async () => {
        delete process.env.GITHUB_WEBHOOK_SECRET;
        const req = makeRequest(pushPayload);
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('responds 200 to ping events', async () => {
        const body = JSON.stringify({ zen: 'Keep it logically awesome.' });
        const req = makeRequest(body, 'ping');
        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.event).toBe('ping');
    });

    it('skips non-push events', async () => {
        const req = makeRequest(pushPayload, 'issues');
        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.skipped).toBe(true);
    });

    it('skips push for untracked repo', async () => {
        (getNeonClient as Mock).mockReturnValue(
            Object.assign(
                vi.fn().mockResolvedValue([]),
                { transaction: vi.fn() }
            )
        );
        const req = makeRequest(pushPayload);
        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.skipped).toBe(true);
    });

    it('queues sync for tracked repo and returns 200', async () => {
        const mockTag = vi.fn().mockResolvedValue([{ name: 'my-repo' }]);
        (getNeonClient as Mock).mockReturnValue(mockTag);

        const { GitHubClient } = await import('@/lib/github');
        (GitHubClient as Mock).mockImplementation(() => ({
            getRepo: vi.fn().mockResolvedValue({ name: 'my-repo', fullName: 'owner/my-repo' }),
        }));

        const req = makeRequest(pushPayload);
        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.queued).toBe('owner/my-repo');
    });
});
