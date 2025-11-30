/**
 * One-time script to populate subsection field for existing tasks
 * Run with: npx tsx scripts/fix-task-subsections.ts
 */

import 'dotenv/config';
import { getNeonClient } from '@/lib/db';
import { parseTasks } from '@/lib/parsers/tasks';
import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fixTaskSubsections() {
  const db = getNeonClient();
  
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN not found in environment');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  console.log('Fetching repositories with tasks...');
  
  // Get all repos with tasks
  const repos = await db`SELECT id, name, owner FROM repos WHERE id IN (SELECT DISTINCT repo_id FROM tasks)`;
  
  console.log(`Found ${repos.length} repositories with tasks`);

  for (const repo of repos) {
    console.log(`\nProcessing ${repo.owner}/${repo.name}...`);
    
    try {
      // Fetch TASKS.md from GitHub
      const { data } = await octokit.repos.getContent({
        owner: repo.owner,
        repo: repo.name,
        path: 'TASKS.md',
      });

      if (!('content' in data)) {
        console.log(`  ⚠️  TASKS.md not found or is a directory`);
        continue;
      }

      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      const tasksData = parseTasks(content);

      console.log(`  Found ${tasksData.tasks.length} tasks in TASKS.md`);

      // Update each task with its subsection
      let updated = 0;
      for (const task of tasksData.tasks) {
        const result = await db`
          UPDATE tasks 
          SET subsection = ${task.subsection}
          WHERE repo_id = ${repo.id} 
            AND title = ${task.title}
            AND status = ${task.status}
        `;
        
        // Neon returns an array with a count property
        const rowCount = (result as unknown as { count?: number }).count;
        if (rowCount && rowCount > 0) {
          updated += rowCount;
        }
      }

      console.log(`  ✓ Updated ${updated} tasks with subsection data`);
      
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        console.log(`  ⚠️  TASKS.md not found in repository`);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`  ✗ Error: ${errorMessage}`);
      }
    }
  }

  console.log('\n✓ Migration complete!');
  process.exit(0);
}

fixTaskSubsections().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
