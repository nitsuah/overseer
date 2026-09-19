/**
 * Tests for lib/repo-access.ts -- the per-repo authorization layer that
 * closes the IDOR gap on the shared, ownerless `repos` table (CWE-639).
 */
import { describe, it, expect, vi } from 'vitest';
import {
    canAccessRepo,
    grantRepoAccess,
    getAccessibleRepoIds,
    isDefaultRepo,
    type RepoAccessDb,
} from '@/lib/repo-access';

function makeDb(rows: unknown[] = []) {
    const calls: Array<{ text: string; values: unknown[] }> = [];
    const spy = vi.fn(async (strings: TemplateStringsArray, ...values: unknown[]) => {
        calls.push({ text: strings.join(' '), values });
        return rows;
    });
    return { db: spy as unknown as RepoAccessDb, spy, calls };
}

describe('isDefaultRepo', () => {
    it('recognises DEFAULT_REPOS case-insensitively and rejects others', () => {
        expect(isDefaultRepo('nitsuah/vigil')).toBe(true);
        expect(isDefaultRepo('Nitsuah-Labs/nitsuah-io')).toBe(true);
        expect(isDefaultRepo('someone/else')).toBe(false);
        expect(isDefaultRepo(null)).toBe(false);
    });
});

describe('canAccessRepo', () => {
    it('always allows a default repo without querying repo_access', async () => {
        const { db, spy } = makeDb();
        const allowed = await canAccessRepo(db, { id: 'r1', full_name: 'nitsuah/vigil' }, undefined);
        expect(allowed).toBe(true);
        expect(spy).not.toHaveBeenCalled();
    });

    it('allows a verified-public repo without querying repo_access', async () => {
        const { db, spy } = makeDb();
        const allowed = await canAccessRepo(
            db,
            { id: 'r1', full_name: 'a/b', private_repo: false, visibility_verified: true },
            'gh-999'
        );
        expect(allowed).toBe(true);
        expect(spy).not.toHaveBeenCalled();
    });

    it('FAILS CLOSED for an unverified row (synced before visibility was tracked)', async () => {
        const { db } = makeDb([]);
        const allowed = await canAccessRepo(
            db,
            { id: 'r1', full_name: 'a/b', private_repo: false, visibility_verified: false },
            'gh-999'
        );
        expect(allowed).toBe(false);
    });

    it('still lets the owner into an unverified row via their repo_access grant', async () => {
        const { db } = makeDb([{ '?column?': 1 }]);
        const allowed = await canAccessRepo(db, { id: 'r1', full_name: 'a/b' }, 'gh-owner');
        expect(allowed).toBe(true);
    });

    it('denies a private repo when the caller has no githubUserId at all', async () => {
        const { db, spy } = makeDb();
        const allowed = await canAccessRepo(
            db,
            { id: 'r1', full_name: 'a/b', private_repo: true, visibility_verified: true },
            undefined
        );
        expect(allowed).toBe(false);
        expect(spy).not.toHaveBeenCalled();
    });

    it('allows a private repo when a matching repo_access row exists', async () => {
        const { db, calls } = makeDb([{ '?column?': 1 }]);
        const allowed = await canAccessRepo(
            db,
            { id: 'r1', full_name: 'a/b', private_repo: true, visibility_verified: true },
            'gh-999'
        );
        expect(allowed).toBe(true);
        expect(calls[0].values).toEqual(['r1', 'gh-999']);
    });

    it("denies a private repo with no repo_access row for this user (someone else's repo)", async () => {
        const { db } = makeDb([]);
        const allowed = await canAccessRepo(
            db,
            { id: 'r1', full_name: 'a/b', private_repo: true, visibility_verified: true },
            'gh-someone-else'
        );
        expect(allowed).toBe(false);
    });
});

describe('getAccessibleRepoIds', () => {
    it('returns the ids the query yields, scoped to the caller', async () => {
        const { db, calls } = makeDb([{ id: 'r1' }, { id: 'r2' }]);
        const ids = await getAccessibleRepoIds(db, 'gh-999');
        expect([...ids]).toEqual(['r1', 'r2']);
        expect(calls[0].values).toContain('gh-999');
        expect(calls[0].text).toContain('visibility_verified IS TRUE');
    });

    it('scopes an unknown caller to an empty user id (never a wildcard)', async () => {
        const { db, calls } = makeDb([]);
        await getAccessibleRepoIds(db, undefined);
        expect(calls[0].values).toContain('');
    });
});

describe('grantRepoAccess', () => {
    it('is a no-op when githubUserId is undefined', async () => {
        const { db, spy } = makeDb();
        await grantRepoAccess(db, 'owner/repo', undefined);
        expect(spy).not.toHaveBeenCalled();
    });

    it("inserts a repo_access row scoped by full_name and the caller's id", async () => {
        const { db, spy, calls } = makeDb();
        await grantRepoAccess(db, 'owner/repo', 'gh-999');
        expect(spy).toHaveBeenCalledTimes(1);
        expect(calls[0].text).toContain('INSERT INTO repo_access');
        expect(calls[0].values).toEqual(['gh-999', 'owner/repo']);
    });
});
