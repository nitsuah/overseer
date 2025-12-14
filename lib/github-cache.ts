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

  getETag(key: string): string | null {
    const entry = this.cache.get(key);
    return entry ? entry.etag : null;
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
}

export const githubCache = new GitHubCache();

// Prune expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => githubCache.prune(), 10 * 60 * 1000);
}
