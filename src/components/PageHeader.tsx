"use client";

/**
 * PageHeader — standardized page-level header component.
 *
 * Renders:
 *   - Icon + title + optional subtitle
 *   - Optional status chip(s)
 *   - Optional action slot (buttons, links)
 *   - Optional breadcrumb (rendered above the title row)
 */

import React from "react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface StatusChip {
  label: string;
  color?: "green" | "red" | "amber" | "blue" | "violet" | "gray";
}

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  chips?: StatusChip[];
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
}

const CHIP_COLORS: Record<NonNullable<StatusChip["color"]>, string> = {
  green:  "bg-green-500/10  border-green-500/20  text-green-400",
  red:    "bg-red-500/10    border-red-500/20    text-red-400",
  amber:  "bg-amber-500/10  border-amber-500/20  text-amber-400",
  blue:   "bg-blue-500/10   border-blue-500/20   text-blue-400",
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  gray:   "bg-slate-800     border-slate-700     text-slate-400",
};

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  chips = [],
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-6", className)}>
      {breadcrumb && <div className="mb-3">{breadcrumb}</div>}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-slate-300" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight truncate">
                {title}
              </h1>
              {chips.map((chip, i) => (
                <span
                  key={i}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium border",
                    CHIP_COLORS[chip.color ?? "gray"],
                  )}
                >
                  {chip.label}
                </span>
              ))}
            </div>
            {subtitle && (
              <p className="text-sm text-slate-400 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>
        )}
      </div>
    </header>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────

export function SectionHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 mb-4", className)}>
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// ── KPI card ───────────────────────────────────────────────────────────────────

export function KpiCard({
  label,
  value,
  sub,
  trend,
  color = "default",
  className,
  provenance,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  trend?: "up" | "down" | "flat";
  color?: "default" | "green" | "red" | "amber" | "blue" | "violet";
  className?: string;
  provenance?: React.ReactNode;
}) {
  const colorMap = {
    default: "text-white",
    green:   "text-green-400",
    red:     "text-red-400",
    amber:   "text-amber-400",
    blue:    "text-blue-400",
    violet:  "text-violet-400",
  };

  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : null;
  const trendColor = trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "";

  return (
    <div className={cn(
      "relative bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors",
      className,
    )}>
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        {provenance && <div className="shrink-0">{provenance}</div>}
      </div>
      <p className={cn("text-2xl font-bold leading-tight", colorMap[color])}>
        {value}
        {trendIcon && <span className={cn("ml-1 text-base", trendColor)}>{trendIcon}</span>}
      </p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-slate-500" />
        </div>
      )}
      <p className="text-sm font-medium text-slate-300 mb-1">{title}</p>
      {description && <p className="text-xs text-slate-500 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Error state ────────────────────────────────────────────────────────────────

export function ErrorState({
  title = "Something went wrong",
  description,
  retry,
  className,
}: {
  title?: string;
  description?: React.ReactNode;
  retry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <span className="text-red-400 text-lg">!</span>
      </div>
      <p className="text-sm font-medium text-red-300 mb-1">{title}</p>
      {description && <p className="text-xs text-slate-500 max-w-xs mt-1">{description}</p>}
      {retry && (
        <button
          onClick={retry}
          className="mt-4 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
