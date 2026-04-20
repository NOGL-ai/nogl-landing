"use client";

import { useCallback, useId, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { updatePurchaseOrderStatus } from "@/actions/replenishment";
import {
  PO_STATUS_COLUMN_ORDER,
  PO_STATUS_LABELS,
  type PurchaseOrderStatus,
} from "@/config/replenishment";
import type { PurchaseOrder, Supplier } from "@/types/replenishment";
import { FilterBar } from "./FilterBar";
import { KanbanColumn } from "./KanbanColumn";
import { POCard } from "./POCard";

interface ReplenishmentBoardProps {
  companyId: string;
  initialOrders: PurchaseOrder[];
  suppliers: Supplier[];
  variants: { id: string; title: string; sku: string | null }[];
}

function groupByStatus(
  orders: PurchaseOrder[]
): Record<PurchaseOrderStatus, PurchaseOrder[]> {
  const out: Record<PurchaseOrderStatus, PurchaseOrder[]> = {
    draft: [],
    approved: [],
    partially_arrived: [],
    arrived: [],
    cancelled: [],
  };
  for (const o of orders) {
    if (out[o.status]) out[o.status].push(o);
  }
  return out;
}

function parseDroppableStatus(id: string): PurchaseOrderStatus | null {
  if (id.startsWith("column:")) {
    const s = id.slice("column:".length) as PurchaseOrderStatus;
    if (PO_STATUS_COLUMN_ORDER.includes(s)) return s;
  }
  return null;
}

export function ReplenishmentBoard({
  companyId,
  initialOrders,
  suppliers,
  variants,
}: ReplenishmentBoardProps) {
  const [orders, setOrders] = useState<PurchaseOrder[]>(initialOrders);
  const [supplierId, setSupplierId] = useState<string>("");
  const [variantId, setVariantId] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>("");

  const dragInstructionsId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (supplierId && o.supplierId !== supplierId) return false;
      if (variantId) {
        if (!o.lineItems?.some((l) => l.variantId === variantId)) {
          // lineItems missing on list view — fall back to keeping it when
          // variant filter is active but line items aren't loaded. We rely on
          // the server's include filter instead for accurate filtering.
          return true;
        }
      }
      return true;
    });
  }, [orders, supplierId, variantId]);

  const grouped = useMemo(() => groupByStatus(filtered), [filtered]);
  const activeOrder = useMemo(
    () => (activeId ? orders.find((o) => o.id === activeId) ?? null : null),
    [activeId, orders]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;

      const activeOrderId = String(active.id);
      const overId = String(over.id);

      const current = orders.find((o) => o.id === activeOrderId);
      if (!current) return;

      // Determine the destination column. It's either the droppable column id
      // ("column:<status>") or another card; look up that card's status.
      let destStatus = parseDroppableStatus(overId);
      if (!destStatus) {
        const overOrder = orders.find((o) => o.id === overId);
        if (overOrder) destStatus = overOrder.status;
      }
      if (!destStatus || destStatus === current.status) return;

      // Optimistic update.
      const previousOrders = orders;
      const nowIso = new Date().toISOString();
      const nextOrders = orders.map((o) => {
        if (o.id !== activeOrderId) return o;
        const patch: PurchaseOrder = { ...o, status: destStatus! };
        if (destStatus === "approved" && !o.approvedAt) patch.approvedAt = nowIso;
        if (destStatus === "arrived") patch.arrivedAt = nowIso;
        // Recompute isLate for the new status.
        patch.isLate = (() => {
          if (!patch.eta) return false;
          if (patch.status === "arrived" || patch.status === "cancelled") return false;
          const etaDay = new Date(patch.eta);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return etaDay.getTime() < today.getTime();
        })();
        return patch;
      });
      setOrders(nextOrders);
      setAnnouncement(
        `${current.poNumber} moved to ${PO_STATUS_LABELS[destStatus]}`
      );

      try {
        await updatePurchaseOrderStatus({
          companyId,
          purchaseOrderId: activeOrderId,
          status: destStatus,
        });
      } catch (err) {
        console.error("[ReplenishmentBoard] update failed, rolling back:", err);
        setOrders(previousOrders);
        setAnnouncement(
          `Failed to move ${current.poNumber}. Reverted to ${PO_STATUS_LABELS[current.status]}.`
        );
      }
    },
    [orders, companyId]
  );

  const handleClearFilters = useCallback(() => {
    setSupplierId("");
    setVariantId("");
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <p id={dragInstructionsId} className="sr-only">
        Press space or enter to pick up a purchase order, use the arrow keys to
        move between columns and items, press space or enter again to drop, and
        press escape to cancel.
      </p>
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <FilterBar
        suppliers={suppliers}
        variants={variants}
        supplierId={supplierId}
        variantId={variantId}
        onSupplierChange={setSupplierId}
        onVariantChange={setVariantId}
        onClear={handleClearFilters}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-3 md:flex-row md:gap-4 md:overflow-x-auto">
          {PO_STATUS_COLUMN_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              label={PO_STATUS_LABELS[status]}
              orders={grouped[status]}
              cardDescribedById={dragInstructionsId}
            />
          ))}
        </div>
        <DragOverlay>
          {activeOrder ? (
            <div className="w-80 rotate-1 opacity-90">
              <POCard order={activeOrder} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default ReplenishmentBoard;
