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
  branches_count INTEGER DEFAULT 0,
  url TEXT NOT NULL,
  homepage TEXT,
  topics TEXT[] DEFAULT '{}',
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
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metrics table
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
  doc_type TEXT CHECK (doc_type IN ('readme', 'roadmap', 'tasks', 'changelog', 'contributing', 'metrics', 'other')) NOT NULL,
  exists BOOLEAN DEFAULT FALSE,
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(repo_id, doc_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_repo_id ON tasks(repo_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_roadmap_repo_id ON roadmap_items(repo_id);
CREATE INDEX IF NOT EXISTS idx_metrics_repo_id ON metrics(repo_id);
CREATE INDEX IF NOT EXISTS idx_doc_status_repo_id ON doc_status(repo_id);

-- Enable Row Level Security (RLS)
ALTER TABLE repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_status ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all access to repos" ON repos FOR ALL USING (true);
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all access to roadmap_items" ON roadmap_items FOR ALL USING (true);
CREATE POLICY "Allow all access to metrics" ON metrics FOR ALL USING (true);
CREATE POLICY "Allow all access to doc_status" ON doc_status FOR ALL USING (true);
