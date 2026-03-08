#!/usr/bin/env node
/**
 * GitDash Product Walkthrough – Playwright Video Recorder
 *
 * Records a polished 60–90 s executive product tour of GitDash in demo mode.
 * Produces:
 *   • walkthrough.webm  — full-resolution 1440×900 video
 *   • thumb_*.png        — 4–6 thumbnail screenshots from the best frames
 *   • shot-list.md       — timestamped shot list
 *
 * Usage:
 *   npx playwright install chromium   # one-time
 *   node scripts/walkthrough.mjs      # run walkthrough
 */

import { chromium } from "playwright";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "walkthrough-output");
const BASE = process.env.APP_URL || "http://localhost:3000";
const OWNER = "dinhdobathi1992";
const REPO = "gitdash";

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Wait for network-idle + extra settle time so charts render fully. */
async function settle(page, ms = 2000) {
    await page.waitForLoadState("networkidle").catch(() => { });
    await page.waitForTimeout(ms);
}

/** Smooth-scroll to an element or to top. */
async function smoothScroll(page, selector = null, position = "center") {
    if (selector) {
        await page.evaluate(
            ([sel, pos]) => {
                const el = document.querySelector(sel);
                if (el) el.scrollIntoView({ behavior: "smooth", block: pos });
            },
            [selector, position]
        );
    } else {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
    await page.waitForTimeout(800);
}

/** Slowly move mouse to centre of a locator before clicking. */
async function deliberateClick(page, locator, opts = {}) {
    const box = await locator.boundingBox();
    if (!box) {
        await locator.click();
        return;
    }
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y, { steps: 30 }); // slow, visible motion
    await page.waitForTimeout(300);
    await locator.click(opts);
}

let thumbIndex = 0;
const shotList = [];
const startedAt = Date.now();

function ts() {
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    return `${elapsed}s`;
}

async function screenshot(page, label) {
    thumbIndex++;
    const filename = `thumb_${String(thumbIndex).padStart(2, "0")}_${label.replace(/\s+/g, "_").toLowerCase()}.png`;
    await page.screenshot({ path: join(OUT_DIR, filename), fullPage: false });
    shotList.push({ time: ts(), label, filename, route: page.url().replace(BASE, "") });
    console.log(`  📸 [${ts()}] ${label}`);
}

// ── Main Walkthrough ─────────────────────────────────────────────────────────

