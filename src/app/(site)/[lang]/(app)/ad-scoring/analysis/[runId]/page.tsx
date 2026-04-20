import React from "react";
import { notFound, redirect } from "next/navigation";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MinusCircle,
  Eye,
  Info,
} from "lucide-react";
import type { Locale } from "@/i18n";
import type { AnalysisReport, MetricDetail, MetricStatus } from "@/lib/ad-scoring/types";
import type { Route } from 'next';

export const metadata = {
  title: "Analysis Report",
};

// ─── Status display helpers ────────────────────────────────────────────────────

const statusConfig: Record<
  MetricStatus,
  { icon: React.ReactNode; bg: string; text: string; label: string }
> = {
  pass: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    label: "Pass",
  },
  warn: {
    icon: <AlertTriangle className="h-4 w-4" />,
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
    label: "Warn",
  },
  fail: {
    icon: <XCircle className="h-4 w-4" />,
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    label: "Fail",
  },
  null_with_reason: {
    icon: <MinusCircle className="h-4 w-4" />,
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-500 dark:text-gray-400",
    label: "N/A",
  },
  review_required: {
    icon: <Eye className="h-4 w-4" />,
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
    label: "Review",
  },
};

const tierLabels: Record<string, string> = {
  deterministic: "Tier A — Deterministic",
  probabilistic: "Tier B — Probabilistic",
  subjective: "Tier C — Subjective",
};

const tierBadgeColors: Record<string, string> = {
  deterministic: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  probabilistic: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  subjective: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

function ScoreBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground text-xs">—</span>;
  const pct = Math.round(score * 100);
  const color =
    pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-foreground tabular-nums">{pct}%</span>
    </div>
  );
}

