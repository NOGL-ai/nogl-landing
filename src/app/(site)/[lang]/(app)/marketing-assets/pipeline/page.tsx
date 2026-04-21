import type { Locale } from "@/i18n";
import type { OverviewResponse } from "@/app/api/ads-events/overview/route";
import { EventsPerDayChart } from "@/components/application/marketing-assets/EventsPerDayChart";
import { QueueDepthCard } from "@/components/application/marketing-assets/QueueDepthCard";
import { CreativeCard } from "@/components/application/marketing-assets/CreativeCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function fetchOverview(): Promise<OverviewResponse> {
  const empty: OverviewResponse = {
    eventsPerDay: [],
    recentCreatives: [],
    totals: { events_7d: 0, creatives_total: 0, accounts_unmapped: 0 },
  };
  try {
    const base =
      process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/ads-events/overview`, { cache: "no-store" });
    return res.ok ? res.json() : empty;
  } catch {
    return empty;
  }
}

async function fetchHealth() {
  try {
    const base =
      process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/ads-events/health`, { cache: "no-store" });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export default async function MarketingAssetsPipelinePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const [overview, health] = await Promise.all([fetchOverview(), fetchHealth()]);
  const { totals, eventsPerDay, recentCreatives } = overview;
  const queue = health?.queue;

  return (
    <div className="min-h-screen bg-bg-secondary p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Ingestion health</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Meta Ads Library and Instagram pipeline — queue depth, events, and recent creatives.
            </p>
          </div>
          <Link
            href={`/${lang}/marketing-assets`}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            ← Marketing Asset Library
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <QueueDepthCard
            label="Events (7d)"
            value={totals.events_7d.toLocaleString()}
            sub="raw events ingested"
          />
          <QueueDepthCard
            label="Creatives"
            value={totals.creatives_total.toLocaleString()}
            sub="unique ad creatives"
          />
          <QueueDepthCard
            label="Unmapped Accounts"
            value={totals.accounts_unmapped}
            sub="need → Company link"
            variant={totals.accounts_unmapped > 0 ? "warning" : "success"}
          />
          <QueueDepthCard
            label="Queue Waiting"
            value={queue?.waiting ?? "—"}
            sub={queue?.healthy === false ? "queue unreachable" : `${queue?.active ?? 0} active`}
            variant={queue?.healthy === false ? "error" : queue?.failed > 0 ? "warning" : "default"}
          />
        </div>

        <section className="rounded-xl border border-border-secondary bg-bg-primary p-5">
          <h2 className="mb-4 text-sm font-semibold text-text-primary">Events / Day (last 30 days)</h2>
          <EventsPerDayChart data={eventsPerDay} />
        </section>

        {recentCreatives.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold text-text-primary">Recent Creatives</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {recentCreatives.map((c) => (
                <CreativeCard key={c.id} creative={c} />
              ))}
            </div>
          </section>
        )}

        {health?.lastRun && (
          <section className="rounded-xl border border-border-secondary bg-bg-primary p-5">
            <h2 className="mb-3 text-sm font-semibold text-text-primary">Last Scraper Run</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <Stat label="Source" value={health.lastRun.source} />
              <Stat label="Status" value={health.lastRun.status} />
              <Stat
                label="Events In"
                value={`${health.lastRun.events_accepted} / ${health.lastRun.events_in}`}
              />
              <Stat
                label="Started"
                value={new Date(health.lastRun.started_at).toLocaleString("en-GB")}
              />
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className="mt-0.5 font-medium text-text-primary">{value}</dd>
    </div>
  );
}
