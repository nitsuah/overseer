/**
 * Tests for lib/repo-access.ts -- the per-repo authorization layer that
 * closes the IDOR gap on the shared, ownerless `repos` table (CWE-639).
 */
import { describe, it, expect, vi } from 'vitest';
import { canAccessRepo, grantRepoAccess, type RepoAccessDb } from '@/lib/repo-access';

function makeDb(rows: unknown[] = []) {
    const calls: Array<{ text: string; values: unknown[] }> = [];
    const spy = vi.fn(async (strings: TemplateStringsArray, ...values: unknown[]) => {
        calls.push({ text: strings.join(' '), values });
        return rows;
    });
    return { db: spy as unknown as RepoAccessDb, spy, calls };
}

describe('canAccessRepo', () => {
    it('allows any signed-in user to view a public repo without querying repo_access', async () => {
        const { db, spy } = makeDb();
        const allowed = await canAccessRepo(db, { id: 'repo-1', private_repo: false }, 'gh-999');
        expect(allowed).toBe(true);
        expect(spy).not.toHaveBeenCalled();
    });

    it('allows a repo with private_repo unset (legacy row) the same as public', async () => {
        const { db } = makeDb();
        const allowed = await canAccessRepo(db, { id: 'repo-1' }, 'gh-999');
        expect(allowed).toBe(true);
    });

    it('denies a private repo when the caller has no githubUserId at all', async () => {
        const { db, spy } = makeDb();
        const allowed = await canAccessRepo(db, { id: 'repo-1', private_repo: true }, undefined);
        expect(allowed).toBe(false);
        expect(spy).not.toHaveBeenCalled();
    });

    it('allows a private repo when a matching repo_access row exists', async () => {
        const { db, calls } = makeDb([{ '?column?': 1 }]);
        const allowed = await canAccessRepo(db, { id: 'repo-1', private_repo: true }, 'gh-999');
        expect(allowed).toBe(true);
        expect(calls[0].values).toEqual(['repo-1', 'gh-999']);
    });

    it('denies a private repo when no repo_access row exists for this user (someone else\'s repo)', async () => {
        const { db } = makeDb([]);
        const allowed = await canAccessRepo(db, { id: 'repo-1', private_repo: true }, 'gh-someone-else');
        expect(allowed).toBe(false);
    });
});

describe('grantRepoAccess', () => {
    it('is a no-op when githubUserId is undefined', async () => {
        const { db, spy } = makeDb();
        await grantRepoAccess(db, 'owner/repo', undefined);
        expect(spy).not.toHaveBeenCalled();
    });

    it('inserts a repo_access row scoped by full_name and the caller\'s id', async () => {
        const { db, spy, calls } = makeDb();
        await grantRepoAccess(db, 'owner/repo', 'gh-999');
        expect(spy).toHaveBeenCalledTimes(1);
        expect(calls[0].text).toContain('INSERT INTO repo_access');
        expect(calls[0].values).toEqual(['gh-999', 'owner/repo']);
    });
});
