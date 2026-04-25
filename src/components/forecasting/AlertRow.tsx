"use client";

import { Check, ChevronRight, DotsHorizontal, Eye, Home02 } from "@untitledui/icons";

import { cn } from "@/lib/utils";

import type { ForecastRow } from "./types";

interface AlertRowProps {
    row: ForecastRow;
    selected: boolean;
    expanded: boolean;
    onToggleSelect: () => void;
    onToggleExpand: () => void;
    onOpenChart: () => void;
}

const REORDER_CLASSES: Record<"purple" | "blue" | "gray", string> = {
    purple: "bg-brand-secondary text-text-brand-secondary",
    blue: "bg-brand-secondary text-text-brand-secondary",
    gray: "bg-bg-secondary text-text-secondary",
};

const DAY_CLASSES: Record<"red" | "orange" | "blue" | "purple" | "gray", string> = {
    red: "bg-error text-text-error-secondary",
    orange: "bg-warning text-text-warning-secondary",
    blue: "bg-brand-secondary text-text-brand-secondary",
    purple: "bg-brand-secondary text-text-brand-secondary",
    gray: "bg-bg-secondary text-text-secondary",
};

const REACH_CLASSES: Record<string, { text: string; fill: string }> = {
    Reorder: { text: "text-text-warning", fill: "bg-warning-solid" },
    Overstock: { text: "text-text-brand-secondary", fill: "bg-brand-solid" },
    "Out of stock": { text: "text-text-error", fill: "bg-error-solid" },
    OK: { text: "text-text-success", fill: "bg-success-solid" },
    Critical: { text: "text-text-error", fill: "bg-error-solid" },
};

const OOS_TEXT: Record<"red" | "orange" | "muted", string> = {
    red: "text-text-error",
    orange: "text-text-warning",
    muted: "text-text-secondary",
};

