"use client";

import { useEffect, useState } from "react";
import { Ico, ICONS } from "./icons";
import { InventoryChart } from "./InventoryChart";
import type { ForecastRow } from "./types";

interface ProductModalProps {
    row: ForecastRow;
    onClose: () => void;
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            style={{
                position: "relative",
                width: 32,
                height: 18,
                borderRadius: 999,
                border: 0,
                background: on ? "#1570EF" : "var(--color-gray-300)",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 200ms",
            }}
            aria-pressed={on}
        >
            <span
                style={{
                    position: "absolute",
                    top: 2,
                    left: on ? 16 : 2,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                    transition: "left 200ms",
                }}
            />
        </button>
    );
}

export function ProductModal({ row, onClose }: ProductModalProps) {
    const [wh, setWh] = useState(0);
    const [showHist, setShowHist] = useState(false);
    const [showPre, setShowPre] = useState(true);

    useEffect(() => {
        const fn = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, [onClose]);

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
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(12,17,29,.45)",
                backdropFilter: "blur(3px)",
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    background: "var(--color-bg-primary)",
                    borderRadius: 12,
                    boxShadow: "0 24px 60px rgba(0,0,0,.22)",
                    width: "min(960px,100%)",
                    maxHeight: "90vh",
                    display: "flex",
                    flexDirection: "column",
                    animation: "fc-slide-up 180ms cubic-bezier(.16,1,.3,1)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 20px",
                        borderBottom: "1px solid var(--color-border-secondary)",
                    }}
                >
                    <span style={{ fontSize: 16, fontWeight: 700 }}>Inventory Chart</span>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        style={{
                            background: "transparent",
                            border: 0,
                            color: "var(--color-text-tertiary)",
                            borderRadius: 6,
                            padding: 4,
                            display: "flex",
                            cursor: "pointer",
                        }}
                    >
                        <Ico path={ICONS.x} size={16} />
                    </button>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "220px 1fr",
                        flex: 1,
                        overflow: "hidden",
                    }}
                >
                    {/* Left rail */}
                    <div
                        style={{
                            padding: 16,
                            borderRight: "1px solid var(--color-border-secondary)",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                aspectRatio: 1,
                                borderRadius: 8,
                                background:
                                    "linear-gradient(135deg,#f4f4f5,#e9eaec)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
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
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "2px 8px",
                                    borderRadius: 5,
                                    background: "#7F56D9",
                                    color: "#fff",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                NOGL ID: {row.sku.slice(-12)}
                            </span>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "var(--color-text-tertiary)",
                                    marginTop: 4,
                                }}
                            >
                                First sold 5 years ago (18.09.2020)
                            </div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>
                            {row.name}
                        </div>
                        {row.size && (
                            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                                {row.size}
                            </div>
                        )}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 12,
                                color: "var(--color-text-secondary)",
                                padding: "5px 0",
                                borderTop: "1px solid var(--color-border-secondary)",
                                borderBottom: "1px solid var(--color-border-secondary)",
                            }}
                        >
                            <Ico path={ICONS.sort} size={13} style={{ opacity: 0.4 }} /> Menge 1 Das
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {platforms.map(([pl, col, lines]) => (
                                <div key={pl} style={{ display: "flex", gap: 6 }}>
                                    <div
                                        style={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: 3,
                                            background: `${col}20`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            marginTop: 2,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                background: col,
                                            }}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 1,
                                        }}
                                    >
                                        {lines.map((l) => (
                                            <div
                                                key={l}
                                                style={{
                                                    fontSize: 10.5,
                                                    color: "var(--color-text-secondary)",
                                                    fontFamily: "var(--font-mono)",
                                                    wordBreak: "break-all",
                                                }}
                                            >
                                                {l}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                                paddingTop: 6,
                                borderTop: "1px solid var(--color-border-secondary)",
                            }}
                        >
                            {meta.map(([k, v]) => (
                                <div key={k} style={{ display: "flex", gap: 6, fontSize: 11.5 }}>
                                    <Ico
                                        path={ICONS.chevR}
                                        size={10}
                                        style={{ opacity: 0.3, flexShrink: 0, marginTop: 2 }}
                                    />
                                    <span
                                        style={{
                                            color: "var(--color-text-secondary)",
                                            minWidth: 64,
                                        }}
                                    >
                                        {k}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {v}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button
                            style={{
                                background: "transparent",
                                border: 0,
                                padding: 0,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 12,
                                color: "var(--color-brand-700)",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            <Ico path={ICONS.eye} size={13} /> Show in Forecast
                        </button>
                    </div>
                    {/* Right rail */}
                    <div
                        style={{
                            padding: 16,
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                        }}
                    >
                        <span style={{ fontSize: 14, fontWeight: 600 }}>Inventory Chart</span>
                        <div
                            style={{
                                display: "flex",
                                gap: 2,
                                border: "1px solid var(--color-border-primary)",
                                borderRadius: 7,
                                padding: 2,
                                background: "var(--color-bg-secondary)",
                                width: "fit-content",
                            }}
                        >
                            {["Example Warehouse 1", "Example Warehouse 2"].map((w, i) => (
                                <button
                                    key={i}
                                    onClick={() => setWh(i)}
                                    style={{
                                        padding: "4px 10px",
                                        borderRadius: 5,
                                        border: 0,
                                        background:
                                            wh === i ? "var(--color-bg-primary)" : "transparent",
                                        color:
                                            wh === i
                                                ? "var(--color-text-primary)"
                                                : "var(--color-text-secondary)",
                                        fontSize: 12,
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        boxShadow: wh === i ? "var(--shadow-xs)" : "none",
                                    }}
                                >
                                    {w}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: 14 }}>
                            {(
                                [
                                    [showHist, setShowHist, "Show History"],
                                    [showPre, setShowPre, "Show Unfulfilled Preorders"],
                                ] as [boolean, (v: boolean | ((p: boolean) => boolean)) => void, string][]
                            ).map(([on, set, label]) => (
                                <div
                                    key={label}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        fontSize: 12,
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    <Toggle on={on} onToggle={() => set((v) => !v)} />
                                    {label}
                                </div>
                            ))}
                        </div>
                        <InventoryChart showHistory={showHist} />
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                                Out of Stock events
                            </div>
                            <div
                                style={{
                                    border: "1px solid #FECACA",
                                    borderRadius: 7,
                                    background: "#FFF5F5",
                                    padding: "10px 14px",
                                }}
                            >
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#D92D20" }}>
                                    30.05.2026 – 25.08.2027 (453 days)
                                </div>
                                <div style={{ fontSize: 11.5, color: "#7F1D1D", marginTop: 2 }}>
                                    OOS Amount: <strong>18,6k units</strong>
                                </div>
                                <div style={{ fontSize: 11.5, color: "#7F1D1D", marginTop: 1 }}>
                                    Lost Revenue: <strong>25k €</strong>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                Incoming Inventories
                            </div>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "var(--color-text-tertiary)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <Ico path={ICONS.wh} size={13} style={{ opacity: 0.4 }} /> {row.warehouses}{" "}
                                warehouse{row.warehouses > 1 ? "s" : ""} · no incoming orders
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
