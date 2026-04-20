import { NextResponse } from "next/server";
import { rollbackJob } from "@/actions/repricing/execution";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await rollbackJob(params.id);
    return NextResponse.json(job);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
