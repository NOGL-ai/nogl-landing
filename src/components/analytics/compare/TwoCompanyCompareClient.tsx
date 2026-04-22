"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, ChevronDown, Plus } from "@untitledui/icons";

import { Card } from "@/components/ui/card";
import { CompanyPickerModal } from "@/components/analytics/compare/CompanyPickerModal";
import { CompareDateRangePopover } from "@/components/analytics/compare/CompareDateRangePopover";
import { CompareMetricsTable } from "@/components/analytics/compare/CompareMetricsTable";

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

export function TwoCompanyCompareClient() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [slugA, setSlugA] = useState("");
  const [slugB, setSlugB] = useState("");
  const [pickerTarget, setPickerTarget] = useState<"A" | "B" | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 27);
    return { start: startDate.toISOString().slice(0, 10), end };
  });

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
  const companyOptions = useMemo(
    () => companies.map((company) => ({ slug: company.slug, name: company.name })),
    [companies]
  );

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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                <div className="space-y-1.5 text-sm">
                  <p className="font-medium text-foreground">Company A</p>
                  <button
                    type="button"
                    onClick={() => setPickerTarget("A")}
                    className="inline-flex h-11 w-full items-center justify-between rounded-md border border-dashed border-border bg-background px-3 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <span className="inline-flex min-w-0 items-center gap-2 truncate">
                      <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{rowA?.name ?? "Choose a company"}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                </div>
                <p className="pb-2 text-center text-sm font-semibold text-muted-foreground">vs</p>
                <div className="space-y-1.5 text-sm">
                  <p className="font-medium text-foreground">Company B</p>
                  <button
                    type="button"
                    onClick={() => setPickerTarget("B")}
                    className="inline-flex h-11 w-full items-center justify-between rounded-md border border-dashed border-border bg-background px-3 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <span className="inline-flex min-w-0 items-center gap-2 truncate">
                      <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{rowB?.name ?? "Choose a company"}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-7 sm:pt-0">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <CompareDateRangePopover
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  onRangeChange={setDateRange}
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[15px] font-semibold text-foreground">Filter comparison data</p>
              <CompareMetricsTable companyA={rowA} companyB={rowB} />
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

      <CompanyPickerModal
        key={`picker-a-${slugA}-${slugB}`}
        open={pickerTarget === "A"}
        title="Select company A"
        description="This company will be compared side-by-side in the left column."
        companies={companyOptions}
        selectedSlug={slugA || null}
        blockedSlug={slugB || null}
        onOpenChange={(open) => setPickerTarget(open ? "A" : null)}
        onConfirm={setSlugA}
      />

      <CompanyPickerModal
        key={`picker-b-${slugA}-${slugB}`}
        open={pickerTarget === "B"}
        title="Select company B"
        description="This company will be compared side-by-side in the right column."
        companies={companyOptions}
        selectedSlug={slugB || null}
        blockedSlug={slugA || null}
        onOpenChange={(open) => setPickerTarget(open ? "B" : null)}
        onConfirm={setSlugB}
      />
    </div>
  );
}
