import Link from "next/link";
import { ExternalLink, Calendar, Clock, Tag, TrendingDown } from "lucide-react";

import { ProductImageGallery } from "./ProductImageGallery";
import { PriceSparklineChart } from "./PriceSparklineChart";
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

// ── FIX 2: Quality grade badge ────────────────────────────────────────────────

type GradeInfo = { label: string; color: string; bg: string; border: string };

function getGrade(score: number | null | undefined): GradeInfo {
  if (score == null || !Number.isFinite(score)) {
    return { label: "—", color: "text-muted-foreground", bg: "bg-muted", border: "border-border" };
  }
  if (score >= 97) return { label: "A+", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-300 dark:border-emerald-700" };
  if (score >= 93) return { label: "A",  color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-300 dark:border-emerald-700" };
  if (score >= 90) return { label: "A-", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-300 dark:border-emerald-700" };
  if (score >= 87) return { label: "B+", color: "text-blue-700 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/40",    border: "border-blue-300 dark:border-blue-700" };
  if (score >= 83) return { label: "B",  color: "text-blue-700 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/40",    border: "border-blue-300 dark:border-blue-700" };
  if (score >= 80) return { label: "B-", color: "text-blue-700 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/40",    border: "border-blue-300 dark:border-blue-700" };
  if (score >= 77) return { label: "C+", color: "text-amber-700 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/40",  border: "border-amber-300 dark:border-amber-700" };
  if (score >= 73) return { label: "C",  color: "text-amber-700 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/40",  border: "border-amber-300 dark:border-amber-700" };
  return             { label: "D",  color: "text-red-700 dark:text-red-400",      bg: "bg-red-50 dark:bg-red-950/40",      border: "border-red-300 dark:border-red-700" };
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

  // FIX 2: compute grade
  const grade = getGrade(product.dataset_quality_score);

  // FIX 3: KPI values
  const avgDiscount =
    price_history.length > 0
      ? price_history.reduce((sum, p) => sum + p.price, 0) / price_history.length
      : null;

  const kpiMinPrice = product.min_price;
  const kpiMaxPrice = product.max_price;
  const hasPriceRange =
    kpiMinPrice != null && kpiMaxPrice != null && kpiMinPrice !== kpiMaxPrice;

  // FIX 4: image list
  const allImages = [product.image_url].filter((u): u is string => Boolean(u));

  // Category breadcrumb tags
  const categories = product.category
    ? product.category
        .split(/[·,>/]/)
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-6">

      {/* ── FIX 5: Breadcrumb ─────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <Link
          href={`/${lang}/companies`}
          className="hover:text-foreground transition-colors shrink-0"
        >
          Company Explorer
        </Link>
        <span className="text-muted-foreground/40 shrink-0">›</span>
        <Link
          href={`/${lang}/companies/${slug}`}
          className="hover:text-foreground transition-colors shrink-0"
        >
          {companyName}
        </Link>
        <span className="text-muted-foreground/40 shrink-0">›</span>
        <Link
          href={`/${lang}/companies/${slug}/products`}
          className="hover:text-foreground transition-colors shrink-0"
        >
          Products
        </Link>
        <span className="text-muted-foreground/40 shrink-0">›</span>
        <span className="text-foreground font-medium truncate max-w-[240px]">
          {product.title}
        </span>
      </nav>

      {/* ── FIX 4: Hero 2-col grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: image gallery */}
        <ProductImageGallery images={allImages} alt={product.title} />

        {/* RIGHT: product info */}
        <div className="space-y-4">

          {/* Badge row: category + brand */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.category && (
              <span className="inline-flex items-center gap-1 text-xs border rounded-full px-2.5 py-0.5 text-muted-foreground bg-muted/50">
                <Tag className="h-3 w-3" />
                {categories[0] ?? product.category}
              </span>
            )}
            {product.brand && (
              <span className="inline-flex items-center text-xs border rounded-full px-2.5 py-0.5 text-muted-foreground bg-muted/50">
                {product.brand}
              </span>
            )}
            {/* FIX 2: Quality grade */}
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold border rounded-full px-2.5 py-0.5 ${grade.color} ${grade.bg} ${grade.border}`}
              title={
                product.dataset_quality_score != null
                  ? `Dataset quality score: ${product.dataset_quality_score}`
                  : "Dataset quality: unavailable"
              }
            >
              Data Quality: {grade.label}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-foreground leading-snug">
            {product.title}
          </h1>

          {/* View on site */}
          {product.source_url && (
            <a
              href={product.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border rounded-md px-3 py-1.5 transition-colors w-fit"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on site
            </a>
          )}

          {/* FIX 3: 4 KPI chips */}
          <div className="grid grid-cols-2 gap-3">
            {/* Current Price */}
            <div className="rounded-lg border bg-card p-3 space-y-0.5">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                Current Price
              </p>
              <p className="text-lg font-bold text-foreground">
                {fmtPrice(product.current_price)}
              </p>
            </div>

            {/* Price Range */}
            <div className="rounded-lg border bg-card p-3 space-y-0.5">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                Price Range
              </p>
              <p className="text-sm font-semibold text-foreground">
                {hasPriceRange
                  ? `${fmtPrice(kpiMinPrice)} – ${fmtPrice(kpiMaxPrice)}`
                  : fmtPrice(product.current_price)}
              </p>
            </div>

            {/* Avg Discount */}
            <div className="rounded-lg border bg-card p-3 space-y-0.5">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Avg Discount
              </p>
              <p className="text-sm font-semibold text-foreground">
                {product.discount_pct != null && product.discount_pct > 0
                  ? `${product.discount_pct.toFixed(0)}%`
                  : "—"}
              </p>
            </div>

            {/* First Seen */}
            <div className="rounded-lg border bg-card p-3 space-y-0.5">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                First Seen
              </p>
              <p className="text-sm font-semibold text-foreground">
                {fmtDate(product.first_seen)}
              </p>
            </div>
          </div>

          {/* Last updated */}
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3 w-3 shrink-0" />
            Last updated {fmtDate(product.last_seen)}
          </p>
        </div>
      </div>

      {/* ── Detail card ─────────────────────────────────────────────── */}
      <div className="rounded-lg border bg-card overflow-hidden">

        {/* Filters row */}
        <div className="border-b px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-foreground">Filters</span>
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
                  Range {fmtPrice(kpiMinPrice)} – {fmtPrice(kpiMaxPrice)}
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

        {/* ── FIX 1: Horizontal data sections — NO raw Product ID ─── */}
        <div className="border-b px-4 sm:px-6 py-4 grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
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

          {/* Brand */}
          {product.brand && (
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-1.5">
                Brand
              </h3>
              <p className="text-xs text-muted-foreground">{product.brand}</p>
            </div>
          )}

          {/* Source */}
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
        </div>

        {/* ── FIX 6: Price sparkline chart ────────────────────────── */}
        <div className="border-b px-4 sm:px-6 py-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Price Over Time
          </h3>
          <PriceSparklineChart history={price_history} productId={product.id} />
        </div>

        {/* ── Sales Over Time — blurred Coming Soon ─────────────────── */}
        <div className="px-4 sm:px-6 py-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Sales Over Time
          </h3>
          <div className="relative rounded-lg border overflow-hidden h-52">
            {/* Ghost chart behind the blur */}
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
                  <linearGradient id="sg-sales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[52, 104, 156].map((y) => (
                  <line
                    key={y}
                    x1="0" y1={y} x2="800" y2={y}
                    stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4"
                    className="text-border"
                  />
                ))}
                <path
                  d="M0,160 C60,140 100,120 160,130 C220,140 260,90 320,80 C380,70 420,100 480,90 C540,80 580,60 640,70 C700,80 750,95 800,100 L800,208 L0,208 Z"
                  fill="url(#sg-sales)"
                />
                <path
                  d="M0,160 C60,140 100,120 160,130 C220,140 260,90 320,80 C380,70 420,100 480,90 C540,80 580,60 640,70 C700,80 750,95 800,100"
                  fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5"
                />
                <path
                  d="M0,120 C80,115 160,125 240,118 C320,111 400,130 480,122 C560,114 640,128 800,120"
                  fill="none" stroke="hsl(var(--destructive))" strokeWidth="1.5" strokeOpacity="0.6"
                />
              </svg>
            </div>

            {/* Frosted-glass overlay */}
            <div className="absolute inset-0 backdrop-blur-[8px] bg-background/60" />

            {/* Coming Soon badge */}
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
                      <td className="px-4 py-2.5 text-foreground">{v.title}</td>
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
    </div>
  );
}
