"use client";

import { useEffect, useMemo, useState, type ComponentType, type SVGProps } from "react";
import {
    Bookmark,
    Eye,
    FilterFunnel01,
    FilterLines,
    Grid01,
    Link01,
    Printer,
    SearchLg,
    Settings01,
    X,
} from "@untitledui/icons";
import { cn } from "@/lib/utils";
import { AlertRow } from "./AlertRow";
import { ProductModal } from "./ProductModal";
import { DraftDrawer } from "./DraftDrawer";
import type { ForecastRow, ForecastTab } from "./types";

type SortDir = "none" | "desc" | "asc";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const TAB_TONES: Record<string, "default" | "warning" | "purple" | "orange"> = {
    reorder: "warning",
    overstock: "purple",
    demand: "orange",
};

const TAB_PILL_TONE_CLASSES: Record<"default" | "warning" | "purple" | "orange", string> = {
    warning: "bg-warning text-text-warning-secondary",
    purple: "bg-brand-secondary text-text-brand-secondary",
    orange: "bg-warning text-text-warning-secondary",
    default: "bg-bg-secondary text-text-tertiary",
};

const TOOLBAR_BUTTONS: ReadonlyArray<readonly [string, IconComponent]> = [
    ["Filter", FilterFunnel01],
    ["Sort", FilterLines],
    ["Group", Grid01],
    ["View", Eye],
    ["Save", Bookmark],
];

const COLUMN_HEADERS: ReadonlyArray<readonly [string, "left" | "right"]> = [
    ["Name", "left"],
    ["Warehouses", "left"],
    ["Reorder Window", "left"],
    ["Stock", "right"],
    ["Predicted OOS Date", "left"],
    ["Reach", "left"],
];

const HEAD_TH_BASE =
    "px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary whitespace-nowrap";

