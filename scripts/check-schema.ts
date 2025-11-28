import { config } from 'dotenv';
import { resolve } from 'path';
import { getNeonClient } from '../lib/db';
import logger from '../lib/log';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function checkSchema() {
  const db = getNeonClient();
  
  try {
  logger.info('Checking table schemas...\n');
    
    const tables = ['repos', 'tasks', 'roadmap_items', 'metrics', 'features', 'best_practices', 'community_standards'];
    
    for (const table of tables) {
  logger.info(`\n=== ${table.toUpperCase()} ===`);
      const result = await db`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = ${table}
        ORDER BY ordinal_position;
      `;
  logger.info('Columns:', result.map(r => r.column_name).join(', '));
    }
    
  } catch (error) {
    logger.warn('Error:', error);
  }
}

checkSchema();
