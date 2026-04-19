import { NextResponse } from "next/server";
import { getJob } from "@/actions/repricing/execution";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await getJob(params.id);
    return NextResponse.json(job);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 404 });
  }
}
