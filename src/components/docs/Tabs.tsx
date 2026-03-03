"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  items,
  children,
}: {
  items: string[];
  children: React.ReactNode;
}) {
  const [active, setActive] = useState(0);

  // Filter children to Tab elements
  const tabs = Array.isArray(children) ? children : [children];

  return (
    <div className="rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-700/50 bg-slate-900/60">
        {items.map((item, i) => (
          <button
            key={item}
            onClick={() => setActive(i)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              active === i
                ? "border-violet-500 text-violet-300 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-white hover:bg-slate-800/20"
            )}
          >
            {item}
          </button>
        ))}
      </div>
      {/* Tab content */}
      <div className="p-0">
        {tabs.map((child, i) => (
          <div key={i} className={active === i ? "block" : "hidden"}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Tab({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
