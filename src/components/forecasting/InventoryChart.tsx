"use client";

import { useCallback, useRef, useState } from "react";

interface InventoryChartProps {
    showHistory: boolean;
}

interface TooltipState {
    x: number;
    flip: boolean;
    date: string;
    inv: number;
    safety: number;
    reordRem: number;
    reordThr: number;
    overstock: number;
}

interface InvPoint {
    d: Date;
    v: number;
}

const fmtDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

export function InventoryChart({ showHistory }: InventoryChartProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const W = 560;
    const H = 210;
    const pad = { top: 20, right: 50, bottom: 30, left: 46 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;

    const startFuture = new Date("2026-02-25");
    const endDate = new Date("2026-08-25");
    const startHist = new Date("2025-06-29");
    const startDate = showHistory ? startHist : startFuture;
    const totalDays = (endDate.getTime() - startDate.getTime()) / 86400000;
    const today = new Date("2026-04-25");
    const oosStart = new Date("2026-05-30");
    const leadTime = new Date("2026-07-20");

    const dx = (d: Date) =>
        pad.left + ((d.getTime() - startDate.getTime()) / 86400000 / totalDays) * cw;
    const dy = (v: number) => pad.top + ch - (v / 7000) * ch;

    // Build inventory polyline
    const invPts: InvPoint[] = [];
    if (showHistory) {
        const hist: InvPoint[] = [
            { d: new Date("2025-06-29"), v: 5800 }, { d: new Date("2025-07-22"), v: 4800 },
            { d: new Date("2025-08-18"), v: 3900 }, { d: new Date("2025-09-12"), v: 2800 },
            { d: new Date("2025-10-08"), v: 1600 }, { d: new Date("2025-11-01"), v: 4900 },
            { d: new Date("2025-11-26"), v: 4100 }, { d: new Date("2025-12-12"), v: 3200 },
            { d: new Date("2026-01-01"), v: 4800 }, { d: new Date("2026-01-26"), v: 4000 },
            { d: new Date("2026-02-12"), v: 3100 }, { d: new Date("2026-03-03"), v: 2300 },
            { d: new Date("2026-03-29"), v: 3200 }, { d: new Date("2026-04-25"), v: 3000 },
        ];
        hist.forEach((p) => invPts.push(p));
    }
    // Future: today → 0 at oosStart, then stays 0
    const base = showHistory ? today : startFuture;
    const futureSpan = (oosStart.getTime() - base.getTime()) / 86400000;
    for (let i = 0; i <= futureSpan; i += 3) {
        const d = new Date(base.getTime() + i * 86400000);
        const t = i / futureSpan;
        invPts.push({ d, v: Math.max(0, 3000 * (1 - t)) });
    }
    for (let i = 3; i <= (endDate.getTime() - oosStart.getTime()) / 86400000; i += 5) {
        invPts.push({ d: new Date(oosStart.getTime() + i * 86400000), v: 0 });
    }

    const pts2path = (pts: InvPoint[]) =>
        pts
            .map((p, i) => `${i ? "L" : "M"}${dx(p.d).toFixed(1)},${dy(p.v).toFixed(1)}`)
            .join(" ");

    const invArea = () => {
        if (!invPts.length) return "";
        const coords = invPts.map((p) => ({ x: dx(p.d), y: dy(p.v) }));
        return (
            coords
                .map((c, i) => `${i ? "L" : "M"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
                .join(" ") +
            ` L${coords[coords.length - 1].x.toFixed(1)},${dy(0).toFixed(1)} L${coords[0].x.toFixed(1)},${dy(0).toFixed(1)} Z`
        );
    };

    const oosArea = () => {
        const ox = dx(oosStart);
        const ex = dx(endDate);
        const bottom = dy(0);
        const sy0 = dy(1700);
        const sy1 = dy(1400);
        return `M${ox.toFixed(1)},${sy0.toFixed(1)} L${ex.toFixed(1)},${sy1.toFixed(1)} L${ex.toFixed(1)},${bottom.toFixed(1)} L${ox.toFixed(1)},${bottom.toFixed(1)} Z`;
    };

    const threshLine = (v0: number, v1: number) => {
        const pts: InvPoint[] = [];
        for (let i = 0; i <= totalDays; i += 7) {
            const d = new Date(startDate.getTime() + i * 86400000);
            const t = i / totalDays;
            pts.push({ d, v: v0 + (v1 - v0) * t });
        }
        return pts;
    };

    const yLabels = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000];
    const xStep = showHistory ? 30 : 14;
    const xDates: Date[] = [];
    for (let i = 0; i <= totalDays; i += xStep) {
        xDates.push(new Date(startDate.getTime() + i * 86400000));
    }

    const handleMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const svg = svgRef.current;
            if (!svg) return;
            const rect = svg.getBoundingClientRect();
            const mx = (e.clientX - rect.left) * (W / rect.width);
            const pct = (mx - pad.left) / cw;
            if (pct < 0 || pct > 1) {
                setTooltip(null);
                return;
            }
            const hd = new Date(startDate.getTime() + pct * totalDays * 86400000);
            const t = pct;
            const futurePct = Math.max(
                0,
                (hd.getTime() - base.getTime()) / (oosStart.getTime() - base.getTime()),
            );
            const inv = hd < oosStart ? Math.round(3000 * Math.max(0, 1 - futurePct)) : 0;
            const rawX = e.clientX - rect.left;
            setTooltip({
                x: rawX,
                flip: rawX > rect.width * 0.55,
                date: fmtDate(hd),
                inv,
                safety: Math.round(1700 - 300 * t),
                reordRem: Math.round(2500 - 400 * t),
                reordThr: Math.round(4200 - 500 * t),
                overstock: Math.round(5500 - 600 * t),
            });
        },
        [startDate, oosStart, totalDays, base, cw, pad.left],
    );

    const tooltipX = tooltip
        ? tooltip.x * (W / (svgRef.current?.getBoundingClientRect().width || 1))
        : 0;

    const legendItems: [string, string, boolean][] = [
        ["#1570EF", "Inventory", true],
        ["#EF4444", "Safety Buffer", false],
        ["#F79009", "Reorder Reminder", false],
        ["#17B26A", "Reorder Threshold", false],
        ["#1570EF", "Overstock Threshold", false],
    ];

    return (
        <div className="relative">
            <div
                className="overflow-hidden rounded-lg border border-border-secondary bg-bg-primary"
                onMouseMove={handleMove}
                onMouseLeave={() => setTooltip(null)}
            >
                <svg
                    ref={svgRef}
                    width="100%"
                    viewBox={`0 0 ${W} ${H}`}
                    className="block min-h-[180px]"
                >
                    <defs>
                        <linearGradient id="fc-inv-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1570EF" stopOpacity=".22" />
                            <stop offset="100%" stopColor="#1570EF" stopOpacity=".02" />
                        </linearGradient>
                        <linearGradient id="fc-oos-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EF4444" stopOpacity=".25" />
                            <stop offset="100%" stopColor="#EF4444" stopOpacity=".04" />
                        </linearGradient>
                    </defs>
                    {yLabels.map((v) => (
                        <g key={v}>
                            <line
                                x1={pad.left}
                                x2={pad.left + cw}
                                y1={dy(v)}
                                y2={dy(v)}
                                stroke="#E5E7EB"
                                strokeWidth=".5"
                            />
                            <text
                                x={pad.left - 4}
                                y={dy(v) + 4}
                                textAnchor="end"
                                fontSize="9"
                                fill="#9CA3AF"
                            >
                                {v === 0 ? "0" : v >= 1000 ? `${v / 1000}k` : v}
                            </text>
                        </g>
                    ))}
                    <path d={oosArea()} fill="url(#fc-oos-grad)" />
                    <path d={invArea()} fill="url(#fc-inv-grad)" />
                    <path
                        d={pts2path(threshLine(5500, 4900))}
                        fill="none"
                        stroke="#1570EF"
                        strokeWidth="1.5"
                        strokeDasharray="5,4"
                    />
                    <path
                        d={pts2path(threshLine(4200, 3700))}
                        fill="none"
                        stroke="#17B26A"
                        strokeWidth="1.5"
                        strokeDasharray="5,4"
                    />
                    <path
                        d={pts2path(threshLine(2500, 2100))}
                        fill="none"
                        stroke="#F79009"
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                    />
                    <path
                        d={pts2path(threshLine(1700, 1400))}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                    />
                    <path d={pts2path(invPts)} fill="none" stroke="#1570EF" strokeWidth="2" />
                    {/* Today */}
                    <line
                        x1={dx(today)}
                        x2={dx(today)}
                        y1={pad.top}
                        y2={pad.top + ch}
                        stroke="#6B7280"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                    />
                    <text
                        x={dx(today) + 3}
                        y={pad.top + 10}
                        fontSize="8.5"
                        fill="#6B7280"
                        fontWeight="500"
                    >
                        Today
                    </text>
                    {dx(leadTime) < pad.left + cw + 10 && (
                        <>
                            <line
                                x1={dx(leadTime)}
                                x2={dx(leadTime)}
                                y1={pad.top}
                                y2={pad.top + ch}
                                stroke="#9CA3AF"
                                strokeWidth="1"
                                strokeDasharray="3,3"
                            />
                            <text
                                x={dx(leadTime) + 3}
                                y={pad.top + ch / 2}
                                fontSize="8"
                                fill="#9CA3AF"
                                transform={`rotate(-90,${dx(leadTime) + 3},${pad.top + ch / 2})`}
                            >
                                Lead Time
                            </text>
                        </>
                    )}
                    <circle cx={dx(today)} cy={dy(3000)} r={5} fill="#1570EF" />
                    <circle cx={dx(today)} cy={dy(3000)} r={9} fill="#1570EF" opacity=".15" />
                    <text
                        x={dx(today) + 12}
                        y={dy(3000) - 4}
                        fontSize="8"
                        fill="#1570EF"
                        fontWeight="600"
                    >
                        Reorder
                    </text>
                    {tooltip && (
                        <line
                            x1={tooltipX}
                            x2={tooltipX}
                            y1={pad.top}
                            y2={pad.top + ch}
                            stroke="#6B7280"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                            opacity=".5"
                        />
                    )}
                    {xDates.map((d, i) => (
                        <text
                            key={i}
                            x={dx(d)}
                            y={H - 5}
                            textAnchor="middle"
                            fontSize="7.5"
                            fill="#9CA3AF"
                        >
                            {fmtDate(d)}
                        </text>
                    ))}
                </svg>
                {tooltip && (
                    <div
                        className="pointer-events-none absolute top-5 z-20 min-w-[165px] rounded-md border border-border-primary bg-bg-primary p-2 shadow-md"
                        style={
                            tooltip.flip
                                ? {
                                      right: `${(svgRef.current?.getBoundingClientRect().width ?? 0) - tooltip.x + 8}px`,
                                  }
                                : { left: `${tooltip.x + 8}px` }
                        }
                    >
                        <div className="mb-1.5 font-mono text-[11px] font-bold text-text-primary">
                            {tooltip.date}
                        </div>
                        {([
                            ["#1570EF", "Inventory", String(tooltip.inv), true],
                            ["#EF4444", "Safety Buffer", tooltip.safety.toLocaleString(), false],
                            ["#F79009", "Reorder Reminder", tooltip.reordRem.toLocaleString(), false],
                            ["#17B26A", "Reorder Threshold", tooltip.reordThr.toLocaleString(), false],
                            ["#1570EF", "Overstock Threshold", tooltip.overstock.toLocaleString(), false],
                        ] as [string, string, string, boolean][]).map(([color, label, val, solid]) => (
                            <div
                                key={label}
                                className="mb-0.5 flex items-center gap-[7px] text-[11px]"
                            >
                                <div
                                    className="h-[7px] w-[7px] flex-shrink-0 rounded-full"
                                    style={{
                                        background: solid ? color : "transparent",
                                        border: solid
                                            ? `1.5px solid ${color}`
                                            : `1.5px dashed ${color}`,
                                    }}
                                />
                                <span className="flex-1 text-text-secondary">{label}</span>
                                <span className="font-mono font-semibold text-text-primary">
                                    {val}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Legend */}
            <div className="mt-2 flex flex-wrap gap-2.5">
                {legendItems.map(([color, label, solid]) => (
                    <div
                        key={label}
                        className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary"
                    >
                        {solid ? (
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ background: color }}
                            />
                        ) : (
                            <div
                                className="h-0 w-4 rounded-[1px]"
                                style={{ border: `1.5px dashed ${color}` }}
                            />
                        )}
                        <span>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
