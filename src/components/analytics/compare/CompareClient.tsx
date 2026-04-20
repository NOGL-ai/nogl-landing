"use client";
import { Download01 as Download, Share01 as Share2, List as LayoutList, LayoutGrid01 as LayoutGrid, SwitchVertical01 as ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, X, Settings01 as Settings, LinkExternal01 as ExternalLink, Grid01 as Grid, HelpCircle } from '@untitledui/icons';


import { Download01 as Download, Share01 as Share2, List as LayoutList, LayoutGrid01 as LayoutGrid, SwitchVertical01 as ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, X, Settings01 as Settings, LinkExternal01 as ExternalLink, Grid01 as Grid, HelpCircle } from '@untitledui/icons';


import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";


import { Card } from "@/components/ui/card";
import { FilterBar, PeriodChip } from "@/components/companies/FilterBar";
import { fmtPrice } from "@/components/companies/pricing/utils";
import type { PriceDistributionBucket } from "@/types/company";

import { CompareProductTypesTable, MOCK_PRODUCT_TYPES } from "./CompareProductTypesTable";
import { CompaniesCompareTable, MOCK_COMPANIES } from "./CompaniesCompareTable";

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
  product_title: string;
  image_url: string | null;
  price: number;
  avg_discount_pct: number;
  variant_count: number;
  product_url: string | null;
}

type SortByOption = "rank" | "price_desc" | "discount_desc";

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: TrackedProduct[] = [
  {
    rank: 1,
    company_name: "Zara",
    company_initials: "ZR",
    company_slug: "zara",
    product_title: "Oversized Linen Blazer",
    image_url: null,
    price: 89,
    avg_discount_pct: 22.5,
    variant_count: 12,
    product_url: null,
  },
  {
    rank: 2,
    company_name: "H&M",
    company_initials: "HM",
    company_slug: "hm",
    product_title: "Premium Slim Fit Chinos",
    image_url: null,
    price: 42,
    avg_discount_pct: 0,
    variant_count: 8,
    product_url: null,
  },
  {
    rank: 3,
    company_name: "Uniqlo",
    company_initials: "UQ",
    company_slug: "uniqlo",
    product_title: "Merino Wool V-Neck Sweater",
    image_url: null,
    price: 69,
    avg_discount_pct: 31.0,
    variant_count: 6,
    product_url: null,
  },
  {
    rank: 4,
    company_name: "Zara",
    company_initials: "ZR",
    company_slug: "zara",
    product_title: "Floral Midi Dress",
    image_url: null,
    price: 115,
    avg_discount_pct: 18.2,
    variant_count: 9,
    product_url: null,
  },
  {
    rank: 5,
    company_name: "H&M",
    company_initials: "HM",
    company_slug: "hm",
    product_title: "Relaxed Cotton T-Shirt",
    image_url: null,
    price: 18,
    avg_discount_pct: 0,
    variant_count: 15,
    product_url: null,
  },
];

const MOCK_PRICE_DIST: PriceDistributionBucket[] = [
  { range: "0-50", count: 420, percentage: 28 },
  { range: "50-100", count: 530, percentage: 35 },
  { range: "100-250", count: 380, percentage: 25 },
  { range: "250-500", count: 150, percentage: 10 },
  { range: "500+", count: 30, percentage: 2 },
];

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// ── Column helper ─────────────────────────────────────────────────────────────

