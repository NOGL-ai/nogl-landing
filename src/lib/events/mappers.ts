import crypto from "crypto";
import { Prisma } from "@prisma/client";
import type { AdsEvent } from "./schema";
import type { AdsEventEnvelope } from "./envelope";

/**
 * Maps a validated AdsEvent into the shape Prisma createMany expects for
 * the ads_events.AdEvent table. account_id + creative_id resolution happens
 * in the worker (not here) so this stays pure.
 */
export function toAdEventRow(
  event: AdsEvent,
  envelope: AdsEventEnvelope,
  accountId: string,
  ingestionRunId: string,
  creativeId: string | null,
) {
  return {
    account_id: accountId,
    creative_id: creativeId,
    event_type: event.event_type,
    ts: new Date(event.ts),
    source: envelope.source,
    ingestion_run_id: ingestionRunId,
    idempotency_key: event.idempotency_key,
    payload: event.payload as Prisma.InputJsonValue,
    metrics: (event.metrics ?? Prisma.JsonNull) as Prisma.InputJsonValue | typeof Prisma.JsonNull,
  };
}

/** Returns upsert args for AdCreative, or null if the event type doesn't produce a creative. */
export function toAdCreativeUpsert(event: AdsEvent, accountId: string) {
  if (event.event_type !== "CREATIVE_SEEN" || event.platform !== "META_ADS_LIBRARY") return null;

  const payload = event.payload as {
    ad_archive_id: string;
    ad_text?: string;
    media_urls?: string[];
  };

  const hash =
    event.creative_hash ??
    crypto
      .createHash("sha256")
      .update(event.platform + ":" + payload.ad_archive_id)
      .digest("hex")
      .slice(0, 32);

  return {
    where: { creative_hash: hash },
    update: {
      last_seen_at: new Date(),
      caption: payload.ad_text ?? undefined,
      raw: payload as Prisma.InputJsonValue,
    },
    create: {
      account_id: accountId,
      platform: event.platform,
      external_creative_id: payload.ad_archive_id,
      creative_hash: hash,
      caption: payload.ad_text ?? null,
      media_url: payload.media_urls?.[0] ?? null,
      thumbnail_url: payload.media_urls?.[1] ?? null,
      raw: payload as Prisma.InputJsonValue,
    },
  };
}

export function toAdAccountUpsert(event: AdsEvent) {
  return {
    where: {
      platform_external_id: {
        platform: event.platform,
        external_id: event.external_account_id,
      },
    },
    update: {
      last_seen_at: new Date(),
      handle: event.handle ?? undefined,
    },
    create: {
      platform: event.platform,
      external_id: event.external_account_id,
      handle: event.handle ?? null,
      last_seen_at: new Date(),
    },
  };
}