export function AlertRow({
    row,
    selected,
    expanded,
    onToggleSelect,
    onToggleExpand,
    onOpenChart,
}: AlertRowProps) {
    const reorderClass = REORDER_CLASSES[row.reorder.type];
    const dayClass = DAY_CLASSES[row.reorder.daysColor];
    const reachClasses =
        REACH_CLASSES[row.reach.label] ?? {
            text: "text-text-secondary",
            fill: "bg-border-secondary",
        };
    const oosClass = OOS_TEXT[row.oos.tone];

    return (
        <>
            <tr
                className={cn(
                    "fc-row border-b border-border-secondary transition-colors",
                    selected ? "bg-brand-secondary/40" : "bg-bg-primary",
                )}
            >
                {/* Select */}
                <td className="py-2.5 pl-3 pr-1.5 align-middle">
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={onToggleSelect}
                        className="h-3.5 w-3.5 cursor-pointer accent-brand-solid"
                    />
                </td>
                {/* Expand */}
                <td className="px-1.5 py-2.5 align-middle">
                    <button
                        onClick={onToggleExpand}
                        aria-label={expanded ? "Collapse" : "Expand"}
                        className={cn(
                            "flex h-[18px] w-[18px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-text-tertiary transition-transform",
                            expanded && "rotate-90",
                        )}
                    >
                        <ChevronRight className="h-[11px] w-[11px]" />
                    </button>
                </td>
                {/* Name */}
                <td className="min-w-[220px] px-3 py-2.5 align-middle">
                    <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                        {row.badges.map((b) => (
                            <span
                                key={b}
                                className="rounded-sm bg-warning px-1.5 py-px text-[9.5px] font-bold uppercase tracking-[.04em] text-text-warning-secondary"
                            >
                                {b}
                            </span>
                        ))}
                        <span className="text-[13px] font-medium text-text-primary">
                            {row.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[11.5px] text-text-tertiary">
                        {row.size && (
                            <span className="font-medium text-text-secondary">
                                {row.size}
                            </span>
                        )}
                        <span className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {row.sku}
                        </span>
                    </div>
                </td>
                {/* Warehouses */}
                <td className="px-3 py-2.5 align-middle">
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-border-secondary bg-bg-secondary px-2 py-[3px] text-[11.5px] text-text-secondary">
                        <Home02 className="h-[11px] w-[11px] opacity-55" />
                        <span className="font-mono">{row.warehouses}</span>
                        <span className="max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {row.wh}
                        </span>
                    </div>
                </td>
                {/* Reorder */}
                <td className="px-3 py-2.5 align-middle">
                    <div className="flex flex-col items-start gap-1">
                        <span
                            className={cn(
                                "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                                reorderClass,
                            )}
                        >
                            {row.reorder.label}
                        </span>
                        <span
                            className={cn(
                                "rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold",
                                dayClass,
                            )}
                        >
                            {row.reorder.days}
                        </span>
                    </div>
                </td>
                {/* Stock */}
                <td className="px-3 py-2.5 text-right align-middle">
                    <div className="font-mono text-[13px] font-semibold text-text-primary">
                        {row.stock.current.toLocaleString()}
                    </div>
                    <div className="mt-0.5 font-mono text-[10.5px] text-text-tertiary">
                        +{row.stock.incoming.toLocaleString()} · ↑{row.stock.preorder} · ↓
                        {row.stock.reserved}
                    </div>
                </td>
                {/* OOS */}
                <td className="px-3 py-2.5 align-middle">
                    <div className={cn("font-mono text-[11.5px]", oosClass)}>
                        {row.oos.date}
                    </div>
                    <div className="mt-0.5 text-[10.5px] text-text-tertiary">
                        {row.oos.eta}
                    </div>
                </td>
                {/* Reach */}
                <td className="px-3 py-2.5 align-middle">
                    <div
                        className={cn(
                            "mb-[3px] font-mono text-[11.5px] font-semibold",
                            reachClasses.text,
                        )}
                    >
                        {row.reach.days}
                    </div>
                    <div className="mb-[3px] flex gap-px">
                        {row.reach.segs.map((on, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1 flex-1 rounded-sm",
                                    on ? reachClasses.fill : "bg-border-secondary",
                                )}
                            />
                        ))}
                    </div>
                    <div className={cn("text-[10px] font-semibold", reachClasses.text)}>
                        {row.reach.label}
                    </div>
                </td>
                {/* OOS Impact */}
                <td className="px-3 py-2.5 align-middle">
                    {row.oosImpact.ok ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-success">
                            <Check className="h-3 w-3" /> {row.oosImpact.text}
                        </span>
                    ) : row.oosImpact.potential ? (
                        <span
                            className="inline-flex items-center gap-1 rounded-sm bg-warning px-1.5 py-0.5 text-[11px] font-medium text-text-warning-secondary"
                            title="Potential lost revenue if reorder is delayed"
                        >
                            ⚠ {row.oosImpact.text}
                        </span>
                    ) : (
                        <>
                            <div className="font-mono text-[12px] font-bold text-text-error-secondary">
                                {row.oosImpact.value}
                            </div>
                            <div className="font-mono text-[10.5px] text-text-error-secondary opacity-85">
                                {row.oosImpact.units}
                            </div>
                        </>
                    )}
                </td>
                {/* Releasable Current */}
                <td className="px-3 py-2.5 align-middle">
                    {row.relCurrent ? (
                        <>
                            <div className="font-mono text-[12px] font-semibold text-text-brand-secondary">
                                {row.relCurrent.value}
                            </div>
                            <div className="font-mono text-[10.5px] text-text-tertiary">
                                {row.relCurrent.units}
                            </div>
                        </>
                    ) : (
                        <span className="text-[13px] text-text-quaternary">—</span>
                    )}
                </td>
                {/* Releasable Incoming */}
                <td className="px-3 py-2.5 align-middle">
                    {row.relIncoming ? (
                        <>
                            <div className="font-mono text-[12px] font-semibold text-text-brand-secondary">
                                {row.relIncoming.value}
                            </div>
                            <div className="font-mono text-[10.5px] text-text-tertiary">
                                {row.relIncoming.units}
                            </div>
                        </>
                    ) : (
                        <span className="text-[13px] text-text-quaternary">—</span>
                    )}
                </td>
                {/* Actions */}
                <td className="py-2.5 pl-1.5 pr-3 text-right align-middle">
                    <div className="inline-flex items-center gap-1">
                        <button
                            onClick={onOpenChart}
                            aria-label="Open inventory chart"
                            className="flex cursor-pointer rounded-md border-0 bg-transparent p-1 text-text-tertiary"
                        >
                            <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                            aria-label="Row actions"
                            className="flex cursor-pointer rounded-md border-0 bg-transparent p-1 text-text-tertiary"
                        >
                            <DotsHorizontal className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </td>
            </tr>

            {expanded && (
                <tr className="bg-bg-secondary">
                    <td colSpan={11} className="p-0">
                        <div className="border-b border-border-secondary px-14 py-3">
                            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 md:grid-cols-4">
                                {(
                                    [
                                        ["Lead Time", "30 days"],
                                        ["COGS", "18,75 € / unit"],
                                        ["RRP", "149,99 € / unit"],
                                        ["Last Sold", "5 hours ago"],
                                        ["Avg Daily Sales", "11,4 units"],
                                        ["7d Sales", "84 units"],
                                        ["30d Sales", "342 units"],
                                        ["Supplier", "PLACEHOLDER"],
                                    ] as [string, string][]
                                ).map(([k, v]) => (
                                    <div key={k}>
                                        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-quaternary">
                                            {k}
                                        </div>
                                        <div className="font-mono text-text-primary">
                                            {v}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
