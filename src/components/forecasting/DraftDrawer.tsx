"use client";

import { useState } from "react";
import { Ico, ICONS } from "./icons";
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

    return (
        <div
            style={{ position: "fixed", inset: 0, zIndex: 50 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    height: "100%",
                    width: 400,
                    background: "var(--color-bg-primary)",
                    borderLeft: "1px solid var(--color-border-secondary)",
                    boxShadow: "-8px 0 24px rgba(0,0,0,.08)",
                    display: "flex",
                    flexDirection: "column",
                    animation: "fc-slide-in-r 200ms cubic-bezier(.16,1,.3,1)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid var(--color-border-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <span
                        style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "var(--color-text-primary)",
                        }}
                    >
                        {title}
                    </span>
                    <button
                        onClick={onClose}
                        aria-label="Close drawer"
                        style={{
                            background: "transparent",
                            border: 0,
                            color: "var(--color-text-tertiary)",
                            borderRadius: 6,
                            padding: 4,
                            cursor: "pointer",
                            display: "flex",
                        }}
                    >
                        <Ico path={ICONS.x} size={16} />
                    </button>
                </div>

                {/* Stats */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4,1fr)",
                        padding: "14px 20px",
                        borderBottom: "1px solid var(--color-border-secondary)",
                        gap: 4,
                    }}
                >
                    {(
                        [
                            [String(suppliers), "Suppliers"],
                            [String(variants), "Variants"],
                            [totalUnits.toLocaleString(), "Units"],
                            [fmtEur(totalCost), "Total"],
                        ] as [string, string][]
                    ).map(([v, l]) => (
                        <div key={l} style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    fontSize: l === "Total" ? 15 : 18,
                                    fontWeight: 700,
                                    color: "var(--color-text-primary)",
                                    fontFamily: "var(--font-mono)",
                                    lineHeight: 1.2,
                                }}
                            >
                                {v}
                            </div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "var(--color-text-tertiary)",
                                    marginTop: 2,
                                }}
                            >
                                {l}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "14px 20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 50px 90px 100px 24px",
                            gap: 6,
                            fontSize: 10,
                            fontWeight: 600,
                            color: "var(--color-text-quaternary)",
                            textTransform: "uppercase",
                            letterSpacing: ".08em",
                            paddingBottom: 6,
                            borderBottom: "1px solid var(--color-border-secondary)",
                        }}
                    >
                        <span></span>
                        <span style={{ textAlign: "right" }}>VARIANTS</span>
                        <span style={{ textAlign: "right" }}>COST</span>
                        <span>ORDER TARGET</span>
                        <span></span>
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 50px 90px 100px 24px",
                            gap: 6,
                            alignItems: "center",
                            fontSize: 12.5,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontWeight: 600,
                                    color: "var(--color-text-primary)",
                                    fontSize: 12,
                                }}
                            >
                                PLACEHOLDER
                            </div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                → Example Warehouse 1
                            </div>
                        </div>
                        <div
                            style={{
                                textAlign: "right",
                                fontFamily: "var(--font-mono)",
                                fontSize: 12,
                            }}
                        >
                            {variants}
                        </div>
                        <div
                            style={{
                                textAlign: "right",
                                fontFamily: "var(--font-mono)",
                                fontSize: 12,
                            }}
                        >
                            {fmtEur(totalCost)}
                        </div>
                        <div>
                            <select
                                style={{
                                    fontSize: 11,
                                    padding: "2px 4px",
                                    border: "1px solid var(--color-border-primary)",
                                    borderRadius: 4,
                                    background: "var(--color-bg-primary)",
                                    color: "var(--color-text-secondary)",
                                    cursor: "pointer",
                                    width: "100%",
                                }}
                            >
                                <option>New draft order</option>
                                <option>Add to existing</option>
                            </select>
                        </div>
                        <button
                            aria-label="Remove"
                            style={{
                                background: "transparent",
                                border: 0,
                                color: "var(--color-text-tertiary)",
                                cursor: "pointer",
                                padding: 0,
                            }}
                        >
                            <Ico path={ICONS.trash} size={13} />
                        </button>
                    </div>

                    {/* Include zero toggle */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 12.5,
                            color: "var(--color-text-secondary)",
                        }}
                    >
                        <button
                            onClick={() => setIncludeZero((v) => !v)}
                            aria-pressed={includeZero}
                            style={{
                                position: "relative",
                                width: 28,
                                height: 16,
                                borderRadius: 999,
                                border: 0,
                                background: includeZero ? "#1570EF" : "var(--color-gray-300)",
                                cursor: "pointer",
                                flexShrink: 0,
                                transition: "background 200ms",
                            }}
                        >
                            <span
                                style={{
                                    position: "absolute",
                                    top: 2,
                                    left: includeZero ? 14 : 2,
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    background: "#fff",
                                    boxShadow: "0 1px 2px rgba(0,0,0,.2)",
                                    transition: "left 200ms",
                                }}
                            />
                        </button>
                        Include zero amount items
                    </div>

                    <button
                        style={{
                            width: "100%",
                            padding: 10,
                            background: "#1570EF",
                            color: "#fff",
                            border: 0,
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        {isOrder
                            ? `Save ${suppliers} Order`
                            : `Save ${suppliers} Transfer`}
                    </button>

                    {/* Variants section */}
                    <div
                        style={{
                            border: "1px solid var(--color-border-primary)",
                            borderRadius: 8,
                            overflow: "hidden",
                        }}
                    >
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "10px 14px",
                                background: "var(--color-bg-secondary)",
                                border: 0,
                                cursor: "pointer",
                                fontSize: 12.5,
                            }}
                        >
                            <Ico
                                path={expanded ? ICONS.chevD : ICONS.chevR}
                                size={13}
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                            <span
                                style={{
                                    fontWeight: 600,
                                    color: "var(--color-text-primary)",
                                    flex: 1,
                                    textAlign: "left",
                                }}
                            >
                                PLACEHOLDER → Example Warehouse 1
                            </span>
                            <span
                                style={{
                                    fontSize: 11,
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                {variants} variants · {fmtEur(totalCost)}
                            </span>
                            <Ico
                                path={ICONS.trash}
                                size={13}
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                        </button>

                        {expanded &&
                            visibleRows.map((row) => (
                                <div
                                    key={row.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: "10px 14px",
                                        borderTop: "1px solid var(--color-border-secondary)",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 5,
                                            background: "var(--color-bg-secondary)",
                                            border: "1px solid var(--color-border-secondary)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Ico
                                            path={ICONS.wh}
                                            size={14}
                                            style={{ opacity: 0.4 }}
                                        />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: 12.5,
                                                fontWeight: 500,
                                                color: "var(--color-text-primary)",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {row.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            {row.size || "—"}
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        value={qtys[row.id] ?? 0}
                                        onChange={(e) =>
                                            updateQty(row.id, e.target.value)
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            width: 64,
                                            padding: "4px 8px",
                                            border: "1px solid var(--color-border-primary)",
                                            borderRadius: 5,
                                            fontSize: 12.5,
                                            fontFamily: "var(--font-mono)",
                                            color: "var(--color-text-primary)",
                                            background: "var(--color-bg-primary)",
                                            textAlign: "right",
                                        }}
                                    />
                                    <button
                                        aria-label="Remove variant"
                                        style={{
                                            background: "transparent",
                                            border: 0,
                                            color: "var(--color-text-tertiary)",
                                            cursor: "pointer",
                                            padding: 2,
                                        }}
                                    >
                                        <Ico path={ICONS.trash} size={13} />
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
