"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Card } from "@/components/ui/card";
import { PriceHistoryChart } from "./PriceHistoryChart";
import type { ProductDetailResponse } from "@/types/companyProducts";

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtPrice(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n === 0) return "€0";
  if (n >= 1)
    return `€${n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  return `€${n.toFixed(2)}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

function truncateUrl(url: string, max = 60): string {
  try {
    const u = new URL(url);
    const display = u.hostname + u.pathname;
    return display.length > max ? display.slice(0, max) + "…" : display;
  } catch {
    return url.length > max ? url.slice(0, max) + "…" : url;
  }
}

// ── KPI chip ──────────────────────────────────────────────────────────────────

function KpiChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="mt-1 text-base font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

// ── Metadata row ──────────────────────────────────────────────────────────────

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-border/40 last:border-0">
      <span className="w-28 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <span className="flex-1 text-sm text-foreground break-all">{value}</span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Props = {
  data: ProductDetailResponse;
  slug: string;
  lang: string;
  companyName: string;
};

export function ProductDetailView({ data, slug, lang, companyName }: Props) {
  const { product, price_history, variants } = data;

  const minPrice =
    price_history.length > 0
      ? Math.min(...price_history.map((p) => p.price))
      : null;
  const maxPrice =
    price_history.length > 0
      ? Math.max(...price_history.map((p) => p.price))
      : null;
  const priceRange =
    minPrice != null && maxPrice != null && minPrice !== maxPrice
      ? `${fmtPrice(minPrice)} – ${fmtPrice(maxPrice)}`
      : fmtPrice(product.current_price);

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <Link
          href={`/${lang}/companies`}
          className="hover:text-foreground transition-colors"
        >
          Company Explorer
        </Link>
        <span>/</span>
        <Link
          href={`/${lang}/companies/${slug}`}
          className="hover:text-foreground transition-colors"
        >
          {companyName}
        </Link>
        <span>/</span>
        <Link
          href={`/${lang}/companies/${slug}/products`}
          className="hover:text-foreground transition-colors"
        >
          Products
        </Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1 max-w-xs">
          {product.title}
        </span>
      </nav>

      {/* ── Product header ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* Image */}
        <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-xl border border-border bg-muted self-center sm:self-start">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-contain p-3"
              sizes="192px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <svg
                className="h-16 w-16 opacity-25"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <h1 className="text-2xl font-bold leading-tight text-foreground">
            {product.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            {product.brand && (
              <span className="rounded-full border border-border bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
                {product.brand}
              </span>
            )}
            {product.category && (
              <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                {product.category}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              First seen {timeAgo(product.first_seen)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last seen {timeAgo(product.last_seen)}
            </span>
          </div>

          {product.source_url && (
            <a
              href={product.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary underline-offset-2 hover:underline"
            >
              View on site
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* ── KPI strip ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiChip label="Current Price" value={fmtPrice(product.current_price)} />
        <KpiChip label="Price Range" value={priceRange} />
        <KpiChip
          label="Discount"
          value={
            product.discount_pct != null
              ? `-${Math.round(product.discount_pct)}%`
              : "—"
          }
        />
        <KpiChip label="First Seen" value={fmtDate(product.first_seen)} />
      </div>

      {/* ── Body: metadata + chart ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT — metadata */}
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Product Metadata
          </h2>
          <div>
            {product.brand && (
              <MetaRow label="Brand" value={product.brand} />
            )}
            {product.category && (
              <MetaRow label="Category" value={product.category} />
            )}
            {product.source_url && (
              <MetaRow
                label="Source URL"
                value={
                  <a
                    href={product.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {truncateUrl(product.source_url)}
                  </a>
                }
              />
            )}
            <MetaRow label="First Seen" value={fmtDate(product.first_seen)} />
            <MetaRow label="Last Seen" value={fmtDate(product.last_seen)} />
            <MetaRow
              label="Variants"
              value={String(product.variants_count)}
            />
            <MetaRow label="Product ID" value={
              <span className="font-mono text-xs break-all">{product.id}</span>
            } />
          </div>
        </Card>

        {/* RIGHT — chart + variants */}
        <div className="space-y-6 lg:col-span-2">
          {/* Price Over Time */}
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Price Over Time
            </h2>
            <PriceHistoryChart
              history={price_history}
              productId={product.id}
            />
          </Card>

          {/* Sales & inventory placeholder */}
          <div className="rounded-lg border bg-card p-4 text-center py-12">
            <p className="text-sm text-muted-foreground">
              Sales &amp; inventory data not available for this company.
            </p>
          </div>

          {/* Variants table (only if > 1 variant) */}
          {variants.length > 1 && (
            <Card className="overflow-hidden p-0">
              <div className="px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">
                  Variants
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                        Title
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                        Price
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                        Discount
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">
                        In Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v) => (
                      <tr
                        key={v.id}
                        className="border-t border-border/40 hover:bg-muted/30"
                      >
                        <td className="px-4 py-2.5 text-foreground">
                          {v.title}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-foreground">
                          {fmtPrice(v.price)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">
                          {fmtPrice(v.discount_price)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {v.in_stock === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : v.in_stock ? (
                            <span className="text-green-600 dark:text-green-400">
                              ✓
                            </span>
                          ) : (
                            <span className="text-destructive">✗</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
