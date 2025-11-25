import { config } from 'dotenv';
import { resolve } from 'path';
import { getNeonClient } from '../lib/db';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function createTables() {
  const db = getNeonClient();
  
  try {
    console.log('Creating missing tables...\n');
    
    // Create features table
    console.log('1. Creating features table...');
    await db`
      CREATE TABLE IF NOT EXISTS features (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        items TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✓ Features table created');
    
    // Create best_practices table
    console.log('\n2. Creating best_practices table...');
    await db`
      CREATE TABLE IF NOT EXISTS best_practices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
        practice_type TEXT NOT NULL,
        status TEXT CHECK (status IN ('missing', 'dormant', 'malformed', 'healthy')) DEFAULT 'missing',
        details JSONB,
        last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(repo_id, practice_type)
      )
    `;
    console.log('✓ Best practices table created');
    
    // Create community_standards table
    console.log('\n3. Creating community_standards table...');
    await db`
      CREATE TABLE IF NOT EXISTS community_standards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
        standard_type TEXT NOT NULL,
        status TEXT CHECK (status IN ('missing', 'dormant', 'malformed', 'healthy')) DEFAULT 'missing',
        details JSONB,
        last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(repo_id, standard_type)
      )
    `;
    console.log('✓ Community standards table created');
    
    // Create indexes
    console.log('\n4. Creating indexes...');
    await db`CREATE INDEX IF NOT EXISTS idx_features_repo_id ON features(repo_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_best_practices_repo_id ON best_practices(repo_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_community_standards_repo_id ON community_standards(repo_id)`;
    console.log('✓ Indexes created');
    
    // Enable RLS
    console.log('\n5. Enabling Row Level Security...');
    await db`ALTER TABLE features ENABLE ROW LEVEL SECURITY`;
    await db`ALTER TABLE best_practices ENABLE ROW LEVEL SECURITY`;
    await db`ALTER TABLE community_standards ENABLE ROW LEVEL SECURITY`;
    console.log('✓ RLS enabled');
    
    // Create policies
    console.log('\n6. Creating policies...');
    try {
      await db`CREATE POLICY "Allow all access to features" ON features FOR ALL USING (true)`;
    } catch {
      // Policy already exists, skip
    }
    try {
      await db`CREATE POLICY "Allow all access to best_practices" ON best_practices FOR ALL USING (true)`;
    } catch {
      // Policy already exists, skip
    }
    try {
      await db`CREATE POLICY "Allow all access to community_standards" ON community_standards FOR ALL USING (true)`;
    } catch {
      // Policy already exists, skip
    }
    console.log('✓ Policies created');
    
    console.log('\n✅ All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

createTables();
