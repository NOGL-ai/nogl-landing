"use client";

import { ForecastChart } from "./ForecastChart";
import type {
  ForecastChannelData,
  ForecastChannelConfig,
  ForecastMetric,
  ForecastScale,
  ForecastQuantileValue,
} from "@/types/forecast";

interface ComparisonForecastChartProps {
  primaryData: ForecastChannelData;
  comparedData: ForecastChannelData;
  primaryLabel: string;
  comparedLabel: string;
  metric: ForecastMetric;
  scale: ForecastScale;
  quantile: ForecastQuantileValue;
  channels: ForecastChannelConfig[];
}

export function ComparisonForecastChart({
  primaryData,
  comparedData,
  primaryLabel,
  comparedLabel,
  metric,
  scale,
  quantile,
  channels,
}: ComparisonForecastChartProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{primaryLabel}</p>
        <ForecastChart
          data={primaryData}
          metric={metric}
          scale={scale}
          quantile={quantile}
          channels={channels}
          height={300}
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{comparedLabel}</p>
        <ForecastChart
          data={comparedData}
          metric={metric}
          scale={scale}
          quantile={quantile}
          channels={channels}
          height={300}
        />
      </div>
    </div>
  );
}
