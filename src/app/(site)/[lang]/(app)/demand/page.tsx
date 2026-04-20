import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CALUMET_COMPANY_ID } from "@/config/forecast";
import DemandClient from "./DemandClient";

export const metadata: Metadata = {
  title: "Demand Forecast | NOGL",
  description: "Sales and revenue demand forecast for Calumet Photographic",
};

export default async function DemandPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");

  // Resolve the tenant's readable name server-side so the client H1 never
  // shows a raw Prisma cuid. Fallback to a friendly default on miss.
  const company = await prisma.company
    .findUnique({
      where: { id: CALUMET_COMPANY_ID },
      select: { name: true, slug: true, domain: true },
    })
    .catch(() => null);

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <DemandClient
        companyId={CALUMET_COMPANY_ID}
        companyName={company?.name ?? "Calumet Photographic"}
        companyDomain={company?.domain ?? "calumet.de"}
      />
    </div>
  );
}
