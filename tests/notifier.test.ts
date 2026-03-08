import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildPayload, dispatchAlert, METRIC_LABELS } from "../src/lib/notifier";
import type { DbAlertRule } from "../src/lib/db";

function makeRule(overrides: Partial<DbAlertRule> = {}): DbAlertRule {
  return {
    id: 1,
    scope: "repo:org/repo",
    metric: "failure_rate",
    threshold: 30,
    window_hours: 24,
    channel: "browser",
    destination: null,
    enabled: true,
    created_at: new Date().toISOString(),
    muted_until: null,
    owner_note: null,
    ...overrides,
  };
}

describe("buildPayload", () => {
  it("includes metricLabel and metricUnit from METRIC_LABELS", () => {
    const rule = makeRule({ metric: "failure_rate" });
    const payload = buildPayload(rule, "org/repo", 42);
    expect(payload.metricLabel).toBe(METRIC_LABELS.failure_rate.label);
    expect(payload.metricUnit).toBe(METRIC_LABELS.failure_rate.unit);
    expect(payload.value).toBe(42);
    expect(payload.repo).toBe("org/repo");
  });

  it("falls back to raw metric name for unknown metrics", () => {
    const rule = makeRule({ metric: "custom_metric" } as Partial<DbAlertRule>);
    const payload = buildPayload(rule, "org/repo", 1);
    expect(payload.metricLabel).toBe("custom_metric");
  });
});

describe("dispatchAlert - browser channel", () => {
  it("returns ok:true for browser channel (server no-op)", async () => {
    const rule = makeRule({ channel: "browser" });
    const payload = buildPayload(rule, "org/repo", 35);
    const result = await dispatchAlert(payload);
    expect(result.ok).toBe(true);
  });
});

describe("dispatchAlert - slack channel", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns ok:false when no destination configured", async () => {
    const rule = makeRule({ channel: "slack", destination: null });
    const payload = buildPayload(rule, "org/repo", 35);
    const result = await dispatchAlert(payload);
    expect(result.ok).toBe(false);
    expect((result as { ok: false; error: string }).error).toContain("No Slack webhook");
  });

  it("returns ok:true when Slack webhook succeeds", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    const rule = makeRule({ channel: "slack", destination: "https://hooks.slack.com/test" });
    const payload = buildPayload(rule, "org/repo", 35);
    const result = await dispatchAlert(payload);
    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("returns ok:false when Slack webhook fails", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 400 });
    vi.stubGlobal("fetch", mockFetch);

    const rule = makeRule({ channel: "slack", destination: "https://hooks.slack.com/test" });
    const payload = buildPayload(rule, "org/repo", 35);
    const result = await dispatchAlert(payload);
    expect(result.ok).toBe(false);
  });
});

describe("dispatchAlert - email channel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.RESEND_API_KEY;
    delete process.env.SMTP_HOST;
  });

  it("returns ok:false when no destination", async () => {
    const rule = makeRule({ channel: "email", destination: null });
    const payload = buildPayload(rule, "org/repo", 35);
    const result = await dispatchAlert(payload);
    expect(result.ok).toBe(false);
  });

  it("returns ok:false when no email provider configured", async () => {
    const rule = makeRule({ channel: "email", destination: "dev@example.com" });
    const payload = buildPayload(rule, "org/repo", 35);
    const result = await dispatchAlert(payload);
    expect(result.ok).toBe(false);
    expect((result as { ok: false; error: string }).error).toContain("No email provider");
  });

  it("calls Resend API when RESEND_API_KEY is set", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    const rule = makeRule({ channel: "email", destination: "dev@example.com" });
    const payload = buildPayload(rule, "org/repo", 35);
    const result = await dispatchAlert(payload);
    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("METRIC_LABELS", () => {
  const expectedMetrics = [
    "failure_rate",
    "duration_p95",
    "queue_wait_p95",
    "success_streak",
    "pr_throughput_drop",
    "review_response_p90",
    "afterhours_commit_pct",
    "pr_abandon_rate",
    "unreviewed_pr_age",
  ];

  it("has labels for all supported metrics", () => {
    for (const metric of expectedMetrics) {
      expect(METRIC_LABELS[metric]).toBeDefined();
      expect(METRIC_LABELS[metric].label).toBeTruthy();
    }
  });
});
