/* eslint-disable no-console */
/**
 * Seed script: Calumet Photographic — Replenishment pipeline.
 *
 * - Upserts the DACH camera/photo supplier catalogue (unique by [tenantId, name]).
 * - Generates ~28 purchase orders spread across draft / approved / partially_arrived
 *   / arrived / cancelled with plausible ETAs, amounts, and 2-5 line items each.
 * - Idempotent: keyed on [tenantId, poNumber]; line items are deleted and re-created
 *   so re-running the seed converges on the same state.
 *
 * Usage:
 *   npm run seed:calumet-replenishment
 */

import { PrismaClient } from "@prisma/client";
import { DACH_SUPPLIERS } from "../src/config/replenishment";

const CALUMET_COMPANY_ID = "cmnw4qqo10000ltccgauemneu";

const prisma = new PrismaClient();

type SeedStatus =
  | "draft"
  | "approved"
  | "partially_arrived"
  | "arrived"
  | "cancelled";

interface PlannedOrder {
  poNumber: string;
  status: SeedStatus;
  etaOffsetDays: number; // negative = in the past, positive = in the future
  supplierIndex: number | null; // null = "Supplier TBD"
  lineCount: number;
}

// Deterministic pseudo-random helpers so the dataset is stable across runs.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function addDaysUtc(base: Date, days: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

async function ensureTenant(): Promise<{ id: string }> {
  const existing = await prisma.forecastTenant.findUnique({
    where: { companyId: CALUMET_COMPANY_ID },
  });
  if (existing) return { id: existing.id };

  console.log(
    `[seed:replenishment] No ForecastTenant for ${CALUMET_COMPANY_ID}; creating one.`
  );
  const created = await prisma.forecastTenant.create({
    data: { companyId: CALUMET_COMPANY_ID },
  });
  return { id: created.id };
}

async function ensureSuppliers(tenantId: string): Promise<string[]> {
  const ids: string[] = [];
  for (const s of DACH_SUPPLIERS) {
    const row = await prisma.replenishmentSupplier.upsert({
      where: { tenantId_name: { tenantId, name: s.name } },
      update: {
        city: s.city,
        country: s.country,
        leadTimeDays: s.leadTimeDays,
        paymentTerms: s.paymentTerms,
        isActive: true,
      },
      create: {
        tenantId,
        name: s.name,
        city: s.city,
        country: s.country,
        leadTimeDays: s.leadTimeDays,
        paymentTerms: s.paymentTerms,
        isActive: true,
      },
      select: { id: true },
    });
    ids.push(row.id);
  }
  return ids;
}

async function ensureVariants(
  tenantId: string
): Promise<{ id: string; rrp: number }[]> {
  const existing = await prisma.forecastVariant.findMany({
    where: { product: { tenantId } },
    take: 40,
    select: { id: true, rrp: true },
    orderBy: { createdAt: "asc" },
  });
  if (existing.length > 0) return existing;

  console.log(
    "[seed:replenishment] No variants for tenant; creating a small synthetic catalogue."
  );

  const synthetic: { title: string; category: string; variants: { title: string; sku: string; rrp: number }[] }[] = [
    {
      title: "Sony Alpha 7 IV",
      category: "camera",
      variants: [{ title: "Body only", sku: "SONY-A7IV-BODY", rrp: 2599 }],
    },
    {
      title: "Canon RF 24-70mm f/2.8",
      category: "lens",
      variants: [{ title: "Lens kit", sku: "CANON-RF-2470-28", rrp: 2399 }],
    },
    {
      title: "Manfrotto 055 tripod",
      category: "tripod",
      variants: [
        { title: "Aluminium", sku: "MANFR-055-ALU", rrp: 249 },
        { title: "Carbon", sku: "MANFR-055-CF", rrp: 499 },
      ],
    },
  ];

  const out: { id: string; rrp: number }[] = [];
  for (const p of synthetic) {
    const product = await prisma.forecastProduct.create({
      data: {
        tenantId,
        productTitle: p.title,
        category: p.category,
      },
    });
    for (const v of p.variants) {
      const created = await prisma.forecastVariant.create({
        data: {
          productId: product.id,
          variantTitle: v.title,
          sku: v.sku,
          rrp: v.rrp,
        },
      });
      out.push({ id: created.id, rrp: created.rrp });
    }
  }
  return out;
}

