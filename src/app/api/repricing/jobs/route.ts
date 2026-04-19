import { NextResponse } from "next/server";
import { listJobs } from "@/actions/repricing/execution";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ruleId    = searchParams.get("ruleId") ?? undefined;
    const status    = searchParams.get("status") ?? undefined;
    const dateFrom  = searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined;
    const dateTo    = searchParams.get("dateTo")   ? new Date(searchParams.get("dateTo")!)   : undefined;
    const limit     = searchParams.get("limit")    ? Number(searchParams.get("limit"))        : 50;
    const offset    = searchParams.get("offset")   ? Number(searchParams.get("offset"))       : 0;

    const jobs = await listJobs({ ruleId, status, dateFrom, dateTo, limit, offset });
    return NextResponse.json(jobs);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
