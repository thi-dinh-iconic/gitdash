export type FeatureFlags = {
  dora: boolean;
  prLifecycle: boolean;
  anomalyDetection: boolean;
  performanceTab: boolean;
  reliabilityTab: boolean;
  busFactor: boolean;
  securityScan: boolean;
  costAnalytics: boolean;
};

export const DEFAULT_FLAGS: FeatureFlags = {
  dora: true,
  prLifecycle: true,
  anomalyDetection: true,
  performanceTab: true,
  reliabilityTab: true,
  busFactor: true,
  securityScan: true,
  costAnalytics: true,
};

export const STORAGE_KEY = "gitdash:feature-flags";

export function loadFlags(): FeatureFlags {
  if (typeof window === "undefined") return DEFAULT_FLAGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FLAGS;
    return { ...DEFAULT_FLAGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FLAGS;
  }
}

export function saveFlags(flags: FeatureFlags): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch {
    // ignore
  }
}
