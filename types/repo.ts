// Shared repository and detail types

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  section: string | null;
  subsection?: string | null;
}

export interface RoadmapItem {
  id: string;
  title: string;
  quarter: string | null;
  status: 'planned' | 'in-progress' | 'completed';
}

export interface DocStatus {
  doc_type: string;
  exists: boolean;
  health_state?: string;
}

export interface Metric {
  name: string;
  value: number;
  unit: string | null;
}

export interface Feature {
  id: string;
  category: string;
  title: string;
  description: string;
  items: string[];
}

export interface BestPractice {
  practice_type: string;
  status: string;
  details: Record<string, unknown>;
}

export interface CommunityStandard {
  standard_type: string;
  status: string;
  details: Record<string, unknown>;
}

export interface Repo {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  branches_count: number;
  url: string;
  homepage: string | null;
  topics: string[];
  last_synced: string;
  is_fork?: boolean;
  repo_type?: string;
  health_score?: number;
  testing_status?: string;
  coverage_score?: number;
  ai_summary?: string;
  last_commit_date?: string | null;
  open_prs?: number;
  open_issues_count?: number;
  readme_last_updated?: string | null;
  total_loc?: number;
  loc_language_breakdown?: Record<string, number>;
  test_case_count?: number;
  test_describe_count?: number;
  ci_status?: string;
  ci_last_run?: string | null;
  ci_workflow_name?: string | null;
  vuln_alert_count?: number;
  vuln_critical_count?: number;
  vuln_high_count?: number;
  vuln_last_checked?: string | null;
  contributor_count?: number;
  commit_frequency?: number;
  bus_factor?: number;
  avg_pr_merge_time_hours?: number;
}

export interface RepoDetails {
  tasks: Task[];
  roadmapItems: RoadmapItem[];
  docStatuses: DocStatus[];
  metrics: Metric[];
  features: Feature[];
  bestPractices: BestPractice[];
  communityStandards: CommunityStandard[];
}
