"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { MetricTooltip } from "@/components/MetricTooltip";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  iconColor?: string;
  tooltip?: string;
  /** Tints the value text for semantic meaning */
  valueColor?: "default" | "green" | "red" | "amber" | "blue" | "violet";
  /** Subtle left-border accent */
  accent?: "green" | "red" | "amber" | "blue" | "violet" | "none";
}

const VALUE_COLORS = {
  default: "text-white",
  green:   "text-green-400",
  red:     "text-red-400",
  amber:   "text-amber-400",
  blue:    "text-blue-300",
  violet:  "text-violet-300",
};

const ACCENT_BORDERS = {
  none:   "",
  green:  "border-l-2 border-l-green-500/60",
  red:    "border-l-2 border-l-red-500/60",
  amber:  "border-l-2 border-l-amber-500/60",
  blue:   "border-l-2 border-l-blue-500/60",
  violet: "border-l-2 border-l-violet-500/60",
};

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor = "text-violet-400",
  tooltip,
  valueColor = "default",
  accent = "none",
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5 hover:border-slate-700 transition-colors",
      ACCENT_BORDERS[accent],
    )}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            {label}
          </span>
          {tooltip && <MetricTooltip text={tooltip} align="left" />}
        </div>
        {Icon && (
          <span className={cn(
            "flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800",
            iconColor,
          )}>
            <Icon className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p className={cn("text-2xl font-bold tabular-nums leading-none", VALUE_COLORS[valueColor])}>
          {value}
        </p>
        {sub && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sub}</p>}
      </div>
    </div>
  );
}
