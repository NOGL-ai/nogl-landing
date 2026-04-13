"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import type { CompanyPricingResponse } from "@/types/company";
import {
  fetchJson,
  formatEuro,
  formatNumber,
  formatPercent,
  InlineError,
  PanelSkeleton,
} from "./shared";

type PricingTabProps = {
  slug: string;
  active: boolean;
};

type PricingState = {
  data: CompanyPricingResponse | null;
  error: string | null;
  loading: boolean;
};

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </Card>
  );
}

export function PricingTab({ slug, active }: PricingTabProps) {
  const [state, setState] = useState<PricingState>({
    data: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    if (!active || state.data || state.loading) {
      return;
    }

    let cancelled = false;

    async function load() {
      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        const data = await fetchJson<CompanyPricingResponse>(`/api/companies/${slug}/pricing`);
        if (!cancelled) {
          setState({ data, error: null, loading: false });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : "Could not load pricing data.",
            loading: false,
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [active, slug, state.data, state.loading]);

  if (state.loading && !state.data) {
    return <PanelSkeleton rows={4} grid="grid-cols-1 md:grid-cols-2 xl:grid-cols-4" />;
  }

  if (state.error) {
    return <InlineError message={state.error} />;
  }

  if (!state.data) {
    return null;
  }

  const { data } = state;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Products" value={formatNumber(data.total_products)} />
        <SummaryCard label="Avg Price" value={formatEuro(data.avg_price)} />
        <SummaryCard
          label="Price Range"
          value={`${formatEuro(data.min_price)} - ${formatEuro(data.max_price)}`}
        />
        <SummaryCard label="Discount Rate" value={formatPercent(data.avg_discount_pct)} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Product Type Pricing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Average pricing and discount performance by category.
          </p>
        </div>

        {data.product_types.length === 0 ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">
            No pricing data yet - populate by running the scraper
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Count</th>
                  <th className="px-6 py-3 font-medium">Avg Price</th>
                  <th className="px-6 py-3 font-medium">Min Price</th>
                  <th className="px-6 py-3 font-medium">Max Price</th>
                  <th className="px-6 py-3 font-medium">Avg Discount</th>
                </tr>
              </thead>
              <tbody>
                {data.product_types.map((row) => (
                  <tr key={row.type} className="border-t border-border">
                    <td className="px-6 py-4 font-medium text-foreground">{row.type}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {row.count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatEuro(row.avg_price)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatEuro(row.min_price)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatEuro(row.max_price)}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatPercent(row.avg_discount_pct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
