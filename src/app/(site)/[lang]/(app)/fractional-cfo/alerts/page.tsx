import { redirect } from "next/navigation";
import type { Route } from "next";
import { getAuthSession } from "@/lib/auth";
import { ForecastingClient } from "@/components/forecasting/ForecastingClient";
import type { Locale } from "@/i18n";

export const dynamic = "force-dynamic";

export default async function CfoAlertsOverviewPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    await params;
    const session = await getAuthSession();
    if (!session?.user) redirect("/auth/signin" as Route);

    return (
        <div className="mx-auto w-full max-w-[1480px] px-5 py-6 lg:px-8">
            <ForecastingClient />
        </div>
    );
}
