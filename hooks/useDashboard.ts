// Custom hooks for dashboard functionality

import { useState, useEffect, useCallback, useRef } from 'react';
import { Repo, RepoDetails } from '@/types/repo';

export function useRepos(showHidden = false) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRepos = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
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
      if (!silent) setLoading(false);
    }
  }, [showHidden]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  // Silent refetch: updates data without flashing a loading spinner
  const refetch = useCallback(() => fetchRepos(true), [fetchRepos]);

  return { repos, setRepos, loading, refetch };
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

  return { repoDetails, fetchRepoDetails };
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
 * Before each sync, checks the GitHub Events API — if nothing has changed
 * since the last sync, the expensive full sync is skipped entirely.
 * Uses recursive setTimeout so the next tick only starts after the current
 * one finishes. Timers cancel when a panel collapses or the component unmounts.
 */
export function useRepoPolling(
  expandedRepos: Set<string>,
  onRefresh: (repoName: string) => Promise<void>,
  intervalMs = 5 * 60 * 1000
) {
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const onRefreshRef = useRef(onRefresh);
  const expandedReposRef = useRef(expandedRepos);
  const intervalMsRef = useRef(intervalMs);
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);
  useEffect(() => { expandedReposRef.current = expandedRepos; }, [expandedRepos]);
  useEffect(() => { intervalMsRef.current = intervalMs; }, [intervalMs]);

  const scheduleOne = useCallback((repoName: string) => {
    const timers = timersRef.current;
    if (timers.has(repoName)) return;
    const timer = setTimeout(async () => {
      timers.delete(repoName);
      try {
        // Check for new GitHub events before running the expensive full sync
        let hasNewEvents = true; // default: sync if check fails
        try {
          const evRes = await fetch(`/api/repos/${repoName}/events`);
          if (evRes.ok) {
            const evData = await evRes.json();
            hasNewEvents = evData.hasNewEvents ?? true;
          }
        } catch {
          // Network error on events check — proceed with sync to stay fresh
        }

        if (hasNewEvents) {
          await onRefreshRef.current(repoName);
        }
      } catch (err) {
        console.error(`[useRepoPolling] refresh failed for "${repoName}":`, err);
      }
      if (expandedReposRef.current.has(repoName)) {
        scheduleOne(repoName);
      }
    }, intervalMsRef.current);
    timers.set(repoName, timer);
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    expandedRepos.forEach(repoName => scheduleOne(repoName));
    timers.forEach((timer, repoName) => {
      if (!expandedRepos.has(repoName)) {
        clearTimeout(timer);
        timers.delete(repoName);
      }
    });
  }, [expandedRepos, scheduleOne]);

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

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, []);
}
