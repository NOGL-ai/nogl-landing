// GET /api/forecasting/products
// Returns the inventory rows shown on the Forecasting / Alert Overview screen.
// Currently backed by static mock data — swap MOCK_FORECAST_ROWS for a DB call
// once the inventory pipeline is wired in.
import { NextResponse } from "next/server";
import { MOCK_FORECAST_ROWS } from "@/components/forecasting/mockData";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").toLowerCase().trim();
    const tab = url.searchParams.get("tab") ?? "all";
    const sort = url.searchParams.get("sort"); // "oosImpact:desc" | "oosImpact:asc"

    let rows = MOCK_FORECAST_ROWS;

    if (q) {
        rows = rows.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.sku.toLowerCase().includes(q),
        );
    }

    // Lightweight tab filtering — production builds will run this server-side
    // off real classification rules.
    switch (tab) {
        case "reorder":
            rows = rows.filter((r) => r.reach.label === "Reorder");
            break;
        case "overstock":
        case "ovall":
            rows = rows.filter((r) => r.reach.label === "Overstock");
            break;
        case "demand":
            rows = rows.filter((r) => r.reach.label === "Out of stock");
            break;
        default:
            // "all", "compact", and named segments fall through to full list
            break;
    }

    if (sort === "oosImpact:desc") {
        rows = [...rows].sort((a, b) => b.oosImpactSort - a.oosImpactSort);
    } else if (sort === "oosImpact:asc") {
        rows = [...rows].sort((a, b) => a.oosImpactSort - b.oosImpactSort);
    }

    return NextResponse.json({ rows, total: rows.length });
}
