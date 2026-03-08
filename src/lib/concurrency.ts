/**
 * Bounded concurrency utilities for GitHub API fan-out.
 *
 * GitHub's secondary rate limits penalise concurrent bursts.
 * These helpers ensure we never have more than `maxConcurrent`
 * in-flight requests at once, which also reduces latency variance.
 */

/**
 * Run an array of async tasks with a maximum concurrency cap.
 *
 * @example
 * const results = await pLimit(
 *   repos.map(r => () => fetchRepoSummary(r)),
 *   { concurrency: 5 }
 * );
 */
export async function pLimit<T>(
  tasks: Array<() => Promise<T>>,
  options: { concurrency?: number } = {},
): Promise<T[]> {
  const concurrency = options.concurrency ?? 5;
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const idx = nextIndex++;
      if (idx >= tasks.length) break;
      results[idx] = await tasks[idx]();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * Like Promise.allSettled but with bounded concurrency.
 * Returns an array of settled results in the same order as `tasks`.
 */
export async function pLimitSettled<T>(
  tasks: Array<() => Promise<T>>,
  options: { concurrency?: number } = {},
): Promise<Array<{ status: "fulfilled"; value: T } | { status: "rejected"; reason: unknown }>> {
  const concurrency = options.concurrency ?? 5;
  const results: Array<
    { status: "fulfilled"; value: T } | { status: "rejected"; reason: unknown }
  > = new Array(tasks.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const idx = nextIndex++;
      if (idx >= tasks.length) break;
      try {
        const value = await tasks[idx]();
        results[idx] = { status: "fulfilled", value };
      } catch (reason) {
        results[idx] = { status: "rejected", reason };
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
