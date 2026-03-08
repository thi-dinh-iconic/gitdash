/**
 * Lightweight in-process server-side cache with TTL and explicit key invalidation.
 *
 * Intended for caching expensive GitHub API summaries across repeated route
 * renders (e.g. org overview fan-out). Not shared across serverless instances —
 * treat as a request-coalescing layer, not a distributed cache.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/**
 * Get a cached value by key. Returns undefined if missing or expired.
 */
export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

/**
 * Set a cache entry with an explicit TTL in seconds.
 */
export function cacheSet<T>(key: string, value: T, ttlSeconds: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

/**
 * Invalidate a single key.
 */
export function cacheDelete(key: string): void {
  store.delete(key);
}

/**
 * Invalidate all keys matching a prefix.
 */
export function cacheDeleteByPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

/**
 * Wrap an async factory in a cache: if the key is hot, return the cached
 * value; otherwise call factory(), cache the result, and return it.
 *
 * @example
 * const data = await withCache(`org-overview:${org}`, 300, () => fetchOrgOverview(org));
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  factory: () => Promise<T>,
): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== undefined) return cached;
  const value = await factory();
  cacheSet(key, value, ttlSeconds);
  return value;
}

/**
 * Return basic cache stats for observability.
 */
export function cacheStats(): { size: number; keys: string[] } {
  const now = Date.now();
  // Purge expired before reporting
  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(key);
  }
  return { size: store.size, keys: Array.from(store.keys()) };
}
