import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import DemandClient from "./DemandClient";

export const metadata: Metadata = {
  title: "Demand Forecast | NOGL",
  description: "Sales and revenue demand forecast for Calumet Photographic",
};

const CALUMET_COMPANY_ID = "cmnw4qqo10000ltccgauemneu";

export default async function DemandPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <DemandClient companyId={CALUMET_COMPANY_ID} />
    </div>
  );
}