function buildPlan(): PlannedOrder[] {
  // 6 draft, 8 approved, 4 partially_arrived (≥2 late), 8 arrived, 2 cancelled = 28
  const plan: PlannedOrder[] = [];

  const push = (
    n: number,
    status: SeedStatus,
    etaFor: (i: number) => number,
    supplierFor: (i: number) => number | null,
    lineCountFor: (i: number) => number
  ) => {
    for (let i = 0; i < n; i++) {
      const idx = plan.length + 1;
      plan.push({
        poNumber: `PO-2024.${String(idx).padStart(2, "0")}`,
        status,
        etaOffsetDays: etaFor(i),
        supplierIndex: supplierFor(i),
        lineCount: lineCountFor(i),
      });
    }
  };

  // draft — 1..4 weeks out
  push(
    6,
    "draft",
    (i) => 7 + i * 5, // 7, 12, 17, 22, 27, 32
    (i) => (i === 0 ? null : i), // one TBD
    (i) => 2 + (i % 4)
  );
  // approved — 1..3 weeks out
  push(
    8,
    "approved",
    (i) => 5 + i * 3, // 5..26
    (i) => (i === 0 ? null : i + 4),
    (i) => 2 + (i % 4)
  );
  // partially_arrived — ETA in the past for at least 2
  push(
    4,
    "partially_arrived",
    (i) => [-10, -4, 2, 6][i] ?? -3, // i=0,1 are late
    (i) => i + 12, // none TBD
    () => 3
  );
  // arrived — ETA in the past
  push(
    8,
    "arrived",
    (i) => -(5 + i * 4), // -5..-33
    (i) => (i === 0 ? null : i + 16),
    (i) => 2 + (i % 4)
  );
  // cancelled
  push(
    2,
    "cancelled",
    (i) => (i === 0 ? -2 : 10),
    (i) => i + 22,
    () => 2
  );

  return plan;
}

async function main() {
  console.log("[seed:replenishment] Starting…");
  const tenant = await ensureTenant();
  console.log(`[seed:replenishment] Tenant: ${tenant.id}`);

  const supplierIds = await ensureSuppliers(tenant.id);
  console.log(`[seed:replenishment] Suppliers upserted: ${supplierIds.length}`);

  const variants = await ensureVariants(tenant.id);
  if (variants.length === 0) {
    throw new Error(
      "No variants available even after synthetic fallback — aborting."
    );
  }
  console.log(`[seed:replenishment] Variant pool: ${variants.length}`);

  const plan = buildPlan();
  const today = startOfUtcDay(new Date());
  const rand = mulberry32(0x10a11e7); // deterministic

  let totalLines = 0;
  let poCount = 0;

  for (const order of plan) {
    const eta = addDaysUtc(today, order.etaOffsetDays);
    const supplierId =
      order.supplierIndex === null
        ? null
        : supplierIds[order.supplierIndex % supplierIds.length];

    // Build line items.
    const lineCount = order.lineCount;
    const lines: {
      variantId: string;
      quantity: number;
      unitCost: number;
      arrivedQty: number;
    }[] = [];

    // Shuffle variant pool indices without duplicates for this PO.
    const variantOrder = [...variants]
      .map((v, i) => ({ v, key: rand() * 1000 + i }))
      .sort((a, b) => a.key - b.key)
      .map((x) => x.v);

    for (let i = 0; i < lineCount; i++) {
      const variant = variantOrder[i];
      if (!variant) break;
      const quantity = Math.max(10, Math.round(10 + rand() * 190));
      const costFactor = 0.45 + rand() * 0.2; // 0.45..0.65
      const unitCost = round2((variant.rrp || 50) * costFactor);

      let arrivedQty = 0;
      if (order.status === "arrived") {
        arrivedQty = quantity;
      } else if (order.status === "partially_arrived") {
        // 30-80% of quantity arrived.
        arrivedQty = Math.max(
          1,
          Math.round(quantity * (0.3 + rand() * 0.5))
        );
        if (arrivedQty >= quantity) arrivedQty = quantity - 1;
      }

      lines.push({
        variantId: variant.id,
        quantity,
        unitCost,
        arrivedQty,
      });
    }

    const totalAmount = round2(
      lines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0)
    );

    const approvedAt: Date | null =
      order.status === "approved" ||
      order.status === "partially_arrived" ||
      order.status === "arrived"
        ? addDaysUtc(today, Math.min(order.etaOffsetDays - 14, -1))
        : null;

    const arrivedAt: Date | null =
      order.status === "arrived" ? addDaysUtc(today, order.etaOffsetDays) : null;

    // Upsert PO by (tenantId, poNumber).
    const po = await prisma.replenishmentPurchaseOrder.upsert({
      where: {
        tenantId_poNumber: {
          tenantId: tenant.id,
          poNumber: order.poNumber,
        },
      },
      update: {
        supplierId,
        status: order.status,
        totalAmount,
        currency: "EUR",
        eta,
        approvedAt,
        arrivedAt,
      },
      create: {
        tenantId: tenant.id,
        poNumber: order.poNumber,
        supplierId,
        status: order.status,
        totalAmount,
        currency: "EUR",
        eta,
        approvedAt,
        arrivedAt,
      },
      select: { id: true },
    });

    // Reset and re-create line items for deterministic output.
    await prisma.replenishmentPOLine.deleteMany({
      where: { purchaseOrderId: po.id },
    });
    await prisma.replenishmentPOLine.createMany({
      data: lines.map((l) => ({
        purchaseOrderId: po.id,
        variantId: l.variantId,
        quantity: l.quantity,
        unitCost: l.unitCost,
        arrivedQty: l.arrivedQty,
      })),
    });

    totalLines += lines.length;
    poCount += 1;
  }

  console.info({
    suppliers: supplierIds.length,
    purchaseOrders: poCount,
    lineItems: totalLines,
  });
}

main()
  .catch((err) => {
    console.error("[seed:replenishment] Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
