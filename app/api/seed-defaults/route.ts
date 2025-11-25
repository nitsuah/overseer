import { NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db';
import { GitHubClient } from '@/lib/github';
import { syncRepo } from '@/lib/sync';
import { DEFAULT_REPOS } from '@/lib/default-repos';

export async function POST() {
    try {
        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) {
            throw new Error('GITHUB_TOKEN not configured');
        }

        const github = new GitHubClient(githubToken, 'nitsuah');
        const db = getNeonClient();

        let syncedCount = 0;
        const errors: string[] = [];

        for (const defaultRepo of DEFAULT_REPOS) {
            try {
                console.log(`Syncing default repo: ${defaultRepo.fullName}`);
                const repoMeta = await github.getRepo(defaultRepo.owner, defaultRepo.name);
                await syncRepo(repoMeta, github, db);
                syncedCount++;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error(`Failed to sync ${defaultRepo.fullName}:`, errorMessage);
                errors.push(`${defaultRepo.fullName}: ${errorMessage}`);
            }
        }

        return NextResponse.json({
            success: true,
            synced: syncedCount,
            total: DEFAULT_REPOS.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error: unknown) {
        console.error('Error seeding default repos:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
