// Custom hooks for repository filtering

import { useState, useMemo } from 'react';
import { Repo } from '@/types/repo';
import { RepoType, detectRepoType } from '@/lib/repo-type';

export function useRepoFilters(repos: Repo[]) {
  const [filterType, setFilterType] = useState<RepoType | 'all'>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterFork, setFilterFork] = useState<'all' | 'no-forks' | 'forks-only'>('all');

  const languages = useMemo(() => {
    return Array.from(new Set(repos.map((r) => r.language).filter(Boolean))) as string[];
  }, [repos]);

  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => {
      const type =
        (repo.repo_type as RepoType) ||
        detectRepoType(repo.name, repo.description, repo.language, repo.topics).type;
      if (filterType !== 'all' && type !== filterType) return false;
      if (filterLanguage !== 'all' && repo.language !== filterLanguage) return false;
      if (filterFork === 'no-forks' && repo.is_fork) return false;
      if (filterFork === 'forks-only' && !repo.is_fork) return false;
      return true;
    });
  }, [repos, filterType, filterLanguage, filterFork]);

  const clearFilters = () => {
    setFilterType('all');
    setFilterLanguage('all');
    setFilterFork('all');
  };

  return {
    filterType,
    setFilterType,
    filterLanguage,
    setFilterLanguage,
    filterFork,
    setFilterFork,
    languages,
    filteredRepos,
    clearFilters,
  };
}
