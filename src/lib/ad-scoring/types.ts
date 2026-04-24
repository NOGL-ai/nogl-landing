/**
 * TypeScript types for the ad-creative scoring platform API.
 * These mirror the Pydantic schemas exported by the FastAPI service.
 * Source: docs/API.md in ad-creative-scoring-platform.
 */

export type Platform =
  | "tiktok"
  | "instagram_reels"
  | "instagram_stories"
  | "youtube_shorts"
  | "meta_feed";

export type AssetType = "image" | "video";

export type AssetStatus = "pending" | "ready" | "error";

export type RunStatus = "pending" | "running" | "completed" | "failed";

export type MetricStatus =
  | "pass"
  | "warn"
  | "fail"
  | "null_with_reason"
  | "review_required";

export type MetricTier = "deterministic" | "probabilistic" | "subjective";

export type ReviewState = "open" | "assigned" | "resolved" | "dismissed";

// ─── Assets ───────────────────────────────────────────────────────────────────

export interface AssetOut {
  id: string;
  platform: Platform;
  asset_type: AssetType;
  status: AssetStatus;
  filename: string;
  s3_key: string;
  sha256: string | null;
  brand_id: string | null;
  created_at: string;
}

export interface UploadUrlRequest {
  platform: Platform;
  asset_type: AssetType;
  filename: string;
  brand_id?: string;
}

export interface UploadUrlResponse {
  upload_url: string;
  /** Form fields for presigned POST (empty object = use plain PUT) */
  upload_fields: Record<string, string>;
  object_key: string;
  asset_id: string;
  expires_at: string;
  finalize_url: string;
}

// ─── Analysis Runs ────────────────────────────────────────────────────────────

export interface AnalysisRunSummary {
  id: string;
  asset_id: string;
  status: RunStatus;
  structural_quality_score: number | null;
  review_required_count: number | null;
  metrics_total: number;
  metrics_pass: number;
  metrics_warn: number;
  metrics_fail: number;
  metrics_null: number;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
}

export interface MetricDetail {
  metric_key: string;
  tier: MetricTier;
  status: MetricStatus;
  /** Normalised 0-1 score (FastAPI field: score_normalized) */
  score_normalized: number | null;
  /** @deprecated use score_normalized */
  score?: number | null;
  confidence: number | null;
  review_required: boolean;
  raw_value_json: Record<string, unknown> | null;
  /** Null/skip reason (FastAPI field: reason) */
  reason: string | null;
  /** @deprecated use reason */
  null_reason?: string | null;
  evidence_json: Record<string, unknown> | null;
  computed_at?: string | null;
}

export interface SemanticTag {
  source_model: string;
  model_version: string;
  tag_type: string;
  value: string;
  confidence: number;
}

export interface AnalysisReport {
  run: AnalysisRunSummary;
  metrics: MetricDetail[];
  advisory_semantic_summary: SemanticTag[];
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface ReviewOut {
  id: string;
  run_id: string;
  asset_id?: string;
  metric_key: string;
  /** "reason" field from FastAPI — format: "tier_c_always_review", "tier_b_low_confidence:0.51", etc. */
  reason: string;
  /** Deprecated alias kept for compatibility */
  trigger_reason?: string;
  state: ReviewState;
  evidence_json: {
    tier?: MetricTier;
    status?: string;
    confidence?: number | null;
    raw_value?: Record<string, unknown> | null;
    evidence?: Record<string, unknown> | null;
    vlm_annotations?: Record<string, unknown> | null;
  } | null;
  /** @deprecated use evidence_json */
  evidence_snapshot_json?: Record<string, unknown> | null;
  decision: string | null;
  decision_notes: string | null;
  assignee: string | null;
  created_at: string;
  decided_at: string | null;
}

export interface ReviewDecision {
  decision: "approved" | "rejected" | "dismissed";
  decision_notes?: string;
  assignee?: string;
}

// ─── Brands ───────────────────────────────────────────────────────────────────

export interface BrandProfile {
  id: string;
  name: string;
  palette_hex: string[];
  product_terms: string[];
  logo_reference_paths: string[];
  created_at: string;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export interface HealthCheck {
  ok: boolean;
  latency_ms?: number;
  error?: string;
}

export interface ReadyzResponse {
  status: "ok" | "degraded";
  checks: {
    postgres: HealthCheck;
    redis: HealthCheck;
    s3: HealthCheck;
  };
}
