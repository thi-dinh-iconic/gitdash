"use client";

/**
 * MissionControl — top-of-home attention strip.
 *
 * Surfaces repos that need immediate attention:
 *   - repos failing in the last 24h
 *   - duration regressions (p95 above baseline)
 *   - high queue wait pressure
 *   - cost spikes
 *   - stale PR review response
 *
 * Reads from the same /api/github/org-overview data, enriched with alert events.
 */

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/swr";
import { AlertTriangle, Clock, DollarSign, GitPullRequest, Zap, ChevronRight, Pin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DbAlertEvent } from "@/lib/db";

// ── Types ──────────────────────────────────────────────────────────────────────

interface AlertsResponse {
  rules: unknown[];
  events: DbAlertEvent[];
}

interface AttentionItem {
  repo: string;
  type: "failure" | "duration" | "queue" | "cost" | "review";
  label: string;
  detail: string;
  href: string;
}

// ── Watchlist hook ────────────────────────────────────────────────────────────

const WATCHLIST_KEY = "gitdash:watchlist";

export function useWatchlist() {
  const [pinned, setPinned] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(WATCHLIST_KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  function toggle(repo: string) {
    setPinned((prev) => {
      const next = prev.includes(repo) ? prev.filter((r) => r !== repo) : [...prev, repo];
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
      return next;
    });
  }

  const isPinned = (repo: string) => pinned.includes(repo);

  return { pinned, toggle, isPinned };
}

// ── Attention strip ───────────────────────────────────────────────────────────

interface MissionControlProps {
  org?: string | null;
  className?: string;
}

export function MissionControl({ className }: MissionControlProps) {
  const { data: alertsData } = useSWR<AlertsResponse>(
    "/api/alerts?events=1",
    fetcher<AlertsResponse>,
  );

  const events = alertsData?.events ?? [];

  // Group events by repo, keeping only the most recent per repo+metric
  const attentionItems: AttentionItem[] = [];
  const seen = new Set<string>();

  for (const event of events) {
    // event.scope is "repo:owner/repo"
    if (!event.scope.startsWith("repo:")) continue;
    const repo = event.scope.slice(5);
    const key = `${repo}:${event.metric}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const typeMap: Record<string, AttentionItem["type"]> = {
      failure_rate: "failure",
      success_streak: "failure",
      duration_p95: "duration",
      queue_wait_p95: "queue",
      pr_throughput_drop: "review",
      review_response_p90: "review",
      unreviewed_pr_age: "review",
    };

    const labelMap: Record<string, string> = {
      failure_rate: "High failure rate",
      success_streak: "Consecutive failures",
      duration_p95: "Duration spike",
      queue_wait_p95: "Queue pressure",
      pr_throughput_drop: "PR throughput drop",
      review_response_p90: "Slow review response",
      unreviewed_pr_age: "Stale unreviewed PRs",
    };

    const type = typeMap[event.metric] ?? "failure";
    const label = labelMap[event.metric] ?? event.metric;
    const value = event.value !== null ? ` (${event.value})` : "";
    const [owner, repoName] = repo.split("/");
    const href = `/repos/${owner}/${repoName}`;

    attentionItems.push({ repo, type, label, detail: `${label}${value}`, href });

    if (attentionItems.length >= 6) break;
  }

  if (attentionItems.length === 0) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3", className)}>
        <Zap className="w-4 h-4 shrink-0" />
        <span>All systems nominal — no active alerts.</span>
      </div>
    );
  }

  const TYPE_ICONS: Record<AttentionItem["type"], React.ComponentType<{ className?: string }>> = {
    failure: AlertTriangle,
    duration: Clock,
    queue: Zap,
    cost: DollarSign,
    review: GitPullRequest,
  };

  const TYPE_COLORS: Record<AttentionItem["type"], string> = {
    failure: "text-red-400 bg-red-500/10 border-red-500/20",
    duration: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    queue: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    cost: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    review: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <h2 className="text-sm font-semibold text-white">Needs Attention</h2>
        <span className="text-xs text-slate-500">({attentionItems.length})</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {attentionItems.map((item) => {
          const Icon = TYPE_ICONS[item.type];
          return (
            <Link
              key={`${item.repo}:${item.type}`}
              href={item.href}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all hover:scale-[1.01]",
                TYPE_COLORS[item.type],
              )}
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{item.label}</p>
                <p className="text-[10px] opacity-70 font-mono truncate">{item.repo}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50 mt-0.5" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Watchlist pin button ───────────────────────────────────────────────────────

export function WatchlistPin({
  isPinned,
  onToggle,
}: {
  repo?: string;
  isPinned: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      title={isPinned ? "Remove from watchlist" : "Add to watchlist"}
      className={cn(
        "p-1 rounded transition-colors",
        isPinned
          ? "text-violet-400 hover:text-violet-300"
          : "text-slate-600 hover:text-slate-400",
      )}
    >
      {isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Quick actions bar ─────────────────────────────────────────────────────────

export function QuickActions({ org }: { org?: string | null }) {
  return (
    <div className="flex items-center gap-1">
      {org && (
        <Link
          href={`/org/${org}`}
          title="Org overview"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700/60"
        >
          <Zap className="w-3.5 h-3.5" />
        </Link>
      )}
      <Link
        href="/alerts"
        title="Alerts"
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700/60"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
      </Link>
      <Link
        href="/docs"
        title="Docs"
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700/60"
      >
        <GitPullRequest className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
