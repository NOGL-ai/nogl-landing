"use client";

import React, {
  useState,
  useCallback,
  useTransition,
  useEffect,
} from "react";
import type { AlertAudience, AlertSeverity, AlertStatus } from "@prisma/client";
import {
  bulkResolveAlerts,
  resolveAlert,
  listAlerts,
  getAlertCounts,
} from "@/actions/alerts";
import type { AlertRow, AlertCountsResult } from "@/actions/alerts";
import { cn } from "@/lib/utils";
import { Button } from '@/components/base/buttons/button';
import Checkbox from "@/components/ui/checkbox";
import {
  Check,
  BellOff01,
  UserPlus01,
  BarChartSquare02,
  RefreshCw01,
  Download01,
  Settings03,
  FilterFunnel01,
  SearchMd,
  XClose,
} from "@untitledui/icons";
import {
  SEVERITY_COLORS,
  SEVERITY_DOT,
  TYPE_LABELS,
  getTabsForAudience,
  type TabKey,
} from "./alertConfig";
import { AlertDetailSheet } from "./AlertDetailSheet";
import { InventoryChartModal } from "./InventoryChartModal";
import { useAlertSSE } from "./useAlertSSE";

interface AlertInboxProps {
  audience: AlertAudience;
  companyId: string;
  initialAlerts: AlertRow[];
  initialCounts: AlertCountsResult;
  userId: string;
}

