"use client";
import { SwitchVertical01 as ArrowUpDown, ArrowUp, ArrowDown, Download01 as Download, List as LayoutList, LayoutGrid01 as LayoutGrid, InfoCircle as Info, LinkExternal01 as ExternalLink } from '@untitledui/icons';


import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";

import { useState } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { fmtPrice } from "@/components/companies/pricing/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CompanyCompareRow {
  id: string;
  slug: string;
  name: string;
  initials: string;
  logo_url: string | null;
  product_count: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  market_share_pct: number;
}

interface CompaniesCompareTableProps {
  rows: CompanyCompareRow[];
  loading?: boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

export const MOCK_COMPANIES: CompanyCompareRow[] = [
  {
    id: "1",
    slug: "zara",
    name: "Zara",
    initials: "ZR",
    logo_url: null,
    product_count: 3241,
    min_price: 12,
    max_price: 450,
    avg_price: 68,
    market_share_pct: 42,
  },
  {
    id: "2",
    slug: "hm",
    name: "H&M",
    initials: "HM",
    logo_url: null,
    product_count: 2887,
    min_price: 8,
    max_price: 320,
    avg_price: 42,
    market_share_pct: 37,
  },
  {
    id: "3",
    slug: "uniqlo",
    name: "Uniqlo",
    initials: "UQ",
    logo_url: null,
    product_count: 1654,
    min_price: 15,
    max_price: 280,
    avg_price: 55,
    market_share_pct: 21,
  },
];

// ── Helper components ─────────────────────────────────────────────────────────

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <ArrowUp className="ml-1 inline h-3 w-3" />;
  if (isSorted === "desc") return <ArrowDown className="ml-1 inline h-3 w-3" />;
  return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30" />;
}

function CompanyAvatar({ row }: { row: CompanyCompareRow }) {
  if (row.logo_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={row.logo_url}
        alt={row.name}
        className="h-7 w-7 rounded-full border border-border object-contain"
      />
    );
  }
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
      {row.initials}
    </div>
  );
}

const columnHelper = createColumnHelper<CompanyCompareRow>();

// ── Main component ────────────────────────────────────────────────────────────

export function CompaniesCompareTable({ rows, loading = false }: CompaniesCompareTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = [
    columnHelper.display({
      id: "logo",
      header: "Logo",
      enableSorting: false,
      meta: { align: "center" },
      cell: (info) => <CompanyAvatar row={info.row.original} />,
    }),
    columnHelper.accessor("name", {
      header: "Company Name",
      enableSorting: true,
      meta: { align: "left" },
      cell: (info) => (
        <span className="font-medium text-foreground">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("product_count", {
      header: "# Products",
      enableSorting: true,
      meta: { align: "right" },
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">
          {info.getValue().toLocaleString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: "price_range",
      header: "Price Range",
      enableSorting: false,
      meta: { align: "left" },
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">
          {fmtPrice(info.row.original.min_price)} – {fmtPrice(info.row.original.max_price)}
        </span>
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
    columnHelper.accessor("market_share_pct", {
      header: () => (
        <div className="inline-flex items-center gap-1">
          Market Share
          <div className="group relative">
            <Info className="h-3 w-3 cursor-help text-muted-foreground/60" />
            <div className="absolute right-0 top-full z-50 mt-1.5 hidden w-48 rounded-lg border border-border bg-popover p-2 text-[10px] text-muted-foreground shadow-md group-hover:block">
              Relative share among tracked companies by product count.
            </div>
          </div>
        </div>
      ),
      enableSorting: true,
      meta: { align: "right" },
      cell: (info) => {
        const v = info.getValue();
        return (
          <div className="flex items-center justify-end gap-2">
            <div className="h-1.5 w-16 rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary/60"
                style={{ width: `${Math.min(v, 100)}%` }}
              />
            </div>
            <span className="tabular-nums text-muted-foreground">{v}%</span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "action",
      header: "Action",
      enableSorting: false,
      meta: { align: "center" },
      cell: (info) => (
        <Link
          href={`/en/companies?company=${encodeURIComponent(info.row.original.slug)}`}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          Explore
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </Link>
      ),
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
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">Companies</h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Download"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
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

      {loading ? (
        <div className="space-y-2 p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="px-5 py-8 text-sm text-muted-foreground">No companies selected.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-card">
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
              {table.getRowModel().rows.map((row) => (
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
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}