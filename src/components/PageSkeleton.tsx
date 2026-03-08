"use client";

/**
 * Generic page skeleton used in loading.tsx boundaries.
 * Renders animated pulse cards and row skeletons.
 */

interface PageSkeletonProps {
  /** Number of KPI-card skeletons to render in the top row. */
  cards?: number;
  /** Number of table/content row skeletons to render below the cards. */
  rows?: number;
}

export default function PageSkeleton({ cards = 3, rows = 5 }: PageSkeletonProps) {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Page title skeleton */}
      <div className="h-7 w-48 bg-gray-700/50 rounded" />

      {/* KPI cards row */}
      {cards > 0 && (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${Math.min(cards, 4)}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-800/60 border border-gray-700/40 rounded-lg" />
          ))}
        </div>
      )}

      {/* Content rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-10 bg-gray-800/40 rounded"
            style={{ width: `${85 + (i % 3) * 5}%` }}
          />
        ))}
      </div>
    </div>
  );
}