export function AlertInbox({
  audience,
  companyId,
  initialAlerts,
  initialCounts,
  userId,
}: AlertInboxProps) {
  const [alerts, setAlerts] = useState<AlertRow[]>(initialAlerts);
  const [counts, setCounts] = useState<AlertCountsResult>(initialCounts);
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailAlert, setDetailAlert] = useState<AlertRow | null>(null);
  const [chartAlert, setChartAlert] = useState<AlertRow | null>(null);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const tabs = getTabsForAudience(audience);

  // SSE — real-time new alerts
  const handleIncomingAlert = useCallback(
    (raw: unknown) => {
      const alert = raw as AlertRow;
      if (alert.audience !== audience || alert.companyId !== companyId) return;
      setAlerts((prev) => [alert, ...prev]);
      setCounts((c) => ({
        ...c,
        total: c.total + 1,
        [alert.severity]: ((c[alert.severity as keyof AlertCountsResult] as number) ?? 0) + 1,
      }));
    },
    [audience, companyId],
  );

  useAlertSSE(companyId, audience, handleIncomingAlert);

  // Re-fetch when tab / search changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      startTransition(async () => {
        const severity: AlertSeverity[] =
          activeTab === "HOT"
            ? ["HOT"]
            : activeTab === "WARM"
              ? ["WARM"]
              : activeTab === "COLD"
                ? ["COLD"]
                : [];

        const status: AlertStatus[] =
          activeTab === "RESOLVED" ? ["RESOLVED"] : ["OPEN", "SNOOZED"];

        const [result, newCounts] = await Promise.all([
          listAlerts({
            companyId,
            audience,
            severity: severity.length ? severity : undefined,
            status,
            search: search || undefined,
          }),
          getAlertCounts({ companyId, audience }),
        ]);

        let rows = result.alerts;
        if (activeTab === "ASSIGNED") {
          rows = rows.filter((a) => a.assignedToUserId === userId);
        }

        setAlerts(rows);
        setCounts(newCounts);
        setSelected(new Set());
      });
    }, 250);
    return () => clearTimeout(debounce);
  }, [activeTab, search, companyId, audience, userId]);

  // Selection helpers
  const toggleRow = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleAll = () =>
    setSelected((s) =>
      s.size === alerts.length ? new Set() : new Set(alerts.map((a) => a.id)),
    );

  const handleBulkResolve = () => {
    startTransition(async () => {
      await bulkResolveAlerts([...selected]);
      setAlerts((prev) => prev.filter((a) => !selected.has(a.id)));
      setSelected(new Set());
    });
  };

  const handleResolve = (id: string) => {
    startTransition(async () => {
      await resolveAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-display-sm font-semibold text-foreground">
          Alert Overview
        </h1>
        <div className="flex items-center gap-2">
          <Button color="secondary" size="sm" className="gap-1.5">
            <Settings03 className="size-4" />
            Columns
          </Button>
          <Button color="secondary" size="sm" className="gap-1.5">
            <Download01 className="size-4" />
            Export
          </Button>
          <Button size="sm">
            {audience === "CMO" ? "Create Rule" : "Settings"}
          </Button>
        </div>
      </div>

      {/* ── Severity tabs ────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-6 pt-3 pb-0 border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const count =
            tab.key === "ALL"
              ? counts.total
              : tab.key === "ASSIGNED"
                ? counts.assigned
                : tab.key === "RESOLVED"
                  ? counts.RESOLVED
                  : ((counts[tab.key as keyof AlertCountsResult] as number) ?? 0);

          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative whitespace-nowrap px-3 pb-3 pt-1 text-sm transition-colors focus-visible:outline-none",
                isActive
                  ? "text-brand-700 dark:text-brand-400 font-semibold after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:rounded-t after:bg-brand-700 dark:after:bg-brand-400"
                  : "text-tertiary hover:text-secondary font-medium",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-1.5 tabular-nums",
                  isActive ? "opacity-100" : "opacity-60",
                )}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Filter row ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-6 py-2.5 border-b border-border bg-background">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <SearchMd className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-placeholder" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts…"
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-foreground placeholder:text-placeholder"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-placeholder hover:text-foreground"
            >
              <XClose className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button color="secondary" size="sm" className="gap-1.5 text-sm">
            <FilterFunnel01 className="size-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* ── Bulk action bar ───────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-6 py-2 bg-brand-50 dark:bg-brand-950/30 border-b border-brand-200 dark:border-brand-800 text-sm">
          <span className="font-medium text-brand-700 dark:text-brand-300">
            {selected.size} selected
          </span>
          <div className="h-4 w-px bg-brand-200 dark:bg-brand-700" />
          <Button
            size="sm"
            color="secondary"
            onClick={handleBulkResolve}
            disabled={isPending}
            className="gap-1.5"
          >
            <Check className="size-3.5" />
            Resolve
          </Button>
          <Button size="sm" color="secondary" disabled className="gap-1.5">
            <BellOff01 className="size-3.5" />
            Snooze
          </Button>
          <Button size="sm" color="secondary" disabled className="gap-1.5">
            <UserPlus01 className="size-3.5" />
            Assign to
          </Button>
          {audience === "CFO" && (
            <Button size="sm" color="secondary" disabled>
              Create Draft Order
            </Button>
          )}
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
            <tr>
              <th className="w-10 px-4 py-3 text-left">
                <Checkbox
                  checked={alerts.length > 0 && selected.size === alerts.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                Issue
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                {audience === "CMO" ? "Price Signal" : "Stock Signal"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                {audience === "CMO" ? "My Price" : "Stock"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                Context
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-tertiary uppercase tracking-wider">
                Est. Impact
              </th>
              <th className="w-20 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isPending && alerts.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-20 text-center text-secondary text-sm"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="size-10 flex items-center justify-center rounded-full bg-utility-gray-100 dark:bg-utility-gray-800">
                      <Check className="size-5 text-utility-gray-500" />
                    </span>
                    <p>No alerts in this category</p>
                  </div>
                </td>
              </tr>
            )}
            {alerts.map((alert) => (
              <AlertTableRow
                key={alert.id}
                alert={alert}
                audience={audience}
                selected={selected.has(alert.id)}
                onToggle={() => toggleRow(alert.id)}
                onResolve={() => handleResolve(alert.id)}
                onOpenDetail={() => setDetailAlert(alert)}
                onOpenChart={() => setChartAlert(alert)}
              />
            ))}
          </tbody>
        </table>

        {isPending && (
          <div className="flex items-center justify-center py-10 text-secondary text-sm gap-2">
            <RefreshCw01 className="size-4 animate-spin" />
            Loading…
          </div>
        )}
      </div>

      {/* ── Detail side sheet ─────────────────────────────────────── */}
      <AlertDetailSheet
        alert={detailAlert}
        onClose={() => setDetailAlert(null)}
        audience={audience}
      />

      {/* ── Chart modal ───────────────────────────────────────────── */}
      <InventoryChartModal
        alert={chartAlert}
        onClose={() => setChartAlert(null)}
        audience={audience}
      />
    </div>
  );
}

// ── Signal bars ───────────────────────────────────────────────────────────────

function SignalBars({ alert, audience }: { alert: AlertRow; audience: AlertAudience }) {
  const meta = alert.metadata as Record<string, unknown>;

  if (audience === "CMO") {
    const my = parseFloat(String(meta.myPrice ?? 0));
    const comp = parseFloat(String(meta.competitorPrice ?? 0));
    if (!my && !comp) return <span className="text-tertiary text-xs">—</span>;
    const max = Math.max(my, comp) * 1.05;
    return (
      <div className="flex flex-col gap-1 w-28">
        <div className="flex items-center gap-1.5">
          <div className="w-full h-1.5 rounded-full bg-utility-gray-100 dark:bg-utility-gray-800 overflow-hidden">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${(my / max) * 100}%` }} />
          </div>
          <span className="text-[10px] text-tertiary whitespace-nowrap">Me</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-full h-1.5 rounded-full bg-utility-gray-100 dark:bg-utility-gray-800 overflow-hidden">
            <div className="h-full rounded-full bg-utility-error-500" style={{ width: `${(comp / max) * 100}%` }} />
          </div>
          <span className="text-[10px] text-tertiary whitespace-nowrap">Them</span>
        </div>
      </div>
    );
  }

  // CFO: stock vs reorder point vs safety buffer
  const stock = Number(meta.stockUnits ?? 0);
  const reorder = Number(meta.reorderPoint ?? 50);
  const safety = Number(meta.safetyBuffer ?? reorder * 0.6);
  const max = Math.max(stock, reorder * 2, 1);
  const stockPct = Math.min((stock / max) * 100, 100);
  const reorderPct = Math.min((reorder / max) * 100, 100);
  const safetyPct = Math.min((safety / max) * 100, 100);
  const stockColor = stock <= safety ? "bg-utility-error-500" : stock <= reorder ? "bg-warning-500" : "bg-utility-success-500";

  return (
    <div className="flex flex-col gap-1 w-28">
      <div className="flex items-center gap-1.5">
        <div className="w-full h-1.5 rounded-full bg-utility-gray-100 dark:bg-utility-gray-800 overflow-hidden">
          <div className={cn("h-full rounded-full", stockColor)} style={{ width: `${stockPct}%` }} />
        </div>
        <span className="text-[10px] text-tertiary">Stock</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-full h-1.5 rounded-full bg-utility-gray-100 dark:bg-utility-gray-800 overflow-hidden">
          <div className="h-full rounded-full bg-warning-400" style={{ width: `${reorderPct}%` }} />
        </div>
        <span className="text-[10px] text-tertiary">ROP</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-full h-1.5 rounded-full bg-utility-gray-100 dark:bg-utility-gray-800 overflow-hidden">
          <div className="h-full rounded-full bg-utility-gray-400" style={{ width: `${safetyPct}%` }} />
        </div>
        <span className="text-[10px] text-tertiary">Safety</span>
      </div>
    </div>
  );
}

// ── Single table row ─────────────────────────────────────────────────────────

function AlertTableRow({
  alert,
  audience,
  selected,
  onToggle,
  onResolve,
  onOpenDetail,
  onOpenChart,
}: {
  alert: AlertRow;
  audience: AlertAudience;
  selected: boolean;
  onToggle: () => void;
  onResolve: () => void;
  onOpenDetail: () => void;
  onOpenChart: () => void;
}) {
  const meta = alert.metadata as Record<string, unknown>;
  const contextSnippet =
    (meta.contextSnippet as string | undefined) ?? alert.description ?? "—";

  const stockOrPrice =
    audience === "CMO"
      ? meta.myPrice
        ? `€${meta.myPrice}`
        : "—"
      : meta.stockUnits != null
        ? `${(meta.stockUnits as number).toLocaleString()} units`
        : "—";

  return (
    <tr
      className={cn(
        "group hover:bg-gray-25 dark:hover:bg-gray-900/40 cursor-pointer transition-colors",
        selected && "bg-brand-50 dark:bg-brand-950/20",
      )}
      onClick={onOpenDetail}
    >
      {/* Checkbox */}
      <td
        className="px-4 py-3"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <Checkbox checked={selected} onChange={onToggle} />
      </td>

      {/* Product */}
      <td className="px-4 py-3 max-w-[200px]">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg border border-border bg-utility-gray-50 dark:bg-utility-gray-900 flex-shrink-0 overflow-hidden">
            {meta.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={meta.imageUrl as string}
                alt=""
                className="size-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate text-sm leading-snug">
              {(meta.productTitle as string | undefined) ?? "Unknown product"}
            </p>
            {meta.sku != null && (
              <span className="text-xs text-tertiary font-mono">
                {String(meta.sku)}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Issue */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "size-1.5 rounded-full flex-shrink-0",
              SEVERITY_DOT[alert.severity],
            )}
          />
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
              SEVERITY_COLORS[alert.severity],
            )}
          >
            {alert.title}
          </span>
        </div>
        <p className="text-xs text-tertiary mt-1 pl-3">
          {TYPE_LABELS[alert.type]}
        </p>
      </td>

      {/* Signal bars */}
      <td className="px-4 py-3 min-w-[120px]">
        <SignalBars alert={alert} audience={audience} />
      </td>

      {/* Stock / Price */}
      <td className="px-4 py-3 font-mono text-sm text-foreground">
        {stockOrPrice}
      </td>

      {/* Context */}
      <td className="px-4 py-3 max-w-[240px]">
        <p className="text-sm text-secondary line-clamp-2">{contextSnippet}</p>
      </td>

      {/* Impact */}
      <td className="px-4 py-3 text-right">
        {alert.estimatedImpact != null ? (
          <>
            <p className="font-semibold text-foreground">
              €{alert.estimatedImpact.toLocaleString("de-DE", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-tertiary">
              next {alert.impactWindowDays / 30}m
            </p>
          </>
        ) : (
          <span className="text-tertiary">—</span>
        )}
      </td>

      {/* Row actions */}
      <td
        className="px-4 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onOpenChart}
            className="p-1.5 rounded-md hover:bg-utility-gray-100 dark:hover:bg-utility-gray-800 text-tertiary hover:text-secondary transition-colors"
            title="View chart"
          >
            <BarChartSquare02 className="size-4" />
          </button>
          <button
            onClick={onResolve}
            className="p-1.5 rounded-md hover:bg-utility-success-50 dark:hover:bg-utility-success-950/30 text-tertiary hover:text-utility-success-600 transition-colors"
            title="Resolve"
          >
            <Check className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
