"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Grid,
  LayoutList,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { DonutBadge } from "@/components/companies/pricing/DonutBadge";
import { PriceRangeBar } from "@/components/companies/pricing/PriceRangeBar";
import { fmtPrice } from "@/components/companies/pricing/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CompareProductTypeRow {
  name: string;
  /** Breadcrumb segments, e.g. ["Apparel & Accessories", "Clothing", "Tops"] */
  breadcrumb?: string[];
  product_count: number;
  pct_tagged: number;
  avg_rating: number | null;
  pct_discounted: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  avg_full_price: number;
  avg_discount_pct: number;
}

interface CompareProductTypesTableProps {
  rows: CompareProductTypeRow[];
  activeType: string | null;
  onTypeSelect: (type: string | null) => void;
  depth: number;
  onDepthChange: (d: number) => void;
  loading?: boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

export const MOCK_PRODUCT_TYPES: CompareProductTypeRow[] = [
  {
    name: "Tops",
    breadcrumb: ["Apparel & Accessories", "Clothing", "Tops"],
    product_count: 1243,
    pct_tagged: 94,
    avg_rating: 4.3,
    pct_discounted: 38,
    min_price: 12,
    max_price: 290,
    avg_price: 68,
    avg_full_price: 82,
    avg_discount_pct: 17.2,
  },
  {
    name: "Dresses",
    breadcrumb: ["Apparel & Accessories", "Clothing", "Dresses"],
    product_count: 887,
    pct_tagged: 91,
    avg_rating: 4.5,
    pct_discounted: 42,
    min_price: 24,
    max_price: 450,
    avg_price: 118,
    avg_full_price: 145,
    avg_discount_pct: 18.8,
  },
  {
    name: "Bottoms",
    breadcrumb: ["Apparel & Accessories", "Clothing", "Bottoms"],
    product_count: 764,
    pct_tagged: 89,
    avg_rating: 4.2,
    pct_discounted: 31,
    min_price: 18,
    max_price: 320,
    avg_price: 74,
    avg_full_price: 86,
    avg_discount_pct: 14.0,
  },
  {
    name: "Footwear",
    breadcrumb: ["Apparel & Accessories", "Footwear"],
    product_count: 612,
    pct_tagged: 96,
    avg_rating: 4.1,
    pct_discounted: 28,
    min_price: 30,
    max_price: 680,
    avg_price: 142,
    avg_full_price: 160,
    avg_discount_pct: 11.2,
  },
  {
    name: "Accessories",
    breadcrumb: ["Apparel & Accessories", "Accessories"],
    product_count: 534,
    pct_tagged: 88,
    avg_rating: 4.4,
    pct_discounted: 22,
    min_price: 8,
    max_price: 220,
    avg_price: 45,
    avg_full_price: 50,
    avg_discount_pct: 9.4,
  },
  {
    name: "Outerwear",
    breadcrumb: ["Apparel & Accessories", "Clothing", "Outerwear"],
    product_count: 389,
    pct_tagged: 90,
    avg_rating: 4.6,
    pct_discounted: 35,
    min_price: 60,
    max_price: 890,
    avg_price: 210,
    avg_full_price: 255,
    avg_discount_pct: 17.6,
  },
  {
    name: "Activewear",
    breadcrumb: ["Apparel & Accessories", "Clothing", "Activewear"],
    product_count: 278,
    pct_tagged: 85,
    avg_rating: 4.3,
    pct_discounted: 26,
    min_price: 15,
    max_price: 180,
    avg_price: 62,
    avg_full_price: 72,
    avg_discount_pct: 13.9,
  },
];

// ── Helper components ─────────────────────────────────────────────────────────

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <ArrowUp className="ml-1 inline h-3 w-3" />;
  if (isSorted === "desc") return <ArrowDown className="ml-1 inline h-3 w-3" />;
  return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30" />;
}

const MAX_DEPTH = 5;
const MIN_DEPTH = 1;

const columnHelper = createColumnHelper<CompareProductTypeRow>();

// ── Main component ────────────────────────────────────────────────────────────