const colHelper = createColumnHelper<TrackedProduct>();

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <ArrowUp className="ml-1 inline h-3 w-3" />;
  if (isSorted === "desc") return <ArrowDown className="ml-1 inline h-3 w-3" />;
  return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30" />;
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

  // Product types table
  const [depth, setDepth] = useState(3);
  const [activeType, setActiveType] = useState<string | null>(null);

  // Price filter from bucket click
  const [priceFilter, setPriceFilter] = useState<PriceDistributionBucket | null>(null);

  function setFilter(key: string, value: string | null) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  }

  function handleBucketClick(bucket: PriceDistributionBucket) {
    setPriceFilter((prev) => (prev?.range === bucket.range ? null : bucket));
  }

  // Sorted mock products
  const sortedProducts = useMemo(() => {
    const copy = [...MOCK_PRODUCTS];
    if (sortBy === "price_desc") copy.sort((a, b) => b.price - a.price);
    else if (sortBy === "discount_desc") copy.sort((a, b) => b.avg_discount_pct - a.avg_discount_pct);
    else copy.sort((a, b) => a.rank - b.rank);
    return copy;
  }, [sortBy]);

  const totalProducts = sortedProducts.length;
  const totalVariants = MOCK_PRODUCTS.reduce((acc, p) => acc + p.variant_count, 0);
  const totalDatapoints = totalVariants * 14; // mock: 14 days of snapshots

  const paginatedProducts = sortedProducts.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(totalProducts / rowsPerPage);

  // TanStack table for products
  const productColumns = [
    colHelper.accessor("rank", {
      header: "Rank",
      enableSorting: true,
      meta: { align: "center" },
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">{info.getValue()}</span>
      ),
    }),
    colHelper.display({
      id: "competitor",
      header: "Competitor",
      enableSorting: false,
      meta: { align: "left" },
      cell: (info) => (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
            {info.row.original.company_initials}
          </div>
          <span className="text-sm text-foreground">{info.row.original.company_name}</span>
        </div>
      ),
    }),
    colHelper.accessor("product_title", {
      header: "Product Title",
      enableSorting: true,
      meta: { align: "left" },
      cell: (info) => (
        <span className="max-w-[200px] truncate font-medium text-foreground" title={info.getValue()}>
          {info.getValue()}
        </span>
      ),
    }),
    colHelper.display({
      id: "image",
      header: "Image",
      enableSorting: false,
      meta: { align: "center" },
      cell: (info) =>
        info.row.original.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={info.row.original.image_url}
            alt={info.row.original.product_title}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <div className="mx-auto h-10 w-10 rounded bg-muted" />
        ),
    }),
    colHelper.accessor("price", {
      header: "Price",
      enableSorting: true,
      meta: { align: "right" },
      cell: (info) => (
        <span className="tabular-nums text-foreground">{fmtPrice(info.getValue())}</span>
      ),
    }),
    colHelper.accessor("avg_discount_pct", {
      header: "Avg. Discount",
      enableSorting: true,
      meta: { align: "right" },
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
      meta: { align: "right" },
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">{info.getValue()}</span>
      ),
    }),
    colHelper.display({
      id: "actions",
      header: "Actions",
      enableSorting: false,
      meta: { align: "center" },
      cell: (info) => (
        <div className="flex items-center justify-center gap-1.5">
          <a
            href={`/en/companies/${info.row.original.company_slug}`}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            Explore
          </a>
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
  ];

  const productTable = useReactTable({
    data: paginatedProducts,
    columns: productColumns,
    state: { sorting },
    onSortingChange: setSorting,
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
                  options: MOCK_COMPANIES.map((c) => ({ label: c.name, value: c.slug })),
                },
                {
                  key: "productType",
                  label: "Product Type",
                  options: MOCK_PRODUCT_TYPES.map((t) => ({ label: t.name, value: t.name })),
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

              {/* Download CSV */}
              <button
                type="button"
                title="Download CSV"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" />
              </button>

              {/* Product Matrix (coming soon) */}
              <div className="relative">
                <button
                  type="button"
                  title="Open in Product Matrix (Coming Soon)"
                  disabled
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground/40"
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
                <span className="absolute -right-1 -top-1 rounded-full bg-orange-500 px-1 text-[8px] font-bold text-white">
                  Soon
                </span>
              </div>

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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border bg-card">
                {productTable.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const align = header.column.columnDef.meta?.align ?? "left";
                      const canSort = header.column.getCanSort();
                      return (
                        <th
                          key={header.id}
                          className={`whitespace-nowrap px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground
                            ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}
                            ${canSort ? "cursor-pointer select-none hover:text-foreground" : ""}
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
                      return (
                        <td
                          key={cell.id}
                          className={`px-4 py-3
                            ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}
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
                      {productColumns.map((_, j) => (
                        <td key={j} className="px-4 py-3 text-center text-muted-foreground/30">
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
          rows={MOCK_PRODUCT_TYPES}
          activeType={activeType}
          onTypeSelect={setActiveType}
          depth={depth}
          onDepthChange={setDepth}
        />

        {/* ── Distribution Row ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Color / Size / etc. Distribution */}
          <ColorDistributionWidget />

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
              buckets={MOCK_PRICE_DIST}
              onBucketClick={handleBucketClick}
            />
          </Card>
        </div>

        {/* ── Companies table ── */}
        <CompaniesCompareTable rows={MOCK_COMPANIES} />

        {/* ── Gender Distribution ── */}
        <GenderDistributionWidget />
      </div>
    </>
  );
}