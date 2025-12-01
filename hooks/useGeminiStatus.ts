// Hook to check Gemini API health status

import { useEffect, useState } from 'react';

interface GeminiStatus {
  healthy: boolean;
  model?: string;
  loading: boolean;
  error?: string;
}

const POLL_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const STORAGE_KEY = 'gemini-status';

export function useGeminiStatus(): GeminiStatus {
  const [status, setStatus] = useState<GeminiStatus>({
    healthy: false,
    loading: true,
  });

  useEffect(() => {
    // Load cached status from localStorage
    const loadCachedStatus = () => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          // Use cached if less than 5 minutes old
          if (Date.now() - parsed.timestamp < POLL_INTERVAL) {
            setStatus({
              healthy: parsed.healthy,
              model: parsed.model,
              loading: false,
            });
            return true;
          }
        }
      } catch (e) {
        // Ignore cache errors
      }
      return false;
    };

    // Check status from API
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/gemini-status');
        const data = await response.json();
        
        const newStatus = {
          healthy: data.healthy,
          model: data.model,
          loading: false,
          error: data.error,
        };
        
        setStatus(newStatus);
        
        // Cache in localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            healthy: data.healthy,
            model: data.model,
            timestamp: Date.now(),
          }));
        } catch (e) {
          // Ignore storage errors
        }
      } catch (error) {
        setStatus({
          healthy: false,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to check status',
        });
      }
    };

    // Try to load from cache first
    const hadCache = loadCachedStatus();
    
    // Always do a fresh check
    checkStatus();

    // Set up polling
    const interval = setInterval(checkStatus, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return status;
}
