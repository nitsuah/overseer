// Simple in-memory cache with ETag support for GitHub API responses
// This reduces unnecessary API calls for unchanged resources

interface CacheEntry {
  data: unknown;
  etag: string;
  timestamp: number;
}

class GitHubCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly maxAge: number = 5 * 60 * 1000; // 5 minutes default

  set(key: string, data: unknown, etag: string): void {
    this.cache.set(key, {
      data,
      etag,
      timestamp: Date.now(),
    });
  }

  get(key: string): { data: unknown; etag: string } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return { data: entry.data, etag: entry.etag };
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }

  private pruneInterval: NodeJS.Timeout | null = null;

  // Start automatic pruning
  startPruning(): void {
    if (this.pruneInterval) return; // Already running
    this.pruneInterval = setInterval(() => this.prune(), 10 * 60 * 1000);
  }

  // Stop automatic pruning (useful for cleanup in tests or hot-reload)
  stopPruning(): void {
    if (this.pruneInterval) {
      clearInterval(this.pruneInterval);
      this.pruneInterval = null;
    }
  }
}

export const githubCache = new GitHubCache();

// Start pruning in non-test environments
if (typeof setInterval !== 'undefined' && process.env.NODE_ENV !== 'test') {
  githubCache.startPruning();
}
