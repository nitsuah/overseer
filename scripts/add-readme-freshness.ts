import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function addReadmeFreshnessColumn() {
    console.log('Adding readme_last_updated column to repos table...');

    try {
        await sql`
      ALTER TABLE repos 
      ADD COLUMN IF NOT EXISTS readme_last_updated TIMESTAMP
    `;

        console.log('✅ Successfully added readme_last_updated column');
    } catch (error) {
        console.error('❌ Error adding column:', error);
        throw error;
    }
}

addReadmeFreshnessColumn()
    .then(() => {
        console.log('Migration complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
