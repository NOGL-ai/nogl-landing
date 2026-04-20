import { z } from "zod";
import { adsEventSchema, MAX_EVENTS_PER_ENVELOPE, ScraperSource, SCHEMA_VERSION } from "./schema";

/**
 * Ingestion envelope posted to /api/ads-events/ingest.
 *
 * schema_version lets workers support N and N-1 via explicit branches;
 * anything older goes to DeadLetterEvent with SCHEMA_UNSUPPORTED.
 */
export const adsEventEnvelopeSchema = z.object({
  schema_version: z.number().int(),
  source: ScraperSource,
  producer: z.string().min(1).max(128),
  producer_version: z.string().min(1).max(32),
  run_id: z.string().min(1).max(128).optional(),
  events: z.array(adsEventSchema).min(1).max(MAX_EVENTS_PER_ENVELOPE),
});

export type AdsEventEnvelope = z.infer<typeof adsEventEnvelopeSchema>;

export const isSupportedSchemaVersion = (v: number): boolean => {
  return v === SCHEMA_VERSION || v === SCHEMA_VERSION - 1;
};

export { SCHEMA_VERSION, MAX_EVENTS_PER_ENVELOPE };
