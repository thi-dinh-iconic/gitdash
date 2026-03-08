import { describe, it, expect } from "vitest";
import {
  calculateCostFromBilling,
  estimateRunCost,
  calculateBurnRate,
  detectRunnerOS,
  RUNNER_RATES,
  DEFAULT_RATE,
} from "../src/lib/cost";

describe("detectRunnerOS", () => {
  it("detects macOS runners", () => {
    expect(detectRunnerOS("macos-latest")).toBe("MACOS");
    expect(detectRunnerOS("macos-13")).toBe("MACOS");
  });
  it("detects Windows runners", () => {
    expect(detectRunnerOS("windows-latest")).toBe("WINDOWS");
    expect(detectRunnerOS("windows-2022")).toBe("WINDOWS");
  });
  it("defaults to Ubuntu for linux and unknown", () => {
    expect(detectRunnerOS("ubuntu-latest")).toBe("UBUNTU");
    expect(detectRunnerOS("ubuntu-22.04")).toBe("UBUNTU");
    expect(detectRunnerOS("self-hosted")).toBe("UBUNTU");
  });
});

describe("estimateRunCost", () => {
  it("calculates correct cost for Ubuntu runner", () => {
    // 10 minutes at $0.008/min = $0.08
    const cost = estimateRunCost(600_000, "ubuntu-latest");
    expect(cost).toBeCloseTo(0.08, 2);
  });

  it("calculates correct cost for macOS runner", () => {
    // 10 minutes at $0.08/min = $0.80
    const cost = estimateRunCost(600_000, "macos-13");
    expect(cost).toBeCloseTo(0.8, 2);
  });

  it("returns 0 for zero duration", () => {
    expect(estimateRunCost(0, "ubuntu-latest")).toBe(0);
  });
});

describe("calculateCostFromBilling", () => {
  it("returns zero cost when no paid minutes", () => {
    const result = calculateCostFromBilling({ UBUNTU: 100 }, 2000, 100, 0);
    expect(result.total_cost).toBe(0);
    expect(result.paid_minutes).toBe(0);
    expect(result.included_minutes).toBe(2000);
  });

  it("calculates correct cost with paid minutes", () => {
    // 100 Ubuntu minutes, 50 are paid => 50 * $0.008 = $0.40
    const result = calculateCostFromBilling({ UBUNTU: 100 }, 2000, 100, 50);
    expect(result.total_cost).toBeCloseTo(0.4, 2);
  });

  it("handles multi-runner breakdown", () => {
    const result = calculateCostFromBilling(
      { UBUNTU: 100, MACOS: 10 },
      2000,
      110,
      110,
    );
    const ubuntuEntry = result.breakdown.find((b) => b.runner === "UBUNTU");
    const macEntry = result.breakdown.find((b) => b.runner === "MACOS");
    expect(ubuntuEntry).toBeDefined();
    expect(macEntry).toBeDefined();
    // macOS should have higher cost per minute
    expect(macEntry!.cost).toBeGreaterThan(ubuntuEntry!.cost / 10);
  });

  it("marks result as estimated", () => {
    const result = calculateCostFromBilling({}, 2000, 0, 0);
    expect(result.estimated).toBe(true);
  });
});

describe("calculateBurnRate", () => {
  it("projects linear burn rate correctly", () => {
    // 1000 minutes in 10 days → 100/day → 3000 projected for 30 days
    const result = calculateBurnRate(1000, 2000, 10, 30);
    expect(result.projected_minutes).toBe(3000);
    expect(result.daily_burn_rate).toBe(100);
    expect(result.projected_overage).toBe(1000);
  });

  it("marks critical when projected is >120% of included", () => {
    const result = calculateBurnRate(3000, 2000, 10, 30);
    expect(result.status).toBe("critical");
  });

  it("marks warning when projected is >90% of included", () => {
    // 620 in 10 days → 1860 projected, included=2000, ratio=0.93 → warning
    const result = calculateBurnRate(620, 2000, 10, 30);
    expect(result.status).toBe("warning");
  });

  it("marks ok when well below limit", () => {
    const result = calculateBurnRate(100, 2000, 10, 30);
    expect(result.status).toBe("ok");
  });

  it("returns correct progress fraction", () => {
    const result = calculateBurnRate(100, 2000, 15, 30);
    expect(result.progress).toBeCloseTo(0.5, 2);
  });
});

describe("RUNNER_RATES", () => {
  it("macOS rate is 10x Ubuntu rate", () => {
    expect(RUNNER_RATES.MACOS).toBe(RUNNER_RATES.UBUNTU * 10);
  });
  it("Windows rate is 2x Ubuntu rate", () => {
    expect(RUNNER_RATES.WINDOWS).toBe(RUNNER_RATES.UBUNTU * 2);
  });
  it("default rate matches Ubuntu", () => {
    expect(DEFAULT_RATE).toBe(RUNNER_RATES.UBUNTU);
  });
});
