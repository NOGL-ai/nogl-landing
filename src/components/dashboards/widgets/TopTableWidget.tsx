"use client";

import type { TableRow } from "@/lib/dashboards/widgetSchemas";
import type { TopTableConfig } from "@/lib/dashboards/widgetSchemas";
import { z } from "zod";
import { StarIcon } from "lucide-react";
import Image from "next/image";

type Config = z.infer<typeof TopTableConfig>;

interface Props {
  rows: TableRow[];
  config: Config;
}

// Format helpers
function fmtNumber(v: unknown): string {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (isNaN(n)) return String(v);
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toFixed(0);
}

function fmtCurrency(v: unknown): string {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (isNaN(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}m`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
}

function fmtPercent(v: unknown): string {
  if (v === null || v === undefined) return "—";
  return `${Number(v).toFixed(1)}%`;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      <span className="text-xs font-medium">{rating.toFixed(1)}</span>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`h-3 w-3 ${i < full ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
        />
      ))}
    </span>
  );
}

export function TopTableWidget({ rows, config }: Props) {
  const isCompact = config.rowDensity === "compact";

  // Determine which columns to show (always show rank + name + config.columns)
  const extraCols = config.columns.length > 0 ? config.columns : defaultColumns(config);

  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-muted-foreground">No data</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="w-8 py-1.5 pr-2 text-left font-medium">Rank</th>
            <th className="py-1.5 pr-2 text-left font-medium">
              {config.entityKind === "company" ? "Company" : "Product"}
            </th>
            {extraCols.map((col) => (
              <th key={col.field} className="py-1.5 pr-2 text-right font-medium">
                {col.label ?? col.field}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className={`border-b border-border/50 transition-colors hover:bg-muted/40 ${
                isCompact ? "h-8" : "h-12"
              }`}
            >
              <td className="py-1 pr-2 text-muted-foreground">{Number(row.rank ?? idx + 1)}</td>
              <td className="py-1 pr-2">
                <div className="flex items-center gap-2">
                  {typeof row.imageUrl === "string" && row.imageUrl && !isCompact && (
                    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-sm border bg-muted">
                      <Image
                        src={row.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <span className="truncate max-w-[180px] font-medium">
                    {String(row.name ?? row.companyName ?? "—")}
                  </span>
                </div>
              </td>
              {extraCols.map((col) => {
                const val = row[col.field];
                return (
                  <td key={col.field} className="py-1 pr-2 text-right">
                    {renderCell(val, col.format)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderCell(val: unknown, format?: string): React.ReactNode {
  if (val === null || val === undefined) return <span className="text-muted-foreground">—</span>;

  switch (format) {
    case "currency":
      return <span>{fmtCurrency(val)}</span>;
    case "percent":
      return <span>{fmtPercent(val)}</span>;
    case "number":
      return <span>{fmtNumber(val)}</span>;
    case "rating":
      return typeof val === "number" ? <StarRating rating={val} /> : <span>{String(val)}</span>;
    case "image":
      return val ? (
        <div className="relative ml-auto h-6 w-6 overflow-hidden rounded-sm border bg-muted">
          <Image src={String(val)} alt="" fill className="object-cover" unoptimized />
        </div>
      ) : <span className="text-muted-foreground">—</span>;
    default:
      return <span>{String(val)}</span>;
  }
}

function defaultColumns(config: Config) {
  if (config.entityKind === "company") {
    return [
      { field: "avgPrice", label: "Avg Price", format: "currency" as const },
      { field: "totalProducts", label: "SKUs", format: "number" as const },
    ];
  }
  return [
    { field: config.rankBy.field, label: config.rankBy.field, format: "number" as const },
  ];
}
