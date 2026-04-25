import { redirect } from "next/navigation";
import type { Route } from "next";
import { LineChartUp02 } from "@untitledui/icons";
import { getAuthSession } from "@/lib/auth";
import { PlaceholderPage } from "../../_PlaceholderPage";
import type { Locale } from "@/i18n";

export const dynamic = "force-dynamic";

export default async function ForecastOverviewPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    await params;
    const session = await getAuthSession();
    if (!session?.user) redirect("/auth/signin" as Route);

    return (
        <PlaceholderPage
            title="Forecast Overview"
            description="Roll-up of inventory health, OOS risk windows, and demand-side metrics across SKUs."
            icon={<LineChartUp02 className="h-5 w-5" />}
        />
    );
}
