import { parseTasks } from '../lib/parsers/tasks';
import * as fs from 'fs';

const content = fs.readFileSync('TASKS.md', 'utf-8');
const result = parseTasks(content);

console.log(`Parsed ${result.tasks.length} tasks\n`);

// Show first 10 tasks
console.log('First 10 tasks:');
result.tasks.slice(0, 10).forEach((task, i) => {
  console.log(`\n${i + 1}. [${task.status}] ${task.title.substring(0, 70)}`);
  console.log(`   Section: ${task.section}`);
  console.log(`   Subsection: ${task.subsection}`);
});

// Count by subsection
const subsections = new Map<string, number>();
result.tasks.forEach(task => {
  const key = task.subsection || 'NULL';
  subsections.set(key, (subsections.get(key) || 0) + 1);
});

console.log('\n\nSubsection distribution:');
Array.from(subsections.entries())
  .sort((a, b) => b[1] - a[1])
  .forEach(([subsection, count]) => {
    console.log(`  ${subsection}: ${count} tasks`);
  });
