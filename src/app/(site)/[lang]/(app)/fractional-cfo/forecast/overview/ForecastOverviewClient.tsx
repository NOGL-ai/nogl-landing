"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, startOfDay } from "date-fns";

import {
    FORECAST_CHANNELS,
    FORECAST_HISTORY_DAYS,
    FORECAST_HORIZON_DAYS,
    QUANTILE_LABELS,
    type ForecastChannelName,
    type ForecastMetric,
    type ForecastQuantile,
    type ForecastScale,
} from "@/config/forecast";
import {
    getForecastSales,
    getForecastAnnotations,
    type ForecastResponse,
    type ForecastAnnotationDTO,
} from "@/actions/forecast";
import { ForecastChart } from "@/components/forecast/charts/ForecastChart";
import { QueryClientProvider } from "@/components/atoms/QueryClientProvider";
import type {
    ForecastChannelConfig,
    ForecastChannelData,
    ForecastAnnotation,
    ForecastAnnotationKind,
} from "@/types/forecast";
import { cx } from "@/utils/cx";

type Mode = "stacked" | "grouped";

const ALL_CHANNEL_NAMES: readonly ForecastChannelName[] = FORECAST_CHANNELS.map((c) => c.name);

interface ForecastOverviewClientProps {
    companyId: string;
    companyName: string;
}

export function ForecastOverviewClient(props: ForecastOverviewClientProps) {
    // The (app) layout does not provide a QueryClient. Wrap locally so
    // `useQuery` works without leaking a provider into unrelated routes.
    return (
        <QueryClientProvider>
            <ForecastOverviewClientInner {...props} />
        </QueryClientProvider>
    );
}

