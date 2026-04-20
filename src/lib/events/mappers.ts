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
