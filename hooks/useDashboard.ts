// Custom hooks for dashboard functionality

import { useState, useEffect } from 'react';
import { Repo, RepoDetails } from '@/types/repo';

export function useRepos() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRepos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/repos');
      if (!res.ok) {
        console.error(`Failed to fetch repos: ${res.status} ${res.statusText}`);
        return;
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error(`Invalid response type: ${contentType}`);
        return;
      }
      
      const data = await res.json();
      setRepos(data);
    } catch (error) {
      console.error('Failed to fetch repos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  return { repos, setRepos, loading, refetch: fetchRepos };
}

export function useRepoDetails() {
  const [repoDetails, setRepoDetails] = useState<Record<string, RepoDetails>>({});
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  const fetchRepoDetails = async (repoName: string, force = false) => {
    if (!force && (repoDetails[repoName] || loadingDetails.has(repoName))) return;
    
    setLoadingDetails(prev => new Set(prev).add(repoName));
    
    try {
      const res = await fetch(`/api/repo-details/${repoName}`);
      if (!res.ok) {
        console.error(`Failed to fetch details for ${repoName}: ${res.status} ${res.statusText}`);
        return;
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error(`Invalid response type for ${repoName}: ${contentType}`);
        return;
      }
      
      const data = await res.json();
      setRepoDetails((prev) => ({
        ...prev,
        [repoName]: {
          tasks: data.tasks || [],
          roadmapItems: data.roadmapItems || [],
          docStatuses: data.docStatuses || [],
          metrics: data.metrics || [],
          features: data.features || [],
          bestPractices: data.bestPractices || [],
          communityStandards: data.communityStandards || [],
        },
      }));
    } catch (error) {
      console.error('Failed to fetch repo details:', error);
    } finally {
      setLoadingDetails(prev => {
        const next = new Set(prev);
        next.delete(repoName);
        return next;
      });
    }
  };

  const fetchAllRepoDetails = async (repoNames: string[]) => {
    // Fetch all repo details in parallel
    await Promise.all(repoNames.map(name => fetchRepoDetails(name)));
  };

  return { repoDetails, fetchRepoDetails, fetchAllRepoDetails };
}

export function useRepoExpansion() {
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());

  const toggleRepo = (repoName: string) => {
    const newExpanded = new Set(expandedRepos);
    if (newExpanded.has(repoName)) {
      newExpanded.delete(repoName);
    } else {
      newExpanded.add(repoName);
    }
    setExpandedRepos(newExpanded);
  };

  return { expandedRepos, toggleRepo };
}
