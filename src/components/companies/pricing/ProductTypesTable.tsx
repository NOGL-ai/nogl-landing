"use client";
import { SwitchVertical01 as ArrowUpDown, ArrowUp, ArrowDown } from '@untitledui/icons';


import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import type { CompanyPricingProductTypeRow } from "@/types/company";
import { DonutBadge } from "./DonutBadge";
import { PriceRangeBar } from "./PriceRangeBar";
import { fmtPrice } from "./utils";

interface ProductTypesTableProps {
  rows: CompanyPricingProductTypeRow[];
  activeType: string | null;
  onTypeSelect: (type: string | null) => void;
  globalMin: number;
  globalMax: number;
  totalProducts: number;
  loading?: boolean;
}

const columnHelper = createColumnHelper<CompanyPricingProductTypeRow>();

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <ArrowUp className="ml-1 inline h-3 w-3" />;
  if (isSorted === "desc") return <ArrowDown className="ml-1 inline h-3 w-3" />;
  return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30" />;
}

export function ProductTypesTable({
  rows,
  activeType,
  onTypeSelect,
  globalMin,
  globalMax,
  totalProducts,
  loading = false,
}: ProductTypesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = [
    columnHelper.accessor("type", {
      header: "Name",
      enableSorting: true,
      meta: { align: "left" },
      cell: (info) => {
        const isActive = info.getValue() === activeType;
        return (
          <span
            className={
              isActive ? "text-primary underline underline-offset-2" : "text-foreground"
            }
          >
            {info.getValue()}
          </span>
        );
      },
    }),
    columnHelper.accessor("count", {
      header: "# Products",
      enableSorting: true,
      meta: { align: "right" },
      cell: (info) => (
        <span className="tabular-nums text-muted-foreground">
          {info.getValue().toLocaleString()}
        </span>
      ),
    }),
    columnHelper.accessor("avg_discount_pct", {
      id: "pct_discounted",
      header: "% Discounted",
      enableSorting: true,
      meta: { align: "center" },
      cell: (info) => <DonutBadge pct={info.getValue() ?? 0} />,
    }),
    columnHelper.accessor("avg_price", {
      header: "Avg. Price",
      enableSorting: true,
      meta: { align: "right" },
      cell: (info) => (
        <span className="tabular-nums text-foreground">{fmtPrice(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("avg_discount_pct", {
      id: "avg_discount_display",
      header: "Avg. Discount",
      enableSorting: false,
      meta: { align: "right" },
      cell: (info) => {
        const v = info.getValue();
        return v != null && v > 0 ? (
          <span className="tabular-nums text-emerald-500">{v.toFixed(1)}%</span>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        );
      },
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
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">Product Types</h3>
        <span className="text-xs text-muted-foreground">
          {totalProducts.toLocaleString()} products · click row to filter
        </span>
      </div>

      {loading ? (
        <div className="space-y-2 p-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="px-5 py-8 text-sm text-muted-foreground">No category data yet.</p>
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
                        className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground
                          ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}
                          ${header.id === "type" ? "px-5" : ""}
                          ${header.id === "price_range" ? "px-5" : ""}
                          ${canSort ? "cursor-pointer select-none hover:text-foreground" : ""}
                        `}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <SortIcon isSorted={header.column.getIsSorted()} />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map((row) => {
                const isActive = row.original.type === activeType;
                return (
                  <tr
                    key={row.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/20 ${isActive ? "bg-primary/5" : ""}`}
                    onClick={() =>
                      onTypeSelect(isActive ? null : row.original.type)
                    }
                  >
                    {row.getVisibleCells().map((cell) => {
                      const align = cell.column.columnDef.meta?.align ?? "left";
                      return (
                        <td
                          key={cell.id}
                          className={`px-4 py-3
                            ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}
                            ${cell.column.id === "type" ? "max-w-[200px] truncate px-5 font-medium" : ""}
                            ${cell.column.id === "price_range" ? "px-5" : ""}
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
    </Card>
  );
}