import { NextResponse } from "next/server";
import { runScheduledRules } from "@/actions/repricing/execution";

/**
 * Vercel Cron target — runs every hour at minute 0.
 * Secured by CRON_SECRET environment variable.
 *
 * vercel.json entry:
 *   { "path": "/api/cron/repricing", "schedule": "0 * * * *" }
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const result = await runScheduledRules();
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[cron/repricing]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
