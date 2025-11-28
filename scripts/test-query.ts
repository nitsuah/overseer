import { config } from 'dotenv';
import { resolve } from 'path';
import { getNeonClient } from '../lib/db';
import logger from '../lib/log';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function testQuery() {
  const db = getNeonClient();
  
  try {
  logger.info('Testing queries...\n');
    
    // Test 1: Get a repo
  logger.info('1. Getting repo...');
    const repos = await db`SELECT * FROM repos WHERE name = 'overseer' LIMIT 1`;
  logger.info('✓ Repo found:', repos[0]?.name);
    const repo = repos[0];
    
    if (!repo) {
      logger.warn('No repo found!');
      return;
    }
    
    // Test 2: Get tasks
  logger.info('\n2. Getting tasks...');
    const tasks = await db`SELECT * FROM tasks WHERE repo_id = ${repo.id} ORDER BY created_at DESC`;
  logger.info('✓ Tasks found:', tasks.length);
    
    // Test 3: Get roadmap
  logger.info('\n3. Getting roadmap...');
    const roadmap = await db`SELECT * FROM roadmap_items WHERE repo_id = ${repo.id} ORDER BY created_at DESC`;
  logger.info('✓ Roadmap items found:', roadmap.length);
    
    // Test 4: Get metrics
  logger.info('\n4. Getting metrics...');
    const metrics = await db`SELECT * FROM metrics WHERE repo_id = ${repo.id} ORDER BY created_at DESC`;
  logger.info('✓ Metrics found:', metrics.length);
    
    // Test 5: Get features
    logger.info('\n5. Getting features...');
    try {
      const features = await db`SELECT * FROM features WHERE repo_id = ${repo.id} ORDER BY created_at DESC`;
      logger.info('✓ Features found:', features.length);
    } catch (e: unknown) {
      logger.warn('✗ Features error:', e instanceof Error ? e.message : String(e));
    }
    
    logger.info('\n✓ All queries successful!');
    
  } catch (error) {
    logger.warn('Error:', error);
  }
}

testQuery();
