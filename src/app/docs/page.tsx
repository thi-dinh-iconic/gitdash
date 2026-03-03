"use client";

import { useState, useEffect } from "react";
import {
  BookOpen, Rocket, Server, Settings2, GitBranch,
  Layers, Shield, HelpCircle, Terminal, ChevronRight,
  Tag, Search, Menu, X, Code2, Users, ChevronDown,
  ExternalLink, GitPullRequest, Cpu, Lock, Globe,
  CheckCircle, AlertTriangle, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Callout } from "@/components/docs/Callout";
import { CodeBlock, Code } from "@/components/docs/CodeBlock";
import { DocCard, DocTable, FeatureGrid, FeatureCard } from "@/components/docs/DocCard";
import { Tabs, Tab } from "@/components/docs/Tabs";
import { Steps, Step } from "@/components/docs/Steps";
import { DocSearch } from "@/components/docs/DocSearch";

// ── Navigation structure ──────────────────────────────────────────────────────

type NavItem = { id: string; label: string; icon: React.ElementType };
type NavSection = { title: string; items: NavItem[] };

const NAV: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { id: "getting-started", label: "Introduction", icon: Rocket },
      { id: "deployment",      label: "Deployment",   icon: Server },
      { id: "configuration",   label: "Configuration", icon: Settings2 },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { id: "modes",        label: "Auth Modes",       icon: GitBranch },
      { id: "security",     label: "Security Model",   icon: Shield },
      { id: "core-concepts", label: "Data Sources",    icon: Cpu },
    ],
  },
  {
    title: "Features",
    items: [
      { id: "features",       label: "Feature Overview", icon: Layers },
      { id: "api-reference",  label: "API Reference",    icon: Code2 },
    ],
  },
  {
    title: "Support",
    items: [
      { id: "faq",           label: "FAQ & Troubleshooting", icon: HelpCircle },
      { id: "contributing",  label: "Contributing",          icon: GitPullRequest },
      { id: "release-notes", label: "Release Notes",         icon: Tag },
    ],
  },
];

const ALL_SECTIONS = NAV.flatMap((s) => s.items);

// ── Shared micro-components ───────────────────────────────────────────────────

