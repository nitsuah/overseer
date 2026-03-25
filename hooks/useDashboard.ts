// Custom hooks for dashboard functionality

import { useState, useEffect, useCallback, useRef } from 'react';
import { Repo, RepoDetails } from '@/types/repo';

export function useRepos(showHidden = false) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRepos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/repos?showHidden=${showHidden}`);
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
  }, [showHidden]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

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

/**
 * When a repo panel is expanded, schedule a background refresh after `intervalMs`
 * (default 5 minutes). The timer is cancelled if the panel is collapsed before it
 * fires, preventing unnecessary API calls. The callback should call sync + refetch.
 */
export function useRepoPolling(
  expandedRepos: Set<string>,
  onRefresh: (repoName: string) => Promise<void>,
  intervalMs = 5 * 60 * 1000
) {
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Keep a stable ref to onRefresh so the effect doesn't re-subscribe when the
  // callback identity changes on every render.
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => {
    const timers = timersRef.current;

    // Start a timer for each newly-expanded repo
    expandedRepos.forEach(repoName => {
      if (!timers.has(repoName)) {
        const timer = setTimeout(() => {
          timers.delete(repoName);
          onRefreshRef.current(repoName).catch(() => {
            // Swallow errors — polling is best-effort
          });
        }, intervalMs);
        timers.set(repoName, timer);
      }
    });

    // Cancel timers for repos that have been collapsed
    timers.forEach((timer, repoName) => {
      if (!expandedRepos.has(repoName)) {
        clearTimeout(timer);
        timers.delete(repoName);
      }
    });
  }, [expandedRepos, intervalMs]);

  // Cancel all timers when the component unmounts
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, []);
}
