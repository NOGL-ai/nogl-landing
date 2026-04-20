"use client";
import { Loading01 as LoaderCircleIcon, AlertCircle as AlertCircleIcon } from '@untitledui/icons';


import { Loading01 as LoaderCircleIcon, AlertCircle as AlertCircleIcon } from '@untitledui/icons';


import { useWidgetData } from "@/hooks/useWidgetData";
import type {
  DashboardWidgetRow,
  GlobalFilters,
} from "@/lib/dashboards/widgetSchemas";
import { TopTableWidget } from "./TopTableWidget";
import { StatWidget } from "./StatWidget";
import { LineChartWidget } from "./LineChartWidget";
import { BarChartWidget } from "./BarChartWidget";
import { PieWidget } from "./PieWidget";
import { HeatmapWidget } from "./HeatmapWidget";
import { SparklineWidget } from "./SparklineWidget";
import { MarkdownWidget } from "./MarkdownWidget";


interface Props {
  widget: DashboardWidgetRow;
  globalFilters: GlobalFilters;
}

export function WidgetRenderer({ widget, globalFilters }: Props) {
  const { data, loading, error } = useWidgetData(widget, globalFilters);

  if (loading) {
    return (
      <div className="flex h-full min-h-[80px] items-center justify-center">
        <LoaderCircleIcon className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[80px] flex-col items-center justify-center gap-1 text-center">
        <AlertCircleIcon className="h-5 w-5 text-destructive/70" />
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  // Markdown is special — no data fetch needed
  if (widget.type === "markdown") {
    const cfg = widget.config as Extract<typeof widget.config, { type: "markdown" }>;
    return <MarkdownWidget content={cfg.content} />;
  }

  switch (widget.type) {
    case "top_table":
      return (
        <TopTableWidget
          rows={data.rows ?? []}
          config={widget.config as Extract<typeof widget.config, { type: "top_table" }>}
        />
      );
    case "stat":
      return (
        <StatWidget
          value={data.value ?? 0}
          delta={data.delta}
          config={widget.config as Extract<typeof widget.config, { type: "stat" }>}
        />
      );
    case "line_chart":
      return (
        <LineChartWidget
          series={data.series ?? []}
          config={widget.config as Extract<typeof widget.config, { type: "line_chart" }>}
        />
      );
    case "bar_chart":
      return (
        <BarChartWidget
          series={data.series ?? []}
          config={widget.config as Extract<typeof widget.config, { type: "bar_chart" }>}
        />
      );
    case "pie":
      return (
        <PieWidget
          slices={data.slices ?? []}
          config={widget.config as Extract<typeof widget.config, { type: "pie" }>}
        />
      );
    case "heatmap":
      return (
        <HeatmapWidget
          cells={data.cells ?? []}
          config={widget.config as Extract<typeof widget.config, { type: "heatmap" }>}
        />
      );
    case "sparkline":
      return (
        <SparklineWidget
          value={data.value ?? 0}
          delta={data.delta ?? 0}
          series={data.series ?? []}
          config={widget.config as Extract<typeof widget.config, { type: "sparkline" }>}
        />
      );
    default:
      return (
        <p className="text-xs text-muted-foreground">
          Unknown widget type: {widget.type}
        </p>
      );
  }
}