function SectionHeading({ id, icon: Icon, badge, children }: {
  id: string; icon: React.ElementType; badge?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-800">
      <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-violet-400" />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <h2 id={id} className="text-2xl font-bold text-white">{children}</h2>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 font-medium">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-white text-base mb-3">{children}</h3>;
}

function ProseP({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-400 leading-relaxed">{children}</p>;
}

// ── Sections ──────────────────────────────────────────────────────────────────

function GettingStarted() {
  return (
    <section id="getting-started" className="scroll-mt-8 space-y-6">
      <SectionHeading id="getting-started" icon={Rocket}>Introduction</SectionHeading>

      <FeatureGrid>
        <FeatureCard icon="📊" title="Workflow Analytics">
          Deep-dive into success rates, duration trends, MTTR, and failure patterns across all your GitHub Actions workflows.
        </FeatureCard>
        <FeatureCard icon="💰" title="Cost Analytics">
          Track GitHub Actions minutes and spend per workflow. Identify expensive jobs and optimize your CI budget.
        </FeatureCard>
        <FeatureCard icon="🔒" title="Security First">
          Your PAT never touches the browser. AES-256-GCM encrypted sessions, HttpOnly cookies, rate limiting built-in.
        </FeatureCard>
        <FeatureCard icon="⚡" title="Two Modes">
          Standalone for personal use (PAT-based, no OAuth App needed) or Organization mode for teams with GitHub OAuth.
        </FeatureCard>
      </FeatureGrid>

      <DocCard>
        <SubHeading>Prerequisites</SubHeading>
        <ul className="space-y-2 text-sm text-slate-300">
          {[
            "Node.js 20+",
            "npm (or Docker for containerized deployments)",
            "A GitHub Personal Access Token — for standalone mode",
            "A GitHub OAuth App — for organization mode (team sharing)",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-violet-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </DocCard>

      <DocCard>
        <SubHeading>Quick Start — Standalone Mode</SubHeading>
        <ProseP>The fastest way to get running. No OAuth App needed — just your GitHub PAT.</ProseP>
        <CodeBlock language="bash" filename="terminal">
{`git clone https://github.com/dinhdobathi1992/gitdash.git
cd gitdash
cp .env.local.example .env.local

# Edit .env.local — set these two values:
MODE=standalone
SESSION_SECRET=$(openssl rand -hex 32)

npm install
npm run dev`}
        </CodeBlock>
        <ProseP>
          Open <Code>http://localhost:3000</Code> — you will be redirected to <Code>/setup</Code> to enter your PAT.
        </ProseP>
      </DocCard>

      <DocCard>
        <SubHeading>Quick Start — Organization Mode</SubHeading>
        <ProseP>For teams sharing a single deployment. Requires a GitHub OAuth App.</ProseP>
        <Steps>
          <Step title="Create a GitHub OAuth App" step={1}>
            Go to <strong className="text-white">GitHub → Settings → Developer settings → OAuth Apps → New OAuth App</strong>.
            Set the callback URL to <Code>http://localhost:3000/api/auth/callback</Code>.
          </Step>
          <Step title="Configure .env.local" step={2}>
            <CodeBlock language="bash" filename=".env.local">
{`MODE=organization
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
SESSION_SECRET=$(openssl rand -hex 32)`}
            </CodeBlock>
          </Step>
          <Step title="Start the server" step={3}>
            <CodeBlock language="bash" filename="terminal">
{`npm install && npm run dev`}
            </CodeBlock>
          </Step>
        </Steps>
        <Callout type="info">
          Generate a strong <Code>SESSION_SECRET</Code> with: <Code>openssl rand -hex 32</Code>
        </Callout>
      </DocCard>

      <DocCard>
        <SubHeading>Required GitHub PAT Scopes</SubHeading>
        <DocTable
          headers={["Scope", "Purpose"]}
          rows={[
            [<Code key="s1">repo</Code>, "Repository list + workflow data (private repos)"],
            [<Code key="s2">workflow</Code>, "Workflow runs and job details"],
            [<Code key="s3">read:org</Code>, "Organization membership + org repo list"],
            [<Code key="s4">read:user</Code>, "User identity (avatar, name, login)"],
          ]}
        />
        <Callout type="success">
          For reduced permissions, use a fine-grained PAT with <Code>Actions: read</Code> and <Code>Contents: read</Code> scoped to specific repos.
        </Callout>
      </DocCard>
    </section>
  );
}

function Deployment() {
  return (
    <section id="deployment" className="scroll-mt-8 space-y-6">
      <SectionHeading id="deployment" icon={Server}>Deployment</SectionHeading>

      <DocCard>
        <SubHeading>Docker</SubHeading>
        <Tabs items={["Standalone", "Organization", "Docker Compose"]}>
          <Tab>
            <CodeBlock language="bash">
{`docker run -d \\
  --name gitdash \\
  -p 3000:3000 \\
  -e MODE=standalone \\
  -e SESSION_SECRET=your_32_char_secret_here \\
  --restart unless-stopped \\
  dinhdobathi1992/gitdash:latest`}
            </CodeBlock>
          </Tab>
          <Tab>
            <CodeBlock language="bash">
{`docker run -d \\
  --name gitdash \\
  -p 3000:3000 \\
  -e MODE=organization \\
  -e GITHUB_CLIENT_ID=your_client_id \\
  -e GITHUB_CLIENT_SECRET=your_client_secret \\
  -e SESSION_SECRET=your_32_char_secret_here \\
  -e NEXT_PUBLIC_APP_URL=https://gitdash.example.com \\
  --restart unless-stopped \\
  dinhdobathi1992/gitdash:latest`}
            </CodeBlock>
          </Tab>
          <Tab>
            <CodeBlock language="yaml" filename="docker-compose.yml">
{`services:
  gitdash:
    image: dinhdobathi1992/gitdash:latest
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    restart: unless-stopped`}
            </CodeBlock>
            <div className="p-4 border-t border-slate-700/30">
              <CodeBlock language="bash" filename="terminal">
{`docker compose up -d      # start
docker compose down       # stop
docker compose logs -f    # view logs`}
              </CodeBlock>
            </div>
          </Tab>
        </Tabs>
      </DocCard>

      <DocCard>
        <SubHeading>Vercel (One-click)</SubHeading>
        <ProseP>GitDash deploys to Vercel automatically on push to <Code>main</Code>. To deploy your own fork:</ProseP>
        <Steps>
          <Step title="Fork the repository" step={1}>Fork on GitHub, then import the fork in Vercel via <strong className="text-white">New Project → Import Git Repository</strong>.</Step>
          <Step title="Set environment variables" step={2}>Add all required env vars in Vercel&apos;s project settings. <Code>DATABASE_URL</Code> must be added manually — it is not in the repository.</Step>
          <Step title="Update OAuth callback" step={3}>Set the <strong className="text-white">Authorization callback URL</strong> in your GitHub OAuth App to <Code>https://your-vercel-url/api/auth/callback</Code>.</Step>
        </Steps>
        <Callout type="warning">
          <Code>DATABASE_URL</Code> must be added manually in Vercel&apos;s project settings → Environment Variables → Production.
        </Callout>
      </DocCard>

      <DocCard>
        <SubHeading>Reverse Proxy / Custom Domain</SubHeading>
        <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
          <li>Set <Code>NEXT_PUBLIC_APP_URL</Code> to your public URL (e.g. <Code>https://gitdash.example.com</Code>)</li>
          <li>Update the OAuth App callback URL to match</li>
          <li>Ensure your proxy forwards the <Code>x-forwarded-proto</Code> header — the app uses this for HTTPS redirects</li>
        </ol>
      </DocCard>
    </section>
  );
}

function Configuration() {
  return (
    <section id="configuration" className="scroll-mt-8 space-y-6">
      <SectionHeading id="configuration" icon={Settings2}>Configuration</SectionHeading>

      <DocCard>
        <SubHeading>Environment Variables</SubHeading>
        <DocTable
          headers={["Variable", "Required", "Description"]}
          rows={[
            [
              <Code key="v1">SESSION_SECRET</Code>,
              <span key="r1" className="text-red-400 font-medium text-xs">Required</span>,
              "Random string ≥ 32 characters. Encrypts session cookies with AES-256-GCM. App refuses to start in production if missing or too short.",
            ],
            [
              <Code key="v2">MODE</Code>,
              <span key="r2" className="text-slate-400 text-xs">Optional</span>,
              <>Default: <Code>standalone</Code>. Set to <Code>organization</Code> to enable org mode.</>,
            ],
            [
              <Code key="v3">GITHUB_CLIENT_ID</Code>,
              <span key="r3" className="text-amber-400 font-medium text-xs">Org mode only</span>,
              "GitHub OAuth App Client ID.",
            ],
            [
              <Code key="v4">GITHUB_CLIENT_SECRET</Code>,
              <span key="r4" className="text-amber-400 font-medium text-xs">Org mode only</span>,
              "GitHub OAuth App Client Secret. Never commit this value.",
            ],
            [
              <Code key="v5">DATABASE_URL</Code>,
              <span key="r5" className="text-amber-400 font-medium text-xs">Org mode only</span>,
              "PostgreSQL connection string (Neon or any Postgres). Required for alert rules, reports, and sync.",
            ],
            [
              <Code key="v6">NEXT_PUBLIC_APP_URL</Code>,
              <span key="r6" className="text-slate-400 text-xs">Optional</span>,
              "Public URL of the deployment. Used to build OAuth callback URLs and enforce HTTPS redirects.",
            ],
          ]}
        />
      </DocCard>

      <div className="grid md:grid-cols-2 gap-4">
        <DocCard>
          <SubHeading>Standalone <Code>.env.local</Code></SubHeading>
          <CodeBlock language="bash" filename=".env.local">
{`MODE=standalone
SESSION_SECRET=replace_with_openssl_rand_hex_32
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
          </CodeBlock>
        </DocCard>

        <DocCard>
          <SubHeading>Organization <Code>.env.local</Code></SubHeading>
          <CodeBlock language="bash" filename=".env.local">
{`MODE=organization
GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret
SESSION_SECRET=replace_with_openssl_rand_hex_32
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NEXT_PUBLIC_APP_URL=https://gitdash.example.com`}
          </CodeBlock>
        </DocCard>
      </div>

      <DocCard>
        <SubHeading>Creating a GitHub OAuth App</SubHeading>
        <Steps>
          <Step title="Open OAuth App settings" step={1}>
            Navigate to <strong className="text-white">GitHub → Settings → Developer settings → OAuth Apps → New OAuth App</strong>.
          </Step>
          <Step title="Fill in the fields" step={2}>
            <DocTable
              headers={["Field", "Value"]}
              rows={[
                ["Application name", "GitDash"],
                ["Homepage URL", <Code key="h">https://your-domain.com</Code>],
                ["Authorization callback URL", <Code key="c">https://your-domain.com/api/auth/callback</Code>],
              ]}
            />
          </Step>
          <Step title="Copy credentials" step={3}>
            Click <strong className="text-white">Register application</strong>, copy the <strong className="text-white">Client ID</strong>, then click <strong className="text-white">Generate a new client secret</strong> — shown only once.
          </Step>
        </Steps>
      </DocCard>
    </section>
  );
}

function Modes() {
  return (
    <section id="modes" className="scroll-mt-8 space-y-6">
      <SectionHeading id="modes" icon={GitBranch}>Auth Modes</SectionHeading>

      <DocCard>
        <SubHeading>Standalone vs. Organization</SubHeading>
        <DocTable
          headers={["", "Standalone", "Organization"]}
          rows={[
            ["Auth method", "Personal Access Token (PAT)", "GitHub OAuth App"],
            ["Login page", <Code key="l1">/setup</Code>, <Code key="l2">/login</Code>],
            ["Best for", "Personal use, local dashboards", "Teams sharing one deployment"],
            ["OAuth App required", <span key="o1" className="text-emerald-400 text-xs font-medium">No</span>, <span key="o2" className="text-red-400 text-xs font-medium">Yes</span>],
            ["Database features", <span key="d1" className="text-slate-500 text-xs">Not available</span>, <span key="d2" className="text-emerald-400 text-xs">Available</span>],
            ["Alert rules", <span key="a1" className="text-slate-500 text-xs">Not available</span>, <span key="a2" className="text-emerald-400 text-xs">Available</span>],
            ["Multi-user", <span key="m1" className="text-slate-500 text-xs">No — single session</span>, <span key="m2" className="text-emerald-400 text-xs">Yes — isolated sessions per user</span>],
            ["Cost Analytics", "Own repos only", "All org repos (Enhanced Billing Plan required)"],
          ]}
        />
      </DocCard>

      <div className="grid md:grid-cols-2 gap-4">
        <DocCard>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-medium">standalone</span>
            <SubHeading>When to use Standalone</SubHeading>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {[
              "You're the only user",
              "You don't want to create a GitHub OAuth App",
              "You're running locally on your laptop",
              "You want the simplest possible setup",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </DocCard>

        <DocCard>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 font-medium">organization</span>
            <SubHeading>When to use Organization</SubHeading>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {[
              "Multiple team members share one deployment",
              "You want each person to use their own GitHub account",
              "You need alert rules, reports, or DB-backed features",
              "You want to restrict access to a specific GitHub org",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-violet-400 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </DocCard>
      </div>

      <DocCard>
        <SubHeading>Switching Modes</SubHeading>
        <ProseP>Change the <Code>MODE</Code> environment variable and restart the server. All session data is invalidated automatically — users will be redirected to the appropriate login page.</ProseP>
        <CodeBlock language="bash">
{`# Switch to org mode
MODE=organization

# Switch back to standalone
MODE=standalone   # or unset MODE entirely`}
        </CodeBlock>
      </DocCard>
    </section>
  );
}

function Security() {
  return (
    <section id="security" className="scroll-mt-8 space-y-6">
      <SectionHeading id="security" icon={Shield}>Security Model</SectionHeading>

      <Callout type="success" title="Zero browser exposure">
        GitDash is designed so your PAT or OAuth token <strong>never touches the browser</strong>. All credentials live in an encrypted, HTTP-only session cookie on the server.
      </Callout>

      <DocCard>
        <SubHeading>Request Flow</SubHeading>
        <CodeBlock language="text">
{`Browser ──── request ────► Middleware (decrypt session cookie)
                                    │
                                    ├─ No token? ──► Redirect to /setup or /login
                                    │
                                    ▼ Valid session
                         /api/github/* routes
                                    │
                            Retrieve encrypted token
                            from session (server-side)
                                    │
                                    ▼
                          GitHub REST API
                         (Bearer token auth)
                                    │
                                    ▼
                           JSON response
                     (token never sent to browser)`}
        </CodeBlock>
      </DocCard>

      <DocCard>
        <SubHeading>Protection Layers</SubHeading>
        <DocTable
          headers={["Layer", "Mechanism"]}
          rows={[
            ["Encryption", "AES-256-GCM via iron-session v8 — industry-standard authenticated encryption"],
            ["Cookie flags", <><Code key="h">HttpOnly</Code> (no JS access), <Code key="s">Secure</Code> (HTTPS only), <Code key="ss">SameSite=Lax</Code> (CSRF protection)</>],
            ["Session secret", "32+ character minimum enforced at startup in production"],
            ["Rate limiting", <><Code key="rl">/api/auth/setup</Code>: 5 req/min/IP · <Code key="rl2">/api/auth/login</Code>: 10 req/min/IP</>],
            ["Input validation", <>All <Code key="ov">owner</Code>, <Code key="rv">repo</Code>, <Code key="orgv">org</Code> params validated against <Code key="pat">[a-zA-Z0-9_.-]{"{"+"1,100}"}</Code></>],
            ["HTTP headers", "CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy"],
            ["Docker", "Runs as non-root user nextjs (uid 1001). Built from node:20-alpine."],
          ]}
        />
      </DocCard>

      <DocCard>
        <SubHeading>Self-Audit Commands</SubHeading>
        <ProseP>Run these in the project root to verify security claims yourself:</ProseP>
        <CodeBlock language="bash" filename="terminal">
{`# PAT never in browser storage
grep -r "localStorage|sessionStorage" src/ --include="*.tsx"
# Expected: 0 matches ✓

# PAT never returned in API responses
grep -rn "return.*pat|json.*pat" src/app/api --include="*.ts"
# Expected: 0 matches ✓

# XSS: dangerouslySetInnerHTML not used
grep -r "dangerouslySetInnerHTML" src/
# Expected: 0 matches ✓

# Check dependency vulnerabilities
npm audit --production
# Expected: 0 high/critical ✓`}
        </CodeBlock>
      </DocCard>
    </section>
  );
}

function CoreConcepts() {
  return (
    <section id="core-concepts" className="scroll-mt-8 space-y-6">
      <SectionHeading id="core-concepts" icon={Cpu}>Data Sources</SectionHeading>

      <DocCard>
        <SubHeading>Standalone Mode — Direct API</SubHeading>
        <ProseP>
          In standalone mode, every request proxies directly to the GitHub API using your encrypted PAT. No data is stored server-side — all data comes from GitHub in real-time.
        </ProseP>
        <CodeBlock language="text">
{`Browser ──► /api/github/* ──► GitHub REST API (live)
                                        │
                               No DB storage
                               ~60 req/hr per PAT`}
        </CodeBlock>
        <Callout type="warning">
          GitHub API rate limits apply: 60 unauthenticated, 5,000 authenticated requests/hour. GitDash batches requests to stay within limits.
        </Callout>
      </DocCard>

      <DocCard>
        <SubHeading>Organization Mode — DB-Backed</SubHeading>
        <ProseP>
          In org mode with <Code>DATABASE_URL</Code>, workflow runs are synced to PostgreSQL every 15 minutes (or on-demand via webhook). The UI reads from the DB first, falling back to the GitHub API if data is stale.
        </ProseP>
        <CodeBlock language="text">
{`Browser ──► /api/db/runs ──► PostgreSQL (fast, historical)
                   │
                   └── Stale? ──► GitHub API (fallback)

Webhook: POST /api/webhooks/github
  workflow_run events ──► Instant sync to DB`}
        </CodeBlock>
        <Callout type="success">
          DB-backed mode reduces GitHub API calls by ~95% and enables long-term historical analytics beyond GitHub&apos;s 90-day run retention.
        </Callout>
      </DocCard>

      <DocCard>
        <SubHeading>GitHub API Rate Limits</SubHeading>
        <DocTable
          headers={["Scenario", "Limit", "GitDash behavior"]}
          rows={[
            ["Standalone (PAT)", "5,000 req/hr", "Batches workflow fetches, caches per-tab"],
            ["Org mode (OAuth token)", "5,000 req/hr per user", "Each user has their own rate limit bucket"],
            ["Org mode + DB", "~250 req/hr (sync only)", "DB serves most requests; API only for sync"],
            ["Cost Analytics", "Enhanced Billing API", "Requires Team/Enterprise GitHub plan"],
          ]}
        />
      </DocCard>
    </section>
  );
}

function Features() {
  const pages = [
    {
      name: "Repositories",
      path: "/",
      desc: "Browse all personal and org repositories in one table. Fuzzy search with keyboard navigation (/ to focus, ↑↓ to navigate, Enter to open). Run history bars, 30-day trend sparkline, health badges, and org switcher in the sidebar.",
      chips: ["Fuzzy search", "Keyboard shortcuts", "Org switcher", "Health badges", "Run history"],
    },
    {
      name: "Repository Overview",
      path: "/repos/[owner]/[repo]",
      desc: "Repository-level DORA KPI cards (Deploy Frequency, Lead Time, CFR, MTTR) computed from real PR and release data. Expandable drill-down with four charts: PR Cycle Time Breakdown, PR Size vs Velocity scatter, PR Throughput (12 weeks), and Workflow Stability (30d). Below that: Action Duration Trend and a searchable workflow table.",
      chips: ["DORA 4 Keys", "PR Cycle Breakdown", "Scatter plot", "Throughput chart", "Stability chart"],
    },
    {
      name: "Workflow Detail",
      path: "/repos/[owner]/[repo]/workflows/[id]",
      desc: "5-tab deep-dive into a single workflow. Auto-refreshes every 30 seconds while runs are active. Includes DORA metrics (CI-based), cost estimation per run, queue wait analysis, anomaly detection, and optimization recommendations.",
      chips: ["5 tabs", "DORA metrics", "Cost estimate", "Queue analysis", "Anomaly detection", "Optimization tips"],
    },
    {
      name: "Workflow Audit Trail",
      path: "/repos/[owner]/[repo]/audit",
      desc: "Full commit history of every .github/workflows/*.yml file in the repo. Shows author, timestamp, commit message, and links to GitHub. Highlights changes made in the last 24 hours.",
      chips: ["Workflow file history", "Author + timestamp", "Recent-change highlight"],
    },
    {
      name: "Security Scan",
      path: "/repos/[owner]/[repo]/security",
      desc: "Static analysis of all workflow YAML files for common security anti-patterns: secret injection via env, pull_request_target misuse, unpin third-party actions, and more. Findings grouped by severity (critical, high, medium, low, info).",
      chips: ["Static analysis", "Severity grouping", "Per-file findings"],
    },
    {
      name: "Repo Team Stats",
      path: "/repos/[owner]/[repo]/team",
      desc: "Per-contributor delivery metrics for a repository: CI pass rate, avg run duration, run count. Reviewer load matrix (author × reviewer heatmap). Bus factor analysis showing which modules have fewer than 2 active contributors.",
      chips: ["CI leaderboard", "Reviewer matrix", "Bus factor"],
    },
    {
      name: "Team Insights",
      path: "/team",
      desc: "Global team performance view — select any repository to see a sortable contributor leaderboard (PRs merged, reviews given, avg lead time, avg PR size, review response time, first-pass approval rate, self-merges, comments) and a reviewer load heatmap.",
      chips: ["Sortable leaderboard", "Reviewer load matrix", "Repo picker"],
    },
    {
      name: "Contributor Profile",
      path: "/contributor/[login]",
      desc: "\"Player card\" for any developer. Shows KPI cards (PRs merged, avg lead time, reviews given, CI pass rate), 52-week activity heatmap, weekly commit bar chart, PR lifecycle funnel, commit hour distribution, languages touched, and a recent PRs table.",
      chips: ["KPI cards", "52-week heatmap", "PR funnel", "Commit hours", "Languages"],
    },
    {
      name: "Cost Analytics",
      path: "/cost-analytics",
      desc: "GitHub Actions billing breakdown by SKU and runner type. Month-by-month navigation, burn rate progress bar with warning/critical thresholds, per-org and per-repo drill-down. Requires Enhanced Billing Platform (GitHub Team/Enterprise).",
      chips: ["Monthly navigation", "SKU breakdown", "Burn rate", "Org mode + Enhanced Billing"],
    },
    {
      name: "Reports",
      path: "/reports",
      desc: "DB-backed historical reporting. Daily area chart of pass/fail rates and quarterly summary table. Includes a manual sync trigger to pull the latest runs into the database.",
      chips: ["Daily trend", "Quarterly summary", "DB sync"],
    },
    {
      name: "Alerts",
      path: "/alerts",
      desc: "Define alert rules for CI metrics (failure rate, duration P95, queue wait P95, success streak) and people metrics (PR throughput drop, review response P90, after-hours commit %, PR abandon rate, unreviewed PR age). Rules fire events visible in-app; Slack and email delivery supported.",
      chips: ["CI alerts", "People alerts", "Browser / Slack / Email", "Rule history"],
    },
    {
      name: "Settings",
      path: "/settings",
      desc: "Manage your PAT in standalone mode or view your OAuth session details in org mode. Shows GitHub Actions billing widget with remaining free minutes for the current billing period.",
      chips: ["PAT management", "Session info", "Billing widget"],
    },
    {
      name: "Org Overview",
      path: "/org/[orgName]",
      desc: "Organisation-level reliability heatmap and a sortable repository table with health scores, run history bars, and quick links to each repo's workflow dashboard.",
      chips: ["Org heatmap", "Repo table", "Health scores"],
    },
  ];

  return (
    <section id="features" className="scroll-mt-8 space-y-6">
      <SectionHeading id="features" icon={Layers}>Feature Overview</SectionHeading>

      <div className="grid gap-4">
        {pages.map((p) => (
          <DocCard key={p.name}>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-white">{p.name}</h3>
                <Code>{p.path}</Code>
              </div>
              <p className="text-sm text-slate-400">{p.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.chips.map((c) => (
                  <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600/50">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </DocCard>
        ))}
      </div>

      <DocCard>
        <SubHeading>Workflow Detail Tabs</SubHeading>
        <DocTable
          headers={["Tab", "What you see"]}
          rows={[
            ["Overview", "Rolling success rate, duration trend, outcome pie chart, run frequency heatmap, DORA 4 Keys (CI-based)"],
            ["Performance", "Per-job avg/p50/p95 bar chart, stacked job waterfall per run, slowest steps table, cost estimate per run"],
            ["Reliability", "MTTR, failure streaks, flaky branch detection, re-run rate, anomaly detection, pass/fail timeline"],
            ["Triggers", "Event breakdown, top branches, hour-of-day heatmap, day-of-week chart, actor leaderboard"],
            ["Runs", "Sortable/filterable run table with commit message, PR link, attempt count, queue wait, CSV export"],
          ]}
        />
      </DocCard>

      <DocCard>
        <SubHeading>DORA Metrics — Two Contexts</SubHeading>
        <DocTable
          headers={["Context", "Data source", "Location"]}
          rows={[
            ["Repository level", "Merged PRs + GitHub Releases — true delivery pipeline metrics", "/repos/[owner]/[repo] — DORA KPI cards + drill-down"],
            ["Workflow level", "CI workflow run outcomes — proxy metrics for the build pipeline", "/repos/[owner]/[repo]/workflows/[id] — Overview tab"],
          ]}
        />
      </DocCard>
    </section>
  );
}

function APIReference() {
  return (
    <section id="api-reference" className="scroll-mt-8 space-y-6">
      <SectionHeading id="api-reference" icon={Code2} badge="REST">API Reference</SectionHeading>

      <Callout type="info">
        All API routes require an authenticated session. Unauthenticated requests receive a <Code>401 Unauthorized</Code> response and are redirected to the login page.
      </Callout>

      {[
        {
          method: "GET",
          path: "/api/github/repos",
          description: "List all repositories accessible to the authenticated user (personal + org).",
          params: [
            { name: "org", type: "string", optional: true, desc: "Filter to a specific org slug." },
          ],
        },
        {
          method: "GET",
          path: "/api/github/repo-overview",
          description: "Per-workflow summaries for a repository — status, health, run history, trend, duration points.",
          params: [
            { name: "owner", type: "string", optional: false, desc: "Repository owner." },
            { name: "repo", type: "string", optional: false, desc: "Repository name." },
          ],
        },
        {
          method: "GET",
          path: "/api/github/repo-dora",
          description: "Repository-level DORA 4 Keys computed from merged PRs and releases. Includes cycle breakdown, PR scatter, and throughput by week.",
          params: [
            { name: "owner", type: "string", optional: false, desc: "Repository owner." },
            { name: "repo", type: "string", optional: false, desc: "Repository name." },
          ],
        },
        {
          method: "GET",
          path: "/api/github/repo-contributors",
          description: "Per-contributor delivery stats for a repository: PRs merged, reviews given, avg lead time, avg PR size, review turnaround, first-pass approval rate, self-merges. Also returns reviewer load matrix and bus factor.",
          params: [
            { name: "owner", type: "string", optional: false, desc: "Repository owner." },
            { name: "repo", type: "string", optional: false, desc: "Repository name." },
          ],
        },
        {
          method: "GET",
          path: "/api/github/contributor-profile",
          description: "Full contributor profile: KPI cards, 52-week activity calendar, weekly commits, PR funnel, commit hour distribution, languages, recent PRs.",
          params: [
            { name: "owner", type: "string", optional: false, desc: "Org or user context for PR search." },
            { name: "login", type: "string", optional: false, desc: "GitHub username." },
          ],
        },
        {
          method: "GET",
          path: "/api/github/workflows",
          description: "List all GitHub Actions workflows for a repository.",
          params: [
            { name: "owner", type: "string", optional: false, desc: "Repository owner." },
            { name: "repo", type: "string", optional: false, desc: "Repository name." },
          ],
        },
        {
          method: "GET",
          path: "/api/github/runs",
          description: "Fetch workflow runs for a specific workflow (last 50 by default).",
          params: [
            { name: "owner", type: "string", optional: false, desc: "Repository owner." },
            { name: "repo", type: "string", optional: false, desc: "Repository name." },
            { name: "workflow_id", type: "number", optional: false, desc: "Workflow ID." },
            { name: "per_page", type: "number", optional: true, desc: "Results per page (default 50, max 100)." },
          ],
        },
        {
          method: "GET",
          path: "/api/github/job-stats",
          description: "Per-job and per-step timing stats for a workflow: avg, p50, p95, max durations, success/failure counts, waterfall data.",
          params: [
            { name: "owner", type: "string", optional: false, desc: "Repository owner." },
            { name: "repo", type: "string", optional: false, desc: "Repository name." },
            { name: "workflow_id", type: "number", optional: false, desc: "Workflow ID." },
          ],
        },
        {
          method: "GET",
          path: "/api/github/team-stats",
          description: "CI-level team stats: per-actor run count, success rate, avg duration, activity by day/hour.",
          params: [
            { name: "owner", type: "string", optional: false, desc: "Repository owner." },
            { name: "repo", type: "string", optional: false, desc: "Repository name." },
            { name: "per_page", type: "number", optional: true, desc: "Runs to analyse (default 100)." },
          ],
        },
        {
          method: "GET",
          path: "/api/github/bus-factor",
          description: "Bus factor analysis: per-file-prefix contributor count and Herfindahl index. Flags modules with fewer than 2 active contributors.",
          params: [
            { name: "owner", type: "string", optional: false, desc: "Repository owner." },
            { name: "repo", type: "string", optional: false, desc: "Repository name." },
          ],
        },
        {
          method: "GET",
          path: "/api/github/security-scan",
          description: "Static analysis of workflow YAML files for security anti-patterns. Returns findings grouped by severity.",
          params: [
            { name: "owner", type: "string", optional: false, desc: "Repository owner." },
            { name: "repo", type: "string", optional: false, desc: "Repository name." },
          ],
        },
        {
          method: "GET",
          path: "/api/github/audit-log",
          description: "Commit history for all .github/workflows/*.yml files, sorted by date.",
          params: [
            { name: "owner", type: "string", optional: false, desc: "Repository owner." },
            { name: "repo", type: "string", optional: false, desc: "Repository name." },
          ],
        },
        {
          method: "POST",
          path: "/api/db/sync",
          description: "Trigger incremental sync of GitHub workflow runs to the database. Checks alert rules after sync completes.",
          params: [
            { name: "org", type: "string", optional: true, desc: "Limit sync to a specific org." },
          ],
        },
      ].map((endpoint) => (
        <DocCard key={endpoint.path}>
          <div className="flex items-center gap-3 mb-3">
            <span className={cn(
              "text-xs font-mono font-bold px-2.5 py-1 rounded-lg",
              endpoint.method === "GET"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
            )}>
              {endpoint.method}
            </span>
            <code className="text-sm font-mono text-white font-semibold">{endpoint.path}</code>
          </div>
          <ProseP>{endpoint.description}</ProseP>
          {endpoint.params.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Parameters</p>
              <DocTable
                headers={["Name", "Type", "Required", "Description"]}
                rows={endpoint.params.map((p) => [
                  <Code key={p.name}>{p.name}</Code>,
                  <span key="t" className="text-slate-500 text-xs font-mono">{p.type}</span>,
                  p.optional
                    ? <span key="r" className="text-slate-500 text-xs">Optional</span>
                    : <span key="r" className="text-amber-400 text-xs font-medium">Required</span>,
                  <span key="d" className="text-xs">{p.desc}</span>,
                ])}
              />
            </div>
          )}
        </DocCard>
      ))}
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "I see a blank screen or 500 error after deploying.",
      a: <>Check that <Code>SESSION_SECRET</Code> is set and is at least 32 characters. The app throws at startup in production if it is missing or too short. Check server logs for <Code>[startup]</Code> errors.</>,
    },
    {
      q: "Cost Analytics shows a 404 error about billing.",
      a: <>In <strong className="text-white">org mode</strong>, Cost Analytics requires the GitHub Enhanced Billing Platform (Team or Enterprise). In <strong className="text-white">standalone mode</strong>, only your personal billing data is available.</>,
    },
    {
      q: "OAuth callback fails with 'state mismatch' or 'expired state'.",
      a: <>OAuth state tokens expire after 5 minutes. If the user takes longer to authorize, they need to click &ldquo;Sign in with GitHub&rdquo; again. Also verify <Code>NEXT_PUBLIC_APP_URL</Code> exactly matches the callback URL in your GitHub OAuth App.</>,
    },
    {
      q: "DATABASE_URL is set but reports/alerts still don't work.",
      a: <>Confirm you are in <Code>MODE=organization</Code>. These features are disabled in standalone mode regardless of <Code>DATABASE_URL</Code>. Also check that <Code>?sslmode=require</Code> is appended for Neon databases.</>,
    },
    {
      q: "SESSION_SECRET must be at least 32 characters — but I'm running locally.",
      a: <>This check only applies when <Code>NODE_ENV=production</Code>. In development (<Code>npm run dev</Code>) any value is accepted.</>,
    },
    {
      q: "How do I update to a new version?",
      a: <>Pull the latest Docker image: <Code>docker pull dinhdobathi1992/gitdash:latest</Code> then restart your container. For self-built deployments, pull the latest commit and rebuild.</>,
    },
    {
      q: "Can I use a fine-grained PAT instead of a classic PAT?",
      a: <>Yes. Use a fine-grained PAT with <Code>Actions: read</Code> and <Code>Contents: read</Code> scoped to specific repositories. Note: fine-grained PATs cannot access organization data (<Code>read:org</Code>), so org-level features will not work.</>,
    },
  ];

  return (
    <section id="faq" className="scroll-mt-8 space-y-6">
      <SectionHeading id="faq" icon={HelpCircle}>FAQ &amp; Troubleshooting</SectionHeading>
      <div className="space-y-3">
        {items.map((item, i) => (
          <DocCard key={i}>
            <div className="flex items-start gap-3">
              <Terminal className="w-4 h-4 mt-0.5 text-violet-400 shrink-0" />
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-white">{item.q}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            </div>
          </DocCard>
        ))}
      </div>
    </section>
  );
}

function Contributing() {
  return (
    <section id="contributing" className="scroll-mt-8 space-y-6">
      <SectionHeading id="contributing" icon={GitPullRequest}>Contributing</SectionHeading>

      <DocCard>
        <SubHeading>Local Development Setup</SubHeading>
        <Steps>
          <Step title="Clone and install" step={1}>
            <CodeBlock language="bash" filename="terminal">
{`git clone https://github.com/dinhdobathi1992/gitdash.git
cd gitdash
npm install`}
            </CodeBlock>
          </Step>
          <Step title="Configure environment" step={2}>
            <CodeBlock language="bash" filename=".env.local">
{`MODE=standalone
SESSION_SECRET=any_32_char_string_for_local_dev
# DATABASE_URL is optional for standalone mode`}
            </CodeBlock>
          </Step>
          <Step title="Start dev server" step={3}>
            <CodeBlock language="bash" filename="terminal">
{`npm run dev
# → http://localhost:3000`}
            </CodeBlock>
          </Step>
          <Step title="Run type checks" step={4}>
            <CodeBlock language="bash" filename="terminal">
{`npx tsc --noEmit
npm run lint`}
            </CodeBlock>
          </Step>
        </Steps>
      </DocCard>

      <DocCard>
        <SubHeading>Codebase Structure</SubHeading>
        <CodeBlock language="text">
{`src/
├── app/
│   ├── (main)/              # App routes (repos, workflows, etc.)
│   ├── docs/                # This docs page
│   └── api/                 # API routes (proxy to GitHub + DB)
│       ├── github/          # GitHub API proxy routes
│       ├── db/              # Database sync + query routes
│       └── auth/            # OAuth + session routes
├── components/
│   ├── docs/                # Docs-specific UI components
│   └── *.tsx                # Shared app components
└── lib/                     # Utilities, DB client, helpers`}
        </CodeBlock>
      </DocCard>

      <DocCard>
        <SubHeading>PR Guidelines</SubHeading>
        <ul className="space-y-2 text-sm text-slate-300">
          {[
            "Every new feature must include a docs update (update this page)",
            "TypeScript strict mode — no any types without justification",
            "Security: never log or expose credentials (checked in CI)",
            "New API routes must follow existing input validation patterns",
            "Test Docker build locally before opening a PR",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </DocCard>
    </section>
  );
}

function ReleaseNotes() {
  const releases = [
    {
      version: "2.9.0",
      date: "2026-03-03",
      badge: "latest",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      changes: {
        added: [
          "DORA 4 Keys at repository level — Deploy Frequency, Lead Time, CFR, MTTR computed from real merged PRs and GitHub Releases",
          "DORA drill-down charts: PR Cycle Time Breakdown (segmented bar), PR Size vs Velocity (scatter + regression line), PR Throughput (12-week bar), Workflow Stability (30d line with Elite/High reference lines)",
          "Team Insights page (/team) — global view with repo picker, sortable contributor leaderboard (8 metrics), and reviewer load heatmap",
          "Contributor Profile page (/contributor/[login]) — KPI cards, 52-week GitHub-style activity heatmap, weekly commit chart, PR lifecycle funnel, commit hour distribution, languages touched, recent PRs table",
          "Bus factor analysis — per-module contributor Herfindahl index, flags modules with <2 active contributors",
          "People-based alert metrics: PR throughput drop, review response P90, after-hours commit %, PR abandon rate, unreviewed PR age",
          "Reviewer Load Matrix component (author × reviewer heatmap) in both /team and repo team pages",
          "/api/github/repo-dora — new endpoint returning full RepoDoraSummary (5-min cache)",
          "/api/github/repo-contributors — new endpoint: per-contributor stats + reviewer matrix + bus factor",
          "/api/github/contributor-profile — new endpoint: full contributor data from PR, review, and commit APIs",
          "/api/github/bus-factor — new endpoint: per-module concentration analysis",
          "Docs redesigned to single-section navigation (opencode.ai style) — clicking nav replaces content, no more full-page scroll",
          "Prev / Next navigation at the bottom of each docs section",
        ],
        fixed: [],
        improved: [
          "Action Duration Trend (renamed from Duration Trend) on repo overview page",
          "Docs search (⌘K) now switches to the selected section instead of scrolling",
          "Version badge in sidebar reads from package.json via NEXT_PUBLIC_APP_VERSION at build time",
        ],
      },
    },
    {
      version: "2.3.0",
      date: "2026-03-01",
      badge: null,
      badgeColor: "",
      changes: {
        added: [
          "Modernized /docs page with component library, search, collapsible sidebar, IntersectionObserver ToC",
          "GitHub webhook receiver at /api/webhooks/github — workflow_run events auto-sync to Neon DB",
          "Alert rule evaluation wired into POST /api/db/sync — rules checked after every sync",
          "Slack webhook delivery for alert rules (channel=slack)",
          "/docs publicly accessible before authentication (no login required)",
        ],
        fixed: [
          "Sidebar no longer renders on /docs for unauthenticated visitors",
          "SWR global 401 handler no longer redirects away from /docs",
        ],
        improved: [
          "upsertRuns() replaced N+1 per-row SQL loop with single Neon HTTP transaction — up to 500× fewer round-trips per sync",
        ],
      },
    },
    {
      version: "2.2.0",
      date: "2026-02-20",
      badge: null,
      badgeColor: "",
      changes: {
        added: [
          "Reports page — DB-backed historical reporting with daily area chart and quarterly breakdown",
          "Alert rules CRUD UI at /alerts with per-repo and per-org scopes",
          "Neon PostgreSQL integration with idempotent schema migration (ensureSchema)",
          "POST /api/db/sync — incremental GitHub → DB sync with cursor tracking",
        ],
        fixed: [],
        improved: ["Sync cursor prevents re-fetching already-stored runs on repeated syncs"],
      },
    },
    {
      version: "2.1.0",
      date: "2026-02-10",
      badge: null,
      badgeColor: "",
      changes: {
        added: [
          "Cost Analytics page at /cost-analytics — GitHub Actions billing breakdown by SKU/runner type",
          "Monthly burn rate progress bar with warning/critical thresholds",
          "Org dashboard at /org/[orgName] — reliability heatmap and sortable repo table",
          "Audit tab, Security tab, Team stats tab at /repos/[owner]/[repo]/*",
        ],
        fixed: ["OAuth state now expires after 5 minutes to prevent stale CSRF tokens"],
        improved: ["Repo overview fetches up to 10 workflows in parallel batches of 5"],
      },
    },
    {
      version: "2.0.0",
      date: "2026-01-15",
      badge: null,
      badgeColor: "",
      changes: {
        added: [
          "Organization mode — GitHub OAuth App login with isolated per-user sessions",
          "Multi-arch Docker image (linux/amd64 + linux/arm64)",
          "iron-session v8 with AES-256-GCM cookie encryption",
          "HTTP security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options",
          "Rate limiting on /api/auth/setup (5 req/min) and /api/auth/login (10 req/min)",
        ],
        fixed: [],
        improved: [
          "SESSION_SECRET minimum length enforced at startup in production",
          "Lazy Neon DB singleton — no build-time crash when DATABASE_URL is absent",
        ],
      },
    },
    {
      version: "1.0.0",
      date: "2025-12-01",
      badge: null,
      badgeColor: "",
      changes: {
        added: [
          "Initial release — standalone mode with PAT-based authentication",
          "Repositories list with fuzzy search and keyboard navigation",
          "Workflow dashboard with 5 tabs: Overview, Performance, Reliability, Triggers, Runs",
          "Auto-refresh every 30 seconds while runs are in-progress",
          "Browser notifications for new workflow failures (opt-in)",
          "CSV export from the Runs tab",
        ],
        fixed: [],
        improved: [],
      },
    },
  ];

  const chipColors: Record<string, string> = {
    added:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    fixed:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
    improved: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  };

  const dotColors: Record<string, string> = {
    added:    "text-emerald-400",
    fixed:    "text-blue-400",
    improved: "text-violet-400",
  };

  return (
    <section id="release-notes" className="scroll-mt-8 space-y-6">
      <SectionHeading id="release-notes" icon={Tag}>Release Notes</SectionHeading>
      <div className="space-y-4">
        {releases.map((r) => (
          <DocCard key={r.version}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-lg font-bold text-white">v{r.version}</span>
              {r.badge && (
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${r.badgeColor}`}>
                  {r.badge}
                </span>
              )}
              <span className="text-xs text-slate-500">{r.date}</span>
            </div>

            <div className="space-y-4 pt-1">
              {(["added", "fixed", "improved"] as const).map((kind) => {
                const items = r.changes[kind];
                if (!items.length) return null;
                const label = kind === "added" ? "Added" : kind === "fixed" ? "Fixed" : "Improved";
                return (
                  <div key={kind}>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-semibold mb-2 ${chipColors[kind]}`}>
                      {label}
                    </span>
                    <ul className="space-y-1.5">
                      {items.map((item, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm text-slate-300`}>
                          <ChevronRight className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${dotColors[kind]}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </DocCard>
        ))}
      </div>
    </section>
  );
}

// ── Sidebar Component ─────────────────────────────────────────────────────────

function DocSidebar({
  active,
  onSelect,
  onSearchOpen,
  mobileOpen,
  onMobileClose,
}: {
  active: string;
  onSelect: (id: string) => void;
  onSearchOpen: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo / Title */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">GitDash Docs</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/20 font-mono">
            v{process.env.NEXT_PUBLIC_APP_VERSION ?? "2.9.0"}
          </span>
        </div>
        {/* Mobile close */}
        <button
          className="lg:hidden text-slate-500 hover:text-white transition-colors"
          onClick={onMobileClose}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search button */}
      <div className="px-3 py-3 border-b border-slate-800">
        <button
          onClick={onSearchOpen}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 text-sm hover:border-violet-500/40 hover:text-white transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">Search docs...</span>
          <kbd className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-500 font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map((section) => {
          const isCollapsed = collapsed[section.title];
          return (
            <div key={section.title} className="mb-1">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
              >
                {section.title}
                <ChevronDown className={cn("w-3 h-3 transition-transform", isCollapsed && "-rotate-90")} />
              </button>
              {!isCollapsed && (
                <ul className="mt-0.5 space-y-0.5">
                  {section.items.map(({ id, label, icon: Icon }) => (
                    <li key={id}>
                      <button
                        onClick={() => {
                          onSelect(id);
                          onMobileClose();
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                          active === id
                            ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer links */}
      <div className="px-4 py-3 border-t border-slate-800 space-y-1">
        <a
          href="https://github.com/dinhdobathi1992/gitdash"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          GitHub Repository
        </a>
        <a
          href="https://github.com/dinhdobathi1992/gitdash/issues"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Report an Issue
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen border-r border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={onMobileClose} />
          <aside className="relative w-72 h-full bg-slate-950 border-r border-slate-800 flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

// ── Section registry ──────────────────────────────────────────────────────────

const SECTION_COMPONENTS: Record<string, React.ReactNode> = {
  "getting-started": <GettingStarted />,
  "deployment":      <Deployment />,
  "configuration":   <Configuration />,
  "modes":           <Modes />,
  "security":        <Security />,
  "core-concepts":   <CoreConcepts />,
  "features":        <Features />,
  "api-reference":   <APIReference />,
  "faq":             <FAQ />,
  "contributing":    <Contributing />,
  "release-notes":   <ReleaseNotes />,
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [active, setActive] = useState("getting-started");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll to top whenever the active section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [active]);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const activeIndex = ALL_SECTIONS.findIndex((s) => s.id === active);
  const prevSection = activeIndex > 0 ? ALL_SECTIONS[activeIndex - 1] : null;
  const nextSection = activeIndex < ALL_SECTIONS.length - 1 ? ALL_SECTIONS[activeIndex + 1] : null;

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <DocSidebar
        active={active}
        onSelect={(id) => { setActive(id); setMobileOpen(false); }}
        onSearchOpen={() => setSearchOpen(true)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <BookOpen className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">GitDash Docs</span>
          <button
            onClick={() => setSearchOpen(true)}
            className="ml-auto text-slate-400 hover:text-white transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Content area — only the active section is rendered */}
        <main className="max-w-3xl mx-auto px-6 py-10">
          {SECTION_COMPONENTS[active]}

          {/* Prev / Next navigation */}
          <div className="mt-16 pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
            {prevSection ? (
              <button
                onClick={() => setActive(prevSection.id)}
                className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180 shrink-0 text-slate-600 group-hover:text-violet-400 transition-colors" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">Previous</p>
                  <p className="font-medium">{prevSection.label}</p>
                </div>
              </button>
            ) : <div />}

            {nextSection ? (
              <button
                onClick={() => setActive(nextSection.id)}
                className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors text-right"
              >
                <div>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">Next</p>
                  <p className="font-medium">{nextSection.label}</p>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 text-slate-600 group-hover:text-violet-400 transition-colors" />
              </button>
            ) : <div />}
          </div>

          {/* Footer */}
          <footer className="mt-8 pb-4 text-center text-xs text-slate-600 space-y-1">
            <p>GitDash v{process.env.NEXT_PUBLIC_APP_VERSION ?? "2.9.0"} — GitHub Actions Dashboard</p>
            <p>
              <a href="https://github.com/dinhdobathi1992/gitdash" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition-colors">
                Open source on GitHub
              </a>
              {" · "}
              <a href="https://github.com/dinhdobathi1992/gitdash/issues" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition-colors">
                Report an issue
              </a>
            </p>
          </footer>
        </main>
      </div>

      {/* Search modal */}
      <DocSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(id) => { setActive(id); setSearchOpen(false); }}
      />
    </div>
  );
}
