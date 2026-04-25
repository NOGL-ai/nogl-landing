"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Home02, Trash01 } from "@untitledui/icons";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/base/buttons/button";
import { cn } from "@/lib/utils";
import type { ForecastRow } from "./types";

interface DraftDrawerProps {
    type: "order" | "transfer";
    selectedRows: ForecastRow[];
    onClose: () => void;
}

const fmtEur = (n: number) =>
    `${n.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} €`;

export function DraftDrawer({ type, selectedRows, onClose }: DraftDrawerProps) {
    const isOrder = type === "order";
    const title = isOrder ? "Draft order" : "Draft transfer";

    const initQtys: Record<number, number> = {};
    selectedRows.forEach((r) => {
        const match = r.reorder.label.match(/\d+/);
        initQtys[r.id] = match ? parseInt(match[0], 10) : 0;
    });
    const [qtys, setQtys] = useState(initQtys);
    const [includeZero, setIncludeZero] = useState(false);
    const [expanded, setExpanded] = useState(true);

    const updateQty = (id: number, val: string) => {
        const n = Math.max(0, parseInt(val, 10) || 0);
        setQtys((prev) => ({ ...prev, [id]: n }));
    };

    const totalUnits = selectedRows.reduce((s, r) => s + (qtys[r.id] || 0), 0);
    const totalCost = selectedRows.reduce((s, r) => s + (qtys[r.id] || 0) * 18.75, 0);
    const suppliers = 1;
    const variants = selectedRows.length;

    const visibleRows = includeZero
        ? selectedRows
        : selectedRows.filter((r) => (qtys[r.id] || 0) > 0 || initQtys[r.id] > 0);

    const stats: [string, string][] = [
        [String(suppliers), "Suppliers"],
        [String(variants), "Variants"],
        [totalUnits.toLocaleString(), "Units"],
        [fmtEur(totalCost), "Total"],
    ];

    return (
        <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                className="flex w-full max-w-[400px] flex-col gap-0 p-0"
            >
                {/* Header */}
                <SheetHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border-secondary px-5 py-4">
                    <SheetTitle className="text-base font-bold text-text-primary">
                        {title}
                    </SheetTitle>
                    <SheetDescription className="sr-only">{title} drawer</SheetDescription>
                </SheetHeader>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-1 border-b border-border-secondary px-5 py-3.5">
                    {stats.map(([v, l]) => (
                        <div key={l} className="text-center">
                            <div
                                className={cn(
                                    "font-mono font-bold leading-tight text-text-primary",
                                    l === "Total" ? "text-[15px]" : "text-lg",
                                )}
                            >
                                {v}
                            </div>
                            <div className="mt-0.5 text-[11px] text-text-tertiary">{l}</div>
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-3.5">
                    <div
                        className="grid grid-cols-[1fr_50px_90px_100px_24px] gap-1.5 border-b border-border-secondary pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-quaternary"
                    >
                        <span></span>
                        <span className="text-right">VARIANTS</span>
                        <span className="text-right">COST</span>
                        <span>ORDER TARGET</span>
                        <span></span>
                    </div>
                    <div className="grid grid-cols-[1fr_50px_90px_100px_24px] items-center gap-1.5 text-[12.5px]">
                        <div>
                            <div className="text-xs font-semibold text-text-primary">
                                PLACEHOLDER
                            </div>
                            <div className="text-[11px] text-text-tertiary">
                                → Example Warehouse 1
                            </div>
                        </div>
                        <div className="text-right font-mono text-xs">{variants}</div>
                        <div className="text-right font-mono text-xs">{fmtEur(totalCost)}</div>
                        <div>
                            <select
                                className="w-full cursor-pointer rounded border border-border-primary bg-bg-primary px-1 py-0.5 text-[11px] text-text-secondary"
                            >
                                <option>New draft order</option>
                                <option>Add to existing</option>
                            </select>
                        </div>
                        <button
                            type="button"
                            aria-label="Remove"
                            className="cursor-pointer border-0 bg-transparent p-0 text-text-tertiary"
                        >
                            <Trash01 className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* Include zero toggle */}
                    <div className="flex items-center gap-2 text-[12.5px] text-text-secondary">
                        <button
                            type="button"
                            onClick={() => setIncludeZero((v) => !v)}
                            aria-pressed={includeZero}
                            className={cn(
                                "relative h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-0 transition-colors duration-200",
                                includeZero ? "bg-brand-solid" : "bg-bg-quaternary",
                            )}
                        >
                            <span
                                className={cn(
                                    "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-[left] duration-200",
                                    includeZero ? "left-3.5" : "left-0.5",
                                )}
                            />
                        </button>
                        Include zero amount items
                    </div>

                    <Button color="primary" size="md" className="w-full">
                        {isOrder
                            ? `Save ${suppliers} Order`
                            : `Save ${suppliers} Transfer`}
                    </Button>

                    {/* Variants section */}
                    <div className="overflow-hidden rounded-lg border border-border-primary">
                        <button
                            type="button"
                            onClick={() => setExpanded((v) => !v)}
                            className="flex w-full cursor-pointer items-center gap-2 border-0 bg-bg-secondary px-3.5 py-2.5 text-[12.5px]"
                        >
                            {expanded ? (
                                <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
                            )}
                            <span className="flex-1 text-left text-xs font-semibold text-text-primary">
                                PLACEHOLDER → Example Warehouse 1
                            </span>
                            <span className="text-[11px] text-text-tertiary">
                                {variants} variants · {fmtEur(totalCost)}
                            </span>
                            <Trash01 className="h-3.5 w-3.5 text-text-tertiary" />
                        </button>

                        {expanded &&
                            visibleRows.map((row) => (
                                <div
                                    key={row.id}
                                    className="flex items-center gap-2.5 border-t border-border-secondary px-3.5 py-2.5"
                                >
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-border-secondary bg-bg-secondary">
                                        <Home02 className="h-3.5 w-3.5 opacity-40" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-[12.5px] font-medium text-text-primary">
                                            {row.name}
                                        </div>
                                        <div className="text-[11px] text-text-tertiary">
                                            {row.size || "—"}
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        value={qtys[row.id] ?? 0}
                                        onChange={(e) => updateQty(row.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-16 rounded border border-border-primary bg-bg-primary px-2 py-1 text-right font-mono text-[12.5px] text-text-primary"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Remove variant"
                                        className="cursor-pointer border-0 bg-transparent p-0.5 text-text-tertiary"
                                    >
                                        <Trash01 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
