/**
 * Demo mode fixtures.
 *
 * When ?demo=1 is present in the URL (or NEXT_PUBLIC_DEMO_MODE=true),
 * the app renders sanitized synthetic data instead of making real GitHub API calls.
 *
 * This enables:
 *   - No-credential onboarding / first-run experience
 *   - Browser automation walkthroughs without leaking real tokens
 *   - Visual regression tests with stable datasets
 *   - Marketing screenshots and video recording
 */

import type { Repo, RepoSummary, WorkflowRun } from "./github";

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

const DEMO_COMMIT_MESSAGES = [
  "feat: add rate limiting middleware",
  "fix: resolve memory leak in connection pool",
  "chore: update dependencies",
  "feat: implement caching layer",
  "fix: correct auth token expiry handling",
  "refactor: extract service layer",
  "test: add integration tests for API",
  "docs: update API documentation",
  "perf: optimize database queries",
  "ci: parallelize test execution",
];

// ── Demo flag ─────────────────────────────────────────────────────────────────

export function isDemoMode(searchParams?: URLSearchParams): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    if (url.searchParams.get("demo") === "1") return true;
  }
  if (searchParams?.get("demo") === "1") return true;
  return false;
}

// ── Demo repos fixture ────────────────────────────────────────────────────────

export const DEMO_ORG = "acme-corp";

export const DEMO_REPOS: Repo[] = [
  { id: 1, name: "api-gateway",       owner: DEMO_ORG, full_name: `${DEMO_ORG}/api-gateway`,       private: false, description: "Central API gateway service",         language: "Go",         html_url: "#", stargazers_count: 142, updated_at: daysAgo(0)  },
  { id: 2, name: "web-frontend",      owner: DEMO_ORG, full_name: `${DEMO_ORG}/web-frontend`,      private: false, description: "React web application",               language: "TypeScript", html_url: "#", stargazers_count: 89,  updated_at: daysAgo(0)  },
  { id: 3, name: "data-pipeline",     owner: DEMO_ORG, full_name: `${DEMO_ORG}/data-pipeline`,     private: true,  description: "ETL pipeline for analytics",          language: "Python",     html_url: "#", stargazers_count: 31,  updated_at: daysAgo(1)  },
  { id: 4, name: "auth-service",      owner: DEMO_ORG, full_name: `${DEMO_ORG}/auth-service`,      private: true,  description: "OAuth2 + JWT auth service",           language: "Go",         html_url: "#", stargazers_count: 57,  updated_at: daysAgo(2)  },
  { id: 5, name: "mobile-app",        owner: DEMO_ORG, full_name: `${DEMO_ORG}/mobile-app`,        private: false, description: "React Native mobile client",          language: "TypeScript", html_url: "#", stargazers_count: 203, updated_at: daysAgo(3)  },
  { id: 6, name: "infra-terraform",   owner: DEMO_ORG, full_name: `${DEMO_ORG}/infra-terraform`,   private: true,  description: "Terraform infrastructure modules",    language: "HCL",        html_url: "#", stargazers_count: 18,  updated_at: daysAgo(4)  },
  { id: 7, name: "notification-svc",  owner: DEMO_ORG, full_name: `${DEMO_ORG}/notification-svc`,  private: false, description: "Push/email notification service",     language: "Go",         html_url: "#", stargazers_count: 24,  updated_at: daysAgo(5)  },
  { id: 8, name: "search-indexer",    owner: DEMO_ORG, full_name: `${DEMO_ORG}/search-indexer`,    private: false, description: "Elasticsearch indexing worker",        language: "Python",     html_url: "#", stargazers_count: 45,  updated_at: daysAgo(6)  },
];

// ── Demo repo summaries ───────────────────────────────────────────────────────

