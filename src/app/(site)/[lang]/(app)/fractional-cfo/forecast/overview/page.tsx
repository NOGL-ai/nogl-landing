import { redirect } from "next/navigation";
import type { Route } from "next";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prismaDb";
import { CALUMET_COMPANY_ID } from "@/config/forecast";
import { PlaceholderPage } from "../../_PlaceholderPage";
import { ForecastOverviewClient } from "./ForecastOverviewClient";
import type { Locale } from "@/i18n";

export const metadata = { title: "Forecast Overview — Fractional CFO | NOGL" };

export const dynamic = "force-dynamic";

export default async function ForecastOverviewPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    await params;
    const session = await getAuthSession();
    if (!session?.user) redirect("/auth/signin" as Route);

    // Mirror demand/page.tsx: pull the demo Company by CALUMET_COMPANY_ID,
    // then check the matching ForecastTenant. If either is missing, fall back
    // to the existing PlaceholderPage so the route still renders.
    const company = await prisma.company.findUnique({
        where: { id: CALUMET_COMPANY_ID },
        select: { id: true, name: true },
    });

    if (!company) {
        return (
            <PlaceholderPage
                title="Forecast Overview"
                description="No demo Company found. Run npm run seed:forecast-demo to create the Calumet tenant."
            />
        );
    }

    const tenant = await prisma.forecastTenant.findUnique({
        where: { companyId: company.id },
        select: { id: true },
    });

    if (!tenant) {
        return (
            <PlaceholderPage
                title="Forecast Overview"
                description={`No forecast data for ${company.name}. Run npm run seed:forecast-demo to seed the dataset.`}
            />
        );
    }

    return <ForecastOverviewClient companyId={company.id} companyName={company.name} />;
}
