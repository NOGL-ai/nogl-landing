"use client";

import { ReplenishmentBoard } from "@/components/replenishment/ReplenishmentBoard";
import type { PurchaseOrder, Supplier } from "@/types/replenishment";

interface ReplenishmentClientProps {
  companyId: string;
  initialOrders: PurchaseOrder[];
  suppliers: Supplier[];
  variants: { id: string; title: string; sku: string | null }[];
}

export default function ReplenishmentClient({
  companyId,
  initialOrders,
  suppliers,
  variants,
}: ReplenishmentClientProps) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-primary">Replenishment</h1>
        <p className="text-sm text-tertiary">Purchase orders pipeline</p>
      </header>

      <ReplenishmentBoard
        companyId={companyId}
        initialOrders={initialOrders}
        suppliers={suppliers}
        variants={variants}
      />
    </div>
  );
}
