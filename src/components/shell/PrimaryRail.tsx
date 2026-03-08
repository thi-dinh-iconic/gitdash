"use client";

/**
 * PrimaryRail — 76px wide icon-only vertical navigation strip.
 *
 * Sits at the leftmost edge of the desktop shell. Contains:
 *  - Brand logo at top
 *  - Icon nav items (tooltips on hover)
 *  - User avatar anchor at bottom
 *
 * Darker material than WorkspacePanel to create visual separation.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV } from "./nav-config";

// ── Active route check ────────────────────────────────────────────────────────

function useIsActive(href: string): boolean {
  const path = usePathname();
  if (href === "/") return path === "/";
  return path.startsWith(href);
}

// ── Single rail icon button ───────────────────────────────────────────────────

function RailIcon({
  href,
  tooltip,
  children,
  active,
}: {
  href: string;
  tooltip: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={tooltip}
      aria-current={active ? "page" : undefined}
      title={tooltip}
      className={cn(
        "group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150 cursor-pointer",
        active
          ? "bg-slate-700/80 text-white shadow-inner"
          : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/70",
      )}
    >
      {children}
      {/* Active dot indicator */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-400 rounded-r-full" />
      )}
    </Link>
  );
}

// ── PrimaryRail ───────────────────────────────────────────────────────────────

export default function PrimaryRail() {
  const { user, mode } = useAuth();
  const path = usePathname();
  const isStandalone = mode === "standalone";

  return (
    <aside
      aria-label="Primary navigation"
      className="hidden md:flex flex-col items-center w-[76px] min-h-screen shrink-0 bg-[#0b0f17] border-r border-slate-800/60 py-3 gap-1"
    >
      {/* Brand logo */}
      <div className="flex items-center justify-center w-10 h-10 mb-2">
        <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-slate-700/60 shadow-lg shadow-violet-900/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="GitDash" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Mode badge */}
      <span
        className={cn(
          "mb-3 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest",
          isStandalone
            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
            : "bg-violet-500/10 text-violet-400 border border-violet-500/20",
        )}
      >
        {isStandalone ? "PAT" : "ORG"}
      </span>

      {/* Divider */}
      <div className="w-6 h-px bg-slate-800 mb-1" />

      {/* Nav icons */}
      <nav className="flex flex-col items-center gap-1 w-full px-2">
        {PRIMARY_NAV.map(({ href, tooltip, icon: Icon }) => {
          const active =
            href === "/" ? path === "/" : path.startsWith(href);
          return (
            <RailIcon key={href} href={href} tooltip={tooltip} active={active}>
              <Icon className="w-[18px] h-[18px]" />
            </RailIcon>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Version */}
      <span className="text-[8px] font-mono text-slate-700 mb-1">
        v{process.env.NEXT_PUBLIC_APP_VERSION ?? "3.1"}
      </span>

      {/* User avatar */}
      {user && (
        <div className="flex items-center justify-center w-full px-2 pb-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar_url}
            alt={user.login}
            title={`@${user.login}`}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full ring-1 ring-slate-700 cursor-default"
          />
        </div>
      )}
    </aside>
  );
}
