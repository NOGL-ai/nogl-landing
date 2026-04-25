/**
 * Server-side proxy for the ad-scoring /api/v1/brands endpoint.
 *
 * The browser cannot call FastAPI directly because:
 *   1. The AD_SCORING_API_KEY must never ship to the client.
 *   2. The service usually lives on a private homelab IP (10.10.10.184).
 *
 * This route forwards POST /api/ad-scoring/brands → POST {AD_SCORING_API_URL}/api/v1/brands
 * with the server-side API key attached, gated by the user's NextAuth session.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const AD_SCORING_API_URL =
  process.env.AD_SCORING_API_URL ?? "http://10.10.10.184:8000";

export async function POST(request: NextRequest) {
  // Require an authenticated user. We don't gate on role — any signed-in pilot
  // client can self-onboard their brand.
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const apiKey = process.env.AD_SCORING_API_KEY ?? "";

  try {
    const upstream = await fetch(`${AD_SCORING_API_URL}/api/v1/brands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "X-API-Key": apiKey } : {}),
      },
      body: JSON.stringify(body),
      // Don't cache brand creates.
      cache: "no-store",
    });

    const text = await upstream.text();

    // Mirror upstream content-type when possible, but always preserve status.
    const contentType = upstream.headers.get("content-type") ?? "application/json";
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": contentType },
    });
  } catch (err) {
    // Network failure / FastAPI down → 502. The client falls back to queueing.
    const message = err instanceof Error ? err.message : "Upstream unreachable";
    return NextResponse.json(
      {
        error: "ad_scoring_upstream_unreachable",
        detail: message,
      },
      { status: 502 }
    );
  }
}

export async function GET() {
  // Proxy GET to support listing brands from the client without leaking the API key.
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.AD_SCORING_API_KEY ?? "";

  try {
    const upstream = await fetch(`${AD_SCORING_API_URL}/api/v1/brands`, {
      headers: { ...(apiKey ? { "X-API-Key": apiKey } : {}) },
      cache: "no-store",
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream unreachable";
    return NextResponse.json(
      { error: "ad_scoring_upstream_unreachable", detail: message },
      { status: 502 }
    );
  }
}
