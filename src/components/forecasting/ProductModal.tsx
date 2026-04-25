"use client";

import { useState } from "react";
import { ChevronRight, Eye, FilterLines, Home02 } from "@untitledui/icons";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { InventoryChart } from "./InventoryChart";
import type { ForecastRow } from "./types";

interface ProductModalProps {
    row: ForecastRow;
    onClose: () => void;
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-pressed={on}
            className={cn(
                "relative h-[18px] w-8 flex-shrink-0 cursor-pointer rounded-full border-0 transition-colors duration-200",
                on ? "bg-brand-solid" : "bg-bg-quaternary",
            )}
        >
            <span
                className={cn(
                    "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-[left] duration-200",
                    on ? "left-4" : "left-0.5",
                )}
            />
        </button>
    );
}

export function ProductModal({ row, onClose }: ProductModalProps) {
    const [wh, setWh] = useState(0);
    const [showHist, setShowHist] = useState(false);
    const [showPre, setShowPre] = useState(true);

    const platforms: [string, string, string[]][] = [
        [
            "Shopify",
            "#17B26A",
            [
                "Product Category: Short Sleeve Crew",
                "Variant ID: 415443880202195",
                `Variant SKU: ${row.sku.slice(0, 24)}`,
            ],
        ],
        [
            "Amazon",
            "#F79009",
            [
                "Product Category: Short Sleeve Crew",
                "Listing ID: 415443880202198",
                `Variant SKU: ${row.sku.slice(0, 24)}`,
            ],
        ],
    ];

    const meta: [string, string][] = [
        ["Lead Time", "30 days"],
        ["COGS", "18,75 € / unit"],
        ["RRP", "149,99 € / unit"],
        ["Supplier", "PLACEHOLDER"],
    ];

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="flex max-h-[90vh] w-full max-w-[960px] flex-col overflow-hidden gap-0 p-0"
            >
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border-secondary px-5 py-3.5">
                    <DialogTitle className="text-base font-bold text-text-primary">
                        Inventory Chart
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Inventory chart for {row.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid flex-1 grid-cols-[220px_1fr] overflow-hidden">
                    {/* Left rail */}
                    <div className="flex flex-col gap-2.5 overflow-y-auto border-r border-border-secondary p-4">
                        <div
                            className="flex aspect-square w-full items-center justify-center rounded-lg"
                            style={{ background: "linear-gradient(135deg,#f4f4f5,#e9eaec)" }}
                        >
                            <svg width="130" height="130" viewBox="0 0 130 130" fill="none">
                                {(["#4B5563", "#374151", "#1F2937", "#6B7280", "#9CA3AF"] as const).map(
                                    (c, i) => (
                                        <g key={i} transform={`translate(0,${i * -5})`}>
                                            <rect
                                                x="15"
                                                y={55 + i * 4}
                                                width="100"
                                                height="52"
                                                rx="4"
                                                fill={c}
                                                opacity={0.6 + i * 0.07}
                                            />
                                            <path
                                                d="M15 59 L35 42 L50 52 L65 42 L80 52 L95 42 L115 59"
                                                fill={c}
                                                opacity={0.6 + i * 0.07}
                                            />
                                            <rect
                                                x="49"
                                                y="42"
                                                width="32"
                                                height="18"
                                                rx="2"
                                                fill={c}
                                                opacity={0.45}
                                            />
                                        </g>
                                    ),
                                )}
                            </svg>
                        </div>
                        <div>
                            <span className="inline-flex items-center rounded bg-brand-solid px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                                NOGL ID: {row.sku.slice(-12)}
                            </span>
                            <div className="mt-1 text-[11px] text-text-tertiary">
                                First sold 5 years ago (18.09.2020)
                            </div>
                        </div>
                        <div className="text-sm font-bold leading-snug text-text-primary">
                            {row.name}
                        </div>
                        {row.size && (
                            <div className="text-xs text-text-secondary">{row.size}</div>
                        )}
                        <div className="flex items-center gap-1.5 border-y border-border-secondary py-1.5 text-xs text-text-secondary">
                            <FilterLines className="h-3.5 w-3.5 opacity-40" /> Menge 1 Das
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {platforms.map(([pl, col, lines]) => (
                                <div key={pl} className="flex gap-1.5">
                                    <div
                                        className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm"
                                        style={{ background: `${col}20` }}
                                    >
                                        <div
                                            className="h-2 w-2 rounded-full"
                                            style={{ background: col }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-px">
                                        {lines.map((l) => (
                                            <div
                                                key={l}
                                                className="break-all font-mono text-[10.5px] text-text-secondary"
                                            >
                                                {l}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-1 border-t border-border-secondary pt-1.5">
                            {meta.map(([k, v]) => (
                                <div key={k} className="flex gap-1.5 text-[11.5px]">
                                    <ChevronRight className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 opacity-30" />
                                    <span className="min-w-16 text-text-secondary">{k}</span>
                                    <span className="font-mono text-text-primary">{v}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-xs font-medium text-text-brand-secondary"
                        >
                            <Eye className="h-3.5 w-3.5" /> Show in Forecast
                        </button>
                    </div>
                    {/* Right rail */}
                    <div className="flex flex-col gap-3 overflow-y-auto p-4">
                        <span className="text-sm font-semibold text-text-primary">Inventory Chart</span>
                        <div className="flex w-fit gap-0.5 rounded-md border border-border-primary bg-bg-secondary p-0.5">
                            {["Example Warehouse 1", "Example Warehouse 2"].map((w, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setWh(i)}
                                    className={cn(
                                        "cursor-pointer rounded border-0 px-2.5 py-1 text-xs font-medium transition-colors",
                                        wh === i
                                            ? "bg-bg-primary text-text-primary shadow-xs"
                                            : "bg-transparent text-text-secondary",
                                    )}
                                >
                                    {w}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3.5">
                            {(
                                [
                                    [showHist, setShowHist, "Show History"],
                                    [showPre, setShowPre, "Show Unfulfilled Preorders"],
                                ] as [boolean, (v: boolean | ((p: boolean) => boolean)) => void, string][]
                            ).map(([on, set, label]) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-1.5 text-xs text-text-secondary"
                                >
                                    <Toggle on={on} onToggle={() => set((v) => !v)} />
                                    {label}
                                </div>
                            ))}
                        </div>
                        <InventoryChart showHistory={showHist} />
                        <div>
                            <div className="mb-2 text-[13px] font-semibold text-text-primary">
                                Out of Stock events
                            </div>
                            <div className="rounded-md border border-border-error-subtle bg-error px-3.5 py-2.5">
                                <div className="text-xs font-semibold text-text-error">
                                    30.05.2026 – 25.08.2027 (453 days)
                                </div>
                                <div className="mt-0.5 text-[11.5px] text-text-error-secondary">
                                    OOS Amount: <strong>18,6k units</strong>
                                </div>
                                <div className="mt-px text-[11.5px] text-text-error-secondary">
                                    Lost Revenue: <strong>25k €</strong>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="mb-1.5 text-[13px] font-semibold text-text-primary">
                                Incoming Inventories
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                                <Home02 className="h-3.5 w-3.5 opacity-40" />{" "}
                                {row.warehouses} warehouse{row.warehouses > 1 ? "s" : ""} · no incoming orders
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
