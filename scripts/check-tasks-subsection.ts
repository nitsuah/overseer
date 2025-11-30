import { getNeonClient } from '../lib/db';

async function checkTasksSubsection() {
  const db = getNeonClient();
  
  try {
    const repos = await db`SELECT id, name FROM repos WHERE name = 'osrs' LIMIT 1`;
    if (repos.length === 0) {
      console.log('osrs repository not found');
      return;
    }
    
    const repo = repos[0];
    console.log(`Checking tasks for repo: ${repo.name} (id: ${repo.id})`);
    
    const tasks = await db`
      SELECT task_id, title, status, section, subsection 
      FROM tasks 
      WHERE repo_id = ${repo.id} 
      LIMIT 15
    `;
    
    console.log(`\nFound ${tasks.length} tasks (showing first 15):\n`);
    tasks.forEach((task, i) => {
      console.log(`${i + 1}. [${task.status}] ${task.title.substring(0, 60)}`);
      console.log(`   Section: ${task.section || 'null'}`);
      console.log(`   Subsection: ${task.subsection || 'null'}`);
      console.log('');
    });
    
    // Count by subsection
    const subsectionCounts = await db`
      SELECT subsection, COUNT(*) as count 
      FROM tasks 
      WHERE repo_id = ${repo.id}
      GROUP BY subsection
      ORDER BY count DESC
    `;
    
    console.log('\nSubsection distribution:');
    subsectionCounts.forEach(row => {
      console.log(`  ${row.subsection || 'NULL'}: ${row.count} tasks`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTasksSubsection();
