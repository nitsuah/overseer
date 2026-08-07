"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';

interface RateLimitData {
  core: {
    limit: number;
    remaining: number;
    reset: string;
    used: number;
  };
  graphql: {
    limit: number;
    remaining: number;
    reset: string;
    used: number;
  };
}

interface RateLimitState {
  rateLimit: RateLimitData | null;
  loading: boolean;
  error: string | null;
}

export function useRateLimit(enabled: boolean = true): RateLimitState {
  const [rateLimit, setRateLimit] = useState<RateLimitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let aborted = false;
    let inflight = false;
    const controller = new AbortController();

    const fetchRateLimit = async () => {
      if (inflight) return;
      inflight = true;
      try {
        const res = await fetch('/api/github-rate-limit', { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          if (!aborted) { setRateLimit(data); setError(null); }
        } else {
          if (!aborted) setError('Failed to fetch rate limit');
        }
      } catch (err) {
        if (!aborted) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        inflight = false;
        if (!aborted) setLoading(false);
      }
    };

    fetchRateLimit();
    const interval = setInterval(fetchRateLimit, 60000);
    return () => {
      aborted = true;
      controller.abort();
      clearInterval(interval);
    };
  }, [enabled]);

  return { rateLimit, loading, error };
}

export function RateLimitDisplay({ rateLimit, loading, error }: RateLimitState): React.JSX.Element | null {
  if (loading || error || !rateLimit) return null;

  const percentage = (rateLimit.core.remaining / rateLimit.core.limit) * 100;
  const resetDate = new Date(rateLimit.core.reset);
  const now = new Date();
  const minutesUntilReset = Math.max(0, Math.round((resetDate.getTime() - now.getTime()) / 60000));

  const showWarning = percentage < 20;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
      showWarning
        ? 'bg-amber-900/30 text-amber-300 border border-amber-700/50'
        : 'bg-slate-800/50 text-slate-400'
    }`}>
      {showWarning && <AlertCircle className="w-4 h-4" />}
      <Clock className="w-4 h-4" />
      <span className="font-mono">
        {rateLimit.core.remaining}/{rateLimit.core.limit}
      </span>
      {showWarning && (
        <span className="text-xs">
          (resets in {minutesUntilReset}m)
        </span>
      )}
    </div>
  );
}

// Convenience wrapper for standalone use
export function RateLimitIndicator(): React.JSX.Element | null {
  const state = useRateLimit();
  return <RateLimitDisplay {...state} />;
}
