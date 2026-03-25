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
 * Auto-refresh expanded repo panels every `intervalMs` (default 5 min).
 * Uses a recursive setTimeout so the next tick only fires after the async
 * refresh fully completes. Timers are cancelled when a panel is collapsed
 * or when the component unmounts, preventing wasted API calls.
 * When `intervalMs` changes at runtime, all active timers are restarted
 * with the new interval.
 */
export function useRepoPolling(
  expandedRepos: Set<string>,
  onRefresh: (repoName: string) => Promise<void>,
  intervalMs = 5 * 60 * 1000
) {
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Refs keep the latest values accessible inside timer callbacks without
  // requiring the effect to re-subscribe on every render.
  const onRefreshRef = useRef(onRefresh);
  const expandedReposRef = useRef(expandedRepos);
  const intervalMsRef = useRef(intervalMs);
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);
  useEffect(() => { expandedReposRef.current = expandedRepos; }, [expandedRepos]);
  useEffect(() => { intervalMsRef.current = intervalMs; }, [intervalMs]);

  // scheduleOne is stable (no deps) because all mutable values are read via refs.
  const scheduleOne = useCallback((repoName: string) => {
    const timers = timersRef.current;
    if (timers.has(repoName)) return; // already counting down
    const timer = setTimeout(async () => {
      timers.delete(repoName);
      try {
        await onRefreshRef.current(repoName);
      } catch (err) {
        console.error(`[useRepoPolling] refresh failed for "${repoName}":`, err);
      }
      // Re-schedule while the panel is still expanded — this is what makes
      // it truly poll rather than fire once.
      if (expandedReposRef.current.has(repoName)) {
        scheduleOne(repoName);
      }
    }, intervalMsRef.current);
    timers.set(repoName, timer);
  }, []);

  // Start/cancel timers as the set of expanded repos changes.
  useEffect(() => {
    const timers = timersRef.current;

    // Start a timer for each newly-expanded repo
    expandedRepos.forEach(repoName => scheduleOne(repoName));

    // Cancel timers for repos that have been collapsed
    timers.forEach((timer, repoName) => {
      if (!expandedRepos.has(repoName)) {
        clearTimeout(timer);
        timers.delete(repoName);
      }
    });
  }, [expandedRepos, scheduleOne]);

  // When intervalMs changes, restart all active timers so the new interval
  // takes effect immediately rather than waiting for the next expansion.
  const prevIntervalMsRef = useRef(intervalMs);
  useEffect(() => {
    if (prevIntervalMsRef.current === intervalMs) return;
    prevIntervalMsRef.current = intervalMs;
    const timers = timersRef.current;
    const active = [...timers.keys()];
    active.forEach(repoName => {
      clearTimeout(timers.get(repoName)!);
      timers.delete(repoName);
    });
    active.forEach(repoName => scheduleOne(repoName));
  }, [intervalMs, scheduleOne]);

  // Cancel all timers when the component unmounts
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, []);
}
