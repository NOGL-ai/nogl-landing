/* eslint-disable no-console */
/**
 * Generate ForecastQuantile rows for each variant × channel × forward day × quantile.
 */

import { type PrismaClient } from "@prisma/client";
import type { VariantContext } from "./build-catalog";
import type { ChannelContext } from "./generate-history";
import {
  dayStart,
  addDays,
  gaussianRand,
  sinusoidalFactor,
  germanEventFactor,
  weekdayFactor,
  CHANNEL_DISCOUNT_FACTOR,
} from "./math-helpers";
import { QUANTILE_MULTIPLIERS } from "../../src/config/forecast";

const BATCH_SIZE = 5000;
const QUANTILES = [3, 4, 5] as const;

interface QuantileRow {
  variantId: string;
  channelId: string;
  forecastDate: Date;
  quantile: number;
  forecastValue: number;
  revenueValue: number;
  isBundleTotal: boolean;
}

/**
 * Hero-story spread overrides: OOS hero gets wider cone, commodity gets tighter.
 */
function heroSpreadMultiplier(
  story: string | undefined,
  quantile: 3 | 4 | 5,
): number {
  if (story === "oos_hero") {
    return quantile === 3 ? 0.5 : quantile === 5 ? 1.6 : 1.0;
  }
  if (story === "commodity_volume") {
    return quantile === 3 ? 0.85 : quantile === 5 ? 1.15 : 1.0;
  }
  if (story === "launch_hero") {
    return quantile === 3 ? 0.6 : quantile === 5 ? 1.5 : 1.0;
  }
  return QUANTILE_MULTIPLIERS[quantile];
}

export async function generateQuantiles(
  prisma: PrismaClient,
  variants: VariantContext[],
  channels: ChannelContext[],
  trail30: Map<string, number>,
  options: { horizonDays: number },
): Promise<void> {
  const { horizonDays } = options;
  const today = dayStart(new Date());

  console.log(
    `[gen-quantiles] Generating ${horizonDays} forward days for ` +
      `${variants.length} variants × ${channels.length} channels × 3 quantiles…`,
  );

  let totalInserted = 0;
  let batchBuffer: QuantileRow[] = [];

  async function flushBatch(): Promise<void> {
    if (batchBuffer.length === 0) return;
    await prisma.forecastQuantile.createMany({
      data: batchBuffer,
      skipDuplicates: true,
    });
    totalInserted += batchBuffer.length;
    batchBuffer = [];
  }

  for (const vc of variants) {
    for (const ch of channels) {
      const trailKey = `${vc.variantId}:${ch.id}`;
      const avg30 = trail30.get(trailKey) ?? 0.1;
      const discountFactor = CHANNEL_DISCOUNT_FACTOR[ch.name] ?? 0.90;

      // Preferred channel boost for forecast too
      const prefBoost = vc.preferredChannels?.includes(ch.name) ? 1.3 : 1.0;

      for (let d = 0; d < horizonDays; d++) {
        const forecastDate = addDays(today, d);

        const seasonal = sinusoidalFactor(forecastDate);
        const event = germanEventFactor(forecastDate, vc.category, ch.name);
        const weekday = weekdayFactor(forecastDate, ch.name);
        const noise = 1 + gaussianRand(0, 0.05);

        const p50Value = avg30 * seasonal * event * weekday * prefBoost * noise;

        for (const q of QUANTILES) {
          const multiplier = vc.isHero
            ? heroSpreadMultiplier(vc.story, q)
            : QUANTILE_MULTIPLIERS[q];

          const forecastValue = Math.max(0, p50Value * multiplier);
          const revenueValue = forecastValue * vc.rrpEur * discountFactor;

          batchBuffer.push({
            variantId: vc.variantId,
            channelId: ch.id,
            forecastDate,
            quantile: q,
            forecastValue: Math.round(forecastValue * 100) / 100,
            revenueValue: Math.round(revenueValue * 100) / 100,
            isBundleTotal: false,
          });
        }

        if (batchBuffer.length >= BATCH_SIZE) {
          await flushBatch();
        }
      }
    }
  }

  await flushBatch();
  console.log(`[gen-quantiles] Inserted ${totalInserted} quantile rows`);
}
