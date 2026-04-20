"use client";

import { ForecastChart } from "./ForecastChart";
import type {
  ForecastChannelData,
  ForecastChannelConfig,
  ForecastMetric,
  ForecastScale,
  ForecastQuantileValue,
  ForecastAnnotation,
  ForecastAnnotationKind,
} from "@/types/forecast";

interface AnnotationLayerToggle {
  kind: ForecastAnnotationKind;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}

interface ComparisonForecastChartProps {
  primaryData: ForecastChannelData;
  comparedData: ForecastChannelData;
  primaryLabel: string;
  comparedLabel: string;
  metric: ForecastMetric;
  scale: ForecastScale;
  quantile: ForecastQuantileValue;
  channels: ForecastChannelConfig[];
  annotations?: ForecastAnnotation[];
  annotationLayers?: AnnotationLayerToggle[];
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
  annotations,
  annotationLayers,
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
          annotations={annotations}
          annotationLayers={annotationLayers}
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
          annotations={annotations}
          annotationLayers={annotationLayers}
        />
      </div>
    </div>
  );
}
