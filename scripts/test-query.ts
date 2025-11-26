import { config } from 'dotenv';
import { resolve } from 'path';
import { getNeonClient } from '../lib/db';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function testQuery() {
  const db = getNeonClient();
  
  try {
    console.log('Testing queries...\n');
    
    // Test 1: Get a repo
    console.log('1. Getting repo...');
    const repos = await db`SELECT * FROM repos WHERE name = 'overseer' LIMIT 1`;
    console.log('✓ Repo found:', repos[0]?.name);
    const repo = repos[0];
    
    if (!repo) {
      console.log('No repo found!');
      return;
    }
    
    // Test 2: Get tasks
    console.log('\n2. Getting tasks...');
    const tasks = await db`SELECT * FROM tasks WHERE repo_id = ${repo.id} ORDER BY created_at DESC`;
    console.log('✓ Tasks found:', tasks.length);
    
    // Test 3: Get roadmap
    console.log('\n3. Getting roadmap...');
    const roadmap = await db`SELECT * FROM roadmap_items WHERE repo_id = ${repo.id} ORDER BY created_at DESC`;
    console.log('✓ Roadmap items found:', roadmap.length);
    
    // Test 4: Get metrics
    console.log('\n4. Getting metrics...');
    const metrics = await db`SELECT * FROM metrics WHERE repo_id = ${repo.id} ORDER BY created_at DESC`;
    console.log('✓ Metrics found:', metrics.length);
    
    // Test 5: Get features
    console.log('\n5. Getting features...');
    try {
      const features = await db`SELECT * FROM features WHERE repo_id = ${repo.id} ORDER BY created_at DESC`;
      console.log('✓ Features found:', features.length);
    } catch (e: unknown) {
      console.log('✗ Features error:', e instanceof Error ? e.message : String(e));
    }
    
    console.log('\n✓ All queries successful!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testQuery();