export function ForecastingClient() {
    const [rows, setRows] = useState<ForecastRow[]>([]);
    const [tabs, setTabs] = useState<ForecastTab[]>([]);
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [chartRow, setChartRow] = useState<ForecastRow | null>(null);
    const [drawer, setDrawer] = useState<"order" | "transfer" | null>(null);
    const [oosSort, setOosSort] = useState<SortDir>("none");
    const [loading, setLoading] = useState(true);

    // Initial fetch (tabs + rows)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [tRes, pRes] = await Promise.all([
                    fetch("/api/forecasting/tabs"),
                    fetch("/api/forecasting/products"),
                ]);
                const tJson = await tRes.json();
                const pJson = await pRes.json();
                if (!cancelled) {
                    setTabs(tJson.tabs);
                    setRows(pJson.rows);
                    setLoading(false);
                }
            } catch (err) {
                console.error("[forecasting] fetch failed", err);
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const visibleRows = useMemo(() => {
        let out = rows;
        if (search) {
            const q = search.toLowerCase();
            out = out.filter(
                (r) =>
                    r.name.toLowerCase().includes(q) ||
                    r.sku.toLowerCase().includes(q),
            );
        }
        if (activeTab === "reorder") {
            out = out.filter((r) => r.reach.label === "Reorder");
        } else if (activeTab === "overstock" || activeTab === "ovall") {
            out = out.filter((r) => r.reach.label === "Overstock");
        } else if (activeTab === "demand") {
            out = out.filter((r) => r.reach.label === "Out of stock");
        }
        if (oosSort === "desc") {
            out = [...out].sort((a, b) => b.oosImpactSort - a.oosImpactSort);
        } else if (oosSort === "asc") {
            out = [...out].sort((a, b) => a.oosImpactSort - b.oosImpactSort);
        }
        return out;
    }, [rows, search, activeTab, oosSort]);

    const allSelected =
        visibleRows.length > 0 && visibleRows.every((r) => selected.has(r.id));
    const someSelected =
        visibleRows.some((r) => selected.has(r.id)) && !allSelected;

    const toggleAll = () => {
        const next = new Set(selected);
        if (allSelected) {
            visibleRows.forEach((r) => next.delete(r.id));
        } else {
            visibleRows.forEach((r) => next.add(r.id));
        }
        setSelected(next);
    };

    const toggleRow = (id: number) => {
        const next = new Set(selected);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelected(next);
    };

    const toggleExpand = (id: number) => {
        const next = new Set(expanded);
        next.has(id) ? next.delete(id) : next.add(id);
        setExpanded(next);
    };

    const cycleOosSort = () => {
        setOosSort((s) => (s === "none" ? "desc" : s === "desc" ? "asc" : "none"));
    };

    const selectedRows = useMemo(
        () => rows.filter((r) => selected.has(r.id)),
        [rows, selected],
    );

    return (
        <div className="flex flex-col gap-4 bg-bg-primary text-text-primary">
            {/* Page header */}
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <div className="mb-1 text-xs text-text-tertiary">
                        Fractional CFO &nbsp;/&nbsp; Forecasting
                    </div>
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-text-primary">
                        Forecasting · Alert Overview
                    </h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Reorder windows, OOS risk and releasable capital across SKUs.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 rounded-md border border-border-primary bg-bg-primary px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-secondary">
                        <Printer className="h-3.5 w-3.5" /> Export
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-md bg-brand-solid px-3 py-1.5 text-xs font-semibold text-text-on-brand transition-colors hover:bg-brand-solid-hover">
                        <Settings01 className="h-3.5 w-3.5" /> Configure rules
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-border-secondary">
                {tabs.map((t) => {
                    const active = t.id === activeTab;
                    const tone = TAB_TONES[t.id] ?? "default";
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={cn(
                                "-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors",
                                active
                                    ? "border-border-brand-solid font-semibold text-text-primary"
                                    : "border-transparent font-medium text-text-tertiary hover:text-text-primary",
                            )}
                        >
                            {t.label}
                            <span
                                className={cn(
                                    "rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                                    TAB_PILL_TONE_CLASSES[tone],
                                )}
                            >
                                {t.count}
                            </span>
                        </button>
                    );
                })}
                <button
                    aria-label="Add tab"
                    className="px-2.5 py-2 text-base text-text-tertiary hover:text-text-primary"
                >
                    +
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[240px] max-w-xs flex-1">
                    <SearchLg className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or SKU..."
                        className="h-9 w-full rounded-md border border-border-primary bg-bg-primary pl-8 pr-3 text-sm text-text-primary placeholder:text-text-quaternary focus:outline-none focus:ring-2 focus:ring-border-brand"
                    />
                </div>
                {TOOLBAR_BUTTONS.map(([label, Icon]) => (
                    <button
                        key={label}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border-primary bg-bg-primary px-3 text-sm font-medium text-text-secondary hover:bg-bg-secondary"
                    >
                        <Icon className="h-3 w-3" /> {label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-border-secondary bg-bg-primary shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1280px] border-collapse text-sm">
                        <thead className="border-b border-border-secondary bg-bg-secondary">
                            <tr>
                                <th className="w-7 px-3 py-2.5 text-left">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={(el) => {
                                            if (el) el.indeterminate = someSelected;
                                        }}
                                        onChange={toggleAll}
                                        className="h-3.5 w-3.5 cursor-pointer accent-brand-solid"
                                    />
                                </th>
                                <th className="w-6"></th>
                                {COLUMN_HEADERS.map(([label, align]) => (
                                    <th
                                        key={label}
                                        className={cn(
                                            HEAD_TH_BASE,
                                            align === "right" ? "text-right" : "text-left",
                                        )}
                                    >
                                        {label}
                                    </th>
                                ))}
                                <th
                                    className={cn(
                                        HEAD_TH_BASE,
                                        "text-left cursor-pointer select-none",
                                    )}
                                    onClick={cycleOosSort}
                                    title="Click to sort by OOS Impact"
                                >
                                    <span className="inline-flex items-center gap-1">
                                        OOS Impact{" "}
                                        <span
                                            className={cn(
                                                "font-mono text-[9px]",
                                                oosSort !== "none"
                                                    ? "text-text-brand"
                                                    : "text-text-quaternary",
                                            )}
                                        >
                                            {oosSort === "desc"
                                                ? "▼"
                                                : oosSort === "asc"
                                                  ? "▲"
                                                  : "↕"}
                                        </span>
                                    </span>
                                </th>
                                {(["Releasable Current", "Releasable Incoming"] as const).map(
                                    (label) => (
                                        <th
                                            key={label}
                                            className={cn(HEAD_TH_BASE, "text-left")}
                                        >
                                            {label}
                                        </th>
                                    ),
                                )}
                                <th className="w-[70px]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={11}
                                        className="px-4 py-10 text-center text-sm text-text-tertiary"
                                    >
                                        Loading inventory…
                                    </td>
                                </tr>
                            ) : visibleRows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={11}
                                        className="px-4 py-10 text-center text-sm text-text-tertiary"
                                    >
                                        No products match this filter.
                                    </td>
                                </tr>
                            ) : (
                                visibleRows.map((r) => (
                                    <AlertRow
                                        key={r.id}
                                        row={r}
                                        selected={selected.has(r.id)}
                                        expanded={expanded.has(r.id)}
                                        onToggleSelect={() => toggleRow(r.id)}
                                        onToggleExpand={() => toggleExpand(r.id)}
                                        onOpenChart={() => setChartRow(r)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border-secondary bg-bg-secondary px-4 py-2.5 text-xs text-text-tertiary">
                    <span>
                        Showing <strong>{visibleRows.length}</strong> of{" "}
                        <strong>{rows.length}</strong> alerts
                    </span>
                    <span className="inline-flex gap-2">
                        <button className="inline-flex items-center rounded border border-border-primary bg-bg-primary px-2.5 py-1 text-xs text-text-secondary hover:bg-bg-secondary">
                            Previous
                        </button>
                        <button className="inline-flex items-center rounded border border-border-primary bg-bg-primary px-2.5 py-1 text-xs text-text-secondary hover:bg-bg-secondary">
                            Next
                        </button>
                    </span>
                </div>
            </div>

            {/* Bulk action bar */}
            {selected.size > 0 && (
                <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-gray-900 px-4 py-2.5 text-white shadow-2xl [animation:fc-slide-up_200ms_cubic-bezier(.16,1,.3,1)]">
                    <span className="text-sm">
                        <strong className="font-mono">{selected.size}</strong> selected
                    </span>
                    <span className="h-5 w-px bg-white/20" />
                    <button
                        onClick={() => setDrawer("order")}
                        className="inline-flex items-center gap-1.5 rounded-md bg-brand-solid px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-solid-hover"
                    >
                        <Printer className="h-3.5 w-3.5" /> Order
                    </button>
                    <button
                        onClick={() => setDrawer("transfer")}
                        className="inline-flex items-center gap-1.5 rounded-md bg-brand-solid-active px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-solid"
                    >
                        <Link01 className="h-3.5 w-3.5" /> Transfer
                    </button>
                    <button
                        onClick={() => setSelected(new Set())}
                        aria-label="Clear selection"
                        className="ml-1 flex rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {chartRow && (
                <ProductModal row={chartRow} onClose={() => setChartRow(null)} />
            )}
            {drawer && (
                <DraftDrawer
                    type={drawer}
                    selectedRows={selectedRows}
                    onClose={() => setDrawer(null)}
                />
            )}
        </div>
    );
}
