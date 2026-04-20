import { NextResponse } from "next/server";
import { refreshTrendsInternal } from "@/actions/trends";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await refreshTrendsInternal();
    return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[cron/refresh-trends]", err);
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
