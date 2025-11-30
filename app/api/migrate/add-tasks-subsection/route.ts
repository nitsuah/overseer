import { NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db';

export async function POST() {
  const db = getNeonClient();

  try {
    console.log('Running migration: add_tasks_subsection');
    
    // Add subsection column to tasks table
    await db`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subsection TEXT`;
    
    // Create index for better query performance
    await db`CREATE INDEX IF NOT EXISTS idx_tasks_subsection ON tasks(subsection)`;
    
    console.log('✓ Migration completed successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Added subsection column to tasks table'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Migration failed:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: errorMessage 
    }, { status: 500 });
  }
}
