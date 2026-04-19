import React from "react";
import { notFound } from "next/navigation";
import { Eye, Info } from "lucide-react";
import type { Locale } from "@/i18n";
import type { ReviewOut } from "@/lib/ad-scoring/types";
import ReviewDecisionForm from "@/components/application/ad-scoring/ReviewDecisionForm";

export const metadata = {
  title: "Review Item",
};

const tierBadge = (tier: string) => {
  if (tier === "subjective")
    return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
};

const metricGuidance: Record<string, string> = {
  "color.emotional_color_effect":
    "Does the colour palette match the campaign tone? Is it coherent with the brand guide? See HUMAN_REVIEW_GUIDE.md § emotional_color_effect.",
  "cta.distraction_avoidance":
    "Is there a single visually dominant element? Do AI-flagged distractors genuinely compete with the CTA? See HUMAN_REVIEW_GUIDE.md § distraction_avoidance.",
  "faces.authenticity_pose_naturalness":
    "Does the expression/posture fit the campaign tone? Consider brief requirements — polished vs candid. See HUMAN_REVIEW_GUIDE.md § authenticity_pose_naturalness.",
  "platform.ugc_authenticity":
    "Does the production style match platform expectations? For TikTok/IG Reels: UGC feel may be required. See HUMAN_REVIEW_GUIDE.md § ugc_authenticity.",
};

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const { id } = await params;

  const apiBase = process.env.AD_SCORING_API_URL ?? "http://10.10.10.184:8000";

  let review: ReviewOut | null = null;
  try {
    const apiKey = process.env.AD_SCORING_API_KEY ?? "";
    const res = await fetch(`${apiBase}/api/v1/reviews/${id}`, {
      cache: "no-store",
      headers: apiKey ? { "X-API-Key": apiKey } : {},
    });
    if (res.status === 404) notFound();
    if (res.ok) review = await res.json();
  } catch {
    // fall through
  }

  if (!review) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <p className="text-muted-foreground">
          Could not load review item. The API may be unreachable.
        </p>
        <a
          href="/ad-scoring/reviews"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          ← Back to queue
        </a>
      </div>
    );
  }

  const isClosed =
    review.state === "resolved" || review.state === "dismissed";
  const guidance = metricGuidance[review.metric_key];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <a
        href="/ad-scoring/reviews"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Review Queue
      </a>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Review Item
          </h1>
          <p className="mt-1 text-xs font-mono text-muted-foreground break-all">
            {id}
          </p>
        </div>
        {(() => {
          const tier = review.evidence_json?.tier ?? "probabilistic";
          return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tierBadge(tier)}`}>
              {tier}
            </span>
          );
        })()}
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Metric", value: review.metric_key },
          { label: "State", value: review.state },
          {
            label: "Trigger",
            value: (review.reason ?? review.trigger_reason ?? "").split(":")[0].replace(/_/g, " "),
          },
          {
            label: "Confidence",
            value: (() => {
              const conf = review.evidence_json?.confidence;
              return conf != null ? `${Math.round(conf * 100)}%` : "—";
            })(),
          },
          {
            label: "Created",
            value: new Date(review.created_at).toLocaleString(),
          },
          {
            label: "Decided",
            value: review.decided_at
              ? new Date(review.decided_at).toLocaleString()
              : "—",
          },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="text-sm font-medium text-foreground font-mono break-all">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Guidance */}
      {guidance && (
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 flex gap-2.5">
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">{guidance}</p>
        </div>
      )}

      {/* Evidence */}
      {review.evidence_json && Object.keys(review.evidence_json).length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">
            Evidence
          </h2>
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            {Object.entries(review.evidence_json).map(([key, val]) => (
              <div key={key}>
                <p className="text-xs font-mono text-muted-foreground mb-1">
                  {key}
                </p>
                {typeof val === "string" ? (
                  <p className="text-sm text-foreground bg-card border border-border rounded-lg p-3">
                    {val}
                  </p>
                ) : (
                  <pre className="text-xs text-foreground bg-card border border-border rounded-lg p-3 overflow-x-auto">
                    {JSON.stringify(val, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Prior decision (if closed) */}
      {isClosed && (
        <section className="rounded-xl border border-border bg-card p-4 space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Decision</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Decision</p>
              <p className="font-medium text-foreground capitalize">
                {review.decision ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assignee</p>
              <p className="font-medium text-foreground">
                {review.assignee ?? "—"}
              </p>
            </div>
            {review.decision_notes && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-foreground mt-1 bg-muted/40 rounded-lg p-3 text-sm">
                  {review.decision_notes}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Decision form (only for open/assigned) */}
      {!isClosed && (
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Submit Decision
          </h2>
          <ReviewDecisionForm reviewId={id} />
        </section>
      )}

      {/* Link to run report */}
      <div className="pt-2">
        <a
          href={`/ad-scoring/analysis/${review.run_id}`}
          className="text-xs text-primary hover:underline"
        >
          View full analysis report for this run →
        </a>
      </div>
    </div>
  );
}
