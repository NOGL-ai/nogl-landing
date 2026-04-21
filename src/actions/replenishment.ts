"use server";

import { format, startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PO_STATUSES,
  type PurchaseOrderStatus,
} from "@/config/replenishment";
import type {
  PurchaseOrder,
  PurchaseOrderLine,
  Supplier,
} from "@/types/replenishment";

// ── Auth ─────────────────────────────────────────────────────────────────────

async function assertAuth() {
  // Matches src/actions/forecast.ts — getAuthSession respects dev bypass.
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isKnownStatus(value: string): value is PurchaseOrderStatus {
  return (PO_STATUSES as readonly string[]).includes(value);
}

function deriveIsLate(eta: Date | null, status: PurchaseOrderStatus): boolean {
  if (!eta) return false;
  if (status === "arrived" || status === "cancelled") return false;
  return eta.getTime() < startOfDay(new Date()).getTime();
}

type PORow = {
  id: string;
  poNumber: string;
  supplierId: string | null;
  status: string;
  totalAmount: number;
  currency: string;
  eta: Date | null;
  approvedAt: Date | null;
  arrivedAt: Date | null;
  notes: string | null;
  supplier: { name: string } | null;
  lineItems: {
    id: string;
    variantId: string;
    quantity: number;
    unitCost: number;
    arrivedQty: number;
    variant: {
      variantTitle: string;
      sku: string | null;
      product: { productTitle: string };
    };
  }[];
};

function mapPurchaseOrder(row: PORow, includeLineItems: boolean): PurchaseOrder {
  const status: PurchaseOrderStatus = isKnownStatus(row.status)
    ? row.status
    : "draft";

  const lineItems: PurchaseOrderLine[] | undefined = includeLineItems
    ? row.lineItems.map((l) => ({
        id: l.id,
        variantId: l.variantId,
        variantTitle: `${l.variant.product.productTitle} — ${l.variant.variantTitle}`,
        sku: l.variant.sku,
        quantity: l.quantity,
        unitCost: l.unitCost,
        arrivedQty: l.arrivedQty,
      }))
    : undefined;

  return {
    id: row.id,
    poNumber: row.poNumber,
    supplierId: row.supplierId,
    supplierName: row.supplier?.name ?? null,
    status,
    totalAmount: row.totalAmount,
    currency: row.currency,
    eta: row.eta ? format(row.eta, "yyyy-MM-dd") : null,
    approvedAt: row.approvedAt ? row.approvedAt.toISOString() : null,
    arrivedAt: row.arrivedAt ? row.arrivedAt.toISOString() : null,
    notes: row.notes,
    lineCount: row.lineItems.length,
    lineItems,
    isLate: deriveIsLate(row.eta, status),
  };
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function listPurchaseOrders(params: {
  companyId: string;
  supplierId?: string;
  variantId?: string;
  includeLineItems?: boolean;
}): Promise<PurchaseOrder[]> {
  await assertAuth();

  const tenant = await prisma.forecastTenant.findUnique({
    where: { companyId: params.companyId },
  });
  if (!tenant) return [];

  const rows = await prisma.replenishmentPurchaseOrder.findMany({
    where: {
      tenantId: tenant.id,
      ...(params.supplierId ? { supplierId: params.supplierId } : {}),
      ...(params.variantId
        ? { lineItems: { some: { variantId: params.variantId } } }
        : {}),
    },
    include: {
      supplier: { select: { name: true } },
      lineItems: {
        include: {
          variant: {
            select: {
              variantTitle: true,
              sku: true,
              product: { select: { productTitle: true } },
            },
          },
        },
      },
    },
    orderBy: [{ eta: "asc" }, { poNumber: "asc" }],
  });

  const includeLineItems = params.includeLineItems === true;
  return rows.map((r: PORow) => mapPurchaseOrder(r, includeLineItems));
}

export async function listSuppliers(companyId: string): Promise<Supplier[]> {
  await assertAuth();

  const tenant = await prisma.forecastTenant.findUnique({
    where: { companyId },
  });
  if (!tenant) return [];

  const rows = await prisma.replenishmentSupplier.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
  });

  return rows.map((s: {
    id: string;
    name: string;
    city: string | null;
    country: string;
    leadTimeDays: number;
    paymentTerms: string | null;
    isActive: boolean;
  }): Supplier => ({
    id: s.id,
    name: s.name,
    city: s.city,
    country: s.country,
    leadTimeDays: s.leadTimeDays,
    paymentTerms: s.paymentTerms,
    isActive: s.isActive,
  }));
}

export async function listVariants(
  companyId: string
): Promise<{ id: string; title: string; sku: string | null }[]> {
  await assertAuth();

  const tenant = await prisma.forecastTenant.findUnique({
    where: { companyId },
  });
  if (!tenant) return [];

  const variants = await prisma.forecastVariant.findMany({
    where: { product: { tenantId: tenant.id }, isActive: true },
    select: {
      id: true,
      variantTitle: true,
      sku: true,
      product: { select: { productTitle: true } },
    },
    orderBy: [{ product: { productTitle: "asc" } }, { variantTitle: "asc" }],
  });

  return variants.map((v: {
    id: string;
    variantTitle: string;
    sku: string | null;
    product: { productTitle: string };
  }) => ({
    id: v.id,
    title: `${v.product.productTitle} — ${v.variantTitle}`,
    sku: v.sku,
  }));
}

// ── Mutations ────────────────────────────────────────────────────────────────

export async function updatePurchaseOrderStatus(params: {
  companyId: string;
  purchaseOrderId: string;
  status: PurchaseOrderStatus;
}): Promise<{ ok: true }> {
  await assertAuth();

  if (!isKnownStatus(params.status)) {
    throw new Error(`Unknown status: ${String(params.status)}`);
  }

  const tenant = await prisma.forecastTenant.findUnique({
    where: { companyId: params.companyId },
  });
  if (!tenant) throw new Error("Tenant not found");

  // Verify PO belongs to this tenant before mutating.
  const existing = await prisma.replenishmentPurchaseOrder.findFirst({
    where: { id: params.purchaseOrderId, tenantId: tenant.id },
    select: { id: true, approvedAt: true },
  });
  if (!existing) throw new Error("Purchase order not found");

  const now = new Date();

  const data: {
    status: PurchaseOrderStatus;
    approvedAt?: Date;
    arrivedAt?: Date | null;
  } = { status: params.status };

  if (params.status === "approved" && !existing.approvedAt) {
    data.approvedAt = now;
  }
  if (params.status === "arrived") {
    data.arrivedAt = now;
  }

  await prisma.$transaction(async (tx: any) => {
    await tx.replenishmentPurchaseOrder.update({
      where: { id: params.purchaseOrderId },
      data,
    });

    if (params.status === "arrived") {
      // Bring every line to fully-arrived so arrivedQty === quantity.
      const lines = await tx.replenishmentPOLine.findMany({
        where: { purchaseOrderId: params.purchaseOrderId },
        select: { id: true, quantity: true },
      });
      for (const line of lines) {
        await tx.replenishmentPOLine.update({
          where: { id: line.id },
          data: { arrivedQty: line.quantity },
        });
      }
    }
  });

  revalidatePath("/replenishment");
  return { ok: true };
}
