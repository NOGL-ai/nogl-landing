"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle } from "@untitledui/icons";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { PO_STATUS_ACCENT } from "@/config/replenishment";
import type { PurchaseOrder } from "@/types/replenishment";

interface POCardProps {
  order: PurchaseOrder;
  /** id of the element containing keyboard-drag instructions for screen readers. */
  describedById?: string;
}

function formatEuro(amount: number): string {
  return `€${amount.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatEta(eta: string | null): string {
  if (!eta) return "—";
  try {
    return format(parseISO(eta), "dd.MM.yyyy", { locale: de });
  } catch {
    return eta;
  }
}

export function POCard({ order, describedById }: POCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: order.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderTopColor: PO_STATUS_ACCENT[order.status],
    borderTopWidth: 2,
    borderTopStyle: "solid",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="listitem"
      tabIndex={0}
      aria-roledescription="draggable"
      aria-describedby={describedById}
      aria-label={`${order.poNumber}, ${order.supplierName ?? "Supplier TBD"}, total ${formatEuro(order.totalAmount)}${order.isLate ? ", late" : ""}`}
      className="group flex cursor-grab flex-col gap-2 rounded-xl border border-border-secondary bg-bg-primary p-3 shadow-xs transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand active:cursor-grabbing"
    >
      <h3 className="text-sm font-semibold text-primary">{order.poNumber}</h3>
      <p className="text-xs text-tertiary">
        {order.supplierName ?? "Supplier TBD"} · ETA: {formatEta(order.eta)}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-bg-secondary px-2 py-1 text-xs font-medium text-primary">
          {formatEuro(order.totalAmount)}
        </span>
        <span className="rounded-md bg-bg-secondary px-2 py-1 text-xs font-medium text-secondary">
          {order.lineCount} {order.lineCount === 1 ? "line" : "lines"}
        </span>
        {order.isLate ? (
          <span
            className="flex items-center gap-1 rounded-md bg-[#FFFAEB] px-2 py-1 text-xs font-medium text-[#B54708] ring-1 ring-inset ring-[#FEDF89] dark:bg-[#4E1D09] dark:text-[#FEC84B] dark:ring-[#93370D]"
            role="status"
          >
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            Late
          </span>
        ) : null}
      </div>
    </article>
  );
}
