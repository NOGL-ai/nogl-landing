import { NextResponse } from "next/server";
import { applyJob } from "@/actions/repricing/execution";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const proposalIds: string[] | undefined = body.proposalIds ?? undefined;
    const job = await applyJob(params.id, proposalIds);
    return NextResponse.json(job);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
