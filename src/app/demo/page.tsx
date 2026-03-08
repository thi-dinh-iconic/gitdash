"use client";

/**
 * /demo — Demo mode landing page.
 *
 * Redirects the user to the main dashboard with ?demo=1 appended,
 * so all pages can read the demo flag from URL params.
 * Also accepts a `?tour=1` param to trigger the in-app walkthrough.
 */

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap } from "lucide-react";

export default function DemoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tour = searchParams.get("tour") === "1";

  useEffect(() => {
    const target = tour ? "/?demo=1&tour=1" : "/?demo=1";
    const timer = setTimeout(() => router.replace(target), 1200);
    return () => clearTimeout(timer);
  }, [router, tour]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center space-y-5">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-violet-400" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">GitDash Demo</span>
        </div>

        <p className="text-slate-400 text-sm max-w-xs">
          Loading demo environment with sample data. No GitHub credentials required.
        </p>

        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
