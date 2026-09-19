/**
 * denyIfNoRepoAccess -- the one-line guard used by every /api/repos/[name]/*
 * route (CWE-639).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({ getNeonClient: vi.fn(), ensureSchema: vi.fn().mockResolvedValue(undefined) }));

import { getNeonClient } from '@/lib/db';
import { denyIfNoRepoAccess } from '@/lib/repo-access-guard';

const mockGetNeonClient = vi.mocked(getNeonClient);

function dbWith(repoRows: unknown[], accessRows: unknown[] = []) {
    return vi.fn(async (strings: TemplateStringsArray) =>
        strings.join(' ').includes('FROM repo_access') ? accessRows : repoRows
    );
}

const verifiedPublic = { id: 'r1', full_name: 'a/pub', private_repo: false, visibility_verified: true };
const verifiedPrivate = { id: 'r2', full_name: 'a/priv', private_repo: true, visibility_verified: true };
const unverified = { id: 'r3', full_name: 'a/old', private_repo: false, visibility_verified: false };

describe('denyIfNoRepoAccess', () => {
    beforeEach(() => vi.clearAllMocks());

    it('lets the route continue when no repo has that name (the route 404s itself)', async () => {
        mockGetNeonClient.mockReturnValue(dbWith([]) as never);
        expect(await denyIfNoRepoAccess('ghost', { userId: 'u1' })).toBeNull();
    });

    it('allows a verified-public repo', async () => {
        mockGetNeonClient.mockReturnValue(dbWith([verifiedPublic]) as never);
        expect(await denyIfNoRepoAccess('pub', { userId: 'u1' })).toBeNull();
    });

    it("404s a private repo the caller has no grant for (someone else's repo)", async () => {
        mockGetNeonClient.mockReturnValue(dbWith([verifiedPrivate], []) as never);
        const res = await denyIfNoRepoAccess('priv', { userId: 'u1' });
        expect(res?.status).toBe(404);
        expect((await res!.json()).error).toBe('Repo not found');
    });

    it('allows a private repo the caller has a grant for (their own repo)', async () => {
        mockGetNeonClient.mockReturnValue(dbWith([verifiedPrivate], [{ x: 1 }]) as never);
        expect(await denyIfNoRepoAccess('priv', { userId: 'owner' })).toBeNull();
    });

    it('fails closed for an unverified (pre-migration) row', async () => {
        mockGetNeonClient.mockReturnValue(dbWith([unverified], []) as never);
        const res = await denyIfNoRepoAccess('old', { userId: 'u1' });
        expect(res?.status).toBe(404);
    });

    it('404s when there is no session identity at all', async () => {
        mockGetNeonClient.mockReturnValue(dbWith([verifiedPrivate]) as never);
        expect((await denyIfNoRepoAccess('priv', null))?.status).toBe(404);
    });

    it('requires access to EVERY repo sharing the short name, not just one', async () => {
        // `name` isn't unique across owners and the routes act on whichever row
        // (or all rows) match, so a mix of accessible + inaccessible must deny.
        mockGetNeonClient.mockReturnValue(dbWith([verifiedPublic, verifiedPrivate], []) as never);
        expect((await denyIfNoRepoAccess('dup', { userId: 'u1' }))?.status).toBe(404);
    });
});
