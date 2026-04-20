import { X, Download01 as Download } from '@untitledui/icons';
"use client";

import { useState } from "react";

import { ToggleGroup } from "./ToggleGroup";
import { QuantileSelect } from "./QuantileSelect";
import { exportForecastData } from "@/actions/forecast";
import type { ForecastScale, ForecastQuantileValue } from "@/types/forecast";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  defaultDateRange: { start: string; end: string };
  defaultScale: ForecastScale;
  defaultQuantile: ForecastQuantileValue;
}

type Granularity = "variant" | "product" | "category";

const PREVIEW_COLUMNS = ["date", "category", "product", "channel", "real_value", "forecast_value"];

function toCsv(rows: object[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  return [
    keys.join(","),
    ...rows.map((r) =>
      keys.map((k) => {
        const val = (r as Record<string, unknown>)[k] ?? "";
        const str = String(val);
        return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(",")
    ),
  ].join("\n");
}

export function ExportModal({
  open,
  onClose,
  companyId,
  defaultDateRange,
  defaultScale,
  defaultQuantile,
}: ExportModalProps) {
  const [scale, setScale] = useState<ForecastScale>(defaultScale);
  const [quantile, setQuantile] = useState<ForecastQuantileValue>(defaultQuantile);
  const [granularity, setGranularity] = useState<Granularity>("category");
  const [preview, setPreview] = useState(false);
  const [previewRows, setPreviewRows] = useState<object[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    setLoading(true);
    try {
      const rows = await exportForecastData({
        companyId,
        startDate: defaultDateRange.start,
        endDate: defaultDateRange.end,
        scale,
        quantile,
      });
      setPreviewRows(rows);
      setPreview(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const rows = await exportForecastData({
        companyId,
        startDate: defaultDateRange.start,
        endDate: defaultDateRange.end,
        scale,
        quantile,
      });
      const csv = toCsv(rows);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `forecast-export-${scale}-${defaultDateRange.start}-${defaultDateRange.end}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Export Forecast Data</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Time Granularity
            </p>
            <ToggleGroup
              options={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
              ]}
              value={scale}
              onChange={(v) => setScale(v as ForecastScale)}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Product Grouping
            </p>
            <div className="flex flex-col gap-1.5">
              {(["category", "product", "variant"] as Granularity[]).map((g) => (
                <label key={g} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name="granularity"
                    value={g}
                    checked={granularity === g}
                    onChange={() => setGranularity(g)}
                    className="accent-primary"
                  />
                  <span className="capitalize">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Scenario
            </p>
            <QuantileSelect value={quantile} onChange={setQuantile} />
          </div>
        </div>

        {/* Preview table */}
        {preview && previewRows.length > 0 && (
          <div className="mt-4 overflow-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {PREVIEW_COLUMNS.map((c) => (
                    <th key={c} className="px-2 py-1.5 text-left font-medium uppercase text-muted-foreground">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {PREVIEW_COLUMNS.map((c) => (
                      <td key={c} className="px-2 py-1.5 text-muted-foreground">
                        {String((row as Record<string, unknown>)[c] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={handlePreview}
            disabled={loading}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
        </div>
      </div>
    </>
  );
}