function ForecastOverviewClientInner({ companyId, companyName }: ForecastOverviewClientProps) {
    const today = startOfDay(new Date());
    const [startDate] = useState(() => addDays(today, -FORECAST_HISTORY_DAYS));
    const [endDate] = useState(() => addDays(today, FORECAST_HORIZON_DAYS));

    const [mode, setMode] = useState<Mode>("grouped");
    const [scale, setScale] = useState<ForecastScale>("monthly");
    const [quantile, setQuantile] = useState<ForecastQuantile>(4);
    const [metric, setMetric] = useState<ForecastMetric>("sale");
    const [activeChannels, setActiveChannels] = useState<ReadonlySet<ForecastChannelName>>(
        () => new Set(ALL_CHANNEL_NAMES),
    );

    // Annotation layer toggles — all enabled by default.
    const [annotationLayerState, setAnnotationLayerState] = useState<
        Record<ForecastAnnotationKind, boolean>
    >({
        event_spike: true,
        out_of_stock: true,
        promotion: true,
        launch: true,
    });

    // ─── Data ─────────────────────────────────────────────────────────────
    const channelsKey = useMemo(
        () => Array.from(activeChannels).sort().join(","),
        [activeChannels],
    );

    const query = useQuery<ForecastResponse>({
        queryKey: [
            "forecast-overview",
            companyId,
            metric,
            scale,
            quantile,
            channelsKey,
            startDate.toISOString(),
            endDate.toISOString(),
        ],
        queryFn: () =>
            getForecastSales({
                companyId,
                startDate,
                endDate,
                channels: Array.from(activeChannels),
                quantile,
                scale,
            }),
        staleTime: 60_000,
    });

    const annotationsQuery = useQuery<ForecastAnnotationDTO[]>({
        queryKey: ["forecast-annotations", companyId, startDate.toISOString(), endDate.toISOString()],
        queryFn: () => getForecastAnnotations({ companyId, startDate, endDate }),
        staleTime: 5 * 60_000,
    });

    // ─── Derived ──────────────────────────────────────────────────────────
    const visibleChannels = useMemo<ForecastChannelConfig[]>(
        () => FORECAST_CHANNELS.filter((c) => activeChannels.has(c.name)),
        [activeChannels],
    );

    const chartData = (query.data?.channels ?? {}) as ForecastChannelData;

    // Map DTO → ForecastAnnotation (field names are identical; just narrow the types).
    const annotations = useMemo<ForecastAnnotation[]>(
        () =>
            (annotationsQuery.data ?? []).filter(
                (a) => annotationLayerState[a.kind as ForecastAnnotationKind],
            ) as ForecastAnnotation[],
        [annotationsQuery.data, annotationLayerState],
    );

    const annotationLayers = useMemo(
        () =>
            (
                [
                    { kind: "event_spike" as ForecastAnnotationKind, label: "Event Spike" },
                    { kind: "out_of_stock" as ForecastAnnotationKind, label: "Out of Stock" },
                    { kind: "promotion" as ForecastAnnotationKind, label: "Promotion" },
                    { kind: "launch" as ForecastAnnotationKind, label: "Launch" },
                ] as const
            ).map((layer) => ({
                kind: layer.kind,
                label: layer.label,
                enabled: annotationLayerState[layer.kind],
                onToggle: () =>
                    setAnnotationLayerState((prev) => ({
                        ...prev,
                        [layer.kind]: !prev[layer.kind],
                    })),
            })),
        [annotationLayerState],
    );

    // ─── Handlers ─────────────────────────────────────────────────────────
    const toggleChannel = (name: ForecastChannelName) => {
        setActiveChannels((prev) => {
            const next = new Set(prev);
            if (next.has(name)) {
                if (next.size === 1) return prev; // keep at least one channel active
                next.delete(name);
            } else {
                next.add(name);
            }
            return next;
        });
    };

    // ─── Render ───────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-bg-secondary p-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-4">
                <header>
                    <h1 className="text-2xl font-semibold text-text-primary">Forecasting Overview</h1>
                    <p className="text-sm text-text-secondary">
                        {companyName}
                        <span className="text-text-tertiary">
                            {" "}
                            · {FORECAST_HISTORY_DAYS}-day history + {FORECAST_HORIZON_DAYS}-day forecast across all sales
                            channels.
                        </span>
                    </p>
                </header>

                {/* Toolbar: scale | quantile | metric | mode */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <SegmentedToggle
                        ariaLabel="Scale"
                        options={[
                            { value: "daily", label: "Daily" },
                            { value: "weekly", label: "Weekly" },
                            { value: "monthly", label: "Monthly" },
                        ]}
                        value={scale}
                        onChange={setScale}
                    />
                    <SegmentedToggle
                        ariaLabel="Quantile"
                        options={[
                            { value: 3, label: QUANTILE_LABELS[3] },
                            { value: 4, label: QUANTILE_LABELS[4] },
                            { value: 5, label: QUANTILE_LABELS[5] },
                        ]}
                        value={quantile}
                        onChange={setQuantile}
                    />
                    <SegmentedToggle
                        ariaLabel="Metric"
                        options={[
                            { value: "sale", label: "Sale" },
                            { value: "revenue", label: "Revenue" },
                        ]}
                        value={metric}
                        onChange={setMetric}
                    />
                    <SegmentedToggle
                        ariaLabel="Mode"
                        options={[
                            { value: "grouped", label: "Grouped" },
                            { value: "stacked", label: "Stacked" },
                        ]}
                        value={mode}
                        onChange={setMode}
                    />
                </div>

                {/* Chart */}
                {query.isLoading ? (
                    <div className="flex h-[420px] flex-col gap-3 rounded-xl border border-border-secondary bg-bg-primary p-4">
                        <div className="h-4 w-48 animate-pulse rounded bg-bg-secondary" />
                        <div className="flex-1 animate-pulse rounded bg-bg-secondary" />
                    </div>
                ) : query.isError ? (
                    <div className="flex h-[420px] items-center justify-center rounded-xl border border-border-secondary bg-bg-primary p-4 text-sm text-error-primary">
                        Failed to load forecast: {(query.error as Error)?.message ?? "Unknown error"}
                    </div>
                ) : visibleChannels.length === 0 ? (
                    <div className="flex h-[420px] items-center justify-center rounded-xl border border-border-secondary bg-bg-primary p-4 text-sm text-text-tertiary">
                        Select at least one channel to render the chart.
                    </div>
                ) : (
                    <ForecastChart
                        data={chartData}
                        metric={metric}
                        scale={scale}
                        quantile={quantile}
                        channels={visibleChannels}
                        mode={mode}
                        startForecastDate={query.data?.startForecastDate}
                        height={420}
                        annotations={annotations}
                        annotationLayers={annotationLayers}
                    />
                )}

                {/* Channel legend with checkboxes */}
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    {FORECAST_CHANNELS.map((channel) => {
                        const checked = activeChannels.has(channel.name);
                        return (
                            <label
                                key={channel.name}
                                className="inline-flex cursor-pointer items-center gap-2 text-text-secondary"
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleChannel(channel.name)}
                                    className="h-3.5 w-3.5 cursor-pointer accent-[#2970FF]"
                                    aria-label={`Toggle ${channel.label} channel`}
                                />
                                <span
                                    aria-hidden="true"
                                    className="inline-block h-3 w-3 rounded"
                                    style={{ background: channel.colorFg }}
                                />
                                <span>{channel.label}</span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Inline UI bits ──────────────────────────────────────────────────────

interface SegmentedToggleProps<T extends string | number> {
    ariaLabel: string;
    options: ReadonlyArray<{ value: T; label: string }>;
    value: T;
    onChange: (next: T) => void;
}

function SegmentedToggle<T extends string | number>({
    ariaLabel,
    options,
    value,
    onChange,
}: SegmentedToggleProps<T>) {
    return (
        <div
            role="radiogroup"
            aria-label={ariaLabel}
            className="flex overflow-hidden rounded-md border border-border-primary"
        >
            {options.map((opt) => {
                const active = opt.value === value;
                return (
                    <button
                        key={String(opt.value)}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(opt.value)}
                        className={cx(
                            "px-3 py-1.5 text-xs font-medium transition",
                            active
                                ? "bg-bg-secondary text-text-primary"
                                : "bg-bg-primary text-text-tertiary hover:bg-bg-secondary",
                        )}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
