// Dashboard header component with sync and add repo buttons

import { RefreshCw, Filter, X, Plus, Search } from 'lucide-react';
import { RepoType } from '@/lib/repo-type';
import { useState } from 'react';

interface DashboardHeaderProps {
  filteredCount: number;
  totalCount: number;
  showAddRepo: boolean;
  addRepoUrl: string;
  addRepoType: string;
  addingRepo: boolean;
  showFilters: boolean;
  syncing: boolean;
  isAuthenticated?: boolean;
  filterType: RepoType | 'all';
  filterLanguage: string;
  filterFork: 'all' | 'no-forks' | 'forks-only';
  languages: string[];
  onAddRepoUrlChange: (url: string) => void;
  onAddRepoTypeChange: (type: RepoType) => void;
  onAddRepoSubmit: (e: React.FormEvent) => void;
  onToggleAddRepo: () => void;
  onToggleFilters: () => void;
  onSync: () => void;
  onFilterTypeChange: (type: RepoType | 'all') => void;
  onFilterLanguageChange: (language: string) => void;
  onFilterForkChange: (fork: 'all' | 'no-forks' | 'forks-only') => void;
  onClearFilters: () => void;
}

const repoTypes: RepoType[] = ['web-app', 'game', 'tool', 'library', 'bot', 'research', 'unknown'];

export function DashboardHeader({
  filteredCount,
  totalCount,
  showAddRepo,
  addRepoUrl,
  addRepoType,
  addingRepo,
  showFilters,
  syncing,
  isAuthenticated = true,
  filterType,
  filterLanguage,
  filterFork,
  languages,
  onAddRepoUrlChange,
  onAddRepoTypeChange,
  onAddRepoSubmit,
  onToggleAddRepo,
  onToggleFilters,
  onSync,
  onFilterTypeChange,
  onFilterLanguageChange,
  onFilterForkChange,
  onClearFilters,
}: DashboardHeaderProps) {
  const hasActiveFilters = filterType !== 'all' || filterLanguage !== 'all' || filterFork !== 'all';

  return null;
}
