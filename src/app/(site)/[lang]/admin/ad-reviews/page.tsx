"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_AD_SCORING_API_URL ?? "http://10.10.10.184:8000";
const API_KEY = process.env.NEXT_PUBLIC_AD_SCORING_API_KEY ?? "";

const DEMO_REVIEWS = [
  { id: "demo-1", asset_id: "asset-001", metric_key: "gaze_direction", tier: "B",
    auto_decision: "review_required", created_at: new Date().toISOString(),
    evidence: { reason: "Low confidence gaze (0.43), recommend human check" }, run_id: "run-001" },
  { id: "demo-2", asset_id: "asset-002", metric_key: "brand_ci_match", tier: "B",
    auto_decision: "review_required", created_at: new Date().toISOString(),
    evidence: { reason: "Brand colour deviation detected" }, run_id: "run-002" },
  { id: "demo-3", asset_id: "asset-003", metric_key: "emotion_strength", tier: "B",
    auto_decision: "review_required", created_at: new Date().toISOString(),
    evidence: { reason: "Weak emotional signal (score=0.31, threshold=0.45)" }, run_id: "run-003" },
];

type Review = typeof DEMO_REVIEWS[0];

export default function AdReviewsPage() {
  const params = useParams();
  const lang = params?.lang ?? "en";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/api/v1/reviews?status=pending&limit=50`, {
          headers: API_KEY ? { "X-API-Key": API_KEY } : {},
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : DEMO_REVIEWS);
      } catch {
        setReviews(DEMO_REVIEWS);
        setDemo(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ad Creative Reviews</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {demo ? (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-800 text-xs font-medium">
                Demo mode - API unreachable
              </span>
            ) : (
              `${reviews.length} pending review${reviews.length !== 1 ? "s" : ""}`
            )}
          </p>
        </div>
        <a href={`${API}/docs`} target="_blank" rel="noopener noreferrer"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
          API Docs
        </a>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-500">
          No pending reviews
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {["Asset", "Metric", "Tier", "Reason", "Created", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                    {String(r.asset_id).slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {r.metric_key}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      r.tier === "A" ? "bg-green-100 text-green-700"
                      : r.tier === "B" ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}>Tier {r.tier}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs text-sm text-gray-600 truncate">
                    {r.evidence?.reason ?? "--"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/${lang}/admin/ad-reviews/${r.id}`}
                      className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700">
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
