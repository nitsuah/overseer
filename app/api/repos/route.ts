import { NextResponse, NextRequest } from 'next/server';
import logger from '@/lib/log';
import { getNeonClient } from '@/lib/db';
import { auth } from '@/auth';
import { DEFAULT_REPOS } from '@/lib/default-repos';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const db = getNeonClient();
        const { searchParams } = new URL(request.url);
        const showHidden = searchParams.get('showHidden') === 'true';

        // If not authenticated, only return default repos
        if (!session) {
            const defaultRepoNames = DEFAULT_REPOS.map(r => r.fullName);
            const repos = await db`
                SELECT * FROM repos
                WHERE (is_hidden = FALSE OR is_hidden IS NULL)
                AND full_name = ANY(${defaultRepoNames})
                ORDER BY 
                    is_fork ASC,
                    CASE 
                        WHEN repo_type = 'unknown' THEN 999
                        WHEN repo_type = 'web-app' THEN 1
                        WHEN repo_type = 'game' THEN 2
                        WHEN repo_type = 'tool' THEN 3
                        WHEN repo_type = 'library' THEN 4
                        WHEN repo_type = 'bot' THEN 5
                        WHEN repo_type = 'research' THEN 6
                        ELSE 999
                    END ASC,
                    stars DESC, 
                    updated_at DESC
            `;
            return NextResponse.json(repos);
        }

        // If authenticated, return repos based on showHidden param
        // If showHidden is true, we simply omit the is_hidden check (or check ONLY hidden? standard pattern is "include hidden")
        // User asked to "show hidden" implying mixed list or toggle. Let's make it include ALL if showHidden=true.
        // Actually, typical UI is "Show Hidden" toggle which adds them to the list.

        const repos = await db`
            SELECT * FROM repos
            WHERE (${showHidden}::boolean IS TRUE OR ((is_hidden = FALSE OR is_hidden IS NULL) AND (is_archived = FALSE OR is_archived IS NULL)))
            ORDER BY 
                is_hidden ASC, -- Show visible first, then hidden
                is_fork ASC,
                CASE 
                    WHEN repo_type = 'unknown' THEN 999
                    WHEN repo_type = 'web-app' THEN 1
                    WHEN repo_type = 'game' THEN 2
                    WHEN repo_type = 'tool' THEN 3
                    WHEN repo_type = 'library' THEN 4
                    WHEN repo_type = 'bot' THEN 5
                    WHEN repo_type = 'research' THEN 6
                    ELSE 999
                END ASC,
                stars DESC, 
                updated_at DESC
        `;

        return NextResponse.json(repos);
    } catch (error: unknown) {
        logger.warn('Error fetching repos:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

