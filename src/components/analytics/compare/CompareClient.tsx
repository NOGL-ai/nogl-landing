"use client";
import { Download01 as Download, Share01 as Share2, List as LayoutList, LayoutGrid01 as LayoutGrid, SwitchVertical01 as ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, X, Settings01 as Settings, LinkExternal01 as ExternalLink, Grid01 as Grid, HelpCircle, Columns02 as Columns, InfoCircle } from '@untitledui/icons';


import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type Table,
  type VisibilityState,
} from "@tanstack/react-table";
import { Eye, EyeOff } from "lucide-react";


import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FilterBar, PeriodChip } from "@/components/companies/FilterBar";
import { fmtPrice } from "@/components/companies/pricing/utils";
import type { PriceDistributionBucket } from "@/types/company";

import { CompareProductTypesTable } from "./CompareProductTypesTable";
import { CompaniesCompareTable } from "./CompaniesCompareTable";

// Dynamically import chart components to prevent SSR window errors
const PriceDistributionChart = dynamic(
  () => import("@/components/companies/pricing/PriceDistributionChart").then((m) => ({ default: m.PriceDistributionChart })),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse rounded bg-muted" /> }
);

const ColorDistributionWidget = dynamic(
  () => import("./ColorDistributionWidget").then((m) => ({ default: m.ColorDistributionWidget })),
  { ssr: false, loading: () => <div className="h-[290px] animate-pulse rounded bg-muted" /> }
);

const GenderDistributionWidget = dynamic(
  () => import("./GenderDistributionWidget").then((m) => ({ default: m.GenderDistributionWidget })),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse rounded bg-muted" /> }
);

// ── Types ─────────────────────────────────────────────────────────────────────

interface TrackedProduct {
  rank: number;
  company_name: string;
  company_initials: string;
  company_slug: string;
  company_logo_url: string | null;
  product_title: string;
  image_url: string | null;
  price: number;
  avg_discount_pct: number;
  variant_count: number;
  product_url: string | null;
}

type SortByOption = "rank" | "price_desc" | "discount_desc";

type MultiCompanySummary = {
  companies: Array<{
    slug: string;
    name: string;
    total_products: number;
    min_price: number | null;
    max_price: number | null;
    avg_price: number | null;
    market_share_pct: number;
  }>;
  top_products: Array<{
    rank: number;
    company_slug: string;
    company_name: string;
    product_title: string;
    price: number;
    list_price: number | null;
    image_url: string | null;
    product_url: string | null;
  }>;
  product_categories: Array<{
    category: string;
    total_products: number;
    min_price: number | null;
    max_price: number | null;
    avg_price: number | null;
  }>;
  price_distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
};

function toInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function normalizeRangeLabel(range: string): string {
  return range.replace(/€/g, "").replace(/[–—]/g, "-").trim();
}

const COMPANY_DOMAIN_BY_SLUG: Record<string, string> = {
  calumet: "calumet.de",
  teltec: "teltec.de",
  "foto-erhardt": "foto-erhardt.de",
  "foto-leistenschneider": "foto-leistenschneider.de",
  fotokoch: "fotokoch.de",
  "kamera-express": "kamera-express.de",
};

function getCompanyLogoUrl(slug: string): string | null {
  const domain = COMPANY_DOMAIN_BY_SLUG[slug];
  if (!domain) return null;
  // Google favicon service gives a lightweight stable logo-like mark per company domain.
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// ── Column helper ─────────────────────────────────────────────────────────────

const colHelper = createColumnHelper<TrackedProduct>();

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <ArrowUp className="ml-1 inline h-3 w-3" />;
  if (isSorted === "desc") return <ArrowDown className="ml-1 inline h-3 w-3" />;
  return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30" />;
}