export function CompareProductTypesTable({
  rows,
  activeType,
  onTypeSelect,
  depth,
  onDepthChange,
  loading = false,
}: CompareProductTypesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const validPrices = rows.filter((r) => r.min_price > 0 || r.max_price > 0);
  const globalMin = validPrices.length > 0 ? Math.min(...validPrices.map((r) => r.min_price)) : 0;
  const globalMax = validPrices.length > 0 ? Math.max(...validPrices.map((r) => r.max_price)) : 1;

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      enableSorting: true,
      meta: { align: "left" },
      cell: (info) => {
        const breadcrumb = info.row.original.breadcrumb;
        const isActive = info.getValue() === activeType;
        return (
          <div className="flex flex-col gap-0.5">
            {breadcrumb && breadcrumb.length > 1 && (
              <span className="text-[10px] text-muted-foreground">
                {breadcrumb.slice(0, -1).join(" · ")}
              </span>
            )}
            <span
              className={`font-medium ${isActive ? "text-primary underline underline-offset-2" : "text-foreground"}`}
            >
              {info.getValue()}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("product_count", {
      header: "# Products",
      enableSorting: true,
      meta: { align: "right" },
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">{info.getValue().toLocaleString()}</span>
      ),
    }),
    columnHelper.accessor("pct_tagged", {
      header: "% Tagged",
      enableSorting: false,
      meta: { align: "right" },
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">{info.getValue()}%</span>
      ),
    }),
    columnHelper.accessor("avg_rating", {
      header: "Avg. Rating",
      enableSorting: false,
      meta: { align: "right" },
      cell: (info) => {
        const v = info.getValue();
        return v != null ? (
          <span className="tabular-nums text-muted-foreground">⭐ {v.toFixed(1)}</span>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        );
      },
    }),
    columnHelper.accessor("pct_discounted", {
      header: "% Discounted",
      enableSorting: false,
      meta: { align: "center" },
      cell: (info) => <DonutBadge pct={info.getValue() ?? 0} />,
    }),
    columnHelper.display({
      id: "price_range",
      header: "Price Range",
      enableSorting: false,
      meta: { align: "left" },
      cell: (info) => (
        <PriceRangeBar
          min={info.row.original.min_price}
          max={info.row.original.max_price}
          globalMin={globalMin}
          globalMax={globalMax}
        />
      ),
    }),
    columnHelper.accessor("avg_price", {
      header: "Avg. Price",
      enableSorting: true,
      meta: { align: "right" },
      cell: (info) => (
        <span className="tabular-nums text-foreground">{fmtPrice(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("avg_full_price", {
      header: "Avg. Full Price",
      enableSorting: false,
      meta: { align: "right" },
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">{fmtPrice(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("avg_discount_pct", {
      header: "Avg. Discount",
      enableSorting: true,
      meta: { align: "right" },
      cell: (info) => {
        const v = info.getValue();
        return v != null && v > 0 ? (
          <span className="tabular-nums text-orange-500">{v.toFixed(1)}%</span>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card className="overflow-hidden p-0">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Product Types</h3>
          <div className="group relative">
            <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground/60" />
            <div className="absolute left-1/2 top-full z-50 mt-1.5 hidden w-64 -translate-x-1/2 rounded-lg border border-border bg-popover p-2.5 text-[11px] text-muted-foreground shadow-md group-hover:block">
              Categorization depth refers to what level of specificity is used to display product
              types. 1 being more general, 5 being more specific.
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Export as CSV"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <div className="relative">
            <button
              type="button"
              title="Open in Product Matrix (Coming Soon)"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground/40 transition-colors"
              disabled
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <span className="absolute -right-1 -top-1 rounded-full bg-orange-500 px-1 text-[8px] font-bold text-white">
              Soon
            </span>
          </div>
          <div className="flex rounded-md border border-border">
            <button
              type="button"
              title="List view"
              className="flex h-7 w-7 items-center justify-center rounded-l-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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

      {/* Depth selector */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-2">
        <span className="text-xs text-muted-foreground">Depth</span>
        <button
          type="button"
          onClick={() => onDepthChange(Math.max(MIN_DEPTH, depth - 1))}
          disabled={depth <= MIN_DEPTH}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_DEPTH }, (_, i) => i + 1).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDepthChange(d)}
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium transition-colors
                ${d === depth
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
            >
              {d}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onDepthChange(Math.min(MAX_DEPTH, depth + 1))}
          disabled={depth >= MAX_DEPTH}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2 p-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="px-5 py-8 text-sm text-muted-foreground">No category data available.</p>
      ) : (
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 440 }}>
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 border-b border-border bg-card">
              {table.getHeaderGroups().map((headerGroup) => (
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
              {table.getRowModel().rows.map((row) => {
                const isActive = row.original.name === activeType;
                return (
                  <tr
                    key={row.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/20 ${isActive ? "bg-primary/5" : ""}`}
                    onClick={() => onTypeSelect(isActive ? null : row.original.name)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const align = cell.column.columnDef.meta?.align ?? "left";
                      return (
                        <td
                          key={cell.id}
                          className={`px-4 py-3
                            ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}
                            ${cell.column.id === "name" ? "max-w-[220px]" : ""}
                          `}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom depth pagination */}
      <div className="flex items-center justify-center gap-2 border-t border-border px-5 py-2">
        <button
          type="button"
          onClick={() => onDepthChange(Math.max(MIN_DEPTH, depth - 1))}
          disabled={depth <= MIN_DEPTH}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
        {Array.from({ length: MAX_DEPTH }, (_, i) => i + 1).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDepthChange(d)}
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium transition-colors
              ${d === depth
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onDepthChange(Math.min(MAX_DEPTH, depth + 1))}
          disabled={depth >= MAX_DEPTH}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </Card>
  );
}
