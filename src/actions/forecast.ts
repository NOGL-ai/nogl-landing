"use server";

import { format, startOfWeek, startOfMonth } from "date-fns";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { forecastCacheGet, forecastCacheSet } from "@/lib/forecast-cache";
import type {
  ForecastSalesParams,
  ForecastResponse,
  ForecastChannelData,
  ForecastDataPoint,
  CategoryWithVariants,
  ExportParams,
  ForecastMetric,
} from "@/types/forecast";

async function assertAuth() {
  // getAuthSession respects the dev bypass in src/lib/auth.ts
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getForecastCategories(
  companyId: string
): Promise<CategoryWithVariants[]> {
  await assertAuth();

  const cacheKey = `${companyId}:categories`;
  const cached = await forecastCacheGet<CategoryWithVariants[]>(cacheKey);
  if (cached) return cached;

  const tenant = await prisma.forecastTenant.findUnique({ where: { companyId } });
  if (!tenant) return [];

  const products = await prisma.forecastProduct.findMany({
    where: { tenantId: tenant.id },
    include: {
      variants: {
        where: { isActive: true },
        select: { id: true, variantTitle: true, sku: true },
      },
    },
    orderBy: [{ category: "asc" }, { productTitle: "asc" }],
  });

  const grouped: Record<string, CategoryWithVariants> = {};
  for (const p of products) {
    if (!grouped[p.category]) {
      grouped[p.category] = {
        category: p.category,
        label: p.category.replace(/_/g, " "),
        variants: [],
      };
    }
    grouped[p.category].variants.push(
      ...p.variants.map((v: { id: string; variantTitle: string; sku: string | null }) => ({
        id: v.id,
        title: `${p.productTitle} — ${v.variantTitle}`,
        sku: v.sku,
      }))
    );
  }

  const result = Object.values(grouped);
  await forecastCacheSet(cacheKey, result);
  return result;
}

// ── Sales forecast ────────────────────────────────────────────────────────────

export async function getForecastSales(
  params: ForecastSalesParams
): Promise<ForecastResponse> {
  await assertAuth();
  return fetchForecastData(params, "sale");
}

export async function getForecastRevenue(
  params: ForecastSalesParams
): Promise<ForecastResponse> {
  await assertAuth();
  return fetchForecastData(params, "revenue");
}

// ── Export ────────────────────────────────────────────────────────────────────

export async function exportForecastData(params: ExportParams): Promise<object[]> {
  await assertAuth();

  const tenant = await prisma.forecastTenant.findUnique({
    where: { companyId: params.companyId },
    include: { saleChannels: true },
  });
  if (!tenant) throw new Error("Tenant not found");

  const startDate = new Date(params.start);
  const endDate = new Date(params.end);
  const variantFilter = await buildVariantFilter(tenant.id, params);

  const [historical, quantiles] = await Promise.all([
    prisma.forecastHistoricalSale.findMany({
      where: {
        variantId: { in: variantFilter },
        saleDate: { gte: startDate, lte: endDate },
      },
      include: {
        variant: {
          include: { product: { select: { productTitle: true, category: true } } },
        },
        channel: { select: { name: true } },
      },
    }),
    prisma.forecastQuantile.findMany({
      where: {
        variantId: { in: variantFilter },
        forecastDate: { gte: startDate, lte: endDate },
        quantile: params.quantile,
      },
      include: {
        variant: {
          include: { product: { select: { productTitle: true, category: true } } },
        },
        channel: { select: { name: true } },
      },
    }),
  ]);

  const rows: object[] = [];

  const historicalMap = new Map<string, number>();
  for (const h of historical) {
    const key = `${h.variantId}:${h.channelId}:${dateKey(h.saleDate, params.scale)}`;
    historicalMap.set(key, (historicalMap.get(key) ?? 0) + h.quantity);
  }
  const quantileMap = new Map<string, number>();
  for (const q of quantiles) {
    const key = `${q.variantId}:${q.channelId}:${dateKey(q.forecastDate, params.scale)}`;
    quantileMap.set(key, (quantileMap.get(key) ?? 0) + q.forecastValue);
  }

  const allKeys = new Set([...historicalMap.keys(), ...quantileMap.keys()]);
  for (const k of allKeys) {
    const [variantId, channelId, date] = k.split(":");
    const h = historical.find((x: { variantId: string; channelId: string }) => x.variantId === variantId && x.channelId === channelId);
    const q = quantiles.find((x: { variantId: string; channelId: string }) => x.variantId === variantId && x.channelId === channelId);
    const product = h?.variant.product ?? q?.variant.product;
    const channelName = h?.channel.name ?? q?.channel.name ?? "";

    rows.push({
      date,
      category: product?.category ?? "",
      product: product?.productTitle ?? variantId,
      channel: channelName,
      real_value: historicalMap.get(k) ?? null,
      forecast_value: quantileMap.get(k) ?? null,
    });
  }

  rows.sort((a: any, b: any) => a.date.localeCompare(b.date));
  return params.preview ? rows.slice(0, 5) : rows;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function fetchForecastData(
  params: ForecastSalesParams,
  metric: ForecastMetric
): Promise<ForecastResponse> {
  const cacheKey = `${params.companyId}:${metric}:${JSON.stringify(params)}`;
  const cached = await forecastCacheGet<ForecastResponse>(cacheKey);
  if (cached) return cached;

  const tenant = await prisma.forecastTenant.findUnique({
    where: { companyId: params.companyId },
    include: { saleChannels: true },
  });
  if (!tenant) throw new Error("Tenant not found");

  const channels = tenant.saleChannels.filter(
    (c: { id: string; name: string }) =>
      !params.channels || params.channels.includes(c.name as "web" | "marketplace" | "b2b")
  );

  const startDate = new Date(params.start);
  const endDate = new Date(params.end);
  const variantFilter = await buildVariantFilter(tenant.id, params);

  const [historical, quantiles] = await Promise.all([
    prisma.forecastHistoricalSale.findMany({
      where: {
        variantId: { in: variantFilter },
        saleDate: { gte: startDate, lte: endDate },
        channelId: { in: channels.map((c: { id: string }) => c.id) },
      },
    }),
    prisma.forecastQuantile.findMany({
      where: {
        variantId: { in: variantFilter },
        forecastDate: { gte: startDate, lte: endDate },
        channelId: { in: channels.map((c: { id: string }) => c.id) },
        quantile: params.quantile,
      },
    }),
  ]);

  const result = aggregateToChannelData({
    historical,
    quantiles,
    channels,
    scale: params.scale,
    magicNumber: tenant.magicNumber,
    metric,
  });

  await forecastCacheSet(cacheKey, result);
  return result;
}

async function buildVariantFilter(
  tenantId: string,
  params: Pick<ForecastSalesParams, "categories" | "variantIds" | "isSet" | "companyId" | "start" | "end" | "scale" | "quantile">
): Promise<string[]> {
  const products = await prisma.forecastProduct.findMany({
    where: {
      tenantId,
      ...(params.categories?.length ? { category: { in: params.categories } } : {}),
      ...(params.isSet !== undefined ? { isSet: params.isSet } : {}),
    },
    select: { variants: { select: { id: true } } },
  });
  const allVariants = products.flatMap(
    (p: { variants: { id: string }[] }) => p.variants.map((v: { id: string }) => v.id)
  );
  return params.variantIds?.length
    ? allVariants.filter((id: string) => params.variantIds!.includes(id))
    : allVariants;
}

function dateKey(date: Date, scale: ForecastSalesParams["scale"]): string {
  if (scale === "daily") return format(date, "yyyy-MM-dd");
  if (scale === "weekly") return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
  return format(startOfMonth(date), "yyyy-MM");
}

function aggregateToChannelData(opts: {
  historical: { variantId: string; channelId: string; saleDate: Date; quantity: number; revenue: number }[];
  quantiles: { variantId: string; channelId: string; forecastDate: Date; forecastValue: number; revenueValue: number }[];
  channels: { id: string; name: string }[];
  scale: ForecastSalesParams["scale"];
  magicNumber: number;
  metric: ForecastMetric;
}): ForecastResponse {
  const today = format(new Date(), "yyyy-MM-dd");

  // Build real-value map by channelId + dateKey → sum
  const realMap = new Map<string, number>();
  for (const h of opts.historical) {
    const dk = dateKey(h.saleDate, opts.scale);
    const k = `${h.channelId}::${dk}`;
    realMap.set(k, (realMap.get(k) ?? 0) + (opts.metric === "revenue" ? h.revenue : h.quantity));
  }

  // Build forecast-value map by channelId + dateKey → sum
  const forecastMap = new Map<string, number>();
  let minForecastDate: string | null = null;
  for (const q of opts.quantiles) {
    const dk = dateKey(q.forecastDate, opts.scale);
    const k = `${q.channelId}::${dk}`;
    forecastMap.set(
      k,
      (forecastMap.get(k) ?? 0) +
        (opts.metric === "revenue" ? q.revenueValue : q.forecastValue) * opts.magicNumber
    );
    if (!minForecastDate || dk < minForecastDate) minForecastDate = dk;
  }

  // Collect all unique date keys
  const allDates = new Set<string>();
  for (const k of realMap.keys()) allDates.add(k.split("::")[1]);
  for (const k of forecastMap.keys()) allDates.add(k.split("::")[1]);
  const sortedDates = Array.from(allDates).sort();

  const channels: ForecastChannelData = {};
  for (const ch of opts.channels) {
    channels[ch.name] = sortedDates.map((d): ForecastDataPoint => {
      const realKey = `${ch.id}::${d}`;
      const forecastKey = `${ch.id}::${d}`;
      const rv = realMap.get(realKey) ?? null;
      const fv = forecastMap.get(forecastKey) ?? null;
      const isFuture = d >= today;
      return {
        date: d,
        real_value: isFuture ? null : rv,
        forecast_value: isFuture || fv !== null ? round(fv ?? 0) : null,
        quantile: 4,
      };
    });
  }

  return {
    startForecastDate: minForecastDate ?? today,
    channels,
  };
}

function round(v: number): number {
  if (v < 10) return Math.round(v * 10) / 10;
  return Math.round(v);
}
