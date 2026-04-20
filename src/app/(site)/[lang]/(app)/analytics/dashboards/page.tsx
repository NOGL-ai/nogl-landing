import { Plus as PlusIcon, LayoutGrid01 as LayoutDashboardIcon, Clock as ClockIcon } from '@untitledui/icons';
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listDashboards, createDashboard } from "@/actions/dashboards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { Locale } from "@/i18n";
import { DashboardCreateButton } from "@/components/dashboards/DashboardCreateButton";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  let dashboards: Awaited<ReturnType<typeof listDashboards>> = [];

  try {
    dashboards = await listDashboards();
  } catch {
    // Not logged in or DB unavailable — show empty state
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboards</h1>
          <p className="text-sm text-muted-foreground">
            Build custom charts from your scraped data sources.
          </p>
        </div>
        <DashboardCreateButton lang={lang} />
      </div>

      {/* Dashboard grid */}
      <Suspense fallback={<DashboardGridSkeleton />}>
        {dashboards.length === 0 ? (
          <EmptyState lang={lang} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboards.map((d: (typeof dashboards)[number]) => (
              <DashboardCard key={d.id} dashboard={d} lang={lang} />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard card
// ---------------------------------------------------------------------------

const PERSONA_COLORS: Record<string, string> = {
  CFO: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  CMO: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  OPS: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  GENERIC: "bg-muted text-muted-foreground",
};

type DashboardSummary = {
  id: string;
  name: string;
  description?: string | null;
  isShared: boolean;
  persona: string;
  widgetCount: number;
  updatedAt: string;
};

function DashboardCard({
  dashboard,
  lang,
}: {
  dashboard: DashboardSummary;
  lang: Locale;
}) {
  const updated = new Date(dashboard.updatedAt);
  const timeAgo = formatTimeAgo(updated);

  return (
    <Link
      href={`/${lang}/analytics/dashboards/${dashboard.id}`}
      className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-medium leading-tight">{dashboard.name}</span>
          {dashboard.description && (
            <span className="line-clamp-2 text-xs text-muted-foreground">
              {dashboard.description}
            </span>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            PERSONA_COLORS[dashboard.persona] ?? PERSONA_COLORS.GENERIC
          }`}
        >
          {dashboard.persona}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <LayoutDashboardIcon className="h-3 w-3" />
          {dashboard.widgetCount} widget{dashboard.widgetCount !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <ClockIcon className="h-3 w-3" />
          {timeAgo}
        </span>
        {dashboard.isShared && (
          <Badge variant="secondary" className="text-xs">
            Shared
          </Badge>
        )}
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ lang }: { lang: Locale }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed bg-muted/30 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <LayoutDashboardIcon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium">No dashboards yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first dashboard to start exploring your data.
        </p>
      </div>
      <DashboardCreateButton lang={lang} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function DashboardGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 animate-pulse rounded-xl border bg-muted" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
