"use client";

import { Ico, ICONS } from "./icons";
import type { ForecastRow } from "./types";

interface AlertRowProps {
    row: ForecastRow;
    selected: boolean;
    expanded: boolean;
    onToggleSelect: () => void;
    onToggleExpand: () => void;
    onOpenChart: () => void;
}

const REORDER_STYLES = {
    purple: { bg: "#F4EBFF", color: "#6941C6" },
    blue: { bg: "#EFF4FF", color: "#1849A9" },
    gray: { bg: "var(--color-bg-secondary)", color: "var(--color-text-secondary)" },
} as const;

const DAY_COLOR_STYLES = {
    red: { bg: "#FEE4E2", color: "#B42318" },
    orange: { bg: "#FEF0C7", color: "#B54708" },
    blue: { bg: "#D1E9FF", color: "#175CD3" },
    purple: { bg: "#F4EBFF", color: "#6941C6" },
    gray: { bg: "var(--color-bg-secondary)", color: "var(--color-text-secondary)" },
} as const;

const REACH_COLOR_BY_LABEL: Record<string, string> = {
    Reorder: "#F79009",
    Overstock: "#7F56D9",
    "Out of stock": "#D92D20",
    OK: "#17B26A",
    Critical: "#D92D20",
};

const OOS_TONE_COLORS = {
    red: "#D92D20",
    orange: "#DC6803",
    muted: "var(--color-text-secondary)",
} as const;

