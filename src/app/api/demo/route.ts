/**
 * /api/demo
 *
 * GET ?resource=repos|runs|summary&repo=<name>
 *
 * Returns sanitized fixture data for demo mode.
 * Does NOT require authentication — demo data contains no real credentials.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  DEMO_REPOS, DEMO_SUMMARIES, DEMO_ORG, makeDemoRuns,
} from "@/lib/demo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource");

  switch (resource) {
    case "repos": {
      return NextResponse.json({ repos: DEMO_REPOS }, {
        headers: { "Cache-Control": "public, max-age=3600" },
      });
    }

    case "summary": {
      const repo = searchParams.get("repo") ?? "";
      const summary = DEMO_SUMMARIES[repo];
      if (!summary) {
        return NextResponse.json({ error: "Unknown demo repo" }, { status: 404 });
      }
      return NextResponse.json({ summary }, {
        headers: { "Cache-Control": "public, max-age=3600" },
      });
    }

    case "runs": {
      const repo = searchParams.get("repo") ?? "api-gateway";
      const count = Math.min(parseInt(searchParams.get("count") ?? "50", 10), 200);
      const runs = makeDemoRuns(`${DEMO_ORG}/${repo}`, count);
      return NextResponse.json({ runs }, {
        headers: { "Cache-Control": "public, max-age=3600" },
      });
    }

    case "org": {
      return NextResponse.json({
        org: DEMO_ORG,
        total_repos: DEMO_REPOS.length,
        active_repos: DEMO_REPOS.length,
        aggregate: { total_runs: 1532, avg_success_rate: 90 },
        repos: DEMO_REPOS.map((r) => ({
          repo: r,
          summary: DEMO_SUMMARIES[r.name] ?? null,
          workflow_count: 2,
        })),
      }, {
        headers: { "Cache-Control": "public, max-age=3600" },
      });
    }

    default: {
      return NextResponse.json({
        org: DEMO_ORG,
        repos: DEMO_REPOS.map((r) => r.name),
        resources: ["repos", "summary", "runs", "org"],
      });
    }
  }
}
