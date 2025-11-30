import { getNeonClient } from '../lib/db';

async function checkOverseerTasks() {
  const db = getNeonClient();
  
  try {
    const repos = await db`SELECT id, name FROM repos WHERE name = 'overseer' LIMIT 1`;
    if (repos.length === 0) {
      console.log('overseer repository not found');
      return;
    }
    
    const repo = repos[0];
    console.log(`Checking tasks for repo: ${repo.name} (id: ${repo.id})`);
    
    const tasks = await db`
      SELECT task_id, title, status, section, subsection 
      FROM tasks 
      WHERE repo_id = ${repo.id} 
      ORDER BY 
        CASE status 
          WHEN 'todo' THEN 1 
          WHEN 'in-progress' THEN 2 
          WHEN 'done' THEN 3 
        END,
        subsection NULLS LAST
      LIMIT 25
    `;
    
    console.log(`\nFound ${tasks.length} tasks (showing first 25):\n`);
    tasks.forEach((task, i) => {
      console.log(`${i + 1}. [${task.status}] ${task.title.substring(0, 70)}`);
      console.log(`   Section: ${task.section || 'null'}`);
      console.log(`   Subsection: ${task.subsection || 'null'}`);
      console.log('');
    });
    
    // Count by subsection
    const subsectionCounts = await db`
      SELECT subsection, status, COUNT(*) as count 
      FROM tasks 
      WHERE repo_id = ${repo.id}
      GROUP BY subsection, status
      ORDER BY subsection NULLS LAST, status
    `;
    
    console.log('\nSubsection/Status distribution:');
    subsectionCounts.forEach(row => {
      console.log(`  ${row.subsection || 'NULL'} (${row.status}): ${row.count} tasks`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkOverseerTasks();