export function AlertRow({
    row,
    selected,
    expanded,
    onToggleSelect,
    onToggleExpand,
    onOpenChart,
}: AlertRowProps) {
    const reorderStyle = REORDER_STYLES[row.reorder.type];
    const dayStyle = DAY_COLOR_STYLES[row.reorder.daysColor];
    const reachColor = REACH_COLOR_BY_LABEL[row.reach.label] ?? "var(--color-text-secondary)";
    const oosColor = OOS_TONE_COLORS[row.oos.tone];

    return (
        <>
            <tr
                style={{
                    background: selected
                        ? "rgba(127,86,217,.04)"
                        : "var(--color-bg-primary)",
                    borderBottom: "1px solid var(--color-border-secondary)",
                    transition: "background 120ms",
                }}
                className="fc-row"
            >
                {/* Select */}
                <td style={{ padding: "10px 6px 10px 12px", verticalAlign: "middle" }}>
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={onToggleSelect}
                        style={{
                            width: 14,
                            height: 14,
                            accentColor: "#7F56D9",
                            cursor: "pointer",
                        }}
                    />
                </td>
                {/* Expand */}
                <td style={{ padding: "10px 6px", verticalAlign: "middle" }}>
                    <button
                        onClick={onToggleExpand}
                        aria-label={expanded ? "Collapse" : "Expand"}
                        style={{
                            width: 18,
                            height: 18,
                            border: 0,
                            background: "transparent",
                            color: "var(--color-text-tertiary)",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transform: expanded ? "rotate(90deg)" : "none",
                            transition: "transform 150ms",
                        }}
                    >
                        <Ico path={ICONS.chevR} size={11} />
                    </button>
                </td>
                {/* Name */}
                <td
                    style={{
                        padding: "10px 12px",
                        verticalAlign: "middle",
                        minWidth: 220,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 2,
                            flexWrap: "wrap",
                        }}
                    >
                        {row.badges.map((b) => (
                            <span
                                key={b}
                                style={{
                                    padding: "1px 5px",
                                    background: "#FEF3C7",
                                    color: "#92400E",
                                    fontSize: 9.5,
                                    fontWeight: 700,
                                    borderRadius: 3,
                                    textTransform: "uppercase",
                                    letterSpacing: ".04em",
                                }}
                            >
                                {b}
                            </span>
                        ))}
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: "var(--color-text-primary)",
                            }}
                        >
                            {row.name}
                        </span>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 11.5,
                            color: "var(--color-text-tertiary)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {row.size && (
                            <span
                                style={{
                                    color: "var(--color-text-secondary)",
                                    fontWeight: 500,
                                }}
                            >
                                {row.size}
                            </span>
                        )}
                        <span
                            style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 200,
                            }}
                        >
                            {row.sku}
                        </span>
                    </div>
                </td>
                {/* Warehouses */}
                <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11.5,
                            color: "var(--color-text-secondary)",
                            background: "var(--color-bg-secondary)",
                            padding: "3px 8px",
                            borderRadius: 5,
                            border: "1px solid var(--color-border-secondary)",
                        }}
                    >
                        <Ico path={ICONS.wh} size={11} style={{ opacity: 0.55 }} />
                        <span style={{ fontFamily: "var(--font-mono)" }}>{row.warehouses}</span>
                        <span
                            style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 140,
                            }}
                        >
                            {row.wh}
                        </span>
                    </div>
                </td>
                {/* Reorder */}
                <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            alignItems: "flex-start",
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "2px 8px",
                                borderRadius: 5,
                                background: reorderStyle.bg,
                                color: reorderStyle.color,
                            }}
                        >
                            {row.reorder.label}
                        </span>
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "2px 8px",
                                borderRadius: 5,
                                background: dayStyle.bg,
                                color: dayStyle.color,
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {row.reorder.days}
                        </span>
                    </div>
                </td>
                {/* Stock */}
                <td
                    style={{
                        padding: "10px 12px",
                        verticalAlign: "middle",
                        textAlign: "right",
                    }}
                >
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {row.stock.current.toLocaleString()}
                    </div>
                    <div
                        style={{
                            fontSize: 10.5,
                            color: "var(--color-text-tertiary)",
                            fontFamily: "var(--font-mono)",
                            marginTop: 2,
                        }}
                    >
                        +{row.stock.incoming.toLocaleString()} · ↑{row.stock.preorder} · ↓
                        {row.stock.reserved}
                    </div>
                </td>
                {/* OOS */}
                <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                    <div
                        style={{
                            fontSize: 11.5,
                            color: oosColor,
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {row.oos.date}
                    </div>
                    <div
                        style={{
                            fontSize: 10.5,
                            color: "var(--color-text-tertiary)",
                            marginTop: 2,
                        }}
                    >
                        {row.oos.eta}
                    </div>
                </td>
                {/* Reach */}
                <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                    <div
                        style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: reachColor,
                            fontFamily: "var(--font-mono)",
                            marginBottom: 3,
                        }}
                    >
                        {row.reach.days}
                    </div>
                    <div style={{ display: "flex", gap: 1, marginBottom: 3 }}>
                        {row.reach.segs.map((on, i) => (
                            <div
                                key={i}
                                style={{
                                    height: 4,
                                    flex: 1,
                                    background: on
                                        ? reachColor
                                        : "var(--color-border-secondary)",
                                    borderRadius: 1,
                                }}
                            />
                        ))}
                    </div>
                    <div style={{ fontSize: 10, color: reachColor, fontWeight: 600 }}>
                        {row.reach.label}
                    </div>
                </td>
                {/* OOS Impact */}
                <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                    {row.oosImpact.ok ? (
                        <span
                            style={{
                                fontSize: 11,
                                color: "#079455",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontWeight: 500,
                            }}
                        >
                            <Ico path={ICONS.check} size={12} /> {row.oosImpact.text}
                        </span>
                    ) : row.oosImpact.potential ? (
                        <span
                            style={{
                                fontSize: 11,
                                color: "#B54708",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontWeight: 500,
                                background: "#FEF0C7",
                                padding: "2px 7px",
                                borderRadius: 4,
                            }}
                            title="Potential lost revenue if reorder is delayed"
                        >
                            ⚠ {row.oosImpact.text}
                        </span>
                    ) : (
                        <>
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#B42318",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                {row.oosImpact.value}
                            </div>
                            <div
                                style={{
                                    fontSize: 10.5,
                                    color: "#B42318",
                                    fontFamily: "var(--font-mono)",
                                    opacity: 0.85,
                                }}
                            >
                                {row.oosImpact.units}
                            </div>
                        </>
                    )}
                </td>
                {/* Releasable Current */}
                <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                    {row.relCurrent ? (
                        <>
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#7F56D9",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                {row.relCurrent.value}
                            </div>
                            <div
                                style={{
                                    fontSize: 10.5,
                                    color: "var(--color-text-tertiary)",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                {row.relCurrent.units}
                            </div>
                        </>
                    ) : (
                        <span style={{ color: "var(--color-text-quaternary)", fontSize: 13 }}>
                            —
                        </span>
                    )}
                </td>
                {/* Releasable Incoming */}
                <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                    {row.relIncoming ? (
                        <>
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#7F56D9",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                {row.relIncoming.value}
                            </div>
                            <div
                                style={{
                                    fontSize: 10.5,
                                    color: "var(--color-text-tertiary)",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                {row.relIncoming.units}
                            </div>
                        </>
                    ) : (
                        <span style={{ color: "var(--color-text-quaternary)", fontSize: 13 }}>
                            —
                        </span>
                    )}
                </td>
                {/* Actions */}
                <td
                    style={{
                        padding: "10px 12px 10px 6px",
                        verticalAlign: "middle",
                        textAlign: "right",
                    }}
                >
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <button
                            onClick={onOpenChart}
                            aria-label="Open inventory chart"
                            style={{
                                background: "transparent",
                                border: 0,
                                padding: 4,
                                color: "var(--color-text-tertiary)",
                                cursor: "pointer",
                                borderRadius: 5,
                                display: "flex",
                            }}
                        >
                            <Ico path={ICONS.eye} size={14} />
                        </button>
                        <button
                            aria-label="Row actions"
                            style={{
                                background: "transparent",
                                border: 0,
                                padding: 4,
                                color: "var(--color-text-tertiary)",
                                cursor: "pointer",
                                borderRadius: 5,
                                display: "flex",
                            }}
                        >
                            <Ico path={ICONS.moreH} size={14} />
                        </button>
                    </div>
                </td>
            </tr>

            {expanded && (
                <tr style={{ background: "var(--color-bg-secondary)" }}>
                    <td colSpan={11} style={{ padding: 0 }}>
                        <div
                            style={{
                                padding: "12px 22px 14px 56px",
                                borderBottom: "1px solid var(--color-border-secondary)",
                            }}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4,minmax(150px,1fr))",
                                    gap: 12,
                                    fontSize: 11.5,
                                }}
                            >
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
                                        <div
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 600,
                                                textTransform: "uppercase",
                                                letterSpacing: ".05em",
                                                color: "var(--color-text-quaternary)",
                                                marginBottom: 2,
                                            }}
                                        >
                                            {k}
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: "var(--font-mono)",
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
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
