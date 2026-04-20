/* eslint-disable no-console */
/**
 * Seed script: Calumet Photographic forecast annotations.
 *
 * Inserts ~12 realistic forecast annotations (event spikes, promotions,
 * stock-outs, launches) for the Calumet tenant. Spans the last 18 months and
 * the next 60 days, covering seasonal and retail pulses relevant to a German
 * photo retailer.
 *
 * Idempotent: deletes any existing annotation with the same
 * (tenantId, annotationDate, title) before re-inserting. This keeps the seed
 * safe to re-run as the annotation set evolves.
 *
 * Usage:
 *   npm run seed:calumet-annotations
 */

import { PrismaClient } from "@prisma/client";

const CALUMET_COMPANY_ID = "cmnw4qqo10000ltccgauemneu";

type AnnotationSeed = {
  annotationDate: Date;
  endDate: Date | null;
  kind: "event_spike" | "out_of_stock" | "promotion" | "launch";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string | null;
  delta: number | null;
  channelName: string | null;
  variantId: string | null;
};

const prisma = new PrismaClient();

function day(year: number, month: number, date: number): Date {
  // month is 1-indexed for readability
  return new Date(Date.UTC(year, month - 1, date));
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

async function main() {
  console.log("[seed:annotations] Resolving Calumet tenant…");
  const tenant = await prisma.forecastTenant.findUnique({
    where: { companyId: CALUMET_COMPANY_ID },
  });
  if (!tenant) {
    console.error(
      `[seed:annotations] No ForecastTenant found for companyId=${CALUMET_COMPANY_ID}. ` +
        "Run seed:calumet-forecast first."
    );
    process.exit(1);
  }
  console.log(`[seed:annotations] Tenant: ${tenant.id}`);

  // Pick three arbitrary variants for the out-of-stock annotations.
  const stockVariants = await prisma.forecastVariant.findMany({
    take: 3,
    where: {
      product: { tenantId: tenant.id },
      isActive: true,
    },
    select: { id: true, variantTitle: true },
  });

  if (stockVariants.length < 3) {
    console.warn(
      `[seed:annotations] Only found ${stockVariants.length} variants. ` +
        "Out-of-stock annotations will use what's available (no variantId for missing slots)."
    );
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const nextYear = year + 1;
  const lastYear = year - 1;

  const seeds: AnnotationSeed[] = [
    // ── Event spikes (annual trade / retail pulses) ──────────────────────────
    {
      annotationDate: day(lastYear, 9, 23),
      endDate: day(lastYear, 9, 28),
      kind: "event_spike",
      severity: "warning",
      title: "Photokina pulse",
      description:
        "Historical trade-show demand pulse — Cologne. Treated as an annual September peak even post-2022.",
      delta: 0.22,
      channelName: null,
      variantId: null,
    },
    {
      annotationDate: day(lastYear, 11, 25),
      endDate: day(lastYear, 11, 29),
      kind: "event_spike",
      severity: "critical",
      title: "Black Friday week",
      description: "Four-day discount sprint across web + marketplace.",
      delta: 0.68,
      channelName: "web",
      variantId: null,
    },
    {
      annotationDate: day(year, 2, 22),
      endDate: day(year, 2, 25),
      kind: "event_spike",
      severity: "warning",
      title: "CP+ Yokohama influence",
      description:
        "Tokyo camera show drives demand for newly announced bodies/lenses in EU stock.",
      delta: 0.18,
      channelName: null,
      variantId: null,
    },
    {
      annotationDate: day(lastYear, 12, 20),
      endDate: day(lastYear, 12, 24),
      kind: "event_spike",
      severity: "critical",
      title: "Weihnachten rush",
      description: "Pre-Christmas shipping cutoff drives last-minute orders.",
      delta: 0.54,
      channelName: "web",
      variantId: null,
    },
    {
      annotationDate: day(year, 4, 1),
      endDate: day(year, 4, 8),
      kind: "event_spike",
      severity: "warning",
      title: "Ostern week",
      description: "Easter week closure softens B2B, boosts consumer web demand.",
      delta: 0.16,
      channelName: null,
      variantId: null,
    },

    // ── Promotions ───────────────────────────────────────────────────────────
    {
      annotationDate: day(year, 7, 15),
      endDate: day(year, 8, 15),
      kind: "promotion",
      severity: "info",
      title: "Summer Sale",
      description: "Seasonal markdown across accessories and tripods.",
      delta: 0.12,
      channelName: "web",
      variantId: null,
    },
    {
      annotationDate: day(year, 9, 10),
      endDate: day(year, 9, 20),
      kind: "promotion",
      severity: "info",
      title: "Calumet Days",
      description: "Annual in-store + online campaign week.",
      delta: 0.28,
      channelName: null,
      variantId: null,
    },
    {
      annotationDate: day(year, 8, 20),
      endDate: day(year, 9, 5),
      kind: "promotion",
      severity: "info",
      title: "Back to School",
      description: "Student + educator discount on entry cameras and bags.",
      delta: 0.09,
      channelName: "web",
      variantId: null,
    },

    // ── Out of stock (critical, ranged) ──────────────────────────────────────
    {
      annotationDate: day(lastYear, 11, 28),
      endDate: day(lastYear, 12, 6),
      kind: "out_of_stock",
      severity: "critical",
      title: "Stockout — Sony A7 IV body",
      description:
        "Black Friday demand exceeded DE warehouse buffer. 8-day gap before replenishment.",
      delta: null,
      channelName: "web",
      variantId: stockVariants[0]?.id ?? null,
    },
    {
      annotationDate: day(year, 2, 12),
      endDate: day(year, 2, 19),
      kind: "out_of_stock",
      severity: "critical",
      title: "Stockout — Canon RF 24-70 f/2.8",
      description: "Supplier backorder during CP+ announcement window.",
      delta: null,
      channelName: "marketplace",
      variantId: stockVariants[1]?.id ?? null,
    },
    {
      annotationDate: day(year, 5, 3),
      endDate: day(year, 5, 10),
      kind: "out_of_stock",
      severity: "critical",
      title: "Stockout — Manfrotto 055 tripod",
      description: "Shipping delay ex-Italy affected weekly restock cycle.",
      delta: null,
      channelName: null,
      variantId: stockVariants[2]?.id ?? null,
    },

    // ── Launch (forward-looking, info) ───────────────────────────────────────
    {
      annotationDate: addDays(now, 14),
      endDate: addDays(now, 28),
      kind: "launch",
      severity: "info",
      title: "Nikon Z9 restock",
      description:
        "Replenishment of flagship body; expect elevated demand through launch window.",
      delta: 0.35,
      channelName: "web",
      variantId: null,
    },
  ];

  // Future-dated trade event next year, so the calendar always has at least
  // one upcoming event regardless of when the seed is run.
  seeds.push({
    annotationDate: day(nextYear, 9, 22),
    endDate: day(nextYear, 9, 27),
    kind: "event_spike",
    severity: "warning",
    title: "Photokina pulse (upcoming)",
    description:
      "Projected September trade-show demand pulse — Cologne. Treated as an annual peak.",
    delta: 0.22,
    channelName: null,
    variantId: null,
  });

  console.log(`[seed:annotations] Upserting ${seeds.length} annotations…`);

  let inserted = 0;
  for (const s of seeds) {
    // Idempotency: delete prior copies matching the natural key, then insert.
    await prisma.forecastAnnotation.deleteMany({
      where: {
        tenantId: tenant.id,
        annotationDate: s.annotationDate,
        title: s.title,
      },
    });
    await prisma.forecastAnnotation.create({
      data: {
        tenantId: tenant.id,
        annotationDate: s.annotationDate,
        endDate: s.endDate,
        kind: s.kind,
        severity: s.severity,
        title: s.title,
        description: s.description,
        delta: s.delta,
        channelName: s.channelName,
        variantId: s.variantId,
      },
    });
    inserted += 1;
  }

  console.log(`[seed:annotations] Done. Inserted/refreshed ${inserted} annotations.`);
}

main()
  .catch((err) => {
    console.error("[seed:annotations] Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
