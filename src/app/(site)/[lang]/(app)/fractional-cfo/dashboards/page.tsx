import { redirect } from "next/navigation";
import type { Route } from "next";
import { getAuthSession } from "@/lib/auth";
import { PlaceholderPage } from "../_PlaceholderPage";
import type { Locale } from "@/i18n";

export const dynamic = "force-dynamic";

export default async function CfoDashboardsPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    await params;
    const session = await getAuthSession();
    if (!session?.user) redirect("/auth/signin" as Route);

    return (
        <PlaceholderPage
            title="Dashboards"
            description="CFO-level KPI dashboards: cash, margin, OOS exposure and repricing impact."
        />
    );
}
