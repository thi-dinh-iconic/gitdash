# GitDash

**The Engineering Analytics Platform for High-Performing Teams.**

GitDash is a secure, self-hosted dashboard that transforms GitHub and GitHub Actions data into actionable engineering intelligence. Built for tech leads, engineering managers, and individual contributors, it provides deep visibility into repository health, delivery velocity, team insights, and CI/CD costs.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

## 🚀 Key Capabilities

- **Industry-Standard DORA Metrics:** Track Deployment Frequency, Lead Time for Changes, Change Failure Rate, and MTTR derived directly from real PR and release data.
- **Precision Drill-Downs:** Actionable charts including PR Cycle Time Breakdown, PR Size vs. Velocity scatter plots, Throughput Trends, and Workflow Stability.
- **Workflow Intelligence:** Deep-dive into success rates, queue wait times, run duration trends, and cost estimation across all your GitHub Actions.
- **Team & Contributor Insights:** Uncover CI delivery metrics and reviewer load balances across teams. _(Coming Soon: Full Contributor Profiles with 52-week activity heatmaps and PR lifecycle funnels)._
- **Cost Analytics:** Track your GitHub Actions spend month-over-month to identify expensive workflows and optimize your CI budget (Requires Enhanced Billing).
- **Enterprise-Grade Security:** AES-256-GCM encrypted sessions, zero browser exposure for tokens, and native support for static analysis of your workflow configurations.
- **DB-Backed Reporting (Optional):** Persist historical data beyond GitHub's 90-day retention and evaluate advanced Alerting rules.

Screenshots: [`docs/screenshots/`](docs/screenshots)

## Architecture (High-Level)

GitDash is a Next.js App Router app that proxies authenticated requests to GitHub APIs.

- Browser calls internal routes under `/api/*`
- Server reads token from encrypted session cookie (`iron-session`)
- Server calls GitHub REST APIs with Octokit/fetch
- Optional DB routes persist and query historical workflow runs

Key code entry points:

- `src/proxy.ts` - auth gating + production HTTPS redirect
- `src/lib/session.ts` - encrypted session cookie configuration
- `src/lib/mode.ts` - auth mode selection (`standalone` vs `organization`)
- `src/app/api/github/*` - GitHub data endpoints
- `src/app/api/db/*` + `src/lib/db.ts` - optional historical DB layer

## Authentication Modes

| Mode | Best for | Login flow |
| --- | --- | --- |
| `standalone` (default) | Individual/self-hosted use | User enters PAT at `/setup`, token stored in encrypted HttpOnly session cookie |
| `organization` | Shared team deployment | GitHub OAuth via `/login` and `/api/auth/callback`, token stored in encrypted session cookie |

Mode is controlled by `MODE` env var.

## Quick Start (Local)

### 1. Prerequisites

- Node.js 20+
- npm

### 2. Clone and install

```bash
git clone https://github.com/dinhdobathi1992/gitdash.git
cd gitdash
npm ci
```

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Set at least:

```env
SESSION_SECRET=replace_with_a_random_32+_char_secret
MODE=standalone
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate a secure secret:

```bash
openssl rand -hex 32
```

### 4. Start

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- `standalone` mode redirects to `/setup`
- `organization` mode redirects to `/login`

## Organization Mode Setup (OAuth)

If `MODE=organization`, also set:

```env
GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret
```

Create GitHub OAuth App:

- Homepage URL: `http://localhost:3000`
- Callback URL: `http://localhost:3000/api/auth/callback`

## Token Scope Guidance

### Standalone PAT (recommended minimum)

- `repo`
- `workflow`
- `read:org`
- `read:user`

For tighter access, prefer a fine-grained PAT scoped to only the repositories and read permissions you need.

### Cost Analytics note

`/api/github/billing/cost-analysis` uses GitHub Enhanced Billing APIs. Some org/account combinations require fine-grained PAT permissions (for example org Administration read).

## Optional: Historical DB + Webhooks

GitDash works without a database for live GitHub analytics.

Add a Postgres/Neon database to unlock historical persistence and reporting features:

