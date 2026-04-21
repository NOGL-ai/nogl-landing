"use client";
import { Settings02 as Settings2, Play, Clock, AlertTriangle } from '@untitledui/icons';

import React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/base/buttons/button";
import type { RepricingRuleDTO } from "@/lib/repricing/types";
import { formatDistanceToNow } from "date-fns";

// ─── Kept for backward compat with pages that still import the old interface ──
export type { RepricingRuleDTO as RepricingRule };

export interface RepricingRulesCardProps {
  rule: RepricingRuleDTO;
  onToggle?: (id: string, active: boolean) => void;
  onManage?: (id: string) => void;
  onRunPreview?: (id: string) => void;
  className?: string;
}

const STATUS_STYLES: Record<
  RepricingRuleDTO["status"],
  { label: string; className: string }
> = {
  DRAFT:    { label: "Draft",   className: "bg-tertiary text-tertiary" },
  ACTIVE:   { label: "Active",  className: "bg-success-secondary text-success-primary" },
  PAUSED:   { label: "Paused",  className: "bg-warning-secondary text-warning-primary" },
  ARCHIVED: { label: "Archived",className: "bg-error-secondary text-error-primary" },
};

function strategyLabel(rule: RepricingRuleDTO): string {
  const dir =
    rule.comparisonLogic === "BELOW" ? "below" :
    rule.comparisonLogic === "ABOVE" ? "above" : "equal to";
  const ref =
    rule.comparisonSource === "CHEAPEST" ? "cheapest competitor" :
    rule.comparisonSource === "AVERAGE"  ? "average competitor" :
    rule.comparisonSource === "MY_PRICE" ? "my price" :
    "competitor";
  const offset =
    rule.setPrice > 0
      ? rule.priceDirection === "PERCENTAGE"
        ? ` ${rule.setPrice}%`
        : ` €${rule.setPrice.toFixed(2)}`
      : "";
  return `${offset ? offset + " " : ""}${dir} ${ref}`;
}

export default function RepricingRulesCard({
  rule,
  onToggle,
  onManage,
  onRunPreview,
  className,
}: RepricingRulesCardProps) {
  const { label: statusLabel, className: statusClass } = STATUS_STYLES[rule.status] ?? STATUS_STYLES.DRAFT;
  const isActive = rule.status === "ACTIVE";
  const hasConflicts = (rule.conflictsWithRuleIds?.length ?? 0) > 0;

  const lastRunText = rule.lastRunAt
    ? formatDistanceToNow(new Date(rule.lastRunAt), { addSuffix: true })
    : "Never";

  const scopeLabel =
    rule.scopeType === "ALL" ? "All products" :
    rule.scopeType === "CATEGORIES" ? `${rule.categoryIds.length} categories` :
    `${rule.productIds.length} products`;

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border-primary bg-background shadow-sm",
        className
      )}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-2 border-b border-border-primary px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-text-primary">
              {rule.name}
            </h3>
            {hasConflicts && (
              <span
                title={`Conflicts with: ${rule.conflictsWithRuleIds?.join(", ")}`}
                className="inline-flex items-center gap-1 rounded-full bg-warning-secondary px-2 py-0.5 text-xs font-medium text-warning-primary"
              >
                <AlertTriangle className="h-3 w-3" />
                Conflict
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">
            {strategyLabel(rule)}
          </p>
        </div>
        {/* Active/Paused toggle */}
        <button
          role="switch"
          aria-checked={isActive}
          aria-label={isActive ? "Pause rule" : "Activate rule"}
          onClick={() => onToggle?.(rule.id, !isActive)}
          className={cn(
            "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-solid focus:ring-offset-1",
            isActive ? "bg-success-solid" : "bg-tertiary"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 translate-y-0.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              isActive ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        </button>
      </div>

      {/* Card body */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3 text-sm">
        <div>
          <p className="text-xs text-text-tertiary">Products</p>
          <p className="mt-0.5 font-medium text-text-primary">{scopeLabel}</p>
        </div>
        <div>
          <p className="text-xs text-text-tertiary">Competitors</p>
          <p className="mt-0.5 font-medium text-text-primary">
            {rule.competitorIds.length > 0 ? `${rule.competitorIds.length} selected` : "All"}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-tertiary">Method</p>
          <p className="mt-0.5 font-medium text-text-primary">
            {rule.scheduleType === "MANUAL" ? "Manual" :
             rule.scheduleType === "HOURLY" ? "Hourly" :
             rule.scheduleType === "DAILY"  ? `Daily at ${rule.scheduleHour ?? 7}:00` :
             "Weekly"}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-tertiary">Status</p>
          <span
            className={cn(
              "mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
              statusClass
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Last run */}
      <div className="flex items-center justify-between border-t border-border-primary px-4 py-2 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>Last run: {lastRunText}</span>
          {rule.autoApply && (
            <Badge className="bg-brand-secondary px-1.5 py-0.5 text-xs text-brand-secondary">
              Autopilot
            </Badge>
          )}
        </div>
        <span className="text-text-tertiary">
          {rule.scheduleType === "MANUAL" ? "Manual" :
           rule.scheduleType === "HOURLY" ? "Hourly" :
           rule.scheduleType === "DAILY"  ? "Daily" : "Weekly"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-border-primary px-4 py-3">
        <Button
          color="secondary"
          size="sm"
          className="flex flex-1 items-center justify-center gap-1.5 border border-border-primary bg-background text-text-secondary hover:bg-bg-secondary"
          onClick={() => onManage?.(rule.id)}
        >
          <Settings2 className="h-4 w-4" />
          Manage
        </Button>
        <Button
          color="primary"
          size="sm"
          className="flex flex-1 items-center justify-center gap-1.5 bg-brand-solid hover:bg-brand-solid_hover"
          onClick={() => onRunPreview?.(rule.id)}
          isDisabled={rule.status === "ARCHIVED"}
        >
          <Play className="h-4 w-4" />
          Show Preview
        </Button>
      </div>
    </div>
  );
}
