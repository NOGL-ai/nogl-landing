import type { Metadata } from "next";

import { prisma } from "@/lib/prismaDb";
import { CALUMET_COMPANY_ID } from "@/config/forecast";
import { DemandClient } from "./DemandClient";
import { EmptyTenantState } from "./EmptyTenantState";

export const metadata: Metadata = {
  title: "Demand Forecast | Nogl",
  description:
    "14-day rolling history + 60-day quantile forecast across web, marketplace, and B2B channels.",
  openGraph: {
    title: "Demand Forecast | Nogl",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function DemandPage() {
  const company = await prisma.company.findUnique({
    where: { id: CALUMET_COMPANY_ID },
    select: { id: true, name: true, domain: true },
  });

  if (!company) {
    return <EmptyTenantState reason="no-company" />;
  }

  const tenant = await prisma.forecastTenant.findUnique({
    where: { companyId: company.id },
    select: { id: true, isDemoTenant: true },
  });

  if (!tenant) {
    return <EmptyTenantState reason="no-tenant" companyName={company.name} />;
  }

  return (
    <DemandClient
      companyId={company.id}
      companyName={company.name}
      companyDomain={company.domain}
      isDemoTenant={tenant.isDemoTenant}
    />
  );
}