function PriceTrackedProductsColumnSettings({ table }: { table: Table<TrackedProduct> }) {
  const configurable = table.getAllLeafColumns().filter((col) => col.getCanHide());

  function toggleColumn(columnId: string) {
    const column = table.getColumn(columnId);
    if (!column || !column.getCanHide()) return;
    if (column.getIsVisible()) {
      const otherVisible = table.getAllLeafColumns().filter((c) => c.getIsVisible() && c.id !== column.id).length;
      if (otherVisible === 0) return;
    }
    column.toggleVisibility(!column.getIsVisible());
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Configure columns"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Configure columns"
        >
          <Columns className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[min(100vw-1.5rem,22rem)] border-border p-0 shadow-lg">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Configure Columns</h3>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground sm:text-xs">
            Customize how columns appear in results and exports from this table.
          </p>
        </div>
        <ul
          className="max-h-[min(22rem,60vh)] overflow-y-auto overscroll-contain py-1.5 [-webkit-overflow-scrolling:touch]"
          aria-label="Column visibility"
        >
          {configurable.map((column) => {
            const meta = column.columnDef.meta;
            const label = meta?.configureLabel ?? column.id;
            const info = meta?.configureInfo;
            const visible = column.getIsVisible();
            return (
              <li
                key={column.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/50"
              >
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span className="truncate text-sm text-foreground">{label}</span>
                  {info ? (
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="shrink-0 rounded-full p-0.5 text-muted-foreground outline-none ring-offset-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          aria-label={`About ${label}`}
                        >
                          <InfoCircle className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[16rem] text-xs font-normal leading-snug">
                        {info}
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => toggleColumn(column.id)}
                  aria-pressed={visible}
                  aria-label={visible ? `Hide ${label} column` : `Show ${label} column`}
                >
                  {visible ? (
                    <Eye className="h-4 w-4" aria-hidden />
                  ) : (
                    <EyeOff className="h-4 w-4 opacity-80" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

// ── How-to-use modal ──────────────────────────────────────────────────────────

function HowToUseModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="mb-1 text-base font-semibold text-foreground">How to use this page</h2>
        <p className="mb-4 text-xs text-muted-foreground">Multi-Company Analysis</p>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">1</span>
            <span>Use the <strong className="text-foreground">Filters Bar</strong> to narrow down companies, product types, gender, and discount ranges.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">2</span>
            <span>The <strong className="text-foreground">Price Tracked Products</strong> table shows all tracked products sorted by rank. Click <em>Explore</em> to open the company detail page.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">3</span>
            <span>The <strong className="text-foreground">Product Types</strong> table is filterable by depth (1–5). Click any row to filter the entire page by that product type.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">4</span>
            <span>Click a <strong className="text-foreground">Price Distribution</strong> bar to apply min/max price filters instantly.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">5</span>
            <span>Sections marked <strong className="text-foreground">Coming Soon</strong> require sales data not yet available in this plan.</span>
          </li>
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

// ── Main client component ─────────────────────────────────────────────────────

export function CompareClient() {
  // Page state
  const [period, setPeriod] = useState("4w");
  const [showHowTo, setShowHowTo] = useState(false);

  // Filters
  const [filters, setFilters] = useState<Record<string, string | null>>({
    company: null,
    productType: null,
    avgDiscount: null,
    gender: null,
  });

  // Products table state
  const [sortBy, setSortBy] = useState<SortByOption>("rank");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [summary, setSummary] = useState<MultiCompanySummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Product types table
  const [depth, setDepth] = useState(3);
  const [activeType, setActiveType] = useState<string | null>(null);

  // Price filter from bucket click
  const [priceFilter, setPriceFilter] = useState<PriceDistributionBucket | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setLoadingSummary(true);
      try {
        const response = await fetch("/api/analytics/multi-company-summary", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to load summary (${response.status})`);
        }
        const data = (await response.json()) as MultiCompanySummary;
        if (!cancelled) {
          setSummary(data);
        }
      } catch (error) {
        console.error("Failed to load multi-company summary", error);
        if (!cancelled) {
          setSummary(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingSummary(false);
        }
      }
    }

    loadSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  function setFilter(key: string, value: string | null) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  }

  function handleBucketClick(bucket: PriceDistributionBucket) {
    setPriceFilter((prev) => (prev?.range === bucket.range ? null : bucket));
  }

  const sortedProducts = useMemo(() => {
    const sourceProducts: TrackedProduct[] = (summary?.top_products ?? []).map((product) => {
      const discountPct =
        product.list_price && product.list_price > 0
          ? ((product.list_price - product.price) / product.list_price) * 100
          : 0;
      return {
        rank: product.rank,
        company_name: product.company_name,
        company_initials: toInitials(product.company_name),
        company_slug: product.company_slug,
        company_logo_url: getCompanyLogoUrl(product.company_slug),
        product_title: product.product_title,
        image_url: product.image_url,
        price: product.price,
        avg_discount_pct: Math.max(0, Number(discountPct.toFixed(1))),
        variant_count: 0,
        product_url: product.product_url,
      };
    });
    const copy = [...sourceProducts];
    if (sortBy === "price_desc") copy.sort((a, b) => b.price - a.price);
    else if (sortBy === "discount_desc") copy.sort((a, b) => b.avg_discount_pct - a.avg_discount_pct);
    else copy.sort((a, b) => a.rank - b.rank);
    return copy;
  }, [sortBy, summary]);

  const totalProducts = sortedProducts.length;
  const totalVariants = sortedProducts.reduce((acc, p) => acc + p.variant_count, 0);
  const totalDatapoints = summary?.companies.reduce((acc, c) => acc + c.total_products, 0) ?? 0;
  const companiesRows = useMemo(
    () =>
      (summary?.companies ?? []).map((company, idx) => ({
        id: `${idx}-${company.slug}`,
        slug: company.slug,
        name: company.name,
        initials: toInitials(company.name),
        logo_url: null,
        product_count: company.total_products,
        min_price: company.min_price ?? 0,
        max_price: company.max_price ?? 0,
        avg_price: company.avg_price ?? 0,
        market_share_pct: company.market_share_pct,
      })),
    [summary]
  );

  const productTypeRows = useMemo(
    () =>
      (summary?.product_categories ?? []).map((category) => ({
        name: category.category,
        breadcrumb: [category.category],
        product_count: category.total_products,
        pct_tagged: 100,
        avg_rating: null,
        pct_discounted: 0,
        min_price: category.min_price ?? 0,
        max_price: category.max_price ?? 0,
        avg_price: category.avg_price ?? 0,
        avg_full_price: category.avg_price ?? 0,
        avg_discount_pct: 0,
      })),
    [summary]
  );

  const priceBuckets = useMemo(
    () =>
      (summary?.price_distribution ?? []).map((bucket) => ({
        range: normalizeRangeLabel(bucket.range),
        count: bucket.count,
        percentage: bucket.percentage,
      })),
    [summary]
  );


  const paginatedProducts = sortedProducts.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(totalProducts / rowsPerPage);

  // TanStack table for products
  const productColumns = useMemo(
    () => [
    colHelper.accessor("rank", {
      header: "Rank",
      enableSorting: true,
      meta: {
        align: "center",
        thClass: "w-10 sm:w-12",
        tdClass: "w-10 sm:w-12",
        configureLabel: "Rank",
      },
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">{info.getValue()}</span>
      ),
    }),
    colHelper.display({
      id: "competitor",
      header: "Brand",
      enableSorting: false,
      meta: {
        align: "center",
        thClass: "w-11 px-2 sm:w-14 sm:px-3",
        tdClass: "w-11 px-2 sm:w-14 sm:px-3",
        configureLabel: "Competitor",
      },
      cell: (info) => {
        const brand = info.row.original.company_name;
        return (
          <div className="flex justify-center">
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex shrink-0 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={brand}
                >
                  <div className="relative h-8 w-8 shrink-0 sm:h-9 sm:w-9">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-primary shadow-inner ring-1 ring-border/70 sm:h-9 sm:w-9 sm:text-[11px]">
                      {info.row.original.company_initials}
                    </div>
                    {info.row.original.company_logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={info.row.original.company_logo_url}
                        alt=""
                        className="absolute inset-0 h-8 w-8 rounded-full border border-border/80 bg-background object-contain p-0.5 shadow-sm ring-1 ring-black/5 sm:h-9 sm:w-9"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6}>
                {brand}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    }),
    colHelper.accessor("product_title", {
      header: "Product",
      enableSorting: true,
      meta: {
        align: "left",
        thClass: "min-w-0 w-[32%] sm:w-[34%] lg:w-[36%]",
        tdClass: "min-w-0 w-[32%] sm:w-[34%] lg:w-[36%]",
        configureLabel: "Product Title",
      },
      cell: (info) => {
        const title = info.getValue();
        return (
          <p
            className="m-0 line-clamp-2 text-left text-xs font-normal leading-snug tracking-tight text-muted-foreground sm:text-[13px] sm:leading-snug sm:text-foreground/90"
            title={title}
          >
            {title}
          </p>
        );
      },
    }),
    colHelper.display({
      id: "image",
      header: "Image",
      enableSorting: false,
      meta: {
        align: "center",
        thClass: "w-14 sm:w-16",
        tdClass: "w-14 sm:w-16",
        configureLabel: "Image",
      },
      cell: (info) =>
        info.row.original.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={info.row.original.image_url}
            alt={info.row.original.product_title}
            className="mx-auto h-9 w-9 rounded object-cover ring-1 ring-border/60 sm:h-10 sm:w-10"
          />
        ) : (
          <div className="mx-auto h-9 w-9 rounded bg-muted ring-1 ring-border/40 sm:h-10 sm:w-10" />
        ),
    }),
    colHelper.accessor("price", {
      header: "Price",
      enableSorting: true,
      meta: {
        align: "right",
        thClass: "w-[4.5rem] sm:w-24",
        tdClass: "w-[4.5rem] sm:w-24",
        configureLabel: "Price",
        configureInfo:
          "Latest observed selling price for this product from tracked storefronts (primary variant or best offer when multiple).",
      },
      cell: (info) => (
        <span className="tabular-nums text-foreground">{fmtPrice(info.getValue())}</span>
      ),
    }),
    colHelper.accessor("avg_discount_pct", {
      header: "Avg. Discount",
      enableSorting: true,
      meta: {
        align: "right",
        thClass: "w-24 sm:w-28",
        tdClass: "w-24 sm:w-28",
        configureLabel: "Avg. Discount",
        configureInfo:
          "Approximate discount versus list or reference price when list data exists; otherwise shown as unavailable.",
      },
      cell: (info) => {
        const v = info.getValue();
        return v > 0 ? (
          <span className="tabular-nums font-medium text-orange-500">{v.toFixed(1)}%</span>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        );
      },
    }),
    colHelper.accessor("variant_count", {
      header: "# Variants",
      enableSorting: true,
      meta: {
        align: "right",
        thClass: "w-16 sm:w-20",
        tdClass: "w-16 sm:w-20",
        configureLabel: "# Variants",
      },
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">{info.getValue()}</span>
      ),
    }),
    colHelper.display({
      id: "actions",
      header: "Actions",
      enableSorting: false,
      meta: {
        align: "center",
        thClass: "w-36 sm:w-44",
        tdClass: "w-36 sm:w-44",
        configureLabel: "Actions",
      },
      cell: (info) => (
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
          <Link
            href={`/en/companies?company=${encodeURIComponent(info.row.original.company_slug)}`}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            Explore
          </Link>
          {info.row.original.product_url && (
            <a
              href={info.row.original.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              View <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      ),
    }),
    ],
    []
  );

  const productTable = useReactTable({
    data: paginatedProducts,
    columns: productColumns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  return (
    <>
      {showHowTo && <HowToUseModal onClose={() => setShowHowTo(false)} />}

      <div className="space-y-6">

        {/* ── Page header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Multi-Company Analysis</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Data-informed price strategy, opportunities, and development
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHowTo(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              How to use
            </button>
            <button
              type="button"
              title="Share / Download"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Controls row (date range top-right) ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Showing data for the selected period
          </div>
          <PeriodChip value={period} onChange={setPeriod} />
        </div>

        {/* ── Filters bar ── */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <FilterBar
              filters={[
                {
                  key: "company",
                  label: "Company",
                  options: companiesRows.map((c) => ({ label: c.name, value: c.slug })),
                },
                {
                  key: "productType",
                  label: "Product Type",
                  options: productTypeRows.map((t) => ({ label: t.name, value: t.name })),
                },
                {
                  key: "avgDiscount",
                  label: "Avg. Discount",
                  options: [
                    { label: "Any discount", value: "any" },
                    { label: "> 10%", value: "10" },
                    { label: "> 20%", value: "20" },
                    { label: "> 30%", value: "30" },
                    { label: "> 50%", value: "50" },
                  ],
                },
                {
                  key: "gender",
                  label: "Gender",
                  options: [
                    { label: "Male", value: "male" },
                    { label: "Female", value: "female" },
                    { label: "Unisex", value: "unisex" },
                  ],
                },
              ]}
              values={filters}
              onChange={setFilter}
            />

            {/* Add more filters button */}
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
            >
              <span className="text-sm leading-none">+</span> Add filter
            </button>

            {/* Match all toggle */}
            <label className="ml-2 flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
              <input type="checkbox" className="h-3 w-3 rounded accent-primary" />
              Include items matching all filters
            </label>
          </div>

          {/* Results line */}
          <p className="text-xs text-muted-foreground">
            Found:{" "}
            <span className="font-medium text-foreground">{totalProducts.toLocaleString()}</span>{" "}
            products ·{" "}
            <span className="font-medium text-foreground">{totalVariants.toLocaleString()}</span>{" "}
            variants ·{" "}
            <span className="font-medium text-foreground">{totalDatapoints.toLocaleString()}</span>{" "}
            total datapoints
            {priceFilter && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                Price: €{priceFilter.range.replace("-", "–")}
                <button
                  type="button"
                  onClick={() => setPriceFilter(null)}
                  className="ml-0.5 opacity-60 hover:opacity-100"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}
          </p>
        </div>

        {/* ── Price Tracked Products table ── */}
        <Card className="overflow-hidden p-0">
          {/* Section header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">Price Tracked Products</h2>
            <div className="flex items-center gap-2">
              {/* Sort by */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as SortByOption); setPage(0); }}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="rank">Rank</option>
                  <option value="price_desc">Price (High→Low)</option>
                  <option value="discount_desc">Avg. Discount</option>
                </select>
              </div>

              <PriceTrackedProductsColumnSettings table={productTable} />

              {/* Download CSV */}
              <button
                type="button"
                title="Download CSV"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" />
              </button>

              {/* Product Matrix (coming soon) — Particl-style: no noisy badge; explain on hover */}
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <span className="inline-flex rounded-md">
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      aria-label="Product matrix — coming soon"
                      className="flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-md border border-dashed border-border bg-muted/20 text-muted-foreground/50"
                    >
                      <Grid className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6} className="max-w-[14rem] text-xs">
                  Product matrix opens this table in a grid workspace. Coming soon.
                </TooltipContent>
              </Tooltip>

              {/* Layout toggle */}
              <div className="flex rounded-md border border-border">
                <button
                  type="button"
                  title="List view"
                  className="flex h-7 w-7 items-center justify-center rounded-l-md text-foreground transition-colors hover:bg-muted"
                >
                  <LayoutList className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Grid view"
                  className="flex h-7 w-7 items-center justify-center rounded-r-md border-l border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[36rem] table-fixed text-sm sm:min-w-[52rem]">
              <thead className="border-b border-border bg-card">
                {productTable.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const align = header.column.columnDef.meta?.align ?? "left";
                      const thExtra = header.column.columnDef.meta?.thClass ?? "";
                      const canSort = header.column.getCanSort();
                      return (
                        <th
                          key={header.id}
                          className={`whitespace-nowrap px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-2.5
                            ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}
                            ${canSort ? "cursor-pointer select-none hover:text-foreground" : ""}
                            ${thExtra}
                          `}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && <SortIcon isSorted={header.column.getIsSorted()} />}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border">
                {productTable.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-muted/20">
                    {row.getVisibleCells().map((cell) => {
                      const align = cell.column.columnDef.meta?.align ?? "left";
                      const tdExtra = cell.column.columnDef.meta?.tdClass ?? "";
                      return (
                        <td
                          key={cell.id}
                          className={`px-3 py-2 align-middle sm:px-4 sm:py-2.5
                            ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}
                            ${tdExtra}
                          `}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Skeleton placeholder rows if fewer than 5 */}
                {paginatedProducts.length < 5 &&
                  Array.from({ length: 5 - paginatedProducts.length }, (_, i) => (
                    <tr key={`placeholder-${i}`}>
                      {productTable.getVisibleLeafColumns().map((col) => (
                        <td
                          key={col.id}
                          className="px-3 py-2 text-center text-muted-foreground/30 sm:px-4 sm:py-2.5"
                        >
                          —
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, totalProducts)} of{" "}
                {totalProducts}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Product Types table ── */}
        <CompareProductTypesTable
          rows={productTypeRows}
          activeType={activeType}
          onTypeSelect={setActiveType}
          depth={depth}
          onDepthChange={setDepth}
          loading={loadingSummary}
        />

        {/* ── Distribution Row ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Color / Size / etc. Distribution */}
          <ColorDistributionWidget loading={loadingSummary} />

          {/* Right: Price Distribution */}
          <Card className="flex flex-col p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Price Distribution</h3>
                <p className="text-xs text-muted-foreground">
                  Click a price bucket to apply price filters
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Settings className="h-3 w-3" />
                Config
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-3 flex gap-1 rounded-lg border border-border p-0.5">
              <button
                type="button"
                className="flex-1 rounded-md bg-card py-1 text-xs font-medium text-foreground shadow-sm"
              >
                % of Product Prices (P5–P95)
              </button>
              <button
                type="button"
                className="flex-1 rounded-md py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                % of Revenue (P5–P95)
              </button>
            </div>

            <PriceDistributionChart
              buckets={priceBuckets}
              onBucketClick={handleBucketClick}
              loading={loadingSummary}
            />
          </Card>
        </div>

        {/* ── Companies table ── */}
        <CompaniesCompareTable rows={companiesRows} loading={loadingSummary} />

        {/* ── Gender Distribution ── */}
        <GenderDistributionWidget loading={loadingSummary} />
      </div>
    </>
  );
}