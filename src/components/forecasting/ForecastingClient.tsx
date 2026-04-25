"use client";

import { useEffect, useMemo, useState } from "react";
import { Ico, ICONS } from "./icons";
import { AlertRow } from "./AlertRow";
import { ProductModal } from "./ProductModal";
import { DraftDrawer } from "./DraftDrawer";
import type { ForecastRow, ForecastTab } from "./types";

type SortDir = "none" | "desc" | "asc";

const TAB_TONES: Record<string, "default" | "warning" | "purple" | "orange"> = {
    reorder: "warning",
    overstock: "purple",
    demand: "orange",
};

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
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                background: "var(--color-bg-primary)",
                color: "var(--color-text-primary)",
            }}
        >
            <style jsx global>{`
                @keyframes fc-slide-in-r {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
                @keyframes fc-slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .fc-row:hover {
                    background: var(--color-bg-secondary) !important;
                }
            `}</style>

            {/* Page header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 11,
                            color: "var(--color-text-tertiary)",
                            marginBottom: 4,
                        }}
                    >
                        Fractional CFO &nbsp;/&nbsp; Forecasting
                    </div>
                    <h1
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: "var(--color-text-primary)",
                            letterSpacing: "-0.01em",
                            lineHeight: 1.15,
                        }}
                    >
                        Forecasting · Alert Overview
                    </h1>
                    <p
                        style={{
                            fontSize: 13,
                            color: "var(--color-text-secondary)",
                            marginTop: 4,
                        }}
                    >
                        Reorder windows, OOS risk and releasable capital across SKUs.
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: "var(--color-bg-primary)",
                            border: "1px solid var(--color-border-primary)",
                            borderRadius: 7,
                            padding: "6px 12px",
                            fontSize: 12.5,
                            color: "var(--color-text-secondary)",
                            cursor: "pointer",
                            fontWeight: 500,
                        }}
                    >
                        <Ico path={ICONS.print} size={13} /> Export
                    </button>
                    <button
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: "#1570EF",
                            color: "#fff",
                            border: 0,
                            borderRadius: 7,
                            padding: "6px 12px",
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        <Ico path={ICONS.cog} size={13} /> Configure rules
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div
                style={{
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap",
                    borderBottom: "1px solid var(--color-border-secondary)",
                    paddingBottom: 0,
                }}
            >
                {tabs.map((t) => {
                    const active = t.id === activeTab;
                    const tone = TAB_TONES[t.id];
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 12px",
                                background: "transparent",
                                border: 0,
                                borderBottom: `2px solid ${active ? "#7F56D9" : "transparent"}`,
                                color: active
                                    ? "var(--color-text-primary)"
                                    : "var(--color-text-secondary)",
                                fontSize: 12.5,
                                fontWeight: active ? 600 : 500,
                                cursor: "pointer",
                                marginBottom: -1,
                            }}
                        >
                            {t.label}
                            <span
                                style={{
                                    fontSize: 10.5,
                                    fontWeight: 600,
                                    padding: "1px 6px",
                                    borderRadius: 4,
                                    background:
                                        tone === "warning"
                                            ? "#FEF0C7"
                                            : tone === "purple"
                                              ? "#F4EBFF"
                                              : tone === "orange"
                                                ? "#FFEAD5"
                                                : "var(--color-bg-secondary)",
                                    color:
                                        tone === "warning"
                                            ? "#B54708"
                                            : tone === "purple"
                                              ? "#6941C6"
                                              : tone === "orange"
                                                ? "#B93815"
                                                : "var(--color-text-tertiary)",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                {t.count}
                            </span>
                        </button>
                    );
                })}
                <button
                    aria-label="Add tab"
                    style={{
                        padding: "8px 10px",
                        background: "transparent",
                        border: 0,
                        color: "var(--color-text-tertiary)",
                        cursor: "pointer",
                        fontSize: 16,
                    }}
                >
                    +
                </button>
            </div>

            {/* Toolbar */}
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 320 }}>
                    <Ico
                        path={[
                            "M21 21l-4.35-4.35",
                            "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z",
                        ]}
                        size={14}
                        style={{
                            position: "absolute",
                            left: 9,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--color-text-tertiary)",
                        }}
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or SKU..."
                        style={{
                            width: "100%",
                            padding: "7px 10px 7px 30px",
                            border: "1px solid var(--color-border-primary)",
                            borderRadius: 7,
                            fontSize: 12.5,
                            background: "var(--color-bg-primary)",
                            color: "var(--color-text-primary)",
                            outline: "none",
                        }}
                    />
                </div>
                {(
                    [
                        ["Filter", ICONS.filter],
                        ["Sort", ICONS.sort],
                        ["Group", ICONS.grid],
                        ["View", ICONS.eye],
                        ["Save", ICONS.bookmark],
                    ] as [string, string][]
                ).map(([label, icon]) => (
                    <button
                        key={label}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            background: "var(--color-bg-primary)",
                            border: "1px solid var(--color-border-primary)",
                            borderRadius: 7,
                            padding: "6px 10px",
                            fontSize: 12.5,
                            color: "var(--color-text-secondary)",
                            cursor: "pointer",
                            fontWeight: 500,
                        }}
                    >
                        <Ico path={icon} size={12} /> {label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div
                style={{
                    border: "1px solid var(--color-border-secondary)",
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "var(--color-bg-primary)",
                }}
            >
                <div style={{ overflowX: "auto" }}>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            minWidth: 1280,
                            fontSize: 12.5,
                        }}
                    >
                        <thead>
                            <tr
                                style={{
                                    background: "var(--color-bg-secondary)",
                                    borderBottom: "1px solid var(--color-border-secondary)",
                                }}
                            >
                                <th
                                    style={{
                                        padding: "10px 6px 10px 12px",
                                        textAlign: "left",
                                        width: 28,
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={(el) => {
                                            if (el) el.indeterminate = someSelected;
                                        }}
                                        onChange={toggleAll}
                                        style={{
                                            width: 14,
                                            height: 14,
                                            accentColor: "#7F56D9",
                                            cursor: "pointer",
                                        }}
                                    />
                                </th>
                                <th style={{ width: 24 }}></th>
                                {(
                                    [
                                        ["Name", "left"],
                                        ["Warehouses", "left"],
                                        ["Reorder Window", "left"],
                                        ["Stock", "right"],
                                        ["Predicted OOS Date", "left"],
                                        ["Reach", "left"],
                                    ] as [string, "left" | "right"][]
                                ).map(([label, align]) => (
                                    <th
                                        key={label}
                                        style={{
                                            padding: "10px 12px",
                                            textAlign: align,
                                            fontSize: 10.5,
                                            fontWeight: 600,
                                            color: "var(--color-text-quaternary)",
                                            textTransform: "uppercase",
                                            letterSpacing: ".06em",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {label}
                                    </th>
                                ))}
                                <th
                                    style={{
                                        padding: "10px 12px",
                                        textAlign: "left",
                                        fontSize: 10.5,
                                        fontWeight: 600,
                                        color: "var(--color-text-quaternary)",
                                        textTransform: "uppercase",
                                        letterSpacing: ".06em",
                                        whiteSpace: "nowrap",
                                        cursor: "pointer",
                                        userSelect: "none",
                                    }}
                                    onClick={cycleOosSort}
                                    title="Click to sort by OOS Impact"
                                >
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                        }}
                                    >
                                        OOS Impact{" "}
                                        <span
                                            style={{
                                                fontFamily: "var(--font-mono)",
                                                color:
                                                    oosSort !== "none"
                                                        ? "#7F56D9"
                                                        : "var(--color-text-quaternary)",
                                                fontSize: 9,
                                            }}
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
                                            style={{
                                                padding: "10px 12px",
                                                textAlign: "left",
                                                fontSize: 10.5,
                                                fontWeight: 600,
                                                color: "var(--color-text-quaternary)",
                                                textTransform: "uppercase",
                                                letterSpacing: ".06em",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {label}
                                        </th>
                                    ),
                                )}
                                <th style={{ width: 70 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={11}
                                        style={{
                                            padding: 40,
                                            textAlign: "center",
                                            color: "var(--color-text-tertiary)",
                                            fontSize: 13,
                                        }}
                                    >
                                        Loading inventory…
                                    </td>
                                </tr>
                            ) : visibleRows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={11}
                                        style={{
                                            padding: 40,
                                            textAlign: "center",
                                            color: "var(--color-text-tertiary)",
                                            fontSize: 13,
                                        }}
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
                <div
                    style={{
                        padding: "10px 16px",
                        background: "var(--color-bg-secondary)",
                        borderTop: "1px solid var(--color-border-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "var(--color-text-tertiary)",
                    }}
                >
                    <span>
                        Showing <strong>{visibleRows.length}</strong> of{" "}
                        <strong>{rows.length}</strong> alerts
                    </span>
                    <span style={{ display: "inline-flex", gap: 8 }}>
                        <button
                            style={{
                                background: "transparent",
                                border: "1px solid var(--color-border-primary)",
                                borderRadius: 5,
                                padding: "3px 9px",
                                fontSize: 11.5,
                                color: "var(--color-text-secondary)",
                                cursor: "pointer",
                            }}
                        >
                            Previous
                        </button>
                        <button
                            style={{
                                background: "transparent",
                                border: "1px solid var(--color-border-primary)",
                                borderRadius: 5,
                                padding: "3px 9px",
                                fontSize: 11.5,
                                color: "var(--color-text-secondary)",
                                cursor: "pointer",
                            }}
                        >
                            Next
                        </button>
                    </span>
                </div>
            </div>

            {/* Bulk action bar */}
            {selected.size > 0 && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 24,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#101828",
                        color: "#fff",
                        borderRadius: 10,
                        padding: "10px 16px",
                        boxShadow: "0 12px 32px rgba(0,0,0,.25)",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        zIndex: 40,
                        animation: "fc-slide-up 200ms cubic-bezier(.16,1,.3,1)",
                    }}
                >
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                        <strong style={{ fontFamily: "var(--font-mono)" }}>
                            {selected.size}
                        </strong>{" "}
                        selected
                    </span>
                    <span
                        style={{
                            width: 1,
                            height: 20,
                            background: "rgba(255,255,255,.2)",
                        }}
                    />
                    <button
                        onClick={() => setDrawer("order")}
                        style={{
                            background: "#1570EF",
                            color: "#fff",
                            border: 0,
                            borderRadius: 6,
                            padding: "6px 12px",
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                        }}
                    >
                        <Ico path={ICONS.print} size={13} /> Order
                    </button>
                    <button
                        onClick={() => setDrawer("transfer")}
                        style={{
                            background: "#7F56D9",
                            color: "#fff",
                            border: 0,
                            borderRadius: 6,
                            padding: "6px 12px",
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                        }}
                    >
                        <Ico path={ICONS.link} size={13} /> Transfer
                    </button>
                    <button
                        onClick={() => setSelected(new Set())}
                        aria-label="Clear selection"
                        style={{
                            background: "transparent",
                            border: 0,
                            color: "rgba(255,255,255,.7)",
                            cursor: "pointer",
                            padding: 4,
                            display: "flex",
                        }}
                    >
                        <Ico path={ICONS.x} size={14} />
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
