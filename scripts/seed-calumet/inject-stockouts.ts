/* eslint-disable no-console */
/**
 * Inject stockout markers into ForecastHistoricalSale rows.
 *
 * Two flavours:
 *  1. Hero OOS — mandatory, based on hero.oosWindow
 *  2. Random bursty — ~7% of non-hero variants get a random stockout window
 */

import { type PrismaClient } from "@prisma/client";
import type { VariantContext } from "./build-catalog";
import type { ChannelContext } from "./generate-history";
import { addDays, dayStart } from "./math-helpers";

export interface StockoutResult {
  stockoutRowCount: number;
  restockSpikeCount: number;
}

export async function injectStockouts(
  prisma: PrismaClient,
  variants: VariantContext[],
  channels: ChannelContext[],
): Promise<StockoutResult> {
  const today = dayStart(new Date());
  let stockoutRowCount = 0;
  let restockSpikeCount = 0;

  // ── 1. Hero OOS windows ───────────────────────────────────────────────────
  const heroOosVariants = variants.filter(
    (v) => v.story === "oos_hero" && v.oosWindow,
  );

  for (const vc of heroOosVariants) {
    const window = vc.oosWindow!;
    const oosStart = new Date(window.start + "T00:00:00Z");
    const oosEnd = new Date(window.end + "T00:00:00Z");
    const restockEnd = addDays(oosEnd, 5);

    // Determine which channels this hero prefers (stockout applies to all channels)
    const heroChannels = channels.filter((ch) =>
      vc.preferredChannels?.includes(ch.name) ?? true,
    );

    for (const ch of heroChannels) {
      // Mark OOS period
      const result = await prisma.forecastHistoricalSale.updateMany({
        where: {
          variantId: vc.variantId,
          channelId: ch.id,
          saleDate: { gte: oosStart, lte: oosEnd },
        },
        data: { isStockout: true, quantity: 0, revenue: 0 },
      });
      stockoutRowCount += result.count;

      // Also insert zero-quantity stockout rows for days that may not exist
      // (because generate-history skips zero-qty rows). We need records present
      // to mark them as stockouts for the chart.
      const daysInWindow =
        Math.round(
          (oosEnd.getTime() - oosStart.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;

      const oosRows: Array<{
        variantId: string;
        channelId: string;
        saleDate: Date;
        quantity: number;
        revenue: number;
        isStockout: boolean;
      }> = [];

      for (let d = 0; d < daysInWindow; d++) {
        const date = addDays(oosStart, d);
        if (date > today) break;
        oosRows.push({
          variantId: vc.variantId,
          channelId: ch.id,
          saleDate: date,
          quantity: 0,
          revenue: 0,
          isStockout: true,
        });
      }

      if (oosRows.length > 0) {
        // Use createMany with skipDuplicates to handle days already inserted
        // by generate-history, then updateMany to ensure isStockout=true on all
        await prisma.forecastHistoricalSale.createMany({
          data: oosRows,
          skipDuplicates: true,
        });
        // Re-mark after insert (in case existing rows had isStockout=false)
        const upd = await prisma.forecastHistoricalSale.updateMany({
          where: {
            variantId: vc.variantId,
            channelId: ch.id,
            saleDate: { gte: oosStart, lte: oosEnd },
          },
          data: { isStockout: true, quantity: 0, revenue: 0 },
        });
        stockoutRowCount += upd.count;
      }

      // Restock spike: boost the 5 days after OOS ends
      const restockStart = addDays(oosEnd, 1);
      for (let d = 0; d < 5; d++) {
        const date = addDays(restockStart, d);
        if (date > today) break;
        // Multiply existing quantity by 1.5
        const existing = await prisma.forecastHistoricalSale.findUnique({
          where: {
            variantId_channelId_saleDate: {
              variantId: vc.variantId,
              channelId: ch.id,
              saleDate: date,
            },
          },
        });
        if (existing) {
          await prisma.forecastHistoricalSale.update({
            where: { id: existing.id },
            data: {
              quantity: existing.quantity * 1.5,
              revenue: existing.revenue * 1.5,
            },
          });
          restockSpikeCount++;
        }
      }
    }
  }

  console.log(
    `[inject-stockouts] Hero OOS: ${stockoutRowCount} rows marked, ${restockSpikeCount} restock spikes`,
  );

  // ── 2. Random bursty stockouts (~7% of non-hero variants) ────────────────
  const nonHeroVariants = variants.filter((v) => !v.isHero);
  const affectedCount = Math.round(nonHeroVariants.length * 0.07);
  // Deterministic shuffle using index-based selection to avoid full shuffle on large array
  const step = Math.max(1, Math.floor(nonHeroVariants.length / affectedCount));
  const affected = nonHeroVariants.filter((_, i) => i % step === 0).slice(0, affectedCount);

  let randomStockoutRows = 0;
  let randomRestockSpikes = 0;

  for (const vc of affected) {
    // Random channel (pick first channel for simplicity, varies by variant index)
    const chIdx = Math.abs(vc.variantId.charCodeAt(0) + vc.variantId.charCodeAt(1)) % channels.length;
    const ch = channels[chIdx];
    if (!ch) continue;

    // Random start date in last 365 days
    const startOffset = Math.floor(Math.random() * 360) + 1;
    const oosStart = new Date();
    oosStart.setUTCHours(0, 0, 0, 0);
    oosStart.setUTCDate(oosStart.getUTCDate() - startOffset);

    // Duration: Geometric(p=0.20) clamped to [3, 14]
    let duration = 0;
    const p = 0.20;
    for (let i = 0; i < 100; i++) {
      duration++;
      if (Math.random() < p) break;
    }
    duration = Math.max(3, Math.min(14, duration));

    const oosEnd = addDays(oosStart, duration - 1);
    if (oosEnd > today) continue;

    // Mark OOS
    const upd = await prisma.forecastHistoricalSale.updateMany({
      where: {
        variantId: vc.variantId,
        channelId: ch.id,
        saleDate: { gte: oosStart, lte: oosEnd },
      },
      data: { isStockout: true, quantity: 0, revenue: 0 },
    });
    randomStockoutRows += upd.count;

    // 3-day restock spike at ×1.4
    const restockStart = addDays(oosEnd, 1);
    for (let d = 0; d < 3; d++) {
      const date = addDays(restockStart, d);
      if (date > today) break;
      const existing = await prisma.forecastHistoricalSale.findUnique({
        where: {
          variantId_channelId_saleDate: {
            variantId: vc.variantId,
            channelId: ch.id,
            saleDate: date,
          },
        },
      });
      if (existing) {
        await prisma.forecastHistoricalSale.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity * 1.4,
            revenue: existing.revenue * 1.4,
          },
        });
        randomRestockSpikes++;
      }
    }
  }

  console.log(
    `[inject-stockouts] Random OOS: ${randomStockoutRows} rows marked, ` +
      `${randomRestockSpikes} restock spikes (${affected.length} variants)`,
  );

  return {
    stockoutRowCount: stockoutRowCount + randomStockoutRows,
    restockSpikeCount: restockSpikeCount + randomRestockSpikes,
  };
}
