"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { EventsPerDayRow } from "@/app/api/ads-events/overview/route";

const PLATFORM_COLORS: Record<string, string> = {
  META_ADS_LIBRARY: "#1877f2",
  INSTAGRAM: "#c13584",
  FACEBOOK: "#4267B2",
  TIKTOK: "#010101",
};

const PLATFORM_LABELS: Record<string, string> = {
  META_ADS_LIBRARY: "Meta Ads",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
};

interface EventsPerDayChartProps {
  data: EventsPerDayRow[];
}

function formatDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}

export function EventsPerDayChart({ data }: EventsPerDayChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-tertiary">
        No events in the last 30 days
      </div>
    );
  }

  const platforms = (
    ["META_ADS_LIBRARY", "INSTAGRAM", "FACEBOOK", "TIKTOK"] as const
  ).filter((p) => data.some((d) => d[p] > 0));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border-secondary" />
        <XAxis
          dataKey="day"
          tickFormatter={formatDay}
          tick={{ fontSize: 11 }}
          className="text-text-tertiary"
        />
        <YAxis tick={{ fontSize: 11 }} className="text-text-tertiary" />
        <Tooltip
          formatter={(val, name) => [
            val,
            PLATFORM_LABELS[name as string] ?? name,
          ]}
          labelFormatter={(l) => formatDay(l as string)}
        />
        <Legend
          formatter={(name) => PLATFORM_LABELS[name] ?? name}
          wrapperStyle={{ fontSize: 12 }}
        />
        {platforms.map((p) => (
          <Bar
            key={p}
            dataKey={p}
            stackId="a"
            fill={PLATFORM_COLORS[p]}
            radius={platforms[platforms.length - 1] === p ? [3, 3, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
