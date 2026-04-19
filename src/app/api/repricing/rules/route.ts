import { NextResponse } from "next/server";
import { listRules, createRule } from "@/actions/repricing/rules";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") as NonNullable<Parameters<typeof listRules>[0]>["status"]) ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const rules = await listRules({ status, search });
    return NextResponse.json(rules);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rule = await createRule(body);
    return NextResponse.json(rule, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
