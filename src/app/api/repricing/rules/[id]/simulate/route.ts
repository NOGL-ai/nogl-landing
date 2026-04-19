import { NextResponse } from "next/server";
import { simulateRule } from "@/actions/repricing/execution";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await simulateRule(params.id);
    return NextResponse.json(job, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
