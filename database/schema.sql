-- Repos table
CREATE TABLE IF NOT EXISTS repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  description TEXT,
  language TEXT,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  open_issues INTEGER DEFAULT 0,
  open_prs INTEGER DEFAULT 0,
  branches_count INTEGER DEFAULT 0,
  url TEXT NOT NULL,
  homepage TEXT,
  topics TEXT[] DEFAULT '{}',
  last_commit_date TIMESTAMP WITH TIME ZONE,
  is_fork BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  repo_type TEXT CHECK (repo_type IN ('web-app', 'game', 'tool', 'library', 'bot', 'research', 'other')) DEFAULT 'other',
  ai_summary TEXT,
  health_score INTEGER DEFAULT 0,
  testing_status TEXT,
  coverage_score NUMERIC,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in-progress', 'done')) DEFAULT 'todo',
  section TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(repo_id, task_id)
);

-- Roadmap items table
CREATE TABLE IF NOT EXISTS roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  quarter TEXT,
  status TEXT CHECK (status IN ('planned', 'in-progress', 'completed')) DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metrics table
-- NOTE: Production uses 'metric_name' and 'timestamp' columns (legacy schema)
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doc status table
CREATE TABLE IF NOT EXISTS doc_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  exists BOOLEAN DEFAULT FALSE,
  health_state TEXT CHECK (health_state IN ('missing', 'dormant', 'malformed', 'healthy')) DEFAULT 'missing',
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  template_hash TEXT,
  content_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(repo_id, doc_type)
);

-- Features table
CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  items TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Best practices table
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
);

-- Community standards table
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
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_repos_type ON repos(repo_type);
CREATE INDEX IF NOT EXISTS idx_repos_hidden ON repos(is_hidden);
CREATE INDEX IF NOT EXISTS idx_tasks_repo_id ON tasks(repo_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_roadmap_repo_id ON roadmap_items(repo_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_status ON roadmap_items(status);
CREATE INDEX IF NOT EXISTS idx_metrics_repo_id ON metrics(repo_id);
CREATE INDEX IF NOT EXISTS idx_doc_status_repo_id ON doc_status(repo_id);
CREATE INDEX IF NOT EXISTS idx_doc_status_health ON doc_status(health_state);
CREATE INDEX IF NOT EXISTS idx_features_repo_id ON features(repo_id);
CREATE INDEX IF NOT EXISTS idx_best_practices_repo_id ON best_practices(repo_id);
CREATE INDEX IF NOT EXISTS idx_community_standards_repo_id ON community_standards(repo_id);

-- Enable Row Level Security (RLS)
ALTER TABLE repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE best_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_standards ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all access to repos" ON repos FOR ALL USING (true);
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all access to roadmap_items" ON roadmap_items FOR ALL USING (true);
CREATE POLICY "Allow all access to metrics" ON metrics FOR ALL USING (true);
CREATE POLICY "Allow all access to doc_status" ON doc_status FOR ALL USING (true);
CREATE POLICY "Allow all access to features" ON features FOR ALL USING (true);
CREATE POLICY "Allow all access to best_practices" ON best_practices FOR ALL USING (true);
CREATE POLICY "Allow all access to community_standards" ON community_standards FOR ALL USING (true);
