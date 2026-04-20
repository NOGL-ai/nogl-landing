/**
 * Seed ~40 demo alerts for the Calumet tenant.
 * Run: npm run seed:alerts-demo
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CALUMET_COMPANY_ID = "cmnw4qqo10000ltccgauemneu";

const CFO_TYPES = [
  "STOCKOUT_IMMINENT",
  "LOW_INVENTORY",
  "REORDER_POINT_HIT",
  "OVERSTOCK",
  "STOCKOUT_ACTIVE",
  "LEAD_TIME_BREACH",
  "SUPPLIER_DELAY",
] as const;

const CMO_TYPES = [
  "PRICE_DROP",
  "PRICE_INCREASE",
  "COMPETITOR_NEW_PRODUCT",
  "COMPETITOR_STOCKOUT",
  "PROMO_START",
  "PROMO_END",
  "AD_CREATIVE_CHANGE",
  "NEWSLETTER_RECEIVED",
] as const;

const SEVERITIES = ["HOT", "HOT", "WARM", "WARM", "WARM", "WARM", "COLD", "COLD", "COLD"] as const;
const STATUSES = ["OPEN", "OPEN", "OPEN", "OPEN", "OPEN", "OPEN", "OPEN", "OPEN", "SNOOZED", "RESOLVED"] as const;

const PRODUCTS = [
  { title: "Classic Crew 10-Pack", sku: "CC10P-BLK", imageUrl: null },
  { title: "Black & Charcoal Active V-Neck 2-Pack", sku: "BCAVN2-M", imageUrl: null },
  { title: "Classic Crew 5-Pack", sku: "CC5P-WHT", imageUrl: null },
  { title: "Classic Polo 4-Pack", sku: "CP4P-NVY", imageUrl: null },
  { title: "Navy Waffle Long Sleeve Co.", sku: "NWLSC-L", imageUrl: null },
  { title: "Active Tank Top 3-Pack", sku: "ATT3P-GRY", imageUrl: null },
  { title: "Sport Hoodie 2-Pack", sku: "SH2P-BLK", imageUrl: null },
  { title: "Compression Shorts 4-Pack", sku: "CS4P-BLK", imageUrl: null },
  { title: "Performance Tee 6-Pack", sku: "PT6P-WHT", imageUrl: null },
  { title: "Merino Wool Crew Neck", sku: "MWCN-L-BLK", imageUrl: null },
  { title: "Bamboo Blend T-Shirt 3-Pack", sku: "BBT3P-GRN", imageUrl: null },
  { title: "Stretch Chino 2-Pack", sku: "SC2P-KHK", imageUrl: null },
  { title: "UV Protection Polo", sku: "UVPP-M-WHT", imageUrl: null },
  { title: "Thermal Undershirt Set", sku: "TUS-M-GRY", imageUrl: null },
];

const COMPETITORS = [
  { id: "foto-erhardt", name: "Foto Erhardt" },
  { id: "fotokoch", name: "Fotokoch" },
  { id: "amazon-de", name: "Amazon DE" },
  { id: "mediamarkt", name: "MediaMarkt" },
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function seedCfoAlerts() {
  const alerts = [];

  for (let i = 0; i < 15; i++) {
    const type = pick(CFO_TYPES);
    const severity = pick(SEVERITIES);
    const status = pick(STATUSES);
    const product = pick(PRODUCTS);
    const stockUnits = randBetween(50, 12000);
    const reorderPoint = randBetween(500, 2000);
    const daysUntilStockout = type === "STOCKOUT_IMMINENT" ? randBetween(1, 14) : undefined;

    let title = "";
    switch (type) {
      case "STOCKOUT_IMMINENT": title = `Stockout in ${daysUntilStockout}d`; break;
      case "STOCKOUT_ACTIVE": title = "Stockout active"; break;
      case "LOW_INVENTORY": title = `${stockUnits.toLocaleString()} units — low`; break;
      case "REORDER_POINT_HIT": title = "Reorder point reached"; break;
      case "OVERSTOCK": title = `${stockUnits.toLocaleString()} units — overstock`; break;
      case "LEAD_TIME_BREACH": title = "Lead time exceeded"; break;
      case "SUPPLIER_DELAY": title = "Supplier delay reported"; break;
    }

    alerts.push({
      companyId: CALUMET_COMPANY_ID,
      audience: "CFO" as const,
      type,
      severity,
      status,
      title,
      description: `${product.title} inventory requires attention.`,
      estimatedImpact: randBetween(500, 25000),
      impactCurrency: "EUR",
      impactWindowDays: 180,
      metadata: {
        productTitle: product.title,
        sku: product.sku,
        stockUnits,
        reorderPoint,
        daysUntilStockout,
        supplierLeadDays: randBetween(7, 45),
        contextSnippet: `Supplier lead time ${randBetween(7, 45)}d, reorder by ${new Date(Date.now() + randBetween(3, 30) * 86400000).toLocaleDateString("en-GB")}`,
        reorderBy: new Date(Date.now() + randBetween(3, 30) * 86400000).toISOString(),
      },
      triggeredAt: daysAgo(randBetween(0, 14)),
    });
  }

  for (const alert of alerts) {
    await prisma.alert.create({ data: alert as any });
  }

  console.log(`✅ Seeded ${alerts.length} CFO alerts`);
}

async function seedCmoAlerts() {
  const alerts = [];

  for (let i = 0; i < 25; i++) {
    const type = pick(CMO_TYPES);
    const severity = pick(SEVERITIES);
    const status = pick(STATUSES);
    const product = pick(PRODUCTS);
    const competitor = pick(COMPETITORS);
    const myPrice = randBetween(29, 299);
    const priceDeltaPct = randBetween(-25, 25);
    const competitorPrice = Math.round(myPrice * (1 + priceDeltaPct / 100));

    let title = "";
    switch (type) {
      case "PRICE_DROP": title = `Price dropped ${Math.abs(priceDeltaPct)}%`; break;
      case "PRICE_INCREASE": title = `Price increased ${priceDeltaPct}%`; break;
      case "COMPETITOR_NEW_PRODUCT": title = "New variant launched"; break;
      case "COMPETITOR_STOCKOUT": title = `${competitor.name} out of stock`; break;
      case "PROMO_START": title = `Promo started at ${competitor.name}`; break;
      case "PROMO_END": title = `Promo ended at ${competitor.name}`; break;
      case "AD_CREATIVE_CHANGE": title = "Ad creative updated"; break;
      case "NEWSLETTER_RECEIVED": title = `Newsletter from ${competitor.name}`; break;
    }

    alerts.push({
      companyId: CALUMET_COMPANY_ID,
      audience: "CMO" as const,
      type,
      severity,
      status,
      title,
      description: `${competitor.name} activity detected for ${product.title}.`,
      subjectCompetitorId: competitor.id,
      estimatedImpact: randBetween(500, 25000),
      impactCurrency: "EUR",
      impactWindowDays: 180,
      metadata: {
        productTitle: product.title,
        sku: product.sku,
        myPrice,
        competitorPrice,
        priceDeltaPct,
        competitorName: competitor.name,
        contextSnippet: `${competitor.name} ${type === "PRICE_DROP" ? "dropped price" : "updated"} — 2nd time this week`,
      },
      triggeredAt: daysAgo(randBetween(0, 14)),
    });
  }

  for (const alert of alerts) {
    await prisma.alert.create({ data: alert as any });
  }

  console.log(`✅ Seeded ${alerts.length} CMO alerts`);
}

async function main() {
  console.log("🌱 Seeding demo alerts for Calumet…");
  await seedCfoAlerts();
  await seedCmoAlerts();
  console.log("🎉 Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
