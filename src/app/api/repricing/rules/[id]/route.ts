import { NextResponse } from "next/server";
import { getRule, updateRule, archiveRule, duplicateRule } from "@/actions/repricing/rules";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rule = await getRule(params.id);
    return NextResponse.json(rule);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 404 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patch = await req.json();
    const rule = await updateRule(params.id, patch);
    return NextResponse.json(rule);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await archiveRule(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
