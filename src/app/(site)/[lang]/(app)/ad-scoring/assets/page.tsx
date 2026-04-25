import { UploadCloud01 as UploadCloud, Image01 as ImageIcon, VideoRecorder as Video, CheckCircle as CheckCircle2, Clock, AlertCircle, RefreshCw01 as Loader } from '@untitledui/icons';
import React from "react";
import type { Locale } from "@/i18n";
import type { BrandProfile } from "@/lib/ad-scoring/types";
import AssetUploadForm from "@/components/application/ad-scoring/AssetUploadForm";
import { getTenantContext, filterBrandsByTenant } from "@/lib/ad-scoring/tenant";

export const metadata = {
  title: "Ad Creative Assets",
  description: "Upload and manage ad creative assets for scoring",
};

// Combined status colours: asset intrinsic states + run states.
const statusColors: Record<string, string> = {
  ready: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  running: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusIcons: Record<string, React.ReactNode> = {
  ready: <CheckCircle2 className="h-3.5 w-3.5" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5" />,
  pending: <Clock className="h-3.5 w-3.5" />,
  running: <Loader className="h-3.5 w-3.5 animate-spin" />,
  error: <AlertCircle className="h-3.5 w-3.5" />,
  failed: <AlertCircle className="h-3.5 w-3.5" />,
};

interface AssetRow {
  id: string;
  platform: string;
  asset_type: string;
  status: string;
  filename: string;
  created_at: string;
  brand_id?: string | null;
  /** Latest analysis-run id, when one exists. */
  latest_run_id?: string | null;
  /** Latest run status — supersedes asset.status in the UI when present. */
  latest_run_status?: string | null;
}

export default async function AssetsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  // Fetch recent assets from the scoring API (server-side, no CORS)
  const apiBase = process.env.AD_SCORING_API_URL ?? "http://10.10.10.184:8000";
  const apiKey = process.env.AD_SCORING_API_KEY ?? "";
  const authHeaders: Record<string, string> = apiKey ? { "X-API-Key": apiKey } : {};

  // Tenant scoping — same approach as the brands page.
  const tenant = await getTenantContext();

  // Build the set of brand-ids belonging to this tenant (used to filter the
  // asset list).  Admins skip this — their set is "all brands".
  let allowedBrandIds: Set<string> | null = null;
  if (!tenant.isAdmin && tenant.brandToken) {
    try {
      const brandsRes = await fetch(`${apiBase}/api/v1/brands`, {
        next: { revalidate: 60 },
        headers: authHeaders,
      });
      if (brandsRes.ok) {
        const allBrands = (await brandsRes.json()) as BrandProfile[];
        const mine = filterBrandsByTenant(allBrands, tenant);
        allowedBrandIds = new Set(mine.map((b) => b.id));
      }
    } catch {
      allowedBrandIds = new Set();
    }
  }

  let assets: AssetRow[] = [];

  try {
    const res = await fetch(`${apiBase}/api/v1/assets?limit=50`, {
      next: { revalidate: 30 },
      headers: authHeaders,
    });
    if (res.ok) {
      assets = (await res.json()) as AssetRow[];
    }
  } catch {
    // API unreachable — show empty state, upload form still works
  }

  // Tenant filter: drop assets whose brand_id isn't in the allowed set.
  if (allowedBrandIds !== null) {
    assets = assets.filter(
      (a) => a.brand_id && allowedBrandIds!.has(a.brand_id),
    );
  }

  // Enrich with latest-run status.  The /assets endpoint returns the asset's
  // intrinsic status (which stays "ready" forever after upload), so we have
  // to fetch the run separately to know whether scoring completed.
  // /api/v1/analysis/by-asset/{id} returns the latest run summary.
  await Promise.all(
    assets.map(async (a) => {
      try {
        const r = await fetch(`${apiBase}/api/v1/analysis/by-asset/${a.id}`, {
          next: { revalidate: 30 },
          headers: authHeaders,
        });
        if (r.ok) {
          const run = (await r.json()) as { id?: string; status?: string };
          a.latest_run_id = run.id ?? null;
          a.latest_run_status = run.status ?? null;
        }
      } catch {
        // Leave the asset with its intrinsic status if the lookup fails.
      }
    }),
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Ad Creative Assets
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Upload images and videos for the 27-criterion scoring pipeline.
            GPU-dependent metrics (YOLO / SAM2 / OCR) will return{" "}
            <code className="bg-bg-tertiary px-1 rounded text-xs">
              null_with_reason
            </code>{" "}
            when the GPU worker is offline.
          </p>
        </div>
      </div>

      {/* Upload card */}
      <section className="rounded-xl border border-border-primary bg-bg-primary p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <UploadCloud className="h-5 w-5 text-text-brand" />
          <h2 className="text-base font-medium text-text-primary">
            Upload New Creative
          </h2>
        </div>
        <AssetUploadForm />
      </section>

      {/* Asset list */}
      <section>
        <h2 className="text-base font-medium text-text-primary mb-3">
          Recent Assets
        </h2>

        {assets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-primary bg-bg-secondary p-12 text-center">
            <UploadCloud className="h-10 w-10 text-text-tertiary mx-auto mb-3" />
            <p className="text-sm text-text-tertiary">
              No assets yet. Upload your first creative above.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border-primary bg-bg-primary shadow-sm">
            <table className="min-w-full divide-y divide-border-primary text-sm">
              <thead className="bg-bg-secondary">
                <tr>
                  {["Asset", "Platform", "Type", "Status", "Uploaded", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {assets.map((asset) => {
                  // Prefer the latest analysis-run status; fall back to the
                  // asset's intrinsic status when no run exists yet.
                  const displayStatus = asset.latest_run_status ?? asset.status;
                  const reportTarget = asset.latest_run_id ?? asset.id;
                  const reportReady =
                    asset.latest_run_status === "completed" ||
                    (asset.latest_run_status == null && asset.status === "ready");
                  return (
                    <tr key={asset.id} className="hover:bg-bg-secondary transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {asset.asset_type === "video" ? (
                            <Video className="h-4 w-4 text-text-tertiary shrink-0" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-text-tertiary shrink-0" />
                          )}
                          <span className="truncate max-w-[200px] font-mono text-xs text-text-primary">
                            {asset.filename || asset.id.slice(0, 8) + "…"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-tertiary">
                        {asset.platform.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-text-tertiary capitalize">
                        {asset.asset_type}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[displayStatus] ?? ""}`}
                        >
                          {statusIcons[displayStatus]}
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-tertiary text-xs">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {reportReady && (
                          <a
                            href={`/${lang}/ad-scoring/analysis/${reportTarget}`}
                            className="text-xs font-medium text-text-brand hover:underline"
                          >
                            View report →
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
      </section>
    </div>
  );
}
