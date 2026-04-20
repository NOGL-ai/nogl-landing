import { Eye, CheckCircle as CheckCircle2, XCircle, MinusCircle, Clock } from '@untitledui/icons';
import React from "react";
import type { Locale } from "@/i18n";
import type { ReviewOut, ReviewState } from "@/lib/ad-scoring/types";

export const metadata = {
  title: "Ad Creative Review Queue",
};

const stateConfig: Record<
  ReviewState,
  { icon: React.ReactNode; bg: string; text: string }
> = {
  open: {
    icon: <Clock className="h-3.5 w-3.5" />,
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
  },
  assigned: {
    icon: <Eye className="h-3.5 w-3.5" />,
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
  },
  resolved: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
  },
  dismissed: {
    icon: <MinusCircle className="h-3.5 w-3.5" />,
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-500 dark:text-gray-400",
  },
};

const triggerLabels: Record<string, string> = {
  tier_c_always_review: "Tier C (always)",
  tier_c_auto_route: "Tier C (auto-route)",
  tier_b_low_confidence: "Tier B < 70% conf",
  tier_b_null_confidence: "Tier B < 50% conf",
};

const tierBadge = (tier: string) => {
  if (tier === "subjective")
    return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
};

export default async function ReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ state?: string }>;
}) {
  await params;
  const sp = await searchParams;
  const state = (sp.state as ReviewState) ?? "open";

  const apiBase = process.env.AD_SCORING_API_URL ?? "http://10.10.10.184:8000";

  let reviews: ReviewOut[] = [];
  try {
    const apiKey = process.env.AD_SCORING_API_KEY ?? "";
    const res = await fetch(
      `${apiBase}/api/v1/reviews?state=${state}&limit=100`,
      { cache: "no-store", headers: apiKey ? { "X-API-Key": apiKey } : {} }
    );
    if (res.ok) reviews = await res.json();
  } catch {
    // API unreachable
  }

  const tabs: ReviewState[] = ["open", "assigned", "resolved", "dismissed"];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Review Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Items requiring human judgement: Tier-C metrics (always) and Tier-B
          metrics where model confidence fell below 70%.
        </p>
      </div>

      {/* State tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <a
            key={t}
            href={`?state=${t}`}
            className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${
              t === state
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </a>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No {state} items in the queue.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40">
              <tr>
                {[
                  "Metric",
                  "Tier",
                  "Trigger",
                  "Confidence",
                  "State",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reviews.map((r) => {
                const cfg = stateConfig[r.state];
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {r.metric_key}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const tier = r.evidence_json?.tier ?? (r.trigger_reason?.includes("tier_c") ? "subjective" : "probabilistic");
                        return (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tierBadge(tier)}`}>
                            {tier}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {(() => {
                        const key = r.reason ?? r.trigger_reason ?? "";
                        // Normalise "tier_b_low_confidence:0.51" → "tier_b_low_confidence"
                        const baseKey = key.split(":")[0];
                        return triggerLabels[baseKey] ?? baseKey;
                      })()}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                      {(() => {
                        const conf = r.evidence_json?.confidence;
                        return conf != null ? `${Math.round(conf * 100)}%` : "—";
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
                      >
                        {cfg.icon}
                        {r.state}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {r.state === "open" || r.state === "assigned" ? (
                        <a
                          href={`/ad-scoring/reviews/${r.id}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Review →
                        </a>
                      ) : (
                        <a
                          href={`/ad-scoring/reviews/${r.id}`}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          View
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
