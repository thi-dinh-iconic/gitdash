"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import {
  FeatureFlags,
  DEFAULT_FLAGS,
  getSnapshot,
  getServerSnapshot,
  subscribeFlags,
  updateFlag,
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
  // useSyncExternalStore: server uses getServerSnapshot (DEFAULT_FLAGS),
  // client uses getSnapshot (lazy-loads from localStorage). React reconciles
  // the diff without a hydration error and without calling setState in an effect.
  const flags = useSyncExternalStore(subscribeFlags, getSnapshot, getServerSnapshot);

  return (
    <Ctx.Provider value={{ flags, setFlag: updateFlag }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(Ctx);
}
