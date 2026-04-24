import "server-only";

/**
 * Product Trends data layer.
 *
 * Reads from the `market_intelligence` ArangoDB database (CT 211).
 * If `ARANGO_URL` + `ARANGO_PASSWORD` are not configured (or the DB is
 * unreachable, or `arangojs` isn't installed yet), returns deterministic
 * mock data so the dashboard still renders in dev / demo environments.
 *
 * Used by both:
 *   - /api/trends/products            (REST endpoint)
 *   - <ProductTrendsView />           (server component, direct call)
 */

export interface ProductTrendRow {
  key: string;
  title: string;
  brand: string | null;
  category: string | null;
  shopCount: number;
  image: string | null;
  lastSeen: string | null;
}

export interface PriceHistoryPoint {
  ts: string;
  avgPrice: number;
}

export interface BrandSpark {
  brand: string;
  series: number[];
}

export interface ProductTrendsPayload {
  totalProducts: number;
  topByShopCount: ProductTrendRow[];
  priceHistory: PriceHistoryPoint[];
  brandSparklines: BrandSpark[];
  source: "arangodb" | "mock";
  error?: string;
}

const MOCK: ProductTrendsPayload = {
  totalProducts: 149408,
  source: "mock",
  topByShopCount: [
    { key: "sony-a7iv", title: "Sony Alpha 7 IV", brand: "Sony", category: "cameras", shopCount: 14, image: null, lastSeen: null },
    { key: "canon-r6ii", title: "Canon EOS R6 Mark II", brand: "Canon", category: "cameras", shopCount: 13, image: null, lastSeen: null },
    { key: "nikon-z8", title: "Nikon Z 8", brand: "Nikon", category: "cameras", shopCount: 12, image: null, lastSeen: null },
    { key: "fuji-xt5", title: "Fujifilm X-T5", brand: "Fujifilm", category: "cameras", shopCount: 11, image: null, lastSeen: null },
    { key: "sony-2470gm2", title: "Sony FE 24-70mm f/2.8 GM II", brand: "Sony", category: "lenses", shopCount: 10, image: null, lastSeen: null },
    { key: "canon-rf2470", title: "Canon RF 24-70mm f/2.8 L IS USM", brand: "Canon", category: "lenses", shopCount: 9, image: null, lastSeen: null },
    { key: "sigma-24-70", title: "Sigma 24-70mm f/2.8 DG DN Art", brand: "Sigma", category: "lenses", shopCount: 9, image: null, lastSeen: null },
    { key: "tamron-28-75", title: "Tamron 28-75mm f/2.8 Di III VXD G2", brand: "Tamron", category: "lenses", shopCount: 8, image: null, lastSeen: null },
    { key: "panasonic-s5iix", title: "Panasonic Lumix S5 IIX", brand: "Panasonic", category: "cameras", shopCount: 7, image: null, lastSeen: null },
    { key: "leica-q3", title: "Leica Q3", brand: "Leica", category: "cameras", shopCount: 6, image: null, lastSeen: null },
  ],
  priceHistory: Array.from({ length: 12 }).map((_, i) => ({
    ts: new Date(Date.now() - (11 - i) * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    avgPrice: 1899 + Math.round(Math.sin(i / 2) * 120) + i * 4,
  })),
  brandSparklines: [
    { brand: "Sony", series: [1850, 1890, 1920, 1905, 1875, 1860, 1840, 1830] },
    { brand: "Canon", series: [1995, 1980, 1970, 1960, 1975, 1985, 1970, 1950] },
    { brand: "Nikon", series: [2100, 2080, 2070, 2060, 2050, 2030, 2020, 2010] },
    { brand: "Fujifilm", series: [1720, 1735, 1750, 1760, 1745, 1730, 1720, 1705] },
  ],
};

export async function getProductTrends(): Promise<ProductTrendsPayload> {
  const url = process.env.ARANGO_URL;
  const password = process.env.ARANGO_PASSWORD;
  const dbName = process.env.ARANGO_DB ?? "market_intelligence";
  const user = process.env.ARANGO_USER ?? "root";

  if (!url || !password) {
    return { ...MOCK, error: "ARANGO_URL or ARANGO_PASSWORD not set" };
  }

  // Lazy import so the dependency stays optional at build time.
  // If arangojs isn't installed (yet) we still serve the mock.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let Database: any;
  try {
    ({ Database } = await import("arangojs"));
  } catch {
    return { ...MOCK, error: "arangojs not installed — run `npm i arangojs`" };
  }

  try {
    const db = new Database({ url, databaseName: dbName });
    db.useBasicAuth(user, password);

    // 1. Top products by shop coverage
    const topCursor = await db.query(`
      FOR p IN products
        LET shop_count = LENGTH(FOR v IN 1..1 OUTBOUND p._id sold_by RETURN 1)
        FILTER shop_count > 0
        SORT shop_count DESC, p.last_seen_at DESC
        LIMIT 10
        RETURN {
          key: p._key,
          title: p.title,
          brand: p.brand,
          category: p.category_label,
          shopCount: shop_count,
          image: p.image_url,
          lastSeen: p.last_seen_at
        }
    `);
    const topByShopCount = (await topCursor.all()) as ProductTrendRow[];

    // 2. Total product count
    const countCursor = await db.query(`RETURN LENGTH(products)`);
    const totalProducts = ((await countCursor.next()) as number) ?? 0;

    // 3. Price history (avg price per day across historical_snapshots)
    const histCursor = await db.query(`
      FOR s IN historical_snapshots
        FILTER s.price != null AND s.capture_timestamp != null
        COLLECT day = SUBSTRING(s.capture_timestamp, 0, 10)
        AGGREGATE avgPrice = AVG(s.price)
        SORT day ASC
        RETURN { ts: day, avgPrice: avgPrice }
    `);
    const priceHistoryRaw = (await histCursor.all()) as PriceHistoryPoint[];
    // Stub with mock if we have fewer than 3 real snapshots
    const priceHistory =
      priceHistoryRaw.length >= 3 ? priceHistoryRaw : MOCK.priceHistory;

    // 4. Brand sparklines — recent price series per brand
    const sparkCursor = await db.query(`
      FOR p IN products
        FILTER p.brand != null AND p.price != null
        COLLECT brand = p.brand INTO prices = p.price
        LET series = (
          FOR pr IN prices
            LIMIT 8
            RETURN pr
        )
        FILTER LENGTH(series) >= 3
        SORT LENGTH(prices) DESC
        LIMIT 6
        RETURN { brand: brand, series: series }
    `);
    const brandSparklines = (await sparkCursor.all()) as BrandSpark[];

    return {
      totalProducts,
      topByShopCount,
      priceHistory,
      brandSparklines:
        brandSparklines.length > 0 ? brandSparklines : MOCK.brandSparklines,
      source: "arangodb",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ...MOCK, error: `ArangoDB query failed: ${msg}` };
  }
}
