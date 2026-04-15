"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Calendar, Clock } from "lucide-react";

import { PriceHistoryChart } from "./PriceHistoryChart";
import type { ProductDetailResponse } from "@/types/companyProducts";

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtPrice(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n === 0) return "€0";
  return `€${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()) || d.getTime() === 0) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  const hasPriceRange =
    minPrice != null && maxPrice != null && minPrice !== maxPrice;

  const categories = product.category
    ? product.category
        .split(/[·,>/]/)
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* ── Top breadcrumb header bar (Particl-style) ─────────────── */}
      <div className="border-b px-4 sm:px-6 flex items-center gap-2 h-12">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-1 min-w-0">
          <Link
            href={`/${lang}/companies/${slug}/products`}
            className="hover:text-foreground transition-colors shrink-0"
          >
            Products
          </Link>
          <span className="text-muted-foreground/40 shrink-0">›</span>
          <span className="text-foreground font-medium truncate">
            {product.title}
          </span>
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          {product.source_url && (
            <a
              href={product.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-md px-3 py-1.5 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on site
            </a>
          )}
        </div>
      </div>

      {/* ── Sub-header: quality indicator + dates ─────────────────── */}
      <div className="border-b px-4 sm:px-6 h-10 flex items-center gap-5 text-xs text-muted-foreground bg-muted/20">
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full border bg-muted text-[9px] font-bold shrink-0">
            Q
          </span>
          Quality
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 shrink-0" />
          First seen on {fmtDate(product.first_seen)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 shrink-0" />
          Last updated {fmtDate(product.last_seen)}
        </span>
      </div>

      {/* ── Main: LEFT content / RIGHT image panel ─────────────────── */}
      <div className="flex divide-x">
        {/* ── LEFT ──────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Filters row */}
          <div className="border-b px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-foreground">
              Filters
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {["Variants", "Variant Title", "Category", "Brand"].map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-0.5 text-xs border rounded px-2 py-0.5 text-muted-foreground"
                >
                  <span className="text-muted-foreground/50">+</span> {f}
                </span>
              ))}
            </div>
          </div>

          {/* Variant / price stats row */}
          <div className="border-b px-4 sm:px-6 py-3 space-y-1">
            <p className="text-xs text-muted-foreground">
              {variants.length} variant{variants.length !== 1 ? "s" : ""} with
              these filters
            </p>
            <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1">
              <span>
                <strong className="text-foreground text-base">
                  {fmtPrice(product.current_price)}
                </strong>
                <span className="text-xs text-muted-foreground ml-1.5">
                  Current Price
                </span>
              </span>
              {hasPriceRange && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-xs text-muted-foreground">
                    Range {fmtPrice(minPrice)} – {fmtPrice(maxPrice)}
                  </span>
                </>
              )}
              {product.discount_pct != null && product.discount_pct > 0 && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                    {product.discount_pct.toFixed(0)}% Chance of Discount
                  </span>
                </>
              )}
            </div>
          </div>

          {/* ── Horizontal data sections (Particl-style: 4 columns) ── */}
          <div className="border-b px-4 sm:px-6 py-4 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
            {/* Product Types / Category */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-foreground mb-1.5">
                  Product Types
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {categories.join(" · ")}
                </p>
              </div>
            )}

            {/* Brand / Materials */}
            {product.brand && (
              <div>
                <h3 className="text-xs font-semibold text-foreground mb-1.5">
                  Brand
                </h3>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
              </div>
            )}

            {/* Source / Keywords */}
            {product.source_url && (
              <div>
                <h3 className="text-xs font-semibold text-foreground mb-1.5">
                  Source
                </h3>
                <a
                  href={product.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline break-all line-clamp-2"
                >
                  {product.source_url
                    .replace(/^https?:\/\//, "")
                    .split("/")[0]}
                </a>
              </div>
            )}

            {/* Product ID / Review Phrases */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-1.5">
                Product ID
              </h3>
              <p className="font-mono text-xs text-muted-foreground break-all line-clamp-2">
                {product.id}
              </p>
            </div>
          </div>

          {/* ── Price Over Time chart ────────────────────────────────── */}
          <div className="border-b px-4 sm:px-6 py-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Price Over Time
            </h3>
            <PriceHistoryChart history={price_history} productId={product.id} />
          </div>

          {/* ── Sales Over Time – blurred "Coming Soon" ───────────────── */}
          <div className="px-4 sm:px-6 py-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Sales Over Time
            </h3>
            <div className="relative rounded-lg border overflow-hidden h-52">
              {/* Ghost chart rendered behind the blur */}
              <div
                className="absolute inset-0 pointer-events-none select-none"
                aria-hidden="true"
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 800 208"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[52, 104, 156].map((y) => (
                    <line key={y} x1="0" y1={y} x2="800" y2={y}
                      stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4"
                      className="text-border" />
                  ))}
                  <path
                    d="M0,160 C60,140 100,120 160,130 C220,140 260,90 320,80 C380,70 420,100 480,90 C540,80 580,60 640,70 C700,80 750,95 800,100 L800,208 L0,208 Z"
                    fill="url(#sg)"
                  />
                  <path
                    d="M0,160 C60,140 100,120 160,130 C220,140 260,90 320,80 C380,70 420,100 480,90 C540,80 580,60 640,70 C700,80 750,95 800,100"
                    fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5"
                  />
                  {/* Inventory line */}
                  <path
                    d="M0,120 C80,115 160,125 240,118 C320,111 400,130 480,122 C560,114 640,128 800,120"
                    fill="none" stroke="hsl(var(--destructive))" strokeWidth="1.5" strokeOpacity="0.6"
                  />
                </svg>
              </div>

              {/* Frosted-glass overlay */}
              <div className="absolute inset-0 backdrop-blur-[8px] bg-background/60" />

              {/* Coming Soon badge + copy */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary tracking-wide uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Coming Soon
                </span>
                <p className="text-sm font-medium text-foreground">
                  Sales &amp; inventory tracking
                </p>
                <p className="text-xs text-muted-foreground max-w-[240px] text-center leading-relaxed">
                  Volume, revenue, and inventory data will appear here once available.
                </p>
              </div>
            </div>
          </div>

          {/* ── Variants table (only if > 1) ─────────────────────────── */}
          {variants.length > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Top Variants
              </h3>
              <div className="overflow-x-auto rounded-lg border">
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
                        <td className="px-4 py-2.5 text-right font-medium">
                          {fmtPrice(v.price)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">
                          {fmtPrice(v.discount_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT image panel ──────────────────────────────────────── */}
        <div className="w-60 xl:w-72 shrink-0 p-4 flex flex-col gap-3 bg-muted/10">
          {/* Main image */}
          <div className="relative aspect-square w-full rounded-lg overflow-hidden border bg-background">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                className="object-contain p-3"
                sizes="288px"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="h-16 w-16 text-muted-foreground/20"
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

          {/* Thumbnail strip */}
          {product.image_url && (
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`relative h-12 w-12 shrink-0 rounded border overflow-hidden bg-background cursor-pointer transition-all ${
                    i === 0
                      ? "ring-2 ring-primary ring-offset-1 ring-offset-card"
                      : "opacity-40"
                  }`}
                >
                  <Image
                    src={product.image_url!}
                    alt={`View ${i + 1}`}
                    fill
                    className="object-contain p-1"
                    sizes="48px"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
