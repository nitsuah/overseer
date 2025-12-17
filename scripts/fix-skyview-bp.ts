import { config } from 'dotenv';
import { resolve } from 'path';
import { getNeonClient } from '../lib/db';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function fixSkyviewBestPractices() {
    const db = getNeonClient();
    
    // Get skyview repo ID
    const repos = await db`SELECT id, name FROM repos WHERE name = 'skyview'`;
    if (repos.length === 0) {
        console.log('❌ Skyview repo not found');
        process.exit(1);
    }
    
    const repoId = repos[0].id;
    console.log('Found skyview repo:', repoId);
    
    // Check current best practices
    const existingPractices = await db`
        SELECT practice_type 
        FROM best_practices 
        WHERE repo_id = ${repoId}
    `;
    const existingTypes = new Set(existingPractices.map((p) => p.practice_type as string));
    console.log('\nExisting practices:', Array.from(existingTypes));
    
    // Add missing practices
    const missingPractices = [
        { type: 'deploy_badge', status: 'missing', details: { exists: false } },
        { type: 'env_template', status: 'missing', details: { exists: false } },
        { type: 'dependabot', status: 'missing', details: { exists: false } },
        { type: 'docker', status: 'missing', details: { exists: false } }
    ];
    
    for (const practice of missingPractices) {
        if (!existingTypes.has(practice.type)) {
            console.log(`\n➕ Adding ${practice.type}...`);
            await db`
                INSERT INTO best_practices (repo_id, practice_type, status, details, last_checked)
                VALUES (${repoId}, ${practice.type}, ${practice.status}, ${JSON.stringify(practice.details)}, NOW())
            `;
        } else {
            console.log(`⏭️  ${practice.type} already exists`);
        }
    }
    
    // Verify
    const updatedPractices = await db`
        SELECT practice_type, status 
        FROM best_practices 
        WHERE repo_id = ${repoId}
        ORDER BY practice_type
    `;
    
    console.log('\n✅ Updated best practices (total:', updatedPractices.length, '):');
    updatedPractices.forEach((p) => {
        console.log(`  - ${p.practice_type}: ${p.status}`);
    });
    
    process.exit(0);
}

fixSkyviewBestPractices().catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
});
