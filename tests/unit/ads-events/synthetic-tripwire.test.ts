import { adsEventSchema, adsEventEnvelopeSchema, SCHEMA_VERSION } from "@/lib/events";

const baseMetaEvent = {
  kind: "meta.ads_library.creative_snapshot",
  event_type: "CREATIVE_SEEN",
  platform: "META_ADS_LIBRARY",
  idempotency_key: "0000000000000000abcdef1234567890",
  ts: "2026-04-20T10:00:00Z",
  external_account_id: "fb_brand_123",
  payload: {
    ad_archive_id: "123",
    captured_at: "2026-04-20T10:00:00Z",
    selector_version: "v1.0.0",
  },
} as const;

describe("ads-events synthetic-metric tripwire", () => {
  it("accepts events without metrics", () => {
    const r = adsEventSchema.safeParse(baseMetaEvent);
    expect(r.success).toBe(true);
  });

  it("accepts plausible metrics", () => {
    const r = adsEventSchema.safeParse({
      ...baseMetaEvent,
      metrics: { ctr: 0.02, impressions: 10_000, cvr: 0.03 },
    });
    expect(r.success).toBe(true);
  });

  it("REJECTS Math.random-style impossible CTR with low impressions", () => {
    // Simulates the facebook-ad-actor-full-v2 synthetic output pattern.
    const r = adsEventSchema.safeParse({
      ...baseMetaEvent,
      metrics: { ctr: 0.73, impressions: 42 },
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.message.includes("synthetic-metric"))).toBe(true);
    }
  });

  it("REJECTS out-of-range CVR", () => {
    const r = adsEventSchema.safeParse({
      ...baseMetaEvent,
      metrics: { cvr: 1.5 },
    });
    expect(r.success).toBe(false);
  });
});

describe("ads-events envelope", () => {
  it("validates a well-formed envelope", () => {
    const r = adsEventEnvelopeSchema.safeParse({
      schema_version: SCHEMA_VERSION,
      source: "FB_AD_ACTOR_V2",
      producer: "facebook-ad-actor-full-v2",
      producer_version: "2.1.0",
      events: [baseMetaEvent],
    });
    expect(r.success).toBe(true);
  });

  it("rejects envelopes over MAX_EVENTS_PER_ENVELOPE", () => {
    const many = Array.from({ length: 501 }, (_, i) => ({
      ...baseMetaEvent,
      idempotency_key: "x".repeat(16) + String(i).padStart(6, "0"),
    }));
    const r = adsEventEnvelopeSchema.safeParse({
      schema_version: SCHEMA_VERSION,
      source: "FB_AD_ACTOR_V2",
      producer: "x",
      producer_version: "1",
      events: many,
    });
    expect(r.success).toBe(false);
  });
});
