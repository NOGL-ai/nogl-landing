/* eslint-disable no-console */
/**
 * Generate ForecastHistoricalSale rows for each variant × channel × day.
 * Returns a trail30Map keyed by `${variantId}:${channelId}` → avg daily qty
 * over the last 30 days (used by generate-quantiles as the demand prior).
 */

import { type PrismaClient } from "@prisma/client";
import type { VariantContext } from "./build-catalog";
import {
  dayStart,
  addDays,
  dateKey,
  gaussianRand,
  poissonSample,
  sinusoidalFactor,
  germanEventFactor,
  weekdayFactor,
  CHANNEL_DISCOUNT_FACTOR,
  CATEGORY_WEIGHT,
} from "./math-helpers";

const BATCH_SIZE = 5000;

export interface ChannelContext {
  id: string;
  name: string;
  weight: number;
}

interface HistoricalSaleRow {
  variantId: string;
  channelId: string;
  saleDate: Date;
  quantity: number;
  revenue: number;
  isStockout: boolean;
}

// ─── Hero story overlays ──────────────────────────────────────────────────────

function heroOverlay(
  story: string | undefined,
  launchDate: string | undefined,
  date: Date,
): number {
  if (!story) return 1.0;
  const key = dateKey(date);

  if (story === "launch_hero" && launchDate) {
    const launch = new Date(launchDate + "T00:00:00Z");
    const daysAfter = (date.getTime() - launch.getTime()) / (1000 * 60 * 60 * 24);
    if (daysAfter >= 0 && daysAfter <= 14) return 2.5; // launch spike
    if (daysAfter < 0) return 0.05; // pre-launch, almost nothing
  }

  if (story === "christmas_spike") {
    const month = date.getUTCMonth(); // 0-indexed
    const day = date.getUTCDate();
    if (month === 11 && day >= 1 && day <= 24) return 2.0;
  }

  if (story === "high_volume_low_aov") return 1.3;
  if (story === "commodity_volume") return 1.1;
  if (story === "lens_companion") return 0.9;

  return 1.0;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function generateHistory(
  prisma: PrismaClient,
  variants: VariantContext[],
  channels: ChannelContext[],
  options: { historyDays: number },
): Promise<Map<string, number>> {
  const { historyDays } = options;
  const today = dayStart(new Date());

  console.log(
    `[gen-history] Generating ${historyDays} days history for ` +
      `${variants.length} variants × ${channels.length} channels…`,
  );

  // trail30Map: variantId:channelId → sum of last 30 days qty
  const trail30Map = new Map<string, number>();
  // AR(1) state: last lambda per (variantId, channelId)
  const arState = new Map<string, number>();

  let totalInserted = 0;
  let batchBuffer: HistoricalSaleRow[] = [];

  async function flushBatch(): Promise<void> {
    if (batchBuffer.length === 0) return;
    await prisma.forecastHistoricalSale.createMany({
      data: batchBuffer,
      skipDuplicates: true,
    });
    totalInserted += batchBuffer.length;
    batchBuffer = [];
  }

  for (const vc of variants) {
    const catWeight = CATEGORY_WEIGHT[vc.category] ?? 0.8;
    const heroBoost = vc.isHero ? 1.5 : 1.0;

    // ── Variant-level daily demand baseline (channel-independent) ──────────
    // amazonPurchasedLastMonth is a monthly total across all channels.
    // Dividing by 30 gives the aggregate daily rate for this variant.
    // Channel weight then allocates that total across channels so the
    // resulting proportions match CALUMET_CHANNEL_WEIGHTS.
    const amazonPrior = (vc.amazonPurchasedLastMonth ?? 30) / 30;
    const variantLambdaBase = amazonPrior * catWeight * heroBoost;

    // Compute the total weighted denominator once per variant so that
    // prefBoost adjustments are normalised and channel weights remain dominant.
    // prefBoost nudges preferred channels by +20% of their base weight rather
    // than a raw 1.4× multiplier that competes with chWeight magnitude.
    const totalWeightedSum = channels.reduce((sum, c) => {
      const nudge = vc.preferredChannels?.includes(c.name) ? 0.20 * c.weight : 0;
      return sum + c.weight + nudge;
    }, 0);

    for (const ch of channels) {
      const discountFactor = CHANNEL_DISCOUNT_FACTOR[ch.name] ?? 0.90;
      const arKey = `${vc.variantId}:${ch.id}`;

      // Normalised channel weight: dominant factor for cross-channel distribution.
      // prefBoost adds a small nudge (+20% of ch.weight) without swamping the base weight.
      const prefNudge = vc.preferredChannels?.includes(ch.name) ? 0.20 * ch.weight : 0;
      const normalisedChWeight = (ch.weight + prefNudge) / totalWeightedSum;

      const last30Qtys: number[] = [];

      for (let offset = historyDays; offset >= 1; offset--) {
        const date = addDays(today, -offset);

        // ── Base lambda (daily demand rate) ────────────────────────────────
        // normalisedChWeight ensures proportions approximate CALUMET_CHANNEL_WEIGHTS.
        const lambdaBase = variantLambdaBase * normalisedChWeight;

        // ── Seasonal and event adjustments ─────────────────────────────────
        const seasonal = sinusoidalFactor(date);
        const event = germanEventFactor(date, vc.category, ch.name);
        const weekday = weekdayFactor(date, ch.name);
        const story = heroOverlay(vc.story, vc.launchDate, date);

        // ── AR(1) smoothing ────────────────────────────────────────────────
        const targetLambda = lambdaBase * seasonal * event * weekday * story;
        const prevLambda = arState.get(arKey) ?? targetLambda;
        let lambda = 0.7 * prevLambda + 0.3 * targetLambda;

        // ── Gaussian noise ────────────────────────────────────────────────
        lambda *= 1 + gaussianRand(0, 0.08);
        lambda = Math.max(0.05, lambda);

        arState.set(arKey, lambda);

        // ── Sample quantity ────────────────────────────────────────────────
        const quantity = poissonSample(lambda);

        // Track last 30 days for trail
        if (offset <= 30) {
          last30Qtys.push(quantity);
        }

        // Skip zero rows that aren't in stockout windows (stockout injection
        // happens separately in inject-stockouts.ts)
        if (quantity === 0) continue;

        const revenue = vc.rrpEur * quantity * discountFactor;

        batchBuffer.push({
          variantId: vc.variantId,
          channelId: ch.id,
          saleDate: date,
          quantity,
          revenue,
          isStockout: false,
        });

        if (batchBuffer.length >= BATCH_SIZE) {
          await flushBatch();
        }
      }

      // Store trail30 average
      const avg30 =
        last30Qtys.length > 0
          ? last30Qtys.reduce((a, b) => a + b, 0) / last30Qtys.length
          : 0.1;
      trail30Map.set(arKey, avg30);
    }
  }

  // Flush remainder
  await flushBatch();

  console.log(`[gen-history] Inserted ${totalInserted} historical sale rows`);
  return trail30Map;
}
