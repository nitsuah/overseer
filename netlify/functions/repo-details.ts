import type { Handler, HandlerEvent } from '@netlify/functions';
import { getServerSupabase } from '../../lib/supabase';

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    const repoName = event.path.split('/').pop();

    if (!repoName) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Repo name required' }),
        };
    }

    try {
        const supabase = getServerSupabase();

        // Get repo
        const { data: repo, error: repoError } = await supabase
            .from('repos')
            .select('*')
            .eq('name', repoName)
            .single();

        if (repoError) throw repoError;

        // Get tasks
        const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('repo_id', repo.id)
            .order('created_at', { ascending: false });

        // Get roadmap items
        const { data: roadmapItems } = await supabase
            .from('roadmap_items')
            .select('*')
            .eq('repo_id', repo.id)
            .order('created_at', { ascending: false });

        // Get doc statuses
        const { data: docStatuses } = await supabase
            .from('doc_status')
            .select('*')
            .eq('repo_id', repo.id);

        // Get latest metrics
        const { data: metrics } = await supabase
            .from('metrics')
            .select('*')
            .eq('repo_id', repo.id)
            .order('timestamp', { ascending: false })
            .limit(10);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                repo,
                tasks: tasks || [],
                roadmapItems: roadmapItems || [],
                docStatuses: docStatuses || [],
                metrics: metrics || [],
            }),
        };
    } catch (error: any) {
        console.error('Error fetching repo details:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
