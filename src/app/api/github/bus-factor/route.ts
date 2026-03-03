import { NextRequest, NextResponse } from "next/server";
import { getTokenFromSession } from "@/lib/session";
import { validateOwner, validateRepo, safeError } from "@/lib/validation";
import { getOctokit } from "@/lib/github";

const CACHE_TTL = 600; // 10 minutes

// ── Response types ────────────────────────────────────────────────────────────

export interface ModuleOwnership {
  /** Directory path prefix (e.g. "src/lib", "src/components") */
  module: string;
  /** Contributors and their commit share */
  contributors: { login: string; commits: number; pct: number }[];
  /** Number of unique contributors */
  unique_contributors: number;
  /** Bus factor (contributors needed for >=80% of commits) */
  bus_factor: number;
  /** Total commits in this module */
  total_commits: number;
  /** Risk level */
  risk: "critical" | "warning" | "healthy";
}

export interface BusFactorResponse {
  modules: ModuleOwnership[];
  /** Overall repo bus factor */
  overall_bus_factor: number;
  /** Total commits analysed */
  total_commits: number;
  /** Modules with bus factor = 1 (critical risk) */
  critical_modules: number;
  /** Total unique contributors across all modules */
  total_contributors: number;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const token = await getTokenFromSession();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);

  const ownerResult = validateOwner(searchParams.get("owner"));
  if (!ownerResult.ok) return ownerResult.response;

  const repoResult = validateRepo(searchParams.get("repo"));
  if (!repoResult.ok) return repoResult.response;

  const owner = ownerResult.data;
  const repo = repoResult.data;

  try {
    const octokit = getOctokit(token);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch last 300 commits (paginated)
    const commits: { author: string; files: string[] }[] = [];
    let page = 1;
    const perPage = 100;

    while (commits.length < 300 && page <= 3) {
      const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        since: ninetyDaysAgo,
        per_page: perPage,
        page,
      });

      if (data.length === 0) break;

      // For each commit, we need file paths. Use the commit detail API in batches.
      const BATCH = 5;
      for (let i = 0; i < data.length; i += BATCH) {
        const batch = data.slice(i, i + BATCH);
        const results = await Promise.allSettled(
          batch.map(async (c) => {
            const { data: detail } = await octokit.rest.repos.getCommit({
              owner,
              repo,
              ref: c.sha,
            });
            return {
              author: detail.author?.login ?? detail.commit.author?.name ?? "unknown",
              files: (detail.files ?? []).map((f) => f.filename),
            };
          })
        );

        for (const result of results) {
          if (result.status === "fulfilled") {
            commits.push(result.value);
          }
        }
      }

      page++;
    }

    if (commits.length === 0) {
      const empty: BusFactorResponse = {
        modules: [],
        overall_bus_factor: 0,
        total_commits: 0,
        critical_modules: 0,
        total_contributors: 0,
      };
      return NextResponse.json(empty, {
        headers: { "Cache-Control": `private, s-maxage=${CACHE_TTL}, stale-while-revalidate=600` },
      });
    }

    // ── Group commits by module (top-2 directory level) ─────────────────────
    // e.g. "src/lib/dora.ts" → "src/lib"
    // e.g. ".github/workflows/ci.yml" → ".github/workflows"
    function getModule(filePath: string): string {
      const parts = filePath.split("/");
      if (parts.length <= 1) return "(root)";
      if (parts.length === 2) return parts[0];
      return `${parts[0]}/${parts[1]}`;
    }

    const moduleMap = new Map<string, Map<string, number>>();
    const allContributors = new Set<string>();

    for (const commit of commits) {
      allContributors.add(commit.author);
      const seenModules = new Set<string>();
      for (const file of commit.files) {
        const mod = getModule(file);
        if (seenModules.has(mod)) continue; // count each module once per commit
        seenModules.add(mod);

        if (!moduleMap.has(mod)) moduleMap.set(mod, new Map());
        const authorMap = moduleMap.get(mod)!;
        authorMap.set(commit.author, (authorMap.get(commit.author) ?? 0) + 1);
      }
    }

    // ── Compute per-module bus factor ───────────────────────────────────────
    const modules: ModuleOwnership[] = [];

    for (const [mod, authorMap] of moduleMap) {
      const totalCommits = Array.from(authorMap.values()).reduce((s, c) => s + c, 0);
      const contributors = Array.from(authorMap.entries())
        .map(([login, commitCount]) => ({
          login,
          commits: commitCount,
          pct: Math.round((commitCount / totalCommits) * 100),
        }))
        .sort((a, b) => b.commits - a.commits);

      // Bus factor: contributors needed for >= 80% of commits
      let cumulative = 0;
      let busFactor = 0;
      for (const c of contributors) {
        cumulative += c.commits;
        busFactor++;
        if (cumulative >= totalCommits * 0.8) break;
      }

      const risk: ModuleOwnership["risk"] =
        busFactor <= 1 ? "critical" : busFactor <= 2 ? "warning" : "healthy";

      modules.push({
        module: mod,
        contributors: contributors.slice(0, 5), // top 5 per module
        unique_contributors: contributors.length,
        bus_factor: busFactor,
        total_commits: totalCommits,
        risk,
      });
    }

    // Sort: critical first, then by total commits descending
    modules.sort((a, b) => {
      const riskOrder = { critical: 0, warning: 1, healthy: 2 };
      if (riskOrder[a.risk] !== riskOrder[b.risk]) {
        return riskOrder[a.risk] - riskOrder[b.risk];
      }
      return b.total_commits - a.total_commits;
    });

    // Overall bus factor (across all commits, by author)
    const overallAuthorMap = new Map<string, number>();
    for (const commit of commits) {
      overallAuthorMap.set(commit.author, (overallAuthorMap.get(commit.author) ?? 0) + 1);
    }
    const overallSorted = Array.from(overallAuthorMap.entries()).sort(
      ([, a], [, b]) => b - a
    );
    let overallCum = 0;
    let overallBf = 0;
    for (const [, count] of overallSorted) {
      overallCum += count;
      overallBf++;
      if (overallCum >= commits.length * 0.8) break;
    }

    const response: BusFactorResponse = {
      modules: modules.slice(0, 30), // cap at 30 modules
      overall_bus_factor: overallBf,
      total_commits: commits.length,
      critical_modules: modules.filter((m) => m.risk === "critical").length,
      total_contributors: allContributors.size,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": `private, s-maxage=${CACHE_TTL}, stale-while-revalidate=600`,
      },
    });
  } catch (e) {
    return safeError(e, "Failed to fetch bus factor data");
  }
}
