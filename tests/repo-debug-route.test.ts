/**
 * GET /api/repos/[name]/debug used to have NO auth and dumped a repo's whole
 * roadmap/tasks/features/metrics to anyone.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import type { Session } from 'next-auth';
import { NextResponse } from 'next/server';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db', () => ({ getNeonClient: vi.fn(), ensureSchema: vi.fn() }));
vi.mock('@/lib/log', () => ({ default: { warn: vi.fn(), info: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/repo-access-guard', () => ({ denyIfNoRepoAccess: vi.fn() }));

import { GET } from '@/app/api/repos/[name]/debug/route';
import { auth } from '@/auth';
import { getNeonClient } from '@/lib/db';
import { denyIfNoRepoAccess } from '@/lib/repo-access-guard';

const mockAuth = vi.mocked(auth) as unknown as Mock<() => Promise<Session | null>>;
const mockGuard = vi.mocked(denyIfNoRepoAccess);
const ctx = { params: Promise.resolve({ name: 'some-repo' }) };
const req = new Request('http://localhost:3000/api/repos/some-repo/debug');

describe('GET /api/repos/[name]/debug', () => {
    beforeEach(() => vi.clearAllMocks());

    it('rejects an unauthenticated caller before touching the database', async () => {
        mockAuth.mockResolvedValue(null);
        const res = await GET(req, ctx);
        expect(res.status).toBe(401);
        expect(getNeonClient).not.toHaveBeenCalled();
        expect(mockGuard).not.toHaveBeenCalled();
    });

    it("returns the guard's 404 for a repo the signed-in caller cannot access", async () => {
        mockAuth.mockResolvedValue({ user: { name: 'u' }, userId: 'u1', expires: 'x' } as Session);
        mockGuard.mockResolvedValue(NextResponse.json({ error: 'Repo not found' }, { status: 404 }));
        const res = await GET(req, ctx);
        expect(res.status).toBe(404);
        expect(getNeonClient).not.toHaveBeenCalled();
    });
});
