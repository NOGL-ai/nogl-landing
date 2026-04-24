"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface PricePoint {
  ts: string;
  avgPrice: number;
}

export function ProductPriceHistoryChart({ data }: { data: PricePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed border-[#e5e7eb] text-xs text-[#64748b]">
        No price history yet — snapshot job runs nightly.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis
          dataKey="ts"
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
          tickFormatter={(v: number) => `€${Math.round(v).toLocaleString()}`}
        />
        <Tooltip
          formatter={(v: number) => [`€${Math.round(v).toLocaleString()}`, "Avg price"]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="avgPrice"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 2.5, fill: "#2563eb" }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BrandSparkCard({ brand, series }: { brand: string; series: number[] }) {
  if (series.length === 0) return null;
  const data = series.map((v, i) => ({ i, v }));
  const first = series[0] ?? 0;
  const last = series[series.length - 1] ?? 0;
  const delta = first !== 0 ? ((last - first) / first) * 100 : 0;
  const positive = delta >= 0;

  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-[#fafbfc] p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#0f172a]">{brand}</p>
        <span
          className={`text-xs font-medium tabular-nums ${
            positive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {positive ? "+" : ""}
          {delta.toFixed(1)}%
        </span>
      </div>
      <p className="mt-1 text-lg font-bold tabular-nums text-[#0f172a]">
        €{Math.round(last).toLocaleString()}
      </p>
      <div className="mt-2 h-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={positive ? "#10b981" : "#ef4444"}
              strokeWidth={1.75}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
