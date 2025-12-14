import { config } from 'dotenv';
import { resolve } from 'path';
import { getNeonClient } from '../lib/db';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
    const db = getNeonClient();
    
    // Get all repos with their best practices count
    const repos = await db`
        SELECT r.id, r.name, r.full_name, 
               COUNT(bp.id) as bp_count
        FROM repos r
        LEFT JOIN best_practices bp ON r.id = bp.repo_id
        WHERE r.name IN ('skyview', 'overseer', 'farm-3j')
        GROUP BY r.id, r.name, r.full_name
        ORDER BY r.name
    `;
    
    console.log('Repos and their best practice counts:');
    console.log(JSON.stringify(repos, null, 2));
    
    // Get detailed best practices for skyview
    const skyview = repos.find((r: {name: string}) => r.name === 'skyview');
    if (skyview) {
        const practices = await db`
            SELECT practice_type, status, details 
            FROM best_practices 
            WHERE repo_id = ${skyview.id}
            ORDER BY practice_type
        `;
        console.log('\n\nSkyview best practices (total:', practices.length, '):');
        console.log(JSON.stringify(practices, null, 2));
    }
    
    process.exit(0);
}

main().catch(console.error);
