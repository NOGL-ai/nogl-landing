/**
 * Typed client for the ad-creative scoring platform FastAPI service.
 *
 * The base URL is read from AD_SCORING_API_URL (server-side) or
 * NEXT_PUBLIC_AD_SCORING_API_URL (client-side). The service lives at
 * http://10.10.10.184:8000 in the homelab, or http://localhost:8000 in local dev.
 */

import type {
  AnalysisReport,
  AnalysisRunSummary,
  AssetOut,
  BrandProfile,
  ReadyzResponse,
  ReviewDecision,
  ReviewOut,
  ReviewState,
  UploadUrlRequest,
  UploadUrlResponse,
} from "./types";

function baseUrl(): string {
  // Server-side: use the internal network URL (no CORS restriction).
  if (typeof window === "undefined") {
    return process.env.AD_SCORING_API_URL ?? "http://10.10.10.184:8000";
  }
  // Client-side: use the public URL (proxied through /api/ad-scoring in Next.js).
  return process.env.NEXT_PUBLIC_AD_SCORING_API_URL ?? "http://10.10.10.184:8000";
}

function apiKey(): string {
  if (typeof window === "undefined") {
    return process.env.AD_SCORING_API_KEY ?? "";
  }
  return process.env.NEXT_PUBLIC_AD_SCORING_API_KEY ?? "";
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${baseUrl()}/api/v1${path}`;
  const key = apiKey();
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(key ? { "X-API-Key": key } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ad-scoring API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function getHealth(): Promise<{ status: string }> {
  return apiFetch("/healthz");
}

export async function getReadyz(): Promise<ReadyzResponse> {
  return apiFetch("/readyz");
}

// ─── Assets ───────────────────────────────────────────────────────────────────

export async function createUploadUrl(
  req: UploadUrlRequest
): Promise<UploadUrlResponse> {
  return apiFetch("/assets/upload-url", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function finalizeAsset(assetId: string): Promise<AssetOut> {
  return apiFetch(`/assets/${assetId}/finalize`, { method: "POST" });
}

export async function getAsset(assetId: string): Promise<AssetOut> {
  return apiFetch(`/assets/${assetId}`);
}

export async function getDownloadUrl(
  assetId: string
): Promise<{ download_url: string }> {
  return apiFetch(`/assets/${assetId}/download`);
}

/**
 * Full two-phase upload helper.
 * Caller supplies the File object; this function handles the presign → PUT → finalize flow.
 */
export async function uploadAsset(
  file: File,
  opts: Omit<UploadUrlRequest, "filename">
): Promise<AssetOut> {
  // Phase 1: get presigned URL
  const { upload_url, asset_id } = await createUploadUrl({
    ...opts,
    filename: file.name,
  });

  // Phase 2: PUT binary directly to S3
  const putRes = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error(`S3 upload failed: ${putRes.status}`);
  }

  // Phase 3: finalize
  return finalizeAsset(asset_id);
}

// ─── Analysis Runs ────────────────────────────────────────────────────────────

export async function triggerRun(
  assetId: string,
  force = false
): Promise<AnalysisRunSummary> {
  return apiFetch(`/analysis/${assetId}/run`, {
    method: "POST",
    body: JSON.stringify({ force }),
  });
}

export async function getRun(runId: string): Promise<AnalysisRunSummary> {
  return apiFetch(`/analysis/${runId}`);
}

export async function getReport(runId: string): Promise<AnalysisReport> {
  return apiFetch(`/analysis/${runId}/report`);
}

/**
 * Poll a run until it reaches completed or failed status.
 * Resolves with the final AnalysisRunSummary.
 */
export async function pollRun(
  runId: string,
  intervalMs = 2000,
  timeoutMs = 120_000
): Promise<AnalysisRunSummary> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const run = await getRun(runId);
    if (run.status === "completed" || run.status === "failed") {
      return run;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Run ${runId} did not complete within ${timeoutMs}ms`);
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function listReviews(
  state: ReviewState = "open",
  limit = 50
): Promise<ReviewOut[]> {
  return apiFetch(`/reviews?state=${state}&limit=${limit}`);
}

export async function getReview(reviewId: string): Promise<ReviewOut> {
  return apiFetch(`/reviews/${reviewId}`);
}

export async function decideReview(
  reviewId: string,
  decision: ReviewDecision
): Promise<ReviewOut> {
  return apiFetch(`/reviews/${reviewId}/decide`, {
    method: "POST",
    body: JSON.stringify(decision),
  });
}

// ─── Brands ───────────────────────────────────────────────────────────────────

export async function listBrands(): Promise<BrandProfile[]> {
  return apiFetch("/brands");
}

export async function getBrand(brandId: string): Promise<BrandProfile> {
  return apiFetch(`/brands/${brandId}`);
}

/**
 * Create a new brand profile in the ad-scoring service.
 *
 * The shape is the FastAPI /api/v1/brands POST schema:
 *   { name, palette_hex, product_terms, logo_reference_paths }
 *
 * On the browser this is proxied through `/api/ad-scoring/brands` so the
 * AD_SCORING_API_KEY is never exposed to the client. On the server it goes
 * directly to the FastAPI service.
 */
export interface CreateBrandInput {
  name: string;
  slug?: string;
  country?: string;
  homepage_url?: string;
  palette_hex: string[];
  product_terms: string[];
  logo_reference_paths: string[];
}

export async function createBrand(
  input: CreateBrandInput
): Promise<BrandProfile> {
  // Browser path: hit the internal Next.js proxy so the API key stays server-side.
  if (typeof window !== "undefined") {
    const res = await fetch("/api/ad-scoring/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`createBrand ${res.status}: ${body}`);
    }
    return res.json() as Promise<BrandProfile>;
  }

  // Server path: hit FastAPI directly with the server-side API key.
  return apiFetch("/brands", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Upload a logo image as a brand reference asset.
 *
 * Reuses the standard asset upload flow (presign → PUT → finalize), tagging the
 * resulting asset with `asset_type=image`. The returned `asset.s3_key` is what
 * downstream callers should pass into `logo_reference_paths`.
 */
export async function uploadBrandLogo(file: File): Promise<AssetOut> {
  return uploadAsset(file, {
    platform: "meta_feed", // any platform works — logos aren't platform-scoped
    asset_type: "image",
  });
}