- `DATABASE_URL` enables `/api/db/*` and alert rule storage
- `/reports` relies on DB data and is available in organization mode
- `/api/webhooks/github` can upsert workflow runs from GitHub webhooks

Optional webhook hardening:

- Set `GITHUB_WEBHOOK_SECRET`
- Configure GitHub webhook event: `workflow_run`

## Deployment

### Docker Compose

```bash
cp .env.local.example .env.local
# edit .env.local
docker compose up --build -d
```

Stop:

```bash
docker compose down
```

### Docker image behavior

- Multi-stage build (`deps` -> `builder` -> `runner`)
- Runtime user is non-root (`nextjs`, uid 1001)
- `DOCKER_BUILD=1` enables Next standalone output during image build

### Kubernetes (Helm)

Helm chart is in `helm/gitdash/`.

Typical install:

```bash
helm upgrade --install gitdash ./helm/gitdash -n gitdash --create-namespace
```

Adjust `helm/gitdash/values.yaml` for mode, ingress, and secrets.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `SESSION_SECRET` | Yes | Session encryption key. Must be >= 32 chars in production. |
| `MODE` | No | `standalone` (default) or `organization` (aliases: `org`, `team`). |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public app URL, used by OAuth/callback flows. |
| `GITHUB_CLIENT_ID` | Org mode only | GitHub OAuth App client id. |
| `GITHUB_CLIENT_SECRET` | Org mode only | GitHub OAuth App client secret. |
| `DATABASE_URL` | Optional | Enables historical DB sync/trends/alerts persistence. |
| `GITHUB_WEBHOOK_SECRET` | Optional | Enables signature verification for `/api/webhooks/github`. |
| `GITHUB_TOKEN` | Optional fallback | Used only when no session token is provided to server helpers. |

## Main Routes

UI pages:

- `/` repositories
- `/repos/[owner]/[repo]` repository overview + links to audit/security/team
- `/repos/[owner]/[repo]/workflows/[workflow_id]` workflow analytics tabs
- `/team`, `/cost-analytics`, `/reports`, `/alerts`, `/settings`, `/docs`

API groups:

- `/api/auth/*` session setup/login/logout/me
- `/api/github/*` GitHub data + analytics endpoints
- `/api/db/*` optional historical sync and trend endpoints
- `/api/alerts` alert-rule CRUD + events
- `/api/webhooks/github` workflow webhook ingest

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript (strict)
- Tailwind CSS v4
- SWR for client data fetching
- Recharts for visualizations
- Octokit + GitHub REST API
- iron-session for encrypted cookies
- Neon Postgres client (`@neondatabase/serverless`) for optional DB features

## Project Layout

```text
gitdash/
├── src/
│   ├── app/                 # Pages + route handlers
│   ├── components/          # UI and shared client components
│   ├── lib/                 # Core logic (GitHub, DB, sessions, validation)
│   └── proxy.ts             # Auth/redirect proxy layer
├── docs/                    # Plans + screenshots
├── helm/gitdash/            # Helm chart
├── .github/workflows/       # CI/CD workflows
├── Dockerfile
└── docker-compose.yml
```

## Security Posture (Summary)

- Session cookie is `HttpOnly`, `SameSite=lax`, and `Secure` in production
- `SESSION_SECRET` is enforced in production (>=32 chars)
- Auth entry points are rate-limited (`/api/auth/setup`, `/api/auth/login`)
- OAuth `state` is verified and expires
- Input validation and safe error handling are centralized in `src/lib/validation.ts`
- Security headers (CSP, HSTS in prod, X-Frame-Options, etc.) are set in `next.config.ts`

Detailed history: [`README-SECURITY-ENHANCEMENTS.md`](README-SECURITY-ENHANCEMENTS.md)

## Developer Commands

```bash
npm run dev     # local dev
npm run build   # production build
npm run start   # run built app
npm run lint    # eslint
npx tsc --noEmit
```

## CI/CD Workflows

- `ci.yml` - lint, type-check, build, npm audit, Snyk, CodeQL
- `docker.yml` - multi-arch Docker build and push
- `release.yml` - semver release/tag flow
- `vercel.yml` - production deploy with Vercel CLI

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md).