async function main() {
    console.log("🎬 Starting GitDash walkthrough…\n");

    const browser = await chromium.launch({
        headless: false,           // visible so you can screen-record if needed
        slowMo: 50,                // slightly slower for readability
        args: ["--disable-gpu"],
    });

    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,      // retina-quality screenshots
        recordVideo: {
            dir: OUT_DIR,
            size: { width: 1440, height: 900 },
        },
        colorScheme: "dark",
    });

    const page = await context.newPage();

    try {
        // ────────────────────────────────────────────────────────────────────────
        // SHOT 1 — Home Dashboard / Mission Control
        // ────────────────────────────────────────────────────────────────────────
        // Navigate to the app — if it redirects to /login, pause for manual auth
        console.log("▸ Opening app (will pause 3 min for login if needed)…");
        await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
        await settle(page, 2000);

        // Check if we landed on a login page
        const currentUrl = page.url();
        if (currentUrl.includes("/login") || currentUrl.includes("/setup")) {
            console.log("\n⏸  LOGIN REQUIRED — Complete login in the Playwright browser window.");
            console.log("   You have 3 minutes. The walkthrough will resume automatically.\n");
            for (let remaining = 180; remaining > 0; remaining -= 30) {
                console.log(`   ⏳ ${remaining}s remaining…`);
                await page.waitForTimeout(Math.min(30000, remaining * 1000));
                // Check if we navigated away from login
                if (!page.url().includes("/login") && !page.url().includes("/setup")) {
                    console.log("   ✅ Login detected! Resuming walkthrough…\n");
                    break;
                }
            }
            // After login, navigate to home
            await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
            await settle(page, 3000);
        }

        console.log("▸ Shot 1: Home Dashboard");
        await settle(page, 2000);
        await screenshot(page, "Home Dashboard");

        // Slowly scroll down to reveal repo list
        await smoothScroll(page, "table", "start");
        await page.waitForTimeout(1500);

        // ────────────────────────────────────────────────────────────────────────
        // SHOT 2 — Open a high-signal repo (api-gateway)
        // ────────────────────────────────────────────────────────────────────────
        console.log(`▸ Shot 2: Repository Detail — ${OWNER}/${REPO}`);
        const repoLink = page.locator(`a[href*="/repos/${OWNER}/${REPO}"]`).first();
        if (await repoLink.isVisible().catch(() => false)) {
            await deliberateClick(page, repoLink);
        } else {
            // fallback: navigate directly
            await page.goto(`${BASE}/repos/${OWNER}/${REPO}`, { waitUntil: "networkidle", timeout: 60000 });
        }
        await settle(page, 2500);
        await screenshot(page, `Repo Overview - ${REPO}`);

        // scroll to reveal health cards
        await smoothScroll(page, null);
        await page.waitForTimeout(1000);

        // ────────────────────────────────────────────────────────────────────────
        // SHOT 3 — Workflow Detail → Overview tab
        // ────────────────────────────────────────────────────────────────────────
        console.log("▸ Shot 3: Workflow Detail — Overview");
        // Click the first workflow link on the repo page
        const wfLink = page.locator('a[href*="/workflows/"]').first();
        if (await wfLink.isVisible().catch(() => false)) {
            await deliberateClick(page, wfLink);
        } else {
            // Navigate directly to first workflow
            await page.goto(`${BASE}/repos/${OWNER}/${REPO}/workflows/1?tab=overview`, { waitUntil: "networkidle", timeout: 60000 });
        }
        await settle(page, 3000);
        await smoothScroll(page, null); // scroll to top
        await screenshot(page, "Workflow Overview");

        // scroll down to show charts
        await smoothScroll(page, '[id="tabpanel-overview"]', "start");
        await page.waitForTimeout(1500);

        // ────────────────────────────────────────────────────────────────────────
        // SHOT 4 — Performance tab
        // ────────────────────────────────────────────────────────────────────────
        console.log("▸ Shot 4: Performance Tab");
        const perfTab = page.locator('#tab-performance');
        if (await perfTab.isVisible().catch(() => false)) {
            await deliberateClick(page, perfTab);
            await settle(page, 2000);
            await smoothScroll(page, null);
            await screenshot(page, "Performance Tab");

            // scroll down to show queue analysis
            await smoothScroll(page, '[id="tabpanel-performance"] h3', "start");
            await page.waitForTimeout(1500);
        } else {
            console.log("  ⚠ Performance tab not visible, navigating directly");
            await page.goto(`${BASE}/repos/${OWNER}/${REPO}/workflows/1?tab=performance`, { waitUntil: "networkidle", timeout: 60000 });
            await settle(page, 2000);
            await screenshot(page, "Performance Tab");
        }

        // ────────────────────────────────────────────────────────────────────────
        // SHOT 5 — Reliability / DORA tabs
        // ────────────────────────────────────────────────────────────────────────
        console.log("▸ Shot 5: DORA Metrics");
        const doraTab = page.locator('#tab-dora');
        if (await doraTab.isVisible().catch(() => false)) {
            await deliberateClick(page, doraTab);
            await settle(page, 2000);
            await smoothScroll(page, null);
            await screenshot(page, "DORA Metrics");
            await page.waitForTimeout(1500);
        } else {
            await page.goto(`${BASE}/repos/${OWNER}/${REPO}/workflows/1?tab=dora`, { waitUntil: "networkidle", timeout: 60000 });
            await settle(page, 2000);
            await screenshot(page, "DORA Metrics");
        }

        // Also show reliability tab briefly
        console.log("▸ Shot 5b: Reliability Tab");
        const reliTab = page.locator('#tab-reliability');
        if (await reliTab.isVisible().catch(() => false)) {
            await deliberateClick(page, reliTab);
            await settle(page, 2000);
            await smoothScroll(page, null);
            await page.waitForTimeout(1500);
        }

        // ────────────────────────────────────────────────────────────────────────
        // SHOT 6 — Team Insights
        // ────────────────────────────────────────────────────────────────────────
        console.log("▸ Shot 6: Team Insights");
        await page.goto(`${BASE}/team`, { waitUntil: "networkidle", timeout: 60000 });
        await settle(page, 3000);
        await screenshot(page, "Team Insights");

        // Scroll to show contributor cards
        await smoothScroll(page, "table, .grid", "start");
        await page.waitForTimeout(1500);

        // Try to open a contributor profile
        console.log("▸ Shot 6b: Contributor Profile");
        const contribLink = page.locator('a[href*="/contributor/"]').first();
        if (await contribLink.isVisible().catch(() => false)) {
            await deliberateClick(page, contribLink);
            await settle(page, 2500);
        } else {
            await page.goto(`${BASE}/contributor/dinhdobathi1992`, { waitUntil: "networkidle", timeout: 60000 });
            await settle(page, 2500);
        }
        await page.waitForTimeout(1000);

        // ────────────────────────────────────────────────────────────────────────
        // SHOT 7 — Cost Analytics
        // ────────────────────────────────────────────────────────────────────────
        console.log("▸ Shot 7: Cost Analytics");
        await page.goto(`${BASE}/cost-analytics`, { waitUntil: "networkidle", timeout: 60000 });
        await settle(page, 3000);
        await smoothScroll(page, null);
        await screenshot(page, "Cost Analytics");

        // scroll to show detailed charts
        await smoothScroll(page, "table, .recharts-wrapper", "start");
        await page.waitForTimeout(1500);

        // ────────────────────────────────────────────────────────────────────────
        // SHOT 8 — Alerts
        // ────────────────────────────────────────────────────────────────────────
        console.log("▸ Shot 8: Alerts");
        await page.goto(`${BASE}/alerts`, { waitUntil: "networkidle", timeout: 60000 });
        await settle(page, 2000);
        await screenshot(page, "Alerts");
        await page.waitForTimeout(1000);

        // Reports
        console.log("▸ Shot 8b: Reports");
        await page.goto(`${BASE}/reports`, { waitUntil: "networkidle", timeout: 60000 });
        await settle(page, 2000);
        await page.waitForTimeout(1000);

        // ────────────────────────────────────────────────────────────────────────
        // SHOT 9 — Docs + closing frame
        // ────────────────────────────────────────────────────────────────────────
        console.log("▸ Shot 9: Docs / Closing");
        await page.goto(`${BASE}/docs`, { waitUntil: "networkidle", timeout: 60000 });
        await settle(page, 2000);
        await page.waitForTimeout(1000);

        // Return to home for a clean closing frame
        console.log("▸ Closing: Return to Home");
        await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
        await settle(page, 2500);
        await smoothScroll(page, null);
        await screenshot(page, "Closing Frame");
        await page.waitForTimeout(2000);

        console.log("\n✅ Walkthrough complete!\n");

    } catch (err) {
        console.error("❌ Error during walkthrough:", err.message);
        await page.screenshot({ path: join(OUT_DIR, "error_frame.png") });
    } finally {
        await page.close();
        await context.close();
        await browser.close();
    }

    // ── Write shot list ──────────────────────────────────────────────────────
    const md = [
        "# GitDash Product Walkthrough — Shot List",
        "",
        `> Generated: ${new Date().toISOString()}`,
        "",
        "| # | Timestamp | Shot | Route | Screenshot |",
        "| --- | --- | --- | --- | --- |",
        ...shotList.map((s, i) => `| ${i + 1} | ${s.time} | ${s.label} | \`${s.route}\` | \`${s.filename}\` |`),
        "",
        "## Video Output",
        "",
        `Video file saved to: \`walkthrough-output/\` (look for the \`.webm\` file)`,
        "",
        "## Notes",
        "",
        "- All frames captured in demo mode (synthetic data, no real credentials)",
        "- Viewport: 1440×900 @ 2x DPR (retina)",
        "- Browser: Chromium (headed mode)",
    ].join("\n");

    writeFileSync(join(OUT_DIR, "shot-list.md"), md);
    console.log(`📋 Shot list written to: walkthrough-output/shot-list.md`);
    console.log(`📁 All outputs in: walkthrough-output/`);
}

main().catch(console.error);
