"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Receipt } from "@untitledui/icons";
import type { PurchaseOrderStatus } from "@/config/replenishment";
import type { PurchaseOrder } from "@/types/replenishment";
import { POCard } from "./POCard";

interface KanbanColumnProps {
  status: PurchaseOrderStatus;
  label: string;
  orders: PurchaseOrder[];
  cardDescribedById?: string;
}

function formatEuro(amount: number): string {
  return `€${amount.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function KanbanColumn({
  status,
  label,
  orders,
  cardDescribedById,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}` });

  const count = orders.length;
  const total = orders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <section
      className={`flex w-full shrink-0 flex-col gap-3 rounded-2xl border bg-bg-secondary p-3 md:w-80 md:min-w-[20rem] ${
        isOver
          ? "border-border-brand ring-2 ring-border-brand"
          : "border-border-secondary"
      }`}
      aria-label={`${label} column, ${count} ${count === 1 ? "item" : "items"}`}
    >
      <header className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Receipt
            className="h-4 w-4 text-quaternary"
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold text-primary">{label}</h2>
        </div>
        <span className="text-xs font-medium text-tertiary">
          {count}
        </span>
      </header>
      <p className="px-1 text-xs text-tertiary">
        {formatEuro(total)} · {count} {count === 1 ? "item" : "items"}
      </p>

      <SortableContext
        items={orders.map((o) => o.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          role="list"
          aria-label={`${label} purchase orders`}
          className="flex max-h-[calc(100vh-280px)] min-h-[120px] flex-col gap-2 overflow-y-auto pr-1"
        >
          {count === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border-secondary text-xs text-tertiary">
              No {label.toLowerCase()} orders
            </div>
          ) : (
            orders.map((order) => (
              <POCard
                key={order.id}
                order={order}
                describedById={cardDescribedById}
              />
            ))
          )}
        </div>
      </SortableContext>
    </section>
  );
}
