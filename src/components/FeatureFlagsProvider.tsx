"use client";

import { createContext, useContext, useState } from "react";
import {
  FeatureFlags, DEFAULT_FLAGS, loadFlags, saveFlags,
} from "@/lib/feature-flags";

type FeatureFlagsCtx = {
  flags: FeatureFlags;
  setFlag: (key: keyof FeatureFlags, value: boolean) => void;
};

const Ctx = createContext<FeatureFlagsCtx>({
  flags: DEFAULT_FLAGS,
  setFlag: () => {},
});

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer reads localStorage once on mount — avoids SSR mismatch
  // because the function only runs client-side after hydration.
  const [flags, setFlags] = useState<FeatureFlags>(() => loadFlags());

  function setFlag(key: keyof FeatureFlags, value: boolean) {
    setFlags((prev) => {
      const next = { ...prev, [key]: value };
      saveFlags(next);
      return next;
    });
  }

  return <Ctx.Provider value={{ flags, setFlag }}>{children}</Ctx.Provider>;
}

export function useFeatureFlags() {
  return useContext(Ctx);
}
