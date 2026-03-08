import { describe, it, expect } from "vitest";
import {
  calculateDoraMetrics,
  calculateRepoDora,
  type PrInput,
  type ReleaseInput,
  type PrDetailInput,
} from "../src/lib/dora";
import type { WorkflowRun } from "../src/lib/github";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeRun(
  overrides: Partial<WorkflowRun> & { id: number; created_at: string }
): WorkflowRun {
  return {
    id: overrides.id,
    name: "CI",
    status: overrides.status ?? "completed",
    conclusion: overrides.conclusion ?? "success",
    created_at: overrides.created_at,
    updated_at: overrides.created_at,
    run_number: overrides.id,
    run_attempt: 1,
    head_branch: overrides.head_branch ?? "main",
    head_sha: "abc123",
    event: "push",
    html_url: "",
    duration_ms: overrides.duration_ms ?? 60_000,
    queue_wait_ms: overrides.queue_wait_ms ?? 5_000,
    run_started_at: overrides.run_started_at,
    head_commit: overrides.head_commit ?? null,
    repository: { full_name: "org/repo", html_url: "", private: false },
    actor: { login: "dev", avatar_url: "" },
    display_title: null,
    triggering_actor: null,
    jobs_url: "",
    pull_requests: [],
  } as unknown as WorkflowRun;
}

// ── calculateDoraMetrics ───────────────────────────────────────────────────────

describe("calculateDoraMetrics", () => {
  it("returns elite level for frequent, fast, reliable runs", () => {
    const now = Date.now();
    const runs = Array.from({ length: 30 }, (_, i) =>
      makeRun({
        id: i + 1,
        created_at: new Date(now - i * 3_600_000).toISOString(),
        conclusion: "success",
        duration_ms: 120_000,
        run_started_at: new Date(now - i * 3_600_000 + 5_000).toISOString(),
      })
    );
    const metrics = calculateDoraMetrics(runs);
    expect(metrics.deployment_frequency.level).toBe("elite");
    expect(metrics.change_failure_rate.level).toBe("elite");
    expect(metrics.change_failure_rate.rate).toBe(0);
  });

  it("computes change failure rate correctly", () => {
    const now = Date.now();
    const runs = [
      makeRun({ id: 1, created_at: new Date(now - 10 * 3_600_000).toISOString(), conclusion: "failure" }),
      makeRun({ id: 2, created_at: new Date(now - 9 * 3_600_000).toISOString(), conclusion: "success" }),
      makeRun({ id: 3, created_at: new Date(now - 8 * 3_600_000).toISOString(), conclusion: "success" }),
      makeRun({ id: 4, created_at: new Date(now - 7 * 3_600_000).toISOString(), conclusion: "success" }),
    ];
    const metrics = calculateDoraMetrics(runs);
    expect(metrics.change_failure_rate.failures).toBe(1);
    expect(metrics.change_failure_rate.total).toBe(4);
    expect(metrics.change_failure_rate.rate).toBe(25);
  });

  it("computes MTTR from failure → success recovery on same branch", () => {
    const now = Date.now();
    const runs = [
      makeRun({ id: 1, created_at: new Date(now - 4 * 3_600_000).toISOString(), conclusion: "failure", head_branch: "main" }),
      makeRun({ id: 2, created_at: new Date(now - 2 * 3_600_000).toISOString(), conclusion: "success", head_branch: "main" }),
    ];
    const metrics = calculateDoraMetrics(runs);
    expect(metrics.mttr.recoveries).toBe(1);
    expect(metrics.mttr.mean_ms).toBeGreaterThan(0);
  });

  it("handles empty run array without throwing", () => {
    const metrics = calculateDoraMetrics([]);
    expect(metrics.deployment_frequency.total).toBe(0);
    expect(metrics.change_failure_rate.rate).toBe(0);
    expect(metrics.mttr.mean_ms).toBeNull();
  });
});

// ── calculateRepoDora ─────────────────────────────────────────────────────────

describe("calculateRepoDora", () => {
  const basePrTime = new Date("2026-01-01T00:00:00Z").getTime();

  function makePr(n: number, daysToMerge = 1, branch = "feat"): PrInput {
    const created = new Date(basePrTime + n * 86_400_000 * 2).toISOString();
    const merged = new Date(new Date(created).getTime() + daysToMerge * 86_400_000).toISOString();
    return { number: n, title: `feat: pr ${n}`, created_at: created, merged_at: merged, head_ref: branch };
  }

  function makeDetail(n: number): PrDetailInput {
    return {
      number: n,
      first_commit_at: null,
      first_review_at: null,
      approved_at: null,
      additions: 100,
      deletions: 20,
    };
  }

  it("computes deployment frequency from PRs when no releases", () => {
    const prs = [makePr(1), makePr(2), makePr(3), makePr(4)];
    const detailMap = new Map(prs.map((p) => [p.number, makeDetail(p.number)]));
    const result = calculateRepoDora(prs, [], detailMap);
    expect(result.deployment_frequency.total).toBe(4);
    expect(result.prs_analysed).toBe(4);
    expect(result.releases_analysed).toBe(0);
  });

  it("prefers release count over PRs for deployment frequency", () => {
    const prs = [makePr(1), makePr(2)];
    const releases: ReleaseInput[] = [
      { published_at: new Date(basePrTime).toISOString() },
      { published_at: new Date(basePrTime + 86_400_000).toISOString() },
      { published_at: new Date(basePrTime + 2 * 86_400_000).toISOString() },
    ];
    const detailMap = new Map(prs.map((p) => [p.number, makeDetail(p.number)]));
    const result = calculateRepoDora(prs, releases, detailMap);
    expect(result.deployment_frequency.total).toBe(3);
    expect(result.releases_analysed).toBe(3);
  });

  it("flags hotfix PRs as failures for CFR", () => {
    const prs = [
      makePr(1, 1, "feat-new"),
      makePr(2, 1, "hotfix-critical"),
      makePr(3, 1, "feat-other"),
    ];
    const detailMap = new Map(prs.map((p) => [p.number, makeDetail(p.number)]));
    const result = calculateRepoDora(prs, [], detailMap);
    expect(result.change_failure_rate.failures).toBe(1);
    expect(result.change_failure_rate.total).toBe(3);
  });

  it("handles empty PR list without throwing", () => {
    const result = calculateRepoDora([], [], new Map());
    expect(result.prs_analysed).toBe(0);
    expect(result.change_failure_rate.rate).toBe(0);
  });
});
