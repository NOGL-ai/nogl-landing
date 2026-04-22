"use client";

import Link from "next/link";

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

type CompareMetricsTableProps = {
  companyA?: CompanyRow;
  companyB?: CompanyRow;
};

type MetricRow = {
  key: string;
  label: string;
  renderValue: (row?: CompanyRow) => string;
};

const metricRows: MetricRow[] = [
  {
    key: "totalProducts",
    label: "Total Products",
    renderValue: (row) => (row ? row.total_products.toLocaleString() : "-"),
  },
  {
    key: "avgPrice",
    label: "Avg. Price",
    renderValue: (row) => (row?.avg_price != null ? fmtPrice(row.avg_price) : "-"),
  },
  {
    key: "priceBand",
    label: "Price Band",
    renderValue: (row) => {
      if (!row || row.min_price == null || row.max_price == null) return "-";
      return `${fmtPrice(row.min_price)} - ${fmtPrice(row.max_price)}`;
    },
  },
  {
    key: "marketShare",
    label: "Market Share",
    renderValue: (row) => (row ? `${row.market_share_pct.toFixed(1)}%` : "-"),
  },
];

export function CompareMetricsTable({ companyA, companyB }: CompareMetricsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="sticky left-0 z-10 w-56 bg-muted/20 px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Recent events
              </th>
              <th className="w-80 px-4 py-3 text-center text-xl font-semibold leading-tight text-foreground lg:text-2xl">
                {companyA?.name ?? "Choose a company"}
              </th>
              <th className="w-80 px-4 py-3 text-center text-xl font-semibold leading-tight text-foreground lg:text-2xl">
                {companyB?.name ?? "Choose a company"}
              </th>
            </tr>
          </thead>
          <tbody>
            {metricRows.map((metric) => (
              <tr key={metric.key} className="border-b border-border/80 transition-colors hover:bg-muted/10 last:border-b-0">
                <th className="sticky left-0 z-10 bg-card px-4 py-4 text-left text-sm font-medium text-foreground">
                  {metric.label}
                </th>
                <td className="px-4 py-4 text-center text-sm text-foreground">{metric.renderValue(companyA)}</td>
                <td className="px-4 py-4 text-center text-sm text-foreground">{metric.renderValue(companyB)}</td>
              </tr>
            ))}
            <tr className="border-b border-border/80 transition-colors hover:bg-muted/10">
              <th className="sticky left-0 z-10 bg-card px-4 py-4 text-left text-sm font-medium text-foreground">View Details</th>
              <td className="px-4 py-4 text-center">
                {companyA ? (
                  <Link
                    href={`/en/companies?company=${encodeURIComponent(companyA.slug)}`}
                    className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    View Events
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </td>
              <td className="px-4 py-4 text-center">
                {companyB ? (
                  <Link
                    href={`/en/companies?company=${encodeURIComponent(companyB.slug)}`}
                    className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    View Events
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
