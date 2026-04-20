import { z } from "zod";

/**
 * Canonical ads-events schema (SSOT).
 *
 * Mirrors the field dictionary in the external Facebook-ads-meta-data repo.
 * When the dictionary changes, bump SCHEMA_VERSION and add a zod branch; do
 * not silently change existing fields.
 *
 * Payload objects use .passthrough() so unknown producer fields survive in the
 * AdEvent.payload JSON column — we never lose data just because the producer
 * is ahead of the consumer.
 */
export const SCHEMA_VERSION = 1 as const;
export const MAX_EVENTS_PER_ENVELOPE = 500 as const;

// ---------------------------------------------------------------------------
// Platform + event-type enums (keep in sync with prisma/schema.prisma)
// ---------------------------------------------------------------------------

export const AdsPlatform = z.enum([
  "META_ADS_LIBRARY",
  "INSTAGRAM",
  "TIKTOK",
  "FACEBOOK",
]);
export type AdsPlatform = z.infer<typeof AdsPlatform>;

export const AdsEventType = z.enum([
  "CREATIVE_SEEN",
  "CREATIVE_UPDATED",
  "POST_METRICS",
  "PROFILE_SNAPSHOT",
  "PLACEMENT_CHANGE",
]);
export type AdsEventType = z.infer<typeof AdsEventType>;

export const ScraperSource = z.enum([
  "FB_AD_ACTOR_V2",
  "IG_MONITOR",
  "TIKTOK_SCRAPER",
  "MANUAL",
]);
export type ScraperSource = z.infer<typeof ScraperSource>;

// ---------------------------------------------------------------------------
// Synthetic-metric tripwire
// ---------------------------------------------------------------------------
// The external facebook-ad-actor-full-v2 repo historically generated CTR/CVR/
// CPA via Math.random() and mixed them with real scrape output. We reject any
// event whose metrics are statistically impossible (CTR > 0.5 with < 100
// impressions) so fake data never reaches AdMetricDaily aggregation.

const METRICS_TRIPWIRE = (metrics: Record<string, unknown> | undefined) => {
  if (!metrics) return null;
  const ctr = Number(metrics.ctr ?? NaN);
  const impressions = Number(metrics.impressions ?? NaN);
  if (Number.isFinite(ctr) && Number.isFinite(impressions)) {
    if (ctr > 0.5 && impressions < 100) return "impossible_ctr_for_impressions";
  }
  const cvr = Number(metrics.cvr ?? NaN);
  if (Number.isFinite(cvr) && (cvr < 0 || cvr > 1)) return "cvr_out_of_range";
  return null;
};

export const metricsSchema = z
  .object({
    ctr: z.number().optional(),
    cvr: z.number().optional(),
    cpa: z.number().optional(),
    impressions: z.number().int().nonnegative().optional(),
    reach: z.number().int().nonnegative().optional(),
    likes: z.number().int().nonnegative().optional(),
    comments: z.number().int().nonnegative().optional(),
    shares: z.number().int().nonnegative().optional(),
    saves: z.number().int().nonnegative().optional(),
  })
  .passthrough()
  .superRefine((m, ctx) => {
    const reason = METRICS_TRIPWIRE(m as Record<string, unknown>);
    if (reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "synthetic-metric tripwire: " + reason,
        path: ["metrics"],
      });
    }
  });

// ---------------------------------------------------------------------------
// Per-event-type payload schemas
// ---------------------------------------------------------------------------

const baseEvent = z.object({
  // Idempotency key is produced by the source as sha256(source:external_id:ts)
  // and reused verbatim as the BullMQ jobId and the DB unique key.
  idempotency_key: z.string().min(16).max(128),
  ts: z.string().datetime({ offset: true }),
  external_account_id: z.string().min(1),
  handle: z.string().optional(),
  creative_hash: z.string().optional(),
  metrics: metricsSchema.optional(),
});

const metaAdsLibraryCreative = baseEvent.extend({
  kind: z.literal("meta.ads_library.creative_snapshot"),
  event_type: z.literal("CREATIVE_SEEN"),
  platform: z.literal("META_ADS_LIBRARY"),
  payload: z
    .object({
      ad_archive_id: z.string(),
      brand: z.string().optional(),
      ad_text: z.string().optional(),
      landing_url: z.string().url().optional(),
      media_urls: z.array(z.string().url()).optional(),
      captured_at: z.string().datetime({ offset: true }),
      region: z.string().optional(),
      selector_version: z.string(),
    })
    .passthrough(),
});

const igProfileSnapshot = baseEvent.extend({
  kind: z.literal("ig.profile.metrics_snapshot"),
  event_type: z.literal("PROFILE_SNAPSHOT"),
  platform: z.literal("INSTAGRAM"),
  payload: z
    .object({
      ig_user_id: z.string(),
      handle: z.string(),
      followers: z.number().int().nonnegative(),
      following: z.number().int().nonnegative(),
      posts_count: z.number().int().nonnegative(),
      captured_at: z.string().datetime({ offset: true }),
    })
    .passthrough(),
});

const igPostPublished = baseEvent.extend({
  kind: z.literal("ig.post.published"),
  event_type: z.literal("POST_METRICS"),
  platform: z.literal("INSTAGRAM"),
  payload: z
    .object({
      ig_post_id: z.string(),
      ig_user_id: z.string(),
      caption: z.string().optional(),
      media_type: z.string().optional(),
      permalink: z.string().url().optional(),
      published_at: z.string().datetime({ offset: true }),
      like_count: z.number().int().nonnegative().optional(),
      comment_count: z.number().int().nonnegative().optional(),
    })
    .passthrough(),
});

// Placeholder so TikTok producers can start sending events even before
// the scraper is built; zod validates the shape, worker is a no-op today.
const tiktokPlaceholder = baseEvent.extend({
  kind: z.literal("tiktok.ads_library.creative_snapshot"),
  event_type: z.literal("CREATIVE_SEEN"),
  platform: z.literal("TIKTOK"),
  payload: z
    .object({
      creative_external_id: z.string(),
      captured_at: z.string().datetime({ offset: true }),
      selector_version: z.string(),
    })
    .passthrough(),
});

export const adsEventSchema = z.discriminatedUnion("kind", [
  metaAdsLibraryCreative,
  igProfileSnapshot,
  igPostPublished,
  tiktokPlaceholder,
]);
export type AdsEvent = z.infer<typeof adsEventSchema>;