function MetricRow({ metric }: { metric: MetricDetail }) {
  const cfg = statusConfig[metric.status] ?? statusConfig.null_with_reason;
  return (
    <tr className="border-b border-border hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-foreground">{metric.metric_key}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tierBadgeColors[metric.tier] ?? ""}`}>
          {metric.tier}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
          {cfg.icon}
          {cfg.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <ScoreBar score={metric.score_normalized ?? metric.score ?? null} />
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {metric.confidence != null ? `${Math.round(metric.confidence * 100)}%` : "—"}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs">
        {(metric.reason ?? metric.null_reason)
          ? <code className="bg-muted px-1 rounded">{metric.reason ?? metric.null_reason}</code>
          : metric.raw_value_json
          ? <span className="truncate block">{JSON.stringify(metric.raw_value_json).slice(0, 60)}</span>
          : "—"}
      </td>
    </tr>
  );
}

export default async function AnalysisReportPage({
  params,
}: {
  params: Promise<{ lang: Locale; runId: string }>;
}) {
  const { runId } = await params;

  const apiBase = process.env.AD_SCORING_API_URL ?? "http://10.10.10.184:8000";

  const apiKey = process.env.AD_SCORING_API_KEY ?? "";
  const authHeaders: Record<string, string> = apiKey ? { "X-API-Key": apiKey } : {};

  // If runId might be an asset ID (not a run ID), resolve it to the latest run first.
  // We detect this by trying the by-asset lookup whenever the report 404s.
  let resolvedRunId = runId;
  {
    const probeRes = await fetch(`${apiBase}/api/v1/analysis/${runId}/report`, {
      next: { revalidate: 10 },
      headers: authHeaders,
    }).catch(() => null);

    if (probeRes?.status === 404) {
      // Try resolving as an asset ID
      const byAsset = await fetch(`${apiBase}/api/v1/analysis/by-asset/${runId}`, {
        cache: "no-store",
        headers: authHeaders,
      }).catch(() => null);

      if (byAsset?.ok) {
        const latestRun = await byAsset.json() as { id: string };
        // redirect() must be called outside try/catch to propagate correctly
        redirect(`/ad-scoring/analysis/${latestRun.id}` as Route);
      }
      notFound();
    }
  }

  let report: AnalysisReport | null = null;
  try {
    const res = await fetch(`${apiBase}/api/v1/analysis/${resolvedRunId}/report`, {
      next: { revalidate: 10 },
      headers: authHeaders,
    });
    if (res.ok) report = await res.json();
  } catch {
    // fall through to error state
  }

  if (!report) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
        <p className="text-muted-foreground">
          Could not load report for run <code className="bg-muted px-1 rounded text-xs">{runId}</code>.
          The API may be unreachable or the run is still in progress.
        </p>
        <a href="/ad-scoring/assets" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Back to assets
        </a>
      </div>
    );
  }

  const { run, metrics, advisory_semantic_summary } = report;

  // Group metrics by tier
  const grouped = metrics.reduce<Record<string, MetricDetail[]>>((acc, m) => {
    (acc[m.tier] ??= []).push(m);
    return acc;
  }, {});

  const score =
    run.structural_quality_score !== null
      ? Math.round(run.structural_quality_score * 100)
      : null;

  const scoreColor =
    score === null ? "text-muted-foreground"
    : score >= 70 ? "text-green-600 dark:text-green-400"
    : score >= 40 ? "text-yellow-600 dark:text-yellow-400"
    : "text-red-600 dark:text-red-400";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <a href="/ad-scoring/assets" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Assets
        </a>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Analysis Report
        </h1>
        <p className="mt-1 text-xs font-mono text-muted-foreground break-all">{runId}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Structural Score</p>
          <p className={`text-3xl font-bold mt-1 ${scoreColor}`}>
            {score !== null ? `${score}%` : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Tier A + B only</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="text-xl font-semibold mt-1 capitalize text-foreground">{run.status}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Needs Review</p>
          <p className="text-3xl font-bold mt-1 text-purple-600 dark:text-purple-400">
            {run.review_required_count ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Pass / Warn / Fail</p>
          <p className="text-base font-semibold mt-1 text-foreground">
            <span className="text-green-600 dark:text-green-400">{run.metrics_pass}</span>
            {" / "}
            <span className="text-yellow-600 dark:text-yellow-400">{run.metrics_warn}</span>
            {" / "}
            <span className="text-red-600 dark:text-red-400">{run.metrics_fail}</span>
          </p>
        </div>
      </div>

      {/* Metrics table, grouped by tier */}
      {(["deterministic", "probabilistic", "subjective"] as const).map((tier) => {
        const rows = grouped[tier];
        if (!rows || rows.length === 0) return null;
        return (
          <section key={tier}>
            <h2 className="text-sm font-semibold text-foreground mb-2">
              {tierLabels[tier]}
            </h2>
            {tier === "subjective" && (
              <p className="text-xs text-muted-foreground mb-3 flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                Tier-C metrics are always routed to human review. Advisory VLM annotations
                appear in the Semantic Summary below. These values never affect the structural score.
              </p>
            )}
            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    {["Metric", "Tier", "Status", "Score", "Confidence", "Value / Reason"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((m) => (
                    <MetricRow key={m.metric_key} metric={m} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {/* VLM advisory annotations */}
      {advisory_semantic_summary.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Semantic Summary (Advisory — VLM annotations)
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Generated by{" "}
            <code className="bg-muted px-1 rounded">
              {advisory_semantic_summary[0]?.source_model ?? "VLM"}
            </code>
            . Confidence is capped at 0.50 for all VLM outputs. These are structured descriptions,
            not scores.
          </p>
          <div className="space-y-3">
            {advisory_semantic_summary.map((tag, i) => (
              <div
                key={i}
                className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 p-4"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300 font-mono">
                    {tag.tag_type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    confidence {Math.round(tag.confidence * 100)}%
                  </span>
                </div>
                <p className="text-sm text-foreground">{tag.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <a
          href="/ad-scoring/reviews"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Eye className="h-4 w-4" />
          Open Review Queue
        </a>
        <a
          href="/ad-scoring/assets"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-foreground hover:bg-muted/70 transition-colors"
        >
          ← Back to Assets
        </a>
      </div>
    </div>
  );
}