// GET /api/forecasting/tabs
// Returns the tab labels + counts shown above the forecasting table.
import { NextResponse } from "next/server";
import { MOCK_FORECAST_TABS } from "@/components/forecasting/mockData";

export const dynamic = "force-dynamic";

export async function GET() {
    return NextResponse.json({ tabs: MOCK_FORECAST_TABS });
}
