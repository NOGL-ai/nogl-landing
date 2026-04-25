/**
 * Server-side proxy for the ad-scoring /api/v1/analysis/{run_id}/report endpoint.
 *
 * Exposes the canonical FastAPI URL pattern under nogl-landing so external
 * integrators and demo links can hit `/api/v1/analysis/{run_id}/report`
 * without bypassing NextAuth or leaking AD_SCORING_API_KEY to the browser.
 *
 * The actual FastAPI service runs on the homelab (CT 421 / 10.10.10.184:8000)
 * and is not directly reachable from the public internet.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const AD_SCORING_API_URL =
  process.env.AD_SCORING_API_URL ?? "http://10.10.10.184:8000";

// UUID v4-ish guard — we accept any RFC-4122 shape to allow upstream flexibility,
// but reject anything that isn't a UUID to prevent SSRF via crafted run_id values.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  // Auth gate — any signed-in user can read their own runs; the FastAPI side
  // enforces tenancy with the API key.
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { runId } = await params;

  if (!UUID_RE.test(runId)) {
    return NextResponse.json({ error: "invalid run_id" }, { status: 400 });
  }

  const apiKey = process.env.AD_SCORING_API_KEY ?? "";

  try {
    const res = await fetch(
      `${AD_SCORING_API_URL}/api/v1/analysis/${runId}/report`,
      {
        headers: apiKey ? { "X-API-Key": apiKey } : {},
        // 30s timeout — report generation can be slow on large runs.
        signal: AbortSignal.timeout(30000),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "upstream_error", status: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        // Short private cache — reports are stable once generated but per-user.
        "Cache-Control": "private, max-age=30",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream unreachable";
    return NextResponse.json(
      { error: "fetch_failed", detail: message },
      { status: 502 }
    );
  }
}
