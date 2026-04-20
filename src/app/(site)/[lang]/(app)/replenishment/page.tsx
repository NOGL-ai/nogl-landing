import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";
import { CALUMET_COMPANY_ID } from "@/config/forecast";
import {
  listPurchaseOrders,
  listSuppliers,
  listVariants,
} from "@/actions/replenishment";
import ReplenishmentClient from "./ReplenishmentClient";
import type { Route } from 'next';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Replenishment | NOGL",
  description: "Purchase order pipeline for Calumet Photographic",
};

export default async function ReplenishmentPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin" as Route);

  const [orders, suppliers, variants] = await Promise.all([
    listPurchaseOrders({
      companyId: CALUMET_COMPANY_ID,
      includeLineItems: false,
    }),
    listSuppliers(CALUMET_COMPANY_ID),
    listVariants(CALUMET_COMPANY_ID),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <ReplenishmentClient
        companyId={CALUMET_COMPANY_ID}
        initialOrders={orders}
        suppliers={suppliers}
        variants={variants}
      />
    </div>
  );
}