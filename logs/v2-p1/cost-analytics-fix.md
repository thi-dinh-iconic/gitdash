# Cost Analytics Fix — GitHub Enhanced Billing API Migration

**Date:** 2026-03-01  
**Status:** Complete ✓  
**Build:** Passing (tsc, lint, next build — 26 routes, 0 errors)

## Problem

GitHub deprecated **all** old billing REST endpoints. Both personal and org endpoints now return `410 Gone`. This was not a token scope issue — the endpoints no longer exist.

- Old (deprecated): `GET /orgs/{org}/settings/billing/actions` → 410
- Old (deprecated): `GET /users/{username}/settings/billing/actions` → 410

## Solution

Migrated to GitHub's **Enhanced Billing API**:

- Org: `GET /organizations/{org}/settings/billing/usage/summary`
- Query params: `?year=&month=&product=Actions`
- Returns real dollar amounts (`grossAmount`, `netAmount`, `discountAmount`) and minutes per SKU
- Octokit does not support this endpoint — must use raw `fetch()`

## Requirements

- **Fine-grained PAT** with `Administration` org permission (read)
- Classic PATs (`admin:org`) are **not supported** by this API
- Org must be on GitHub Enhanced Billing Platform (Team / Enterprise plans)
- Personal billing is **not supported** by the new API

## Files Changed

### `src/app/api/github/billing/cost-analysis/route.ts`
- Completely rewritten to use the new Enhanced Billing API via raw `fetch()`
- New `CostAnalysisResponse` shape: `{ kind, login, skus[], total_minutes, total_net_amount, total_gross_amount, total_discount_amount, burn_rate, period }`
- `SkuBreakdown` type: `{ sku, label, minutes, unit_type, price_per_unit, gross_amount, discount_amount, net_amount }`
- Actionable 403 error explains fine-grained PAT requirement
- Actionable 404 error links to Enhanced Billing Platform enablement page
- Year/month query params supported for historical navigation

### `src/app/cost-analytics/page.tsx`
- Completely rewritten to match new `CostAnalysisResponse` shape
- Removed `CostTable` (old runner breakdown) → replaced with `SkuTable` (real SKU data)
- Added month selector UI (prev/next navigation, capped at current month)
- 403 error: updated guidance — fine-grained PAT with Administration (read), not admin:org
- 404 error: new — explains Enhanced Billing Platform requirement with link to enable
- Removed `BurnRateBar` usage ratio (included_minutes unknown from new API)
- Stat cards now show: Net Billed, Total Minutes (+ gross), Daily Burn Rate, Projected EOM
- Removed old `isDeprecated` (410) handler — no longer needed
- Removed `RUNNER_META`, `RUNNER_RATES` UI references (API returns real amounts)
- `formatCurrency` still imported from `@/lib/cost`

### `src/app/setup/page.tsx`
- Removed `admin:org` optional scope entry
- Added note: Cost Analytics requires a separate fine-grained PAT with Administration (read) org permission
- Classic token generation link updated (removed `admin:org` from scopes)

### `src/app/login/page.tsx`
- Removed `admin:org` code reference
- Updated copy: Cost Analytics requires a separate fine-grained PAT

## Security Review

- No `dangerouslySetInnerHTML`
- All external links use `rel="noopener noreferrer"`
- `Cache-Control: private` on API response
- Token passed as `Authorization: Bearer` header (not query param)
- Org name validated via `validateOrg()` before use in API path
- No PII in error messages (org name from user input only)
- Error bodies use `safeError()` wrapper
