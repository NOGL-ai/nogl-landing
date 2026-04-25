/**
 * Server-side proxy for the ad-scoring /api/v1/assets/{asset_id}/similar endpoint.
 *
 * Wraps the Qdrant-backed similarity lookup served by FastAPI on CT 421
 * (10.10.10.184:8000). Used by Product Trend to find lookalike creatives.
 *
 * Auth happens server-side so AD_SCORING_API_KEY never reaches the browser.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const AD_SCORING_API_URL =
  process.env.AD_SCORING_API_URL ?? "http://10.10.10.184:8000";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { assetId } = await params;

  if (!UUID_RE.test(assetId)) {
    return NextResponse.json({ error: "invalid asset_id" }, { status: 400 });
  }

  // Validate query params — clamp to safe ranges to avoid hammering Qdrant.
  const rawLimit = req.nextUrl.searchParams.get("limit") ?? "10";
  const rawMinScore = req.nextUrl.searchParams.get("min_score") ?? "0.5";

  const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 10, 1), 100);
  const minScoreNum = parseFloat(rawMinScore);
  const minScore =
    Number.isFinite(minScoreNum) && minScoreNum >= 0 && minScoreNum <= 1
      ? minScoreNum
      : 0.5;

  const apiKey = process.env.AD_SCORING_API_KEY ?? "";

  try {
    const res = await fetch(
      `${AD_SCORING_API_URL}/api/v1/assets/${assetId}/similar?limit=${limit}&min_score=${minScore}`,
      {
        headers: apiKey ? { "X-API-Key": apiKey } : {},
        signal: AbortSignal.timeout(15000),
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
        "Cache-Control": "private, max-age=60",
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