export const DEMO_SUMMARIES: Record<string, RepoSummary> = {
  "api-gateway":      makeSummary({ runs: 340, successRate: 97, trend: "up",   latestConclusion: "success", durationMs: 145_000 }),
  "web-frontend":     makeSummary({ runs: 512, successRate: 94, trend: "up",   latestConclusion: "success", durationMs: 220_000 }),
  "data-pipeline":    makeSummary({ runs: 88,  successRate: 72, trend: "down", latestConclusion: "failure", durationMs: 610_000 }),
  "auth-service":     makeSummary({ runs: 156, successRate: 99, trend: "up",   latestConclusion: "success", durationMs: 90_000  }),
  "mobile-app":       makeSummary({ runs: 201, successRate: 89, trend: "flat", latestConclusion: "success", durationMs: 380_000 }),
  "infra-terraform":  makeSummary({ runs: 42,  successRate: 95, trend: "up",   latestConclusion: "success", durationMs: 55_000  }),
  "notification-svc": makeSummary({ runs: 73,  successRate: 85, trend: "flat", latestConclusion: "failure", durationMs: 120_000 }),
  "search-indexer":   makeSummary({ runs: 120, successRate: 91, trend: "up",   latestConclusion: "success", durationMs: 240_000 }),
};

// ── Demo workflow runs ────────────────────────────────────────────────────────

export function makeDemoRuns(repoFullName: string, count = 50): WorkflowRun[] {
  const runs: WorkflowRun[] = [];
  let consecutiveFailures = 0;

  for (let i = 0; i < count; i++) {
    const isRecent = i < 5;
    // Inject a failure cluster around index 8-12
    const forceFailure = i >= 8 && i <= 11;
    const conclusion = forceFailure ? "failure" : Math.random() > 0.08 ? "success" : "failure";
    if (conclusion === "failure") consecutiveFailures++;
    else consecutiveFailures = 0;

    const durationMs = Math.round(120_000 + (Math.random() - 0.4) * 60_000);
    const queueMs = Math.round(5_000 + Math.random() * 15_000);
    const createdAt = new Date(Date.now() - i * 2 * 3_600_000).toISOString();

    runs.push({
      id: 1000 + i,
      name: "CI",
      display_title: `CI run #${count - i}`,
      status: "completed",
      conclusion,
      created_at: createdAt,
      updated_at: createdAt,
      run_number: count - i,
      run_attempt: 1,
      head_branch: i % 8 === 0 ? "feat/new-feature" : "main",
      head_sha: `abc${i.toString(16).padStart(6, "0")}`,
      event: i % 12 === 0 ? "pull_request" : "push",
      html_url: "#",
      duration_ms: durationMs,
      queue_wait_ms: queueMs,
      run_started_at: new Date(new Date(createdAt).getTime() + queueMs).toISOString(),
      triggering_actor: { login: isRecent ? "alice" : "bob", avatar_url: "" },
      jobs_url: "#",
      head_commit: {
        id: `abc${i}`,
        message: DEMO_COMMIT_MESSAGES[i % DEMO_COMMIT_MESSAGES.length],
        author: { name: isRecent ? "Alice Developer" : "Bob Engineer", email: "dev@acme.com" },
      },
      pull_requests: i % 12 === 0 ? [{ number: 100 + i, url: "#", head_sha: `abc${i}` }] : [],
      repository: {
        full_name: repoFullName,
        html_url: "#",
        private: false,
      },
      actor: { login: isRecent ? "alice" : "bob", avatar_url: "" },
    } as WorkflowRun);
  }

  return runs;
}

function makeSummary(opts: {
  runs: number;
  successRate: number;
  trend: "up" | "down" | "flat";
  latestConclusion: string;
  durationMs: number;
}): RepoSummary {
  const recentRuns: RepoSummary["recent_runs"] = Array.from({ length: Math.min(opts.runs, 10) }, (_, i) => ({
    id: 9000 + i,
    conclusion: (Math.random() * 100 < opts.successRate ? "success" : "failure") as string | null,
    status: "completed" as string | null,
    created_at: daysAgo(i * 0.5),
  }));

  const trend30d: RepoSummary["trend_30d"] = Array.from({ length: 30 }, (_, i) => ({
    date: daysAgo(29 - i).slice(0, 10),
    total: Math.round(5 + Math.random() * 8),
    success: Math.round((5 + Math.random() * 8) * opts.successRate / 100),
  }));

  return {
    recent_runs: recentRuns,
    success_rate: opts.successRate,
    latest_run_at: daysAgo(0),
    latest_conclusion: opts.latestConclusion,
    latest_status: "completed",
    latest_actor: "alice",
    latest_sha: "abc1234",
    latest_message: DEMO_COMMIT_MESSAGES[Math.floor(Math.random() * DEMO_COMMIT_MESSAGES.length)],
    trend_30d: trend30d,
  };
}
