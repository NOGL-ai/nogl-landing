"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_AD_SCORING_API_URL ?? "http://10.10.10.184:8000";
const API_KEY = process.env.NEXT_PUBLIC_AD_SCORING_API_KEY ?? "";

type BBox = { x: number; y: number; w: number; h: number; label: string };
type Evidence = {
  reason?: string;
  bounding_boxes?: BBox[];
  score_normalized?: number;
  confidence?: number;
};
type ReviewDetail = {
  id: string;
  asset_id: string;
  run_id: string;
  metric_key: string;
  tier: string;
  auto_decision: string;
  created_at: string;
  evidence: Evidence;
  human_decision: string | null;
  human_notes: string | null;
};

const DEMO_DETAIL: ReviewDetail = {
  id: "demo-1", asset_id: "asset-001", run_id: "run-001",
  metric_key: "gaze_direction", tier: "B", auto_decision: "review_required",
  created_at: new Date().toISOString(),
  evidence: {
    reason: "Low confidence gaze detection (score=0.43, threshold=0.55)",
    bounding_boxes: [{ x: 120, y: 80, w: 160, h: 180, label: "face" }],
    score_normalized: 0.43, confidence: 0.61,
  },
  human_decision: null, human_notes: null,
};

export default function AdReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang ?? "en";
  const reviewId = params?.review_id as string;

  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/api/v1/reviews/${reviewId}`, {
          headers: API_KEY ? { "X-API-Key": API_KEY } : {},
        });
        if (!res.ok) throw new Error(`${res.status}`);
        setReview(await res.json());
      } catch {
        setReview({ ...DEMO_DETAIL, id: reviewId });
        setDemo(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reviewId]);

  async function decide(decision: "approved" | "rejected") {
    setSubmitting(true);
    try {
      if (!demo) {
        await fetch(`${API}/api/v1/reviews/${reviewId}/decide`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
          },
          body: JSON.stringify({ decision, notes }),
        });
      }
      setSubmitted(true);
      setTimeout(() => router.push(`/${lang}/admin/ad-reviews`), 1500);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if (!review) return <div className="text-red-500">Review not found</div>;

  const ev = review.evidence ?? {};

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()}
          className="rounded bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
          Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Review: {review.metric_key}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Asset {String(review.asset_id).slice(0, 12)}...
            {demo && (
              <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-800 text-xs">demo</span>
            )}
          </p>
        </div>
      </div>

      {submitted && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900 dark:text-green-200">
          Decision recorded - redirecting...
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 font-semibold text-gray-700 dark:text-gray-200">Evidence</h2>

          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Score (normalized)</span>
              <span className="font-mono font-bold">{(ev.score_normalized ?? 0).toFixed(3)}</span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-700">
              <div className={`h-3 rounded-full transition-all ${
                (ev.score_normalized ?? 0) >= 0.6 ? "bg-green-500"
                : (ev.score_normalized ?? 0) >= 0.4 ? "bg-yellow-500" : "bg-red-500"
              }`} style={{ width: `${((ev.score_normalized ?? 0) * 100).toFixed(1)}%` }} />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Confidence</span>
              <span className="font-mono font-bold">{(ev.confidence ?? 0).toFixed(3)}</span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-700">
              <div className="h-3 rounded-full bg-blue-500"
                style={{ width: `${((ev.confidence ?? 0) * 100).toFixed(1)}%` }} />
            </div>
          </div>

          <div className="rounded bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            <strong>Reason:</strong> {ev.reason ?? "No reason provided"}
          </div>

          {ev.bounding_boxes && ev.bounding_boxes.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-1">Detection boxes</p>
              <div className="relative h-48 rounded-md bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  [creative preview]
                </div>
                {ev.bounding_boxes.map((box, i) => (
                  <div key={i} className="absolute border-2 border-red-500"
                    style={{
                      left: `${(box.x / 640 * 100).toFixed(1)}%`,
                      top: `${(box.y / 480 * 100).toFixed(1)}%`,
                      width: `${(box.w / 640 * 100).toFixed(1)}%`,
                      height: `${(box.h / 480 * 100).toFixed(1)}%`,
                    }}>
                    <span className="absolute -top-5 left-0 bg-red-500 px-1 text-xs text-white rounded">
                      {box.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 font-semibold text-gray-700 dark:text-gray-200">Your Decision</h2>

          {review.human_decision ? (
            <div className={`rounded-lg p-4 text-center font-semibold ${
              review.human_decision === "approved"
                ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}>
              Already {review.human_decision}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
                  placeholder="Add reviewer notes..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="flex gap-3">
                <button disabled={submitting || submitted} onClick={() => decide("approved")}
                  className="flex-1 rounded-md bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                  {submitting ? "Saving..." : "Approve"}
                </button>
                <button disabled={submitting || submitted} onClick={() => decide("rejected")}
                  className="flex-1 rounded-md bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                  {submitting ? "Saving..." : "Reject"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
