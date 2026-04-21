"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@untitledui/icons";

import { Card } from "@/components/ui/card";
import { fmtPrice } from "@/components/companies/pricing/utils";

type CompanyRow = {
  slug: string;
  name: string;
  total_products: number;
  min_price: number | null;
  max_price: number | null;
  avg_price: number | null;
  market_share_pct: number;
};

type Summary = { companies: CompanyRow[] };

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export function TwoCompanyCompareClient() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [slugA, setSlugA] = useState("");
  const [slugB, setSlugB] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/analytics/multi-company-summary", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Summary;
        if (cancelled) return;
        setSummary(data);
        const list = data.companies ?? [];
        if (list.length >= 1) {
          setSlugA(list[0].slug);
          setSlugB(list.length >= 2 ? list[1].slug : list[0].slug);
        }
      } catch {
        if (!cancelled) setSummary(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const companies = summary?.companies ?? [];
  const rowA = useMemo(() => companies.find((c) => c.slug === slugA), [companies, slugA]);
  const rowB = useMemo(() => companies.find((c) => c.slug === slugB), [companies, slugB]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Compare companies</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Pick two tracked competitors and review headline metrics side by side. For ranked products, price
            distribution, and filters across the whole set, use{" "}
            <Link href="/en/analytics/multi-company" className="font-medium text-primary underline-offset-4 hover:underline">
              Competitive Compare
            </Link>
            .
          </p>
        </div>
      </div>

      <Card className="border-border p-4 sm:p-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 max-w-md rounded-md bg-muted" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-48 rounded-lg bg-muted" />
              <div className="h-48 rounded-lg bg-muted" />
            </div>
          </div>
        ) : companies.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tracked companies yet. Add competitors to compare.</p>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground">Company A</span>
                <select
                  value={slugA}
                  onChange={(e) => setSlugA(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {companies.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground">Company B</span>
                <select
                  value={slugB}
                  onChange={(e) => setSlugB(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {companies.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
              <CompanyCard row={rowA} emptyLabel="Select company A" />
              <div className="hidden items-center justify-center lg:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </div>
              </div>
              <CompanyCard row={rowB} emptyLabel="Select company B" />
            </div>

            <div className="flex flex-wrap gap-3 border-t border-border pt-4">
              <Link
                href="/en/analytics/multi-company"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Open competitive compare
              </Link>
              {rowA && (
                <Link
                  href={`/en/companies?company=${encodeURIComponent(rowA.slug)}`}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Explore {rowA.name}
                </Link>
              )}
              {rowB && (
                <Link
                  href={`/en/companies?company=${encodeURIComponent(rowB.slug)}`}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Explore {rowB.name}
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function CompanyCard({ row, emptyLabel }: { row: CompanyRow | undefined; emptyLabel: string }) {
  if (!row) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 p-4 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-semibold text-foreground">{row.name}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{row.slug}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-2">
        <Stat label="Products tracked" value={row.total_products.toLocaleString()} />
        <Stat
          label="Avg. price"
          value={row.avg_price != null ? fmtPrice(row.avg_price) : "—"}
        />
        <Stat
          label="Price band"
          value={
            row.min_price != null && row.max_price != null
              ? `${fmtPrice(row.min_price)} – ${fmtPrice(row.max_price)}`
              : "—"
          }
        />
        <Stat label="Share of catalog" value={`${row.market_share_pct.toFixed(1)}%`} />
      </div>
    </div>
  );
}
