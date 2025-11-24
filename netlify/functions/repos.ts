import type { Handler, HandlerEvent } from '@netlify/functions';
import { getServerSupabase } from '../../lib/supabase';

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const supabase = getServerSupabase();

        const { data: repos, error } = await supabase
            .from('repos')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            throw error;
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(repos || []),
        };
    } catch (error: any) {
        console.error('Error fetching repos:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
