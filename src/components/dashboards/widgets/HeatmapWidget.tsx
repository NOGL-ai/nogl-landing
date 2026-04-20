"use client";

import type { HeatmapConfig, WidgetQueryResult } from "@/lib/dashboards/widgetSchemas";
import { z } from "zod";

type Config = z.infer<typeof HeatmapConfig>;
type Cells = NonNullable<WidgetQueryResult["cells"]>;

const SCHEME: Record<Config["colorScheme"], [string, string]> = {
  green:  ["#dcfce7", "#166534"],
  blue:   ["#dbeafe", "#1e40af"],
  red:    ["#fee2e2", "#991b1b"],
  purple: ["#ede9fe", "#5b21b6"],
};

function lerp(t: number, from: string, to: string): string {
  // Simple linear interpolation between two hex colours
  const hex = (s: string) =>
    [s.slice(1, 3), s.slice(3, 5), s.slice(5, 7)].map((h) => parseInt(h, 16));
  const [r1, g1, b1] = hex(from);
  const [r2, g2, b2] = hex(to);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

interface Props {
  cells: Cells;
  config: Config;
}

export function HeatmapWidget({ cells, config }: Props) {
  if (!cells.length) {
    return (
      <p className="flex h-full items-center justify-center text-xs text-muted-foreground">
        No data
      </p>
    );
  }

  const rows = [...new Set(cells.map((c) => c.row))];
  const cols = [...new Set(cells.map((c) => c.col))];
  const maxVal = Math.max(...cells.map((c) => c.value), 1);

  const [fromColor, toColor] = SCHEME[config.colorScheme] ?? SCHEME.blue;

  const lookup = new Map<string, number>();
  for (const cell of cells) lookup.set(`${cell.row}|${cell.col}`, cell.value);

  return (
    <div className="overflow-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="pb-1 pr-2 text-left text-muted-foreground"></th>
            {cols.map((col) => (
              <th
                key={col}
                className="pb-1 pr-1 text-center font-normal text-muted-foreground"
              >
                <span className="block max-w-[64px] truncate">{col}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              <td className="pr-2 py-0.5 text-right text-muted-foreground">
                <span className="block max-w-[72px] truncate">{row}</span>
              </td>
              {cols.map((col) => {
                const val = lookup.get(`${row}|${col}`) ?? 0;
                const t = val / maxVal;
                return (
                  <td key={col} className="pr-1 py-0.5">
                    <div
                      className="h-5 w-full min-w-[28px] rounded-sm"
                      style={{ background: lerp(t, fromColor, toColor) }}
                      title={`${row} × ${col}: ${val.toFixed(1)}`}
                    />
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
