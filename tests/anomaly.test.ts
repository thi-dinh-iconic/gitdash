import { describe, it, expect } from "vitest";
import { detectAnomalies, computeBaseline, anomalySeverity, formatAnomalyTooltip } from "../src/lib/anomaly";
import type { WorkflowRun } from "../src/lib/github";

function makeRun(
  id: number,
  duration_ms: number | undefined,
  queue_wait_ms: number | undefined = 5_000,
): WorkflowRun {
  return {
    id,
    name: "CI",
    status: "completed",
    conclusion: "success",
    created_at: new Date(Date.now() - id * 3_600_000).toISOString(),
    updated_at: new Date().toISOString(),
    run_number: id,
    run_attempt: 1,
    head_branch: "main",
    head_sha: "abc",
    event: "push",
    html_url: "",
    duration_ms,
    queue_wait_ms,
    repository: { full_name: "org/repo", html_url: "", private: false },
    actor: { login: "dev", avatar_url: "" },
    display_title: null,
    triggering_actor: null,
    jobs_url: "",
    head_commit: null,
    pull_requests: [],
  } as unknown as WorkflowRun;
}

describe("detectAnomalies", () => {
  it("returns empty map when not enough samples", () => {
    const runs = [makeRun(1, 60_000), makeRun(2, 65_000), makeRun(3, 70_000)];
    const result = detectAnomalies(runs);
    expect(result.size).toBe(0);
  });

  it("detects a high-duration outlier", () => {
    // 20 normal runs, then one outlier
    const normalRuns = Array.from({ length: 20 }, (_, i) =>
      makeRun(i + 2, 60_000 + i * 100)
    );
    const outlier = makeRun(1, 600_000); // 10x normal
    const runs = [outlier, ...normalRuns];
    const result = detectAnomalies(runs);
    const outlierEntry = result.get(1);
    expect(outlierEntry).toBeDefined();
    expect(outlierEntry?.hasAnomaly).toBe(true);
    expect(outlierEntry?.anomalies[0].isHigh).toBe(true);
  });

  it("does not flag low queue_wait as anomaly", () => {
    const normalRuns = Array.from({ length: 20 }, (_, i) =>
      makeRun(i + 2, 60_000, 30_000 + i * 1_000)
    );
    const fastQueue = makeRun(1, 60_000, 100); // very low queue
    const runs = [fastQueue, ...normalRuns];
    const result = detectAnomalies(runs);
    const entry = result.get(1);
    if (entry) {
      const queueAnomalies = entry.anomalies.filter((a) => a.metric === "queue_wait");
      expect(queueAnomalies.every((a) => !a.isLow)).toBe(true);
    }
  });
});

describe("computeBaseline", () => {
  it("returns null when fewer than MIN_SAMPLES runs", () => {
    const runs = [makeRun(1, 60_000), makeRun(2, 60_000)];
    expect(computeBaseline(runs, "duration")).toBeNull();
  });

  it("returns valid stats for sufficient samples", () => {
    const runs = Array.from({ length: 15 }, (_, i) => makeRun(i + 1, 60_000 + i * 1_000));
    const baseline = computeBaseline(runs, "duration");
    expect(baseline).not.toBeNull();
    expect(baseline!.mean_ms).toBeGreaterThan(0);
    expect(baseline!.upperBound_ms).toBeGreaterThan(baseline!.mean_ms);
    expect(baseline!.sampleSize).toBeGreaterThanOrEqual(5);
  });
});

describe("anomalySeverity", () => {
  it("labels high z-scores as extreme", () => {
    expect(anomalySeverity(4.5)).toBe("extreme");
  });
  it("labels mid z-scores as high", () => {
    expect(anomalySeverity(3.2)).toBe("high");
  });
  it("labels low z-scores as moderate", () => {
    expect(anomalySeverity(2.1)).toBe("moderate");
  });
  it("handles negative z-scores by absolute value", () => {
    expect(anomalySeverity(-4.5)).toBe("extreme");
  });
});

describe("formatAnomalyTooltip", () => {
  it("includes metric label and direction", () => {
    const tooltip = formatAnomalyTooltip({
      runId: 1,
      runNumber: 42,
      metric: "duration",
      value_ms: 300_000,
      mean_ms: 60_000,
      stddev_ms: 10_000,
      zScore: 3.5,
      isHigh: true,
      isLow: false,
    });
    expect(tooltip).toContain("Duration");
    expect(tooltip).toContain("above");
  });
});
