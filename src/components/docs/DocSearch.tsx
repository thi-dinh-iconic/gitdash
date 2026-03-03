"use client";

import { useState, useEffect } from "react";
import { Search, X, ChevronRight } from "lucide-react";

type SearchResult = {
  id: string;
  title: string;
  section: string;
  excerpt: string;
};

// Static search index built from section content
const SEARCH_INDEX: SearchResult[] = [
  { id: "getting-started", title: "Getting Started", section: "Docs", excerpt: "Prerequisites, quick start for standalone and organization modes, PAT scopes." },
  { id: "deployment", title: "Deployment", section: "Docs", excerpt: "Docker standalone, Docker Compose, Docker organization mode, Vercel one-click deploy, reverse proxy setup." },
  { id: "configuration", title: "Configuration", section: "Docs", excerpt: "Environment variables: SESSION_SECRET, MODE, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, DATABASE_URL. Creating a GitHub OAuth App." },
  { id: "modes", title: "Modes", section: "Docs", excerpt: "Standalone vs. Organization mode comparison. When to use each. Switching modes." },
  { id: "features", title: "Features", section: "Docs", excerpt: "Repositories, Workflow Dashboard, Cost Analytics, Reports, Alerts, Settings, tabs: Overview, Performance, Reliability, Triggers, Runs." },
  { id: "security", title: "Security", section: "Docs", excerpt: "AES-256-GCM encryption, HttpOnly cookies, rate limiting, input validation, CSP headers, PAT never stored in browser." },
  { id: "faq", title: "FAQ & Troubleshooting", section: "Docs", excerpt: "Blank screen, 500 error, cost analytics 404, OAuth state mismatch, DATABASE_URL not working, SESSION_SECRET length, fine-grained PAT." },
  { id: "release-notes", title: "Release Notes", section: "Docs", excerpt: "v2.3.0, v2.2.0, v2.1.0, v2.0.0, v1.0.0. Changelog, added features, fixes, improvements." },
  { id: "api-reference", title: "API Reference", section: "Docs", excerpt: "REST API endpoints: /api/github/repos, /api/github/workflows, /api/github/runs, /api/github/job-stats, /api/analytics." },
  { id: "core-concepts", title: "Core Concepts", section: "Docs", excerpt: "Authentication modes, PAT protection, data sources, GitHub API rate limits, session model." },
  { id: "contributing", title: "Contributing", section: "Docs", excerpt: "Development setup, architecture, local environment, npm install, npm run dev, TypeScript, testing." },
];

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-violet-500/30 text-violet-200 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function DocSearch({
  onSelect,
  open,
  onClose,
}: {
  onSelect: (id: string) => void;
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  const results = query.length >= 2
    ? SEARCH_INDEX.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.excerpt.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_INDEX;

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-700/50">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search docs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">No results for &ldquo;{query}&rdquo;</p>
          ) : (
            <ul className="py-2">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/60 transition-colors group"
                    onClick={() => {
                      onSelect(r.id);
                      onClose();
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">
                        {highlight(r.title, query)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {highlight(r.excerpt, query)}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-violet-400 shrink-0 transition-colors" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-700/50 bg-slate-950/40">
          <span className="text-xs text-slate-600">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-xs">↑↓</kbd>
            {" "}navigate
          </span>
          <span className="text-xs text-slate-600">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-xs">↵</kbd>
            {" "}select
          </span>
          <span className="text-xs text-slate-600">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-xs">Esc</kbd>
            {" "}close
          </span>
        </div>
      </div>
    </div>
  );
}
