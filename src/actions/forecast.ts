"use server";

/**
 * Server actions for the /en/demand forecast page.
 * All reads are scoped to a single ForecastTenant (resolved via companyId);
 * all responses go through an LRU cache keyed by companyId + params.
 */

import { addDays, format, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { z } from "zod";

import { prisma } from "@/lib/prismaDb";
import { isAuthorized } from "@/lib/isAuthorized";
import { forecastCacheGet, forecastCacheKey, forecastCacheSet } from "@/lib/forecast/cache";
import {
  DEFAULT_QUANTILE,
  DEFAULT_SCALE,
  FORECAST_CHANNEL_NAMES,
  FORECAST_HORIZON_DAYS,
  FORECAST_HISTORY_DAYS,
  FORECAST_QUANTILES,
  type ForecastChannelName,
  type ForecastQuantile,
  type ForecastScale,
} from "@/config/forecast";

// ─── Input validation ────────────────────────────────────────────────────

const dateOrString = z.union([z.date(), z.string()]).transform((v) => new Date(v));

const salesParamsSchema = z.object({
  companyId: z.string().min(1),
  startDate: dateOrString.optional(),
  endDate: dateOrString.optional(),
  channels: z
    .array(z.enum(["web", "marketplace", "b2b", "shopify", "amazon", "offline"]))
    .optional(),
  categories: z.array(z.string()).optional(),
  variantIds: z.array(z.string()).optional(),
  quantile: z.union([z.literal(3), z.literal(4), z.literal(5)]).optional(),
  scale: z.enum(["daily", "weekly", "monthly"]).optional(),
});

export type ForecastSalesParams = z.input<typeof salesParamsSchema>;

// ─── DTO types returned to the client ────────────────────────────────────

export interface ForecastSeriesPoint {
  date: string; // YYYY-MM-DD
  real_value: number | null;
  forecast_value: number | null;
  quantile: ForecastQuantile;
}

export type ForecastChannelsMap = Partial<Record<ForecastChannelName, ForecastSeriesPoint[]>>;

export interface ForecastResponse {
  startForecastDate: string;
  channels: ForecastChannelsMap;
  metric: "sale" | "revenue";
}

export interface ForecastCategoryDTO {
  category: string;
  variants: Array<{ id: string; title: string; sku: string }>;
}

export interface ForecastSummaryDTO {
  totalProducts: number;
  avgRrp: number;
  channels: number;
  historyPoints: number;
  forecastPoints: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

async function requireUser() {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");
  return user;
}

async function resolveTenantId(companyId: string): Promise<string | null> {
  const tenant = await prisma.forecastTenant.findUnique({
    where: { companyId },
    select: { id: true },
  });
  return tenant?.id ?? null;
}

function dateKey(date: Date, scale: ForecastScale): string {
  switch (scale) {
    case "weekly":
      return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
    case "monthly":
      return format(startOfMonth(date), "yyyy-MM-dd");
    case "daily":
    default:
      return format(startOfDay(date), "yyyy-MM-dd");
  }
}

function emptyChannelsMap(): ForecastChannelsMap {
  return FORECAST_CHANNEL_NAMES.reduce<ForecastChannelsMap>((acc, name) => {
    acc[name] = [];
    return acc;
  }, {});
}

function normalizeRange(params: {
  startDate?: Date;
  endDate?: Date;
}): { startDate: Date; endDate: Date; today: Date } {
  const today = startOfDay(new Date());
  const startDate = params.startDate ?? addDays(today, -FORECAST_HISTORY_DAYS);
  const endDate = params.endDate ?? addDays(today, FORECAST_HORIZON_DAYS);
  return { startDate, endDate, today };
}

// ─── Public API: categories ──────────────────────────────────────────────

export async function getForecastCategories(companyId: string): Promise<ForecastCategoryDTO[]> {
  await requireUser();
  const cacheKey = forecastCacheKey("categories", companyId);
  const cached = forecastCacheGet<ForecastCategoryDTO[]>(cacheKey);
  if (cached) return cached;

  const tenantId = await resolveTenantId(companyId);
  if (!tenantId) return [];

  const products = await prisma.forecastProduct.findMany({
    where: { tenantId },
    select: {
      category: true,
      variants: {
        where: { isActive: true },
        select: { id: true, variantTitle: true, sku: true },
      },
    },
    orderBy: [{ category: "asc" }, { productTitle: "asc" }],
  });

  const map = new Map<string, ForecastCategoryDTO>();
  for (const p of products as Array<{ category: string; variants: Array<{ id: string; variantTitle: string; sku: string }> }>) {
    const bucket: ForecastCategoryDTO =
      map.get(p.category) ?? { category: p.category, variants: [] };
    for (const v of p.variants) {
      bucket.variants.push({ id: v.id, title: v.variantTitle, sku: v.sku });
    }
    map.set(p.category, bucket);
  }
  const result = Array.from(map.values());
  forecastCacheSet(cacheKey, result);
  return result;
}

// ─── Public API: summary KPIs ────────────────────────────────────────────

export async function getForecastSummary(companyId: string): Promise<ForecastSummaryDTO> {
  await requireUser();
  const cacheKey = forecastCacheKey("summary", companyId);
  const cached = forecastCacheGet<ForecastSummaryDTO>(cacheKey);
  if (cached) return cached;

  const tenantId = await resolveTenantId(companyId);
  if (!tenantId) {
    const empty: ForecastSummaryDTO = {
      totalProducts: 0,
      avgRrp: 0,
      channels: 0,
      historyPoints: 0,
      forecastPoints: 0,
    };
    forecastCacheSet(cacheKey, empty);
    return empty;
  }

  const [products, variants, channels, historyPoints, forecastPoints] = await Promise.all([
    prisma.forecastProduct.count({ where: { tenantId } }),
    prisma.forecastVariant.findMany({
      where: { product: { tenantId }, isActive: true },
      select: { rrp: true },
    }),
    prisma.forecastSaleChannel.count({ where: { tenantId } }),
    prisma.forecastHistoricalSale.count({ where: { variant: { product: { tenantId } } } }),
    prisma.forecastQuantile.count({ where: { variant: { product: { tenantId } } } }),
  ]);

  const variantList = variants as Array<{ rrp: unknown }>;
  const avgRrp = variantList.length
    ? variantList.reduce((s: number, v) => s + Number(v.rrp), 0) / variantList.length
    : 0;

  const result: ForecastSummaryDTO = {
    totalProducts: products,
    avgRrp: Math.round(avgRrp * 100) / 100,
    channels,
    historyPoints,
    forecastPoints,
  };
  forecastCacheSet(cacheKey, result);
  return result;
}

// ─── Public API: sales + revenue timeseries ──────────────────────────────

async function getForecastTimeseries(
  rawParams: ForecastSalesParams,
  metric: "sale" | "revenue",
): Promise<ForecastResponse> {
  await requireUser();
  const parsed = salesParamsSchema.parse(rawParams);
  const { startDate, endDate, today } = normalizeRange(parsed);
  const scale: ForecastScale = parsed.scale ?? DEFAULT_SCALE;
  const quantile: ForecastQuantile = (parsed.quantile ?? DEFAULT_QUANTILE) as ForecastQuantile;
  if (!FORECAST_QUANTILES.includes(quantile)) {
    throw new Error(`Invalid quantile: ${quantile}`);
  }

  const cacheKey = forecastCacheKey(`timeseries:${metric}`, parsed.companyId, {
    startDate,
    endDate,
    channels: parsed.channels,
    categories: parsed.categories,
    variantIds: parsed.variantIds,
    quantile,
    scale,
  });
  const cached = forecastCacheGet<ForecastResponse>(cacheKey);
  if (cached) return cached;

  const tenantId = await resolveTenantId(parsed.companyId);
  if (!tenantId) {
    const empty: ForecastResponse = {
      startForecastDate: format(today, "yyyy-MM-dd"),
      channels: {},
      metric,
    };
    forecastCacheSet(cacheKey, empty);
    return empty;
  }

  // Build variant filter
  const variantWhere: Record<string, unknown> = { product: { tenantId } };
  if (parsed.categories?.length) {
    variantWhere.product = { tenantId, category: { in: parsed.categories } };
  }
  if (parsed.variantIds?.length) variantWhere.id = { in: parsed.variantIds };

  const channelFilter = parsed.channels?.length
    ? { name: { in: parsed.channels } }
    : undefined;

  const channels = (await prisma.forecastSaleChannel.findMany({
    where: { tenantId, ...(channelFilter ?? {}) },
    select: { id: true, name: true },
  })) as Array<{ id: string; name: string }>;
  if (!channels.length) {
    const empty: ForecastResponse = {
      startForecastDate: format(today, "yyyy-MM-dd"),
      channels: {},
      metric,
    };
    forecastCacheSet(cacheKey, empty);
    return empty;
  }
  const channelById = new Map(channels.map((c) => [c.id, c.name as ForecastChannelName]));
  const channelIds = channels.map((c) => c.id);

  const [historical, forecast] = await Promise.all([
    prisma.forecastHistoricalSale.findMany({
      where: {
        variant: variantWhere,
        channelId: { in: channelIds },
        saleDate: { gte: startDate, lte: endDate },
        isStockout: false,
      },
      select: { channelId: true, saleDate: true, quantity: true, revenue: true },
    }),
    prisma.forecastQuantile.findMany({
      where: {
        variant: variantWhere,
        channelId: { in: channelIds },
        forecastDate: { gte: startDate, lte: endDate },
        quantile,
      },
      select: {
        channelId: true,
        forecastDate: true,
        forecastValue: true,
        revenueValue: true,
      },
    }),
  ]);

  // Bucket by channel × dateKey
  type Bucket = { real: number; forecast: number };
  const buckets = new Map<string, Bucket>();
  const keyOf = (channelId: string, d: Date) => `${channelId}|${dateKey(d, scale)}`;

  for (const h of historical) {
    const k = keyOf(h.channelId, h.saleDate);
    const b = buckets.get(k) ?? { real: 0, forecast: 0 };
    b.real += metric === "sale" ? h.quantity : Number(h.revenue);
    buckets.set(k, b);
  }
  for (const q of forecast) {
    const k = keyOf(q.channelId, q.forecastDate);
    const b = buckets.get(k) ?? { real: 0, forecast: 0 };
    b.forecast += metric === "sale" ? q.forecastValue : Number(q.revenueValue);
    buckets.set(k, b);
  }

  // Assemble response: for each channel, sorted date series with null for the
  // opposite side of the `today` divider so client charts can draw the ribbon.
  const out: ForecastChannelsMap = emptyChannelsMap();
  const todayKey = dateKey(today, scale);

  // Group keys back into channel-scoped lists
  const byChannel = new Map<string, Array<{ date: string; real: number; forecast: number }>>();
  for (const [key, b] of buckets) {
    const [channelId, date] = key.split("|");
    const list = byChannel.get(channelId) ?? [];
    list.push({ date, real: b.real, forecast: b.forecast });
    byChannel.set(channelId, list);
  }

  for (const [channelId, list] of byChannel) {
    const name = channelById.get(channelId);
    if (!name) continue;
    list.sort((a, b) => a.date.localeCompare(b.date));
    out[name] = list.map<ForecastSeriesPoint>((p) => ({
      date: p.date,
      real_value: p.date <= todayKey && p.real > 0 ? round(p.real) : null,
      forecast_value: p.date >= todayKey && p.forecast > 0 ? round(p.forecast) : null,
      quantile,
    }));
  }

  // Filter out channels with no points at all
  for (const key of Object.keys(out) as ForecastChannelName[]) {
    if (!out[key]?.length) delete out[key];
  }

  const result: ForecastResponse = {
    startForecastDate: todayKey,
    channels: out,
    metric,
  };
  forecastCacheSet(cacheKey, result);
  return result;
}

export async function getForecastSales(params: ForecastSalesParams): Promise<ForecastResponse> {
  return getForecastTimeseries(params, "sale");
}

export async function getForecastRevenue(params: ForecastSalesParams): Promise<ForecastResponse> {
  return getForecastTimeseries(params, "revenue");
}

// ─── Public API: CSV export rows ─────────────────────────────────────────

export interface ForecastExportRow {
  date: string;
  category: string;
  product: string;
  channel: ForecastChannelName;
  real_value: number | null;
  forecast_value: number | null;
}

export async function exportForecastData(
  params: ForecastSalesParams,
): Promise<ForecastExportRow[]> {
  await requireUser();
  const parsed = salesParamsSchema.parse(params);
  const { startDate, endDate } = normalizeRange(parsed);
  const tenantId = await resolveTenantId(parsed.companyId);
  if (!tenantId) return [];
  const quantile = (parsed.quantile ?? DEFAULT_QUANTILE) as ForecastQuantile;

  const [historical, forecast] = await Promise.all([
    prisma.forecastHistoricalSale.findMany({
      where: {
        variant: { product: { tenantId } },
        saleDate: { gte: startDate, lte: endDate },
        isStockout: false,
      },
      select: {
        saleDate: true,
        quantity: true,
        channel: { select: { name: true } },
        variant: {
          select: { product: { select: { productTitle: true, category: true } } },
        },
      },
    }),
    prisma.forecastQuantile.findMany({
      where: {
        variant: { product: { tenantId } },
        forecastDate: { gte: startDate, lte: endDate },
        quantile,
      },
      select: {
        forecastDate: true,
        forecastValue: true,
        channel: { select: { name: true } },
        variant: {
          select: { product: { select: { productTitle: true, category: true } } },
        },
      },
    }),
  ]);

  const rows: ForecastExportRow[] = [];
  for (const h of historical) {
    rows.push({
      date: format(h.saleDate, "yyyy-MM-dd"),
      category: h.variant.product.category,
      product: h.variant.product.productTitle,
      channel: h.channel.name as ForecastChannelName,
      real_value: h.quantity,
      forecast_value: null,
    });
  }
  for (const q of forecast) {
    rows.push({
      date: format(q.forecastDate, "yyyy-MM-dd"),
      category: q.variant.product.category,
      product: q.variant.product.productTitle,
      channel: q.channel.name as ForecastChannelName,
      real_value: null,
      forecast_value: round(q.forecastValue),
    });
  }
  return rows;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Public API: annotations ─────────────────────────────────────────────

export interface ForecastAnnotationDTO {
  id: string;
  annotationDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  kind: string;
  severity: string;
  title: string;
  description: string | null;
  delta: number | null;
  channelName: string | null;
  variantId: string | null;
}

export async function getForecastAnnotations(params: {
  companyId: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<ForecastAnnotationDTO[]> {
  await requireUser();

  const tenantId = await resolveTenantId(params.companyId);
  if (!tenantId) return [];

  const where: Record<string, unknown> = { tenantId };
  if (params.startDate || params.endDate) {
    const dateFilter: Record<string, unknown> = {};
    if (params.startDate) dateFilter.gte = params.startDate;
    if (params.endDate) dateFilter.lte = params.endDate;
    where.annotationDate = dateFilter;
  }

  const rows = await prisma.forecastAnnotation.findMany({
    where,
    orderBy: { annotationDate: "asc" },
    select: {
      id: true,
      annotationDate: true,
      endDate: true,
      kind: true,
      severity: true,
      title: true,
      description: true,
      delta: true,
      channelName: true,
      variantId: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    annotationDate: format(r.annotationDate, "yyyy-MM-dd"),
    endDate: r.endDate ? format(r.endDate, "yyyy-MM-dd") : null,
    kind: r.kind,
    severity: r.severity,
    title: r.title,
    description: r.description ?? null,
    delta: r.delta ?? null,
    channelName: r.channelName ?? null,
    variantId: r.variantId ?? null,
  }));
}
