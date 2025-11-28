// netlify/functions/sync-repos.ts
import type { Handler } from '@netlify/functions';
import { GitHubClient } from '../../lib/github';
import { getNeonClient } from '../../lib/db';
import { syncRepo } from '../../lib/sync';
import logger from '../../lib/log';
import { DEFAULT_REPOS } from '../../lib/default-repos';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) throw new Error('GITHUB_TOKEN not configured');
        const github = new GitHubClient(githubToken, 'nitsuah');
        const db = getNeonClient();

        const githubRepos = await github.listRepos();
        const githubRepoNames = new Set(githubRepos.map(r => r.name));

        // Sync user repos
        for (const repo of githubRepos) {
            await syncRepo(repo, github, db);
        }

        // Sync custom repos (those in DB but not in GitHub list)
        const dbRepos = await db`SELECT name, full_name FROM repos`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const customRepos = dbRepos.filter((r: any) => !githubRepoNames.has(r.name));

        for (const dbRepo of customRepos) {
            try {
                const [owner, name] = dbRepo.full_name.split('/');
                const repoMeta = await github.getRepo(owner, name);
                await syncRepo(repoMeta, github, db);
            } catch (e) {
                logger.warn(`Failed to sync custom repo ${dbRepo.full_name}:`, e);
            }
        }

        // Always sync default repos
        for (const defaultRepo of DEFAULT_REPOS) {
            try {
                const repoMeta = await github.getRepo(defaultRepo.owner, defaultRepo.name);
                await syncRepo(repoMeta, github, db);
            } catch (e) {
                logger.warn(`Failed to sync default repo ${defaultRepo.fullName}:`, e);
            }
        }

        return { statusCode: 200, body: JSON.stringify({ success: true, count: githubRepos.length + customRepos.length + DEFAULT_REPOS.length }) };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        logger.warn('Sync error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
