"use client";

import React, { useTransition } from "react";
import type { AlertAudience } from "@prisma/client";
import type { AlertRow } from "@/actions/alerts";
import { createDraftOrderFromAlert } from "@/actions/alerts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEVERITY_COLORS, TYPE_LABELS } from "./alertConfig";
import { cn } from "@/lib/utils";
import {
  Package,
  TrendDown01,
  ArrowUpRight,
  ShoppingCart01,
  Tag01,
  CalendarDate,
  ClockRefresh,
  UserCircle,
} from "@untitledui/icons";
import { useRouter } from "next/navigation";

interface Props {
  alert: AlertRow | null;
  onClose: () => void;
  audience: AlertAudience;
}

export function AlertDetailSheet({ alert, onClose, audience }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const meta = (alert?.metadata ?? {}) as Record<string, unknown>;

  const handleCreateDraftOrder = () => {
    if (!alert) return;
    startTransition(async () => {
      const { poId } = await createDraftOrderFromAlert(alert.id);
      onClose();
      router.push(`/en/replenishment?newPO=${poId}`);
    });
  };

  const showDraftOrderCta =
    audience === "CFO" &&
    alert != null &&
    (
      alert.type === "STOCKOUT_IMMINENT" ||
      alert.type === "STOCKOUT_ACTIVE" ||
      alert.type === "REORDER_POINT_HIT" ||
      alert.type === "LOW_INVENTORY"
    );

  const showRepricingCta =
    audience === "CMO" &&
    alert != null &&
    (alert.type === "PRICE_DROP" || alert.type === "PRICE_INCREASE");

  return (
    <Sheet open={!!alert} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex flex-col overflow-hidden w-full max-w-[480px] p-0">
        {alert && (
          <>
            {/* Header */}
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
              <div className="flex items-start justify-between gap-3 pr-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        SEVERITY_COLORS[alert.severity],
                      )}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs text-tertiary">
                      {TYPE_LABELS[alert.type]}
                    </span>
                  </div>
                  <SheetTitle className="text-lg font-semibold text-foreground leading-snug">
                    {alert.title}
                  </SheetTitle>
                </div>
              </div>
              <SheetDescription className="sr-only">
                Alert detail for {alert.title}
              </SheetDescription>
            </SheetHeader>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Product card */}
              {(meta.productTitle != null || meta.sku != null) && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-utility-gray-50 dark:bg-utility-gray-900">
                  <div className="size-10 rounded-lg border border-border bg-background overflow-hidden flex-shrink-0">
                    {meta.imageUrl != null ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={String(meta.imageUrl)}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <Package className="size-5 m-2.5 text-tertiary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    {meta.productTitle != null && (
                      <p className="font-medium text-sm text-foreground">
                        {String(meta.productTitle)}
                      </p>
                    )}
                    {meta.sku != null && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Tag01 className="size-3 text-tertiary" />
                        <span className="text-xs text-tertiary font-mono">
                          {String(meta.sku)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {alert.description && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-tertiary mb-2">
                    Details
                  </p>
                  <p className="text-sm text-secondary">{alert.description}</p>
                </div>
              )}

              {/* Audience-specific content */}
              {audience === "CMO" && <CmoPriceDetail meta={meta} />}
              {audience === "CFO" && <CfoInventoryDetail meta={meta} />}

              {/* Impact callout */}
              {alert.estimatedImpact != null && (
                <div className="p-4 rounded-xl bg-warning-50 dark:bg-warning-950/20 border border-warning-200 dark:border-warning-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-warning-600 dark:text-warning-400 mb-1">
                    Estimated Impact
                  </p>
                  <p className="text-2xl font-bold text-warning-900 dark:text-warning-100">
                    €
                    {alert.estimatedImpact.toLocaleString("de-DE", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <p className="text-xs text-warning-600 dark:text-warning-400 mt-0.5">
                    next {alert.impactWindowDays / 30} months
                  </p>
                </div>
              )}

              {/* Meta footer */}
              <div className="pt-2 border-t border-border space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-tertiary">
                  <ClockRefresh className="size-3.5" />
                  Triggered: {new Date(alert.triggeredAt).toLocaleString("en-GB")}
                </div>
                {alert.assignedToUserId && (
                  <div className="flex items-center gap-1.5 text-xs text-tertiary">
                    <UserCircle className="size-3.5" />
                    Assigned to: {alert.assignedToUserId}
                  </div>
                )}
              </div>
            </div>

            {/* Footer CTAs */}
            {(showDraftOrderCta || showRepricingCta) && (
              <SheetFooter className="px-6 py-4 border-t border-border">
                {showDraftOrderCta && (
                  <Button
                    onClick={handleCreateDraftOrder}
                    disabled={isPending}
                    className="w-full gap-2"
                  >
                    <ShoppingCart01 className="size-4" />
                    {isPending ? "Creating…" : "Create Draft Purchase Order"}
                  </Button>
                )}
                {showRepricingCta && (
                  <Button className="w-full gap-2">
                    <TrendDown01 className="size-4" />
                    Create Repricing Rule
                    <ArrowUpRight className="size-4" />
                  </Button>
                )}
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CmoPriceDetail({ meta }: { meta: Record<string, unknown> }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-tertiary mb-3">
        Price Snapshot
      </p>
      <div className="grid grid-cols-2 gap-3">
        {meta.myPrice != null && (
          <div className="p-3 rounded-xl border border-border text-center bg-background">
            <p className="text-xs text-tertiary mb-1">My Price</p>
            <p className="text-xl font-bold text-foreground">€{meta.myPrice as string}</p>
          </div>
        )}
        {meta.competitorPrice != null && (
          <div className="p-3 rounded-xl border border-border text-center bg-background">
            <p className="text-xs text-tertiary mb-1">Competitor</p>
            <p className="text-xl font-bold text-foreground">€{meta.competitorPrice as string}</p>
          </div>
        )}
      </div>
      {meta.competitorName != null && (
        <p className="text-xs text-tertiary mt-2">
          From: {String(meta.competitorName)}
        </p>
      )}
      {meta.priceDeltaPct != null && (
        <Badge
          variant="outline"
          className="mt-2 text-error-600 dark:text-error-400 border-error-200 dark:border-error-800"
        >
          {(meta.priceDeltaPct as number) > 0 ? "+" : ""}
          {String(meta.priceDeltaPct)}%
        </Badge>
      )}
    </div>
  );
}

function CfoInventoryDetail({ meta }: { meta: Record<string, unknown> }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-tertiary mb-3">
        Inventory Snapshot
      </p>
      <div className="grid grid-cols-2 gap-3">
        {meta.stockUnits != null && (
          <div className="p-3 rounded-xl border border-border text-center bg-background">
            <p className="text-xs text-tertiary mb-1">Current Stock</p>
            <p className="text-xl font-bold text-foreground">
              {(meta.stockUnits as number).toLocaleString()}
            </p>
          </div>
        )}
        {meta.reorderPoint != null && (
          <div className="p-3 rounded-xl border border-border text-center bg-background">
            <p className="text-xs text-tertiary mb-1">Reorder Point</p>
            <p className="text-xl font-bold text-foreground">
              {(meta.reorderPoint as number).toLocaleString()}
            </p>
          </div>
        )}
      </div>
      {meta.daysUntilStockout != null && (
        <div className="mt-3 p-3 rounded-xl border border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-950/20 text-sm text-error-700 dark:text-error-300">
          Stockout in{" "}
          <strong>{meta.daysUntilStockout as number} days</strong>
        </div>
      )}
      {meta.supplierLeadDays != null && (
        <p className="text-xs text-tertiary mt-2">
          Supplier lead time: {meta.supplierLeadDays as number} days
        </p>
      )}
      {meta.reorderBy != null && (
        <div className="flex items-center gap-1.5 text-xs text-tertiary mt-1">
          <CalendarDate className="size-3.5" />
          Reorder by:{" "}
          {new Date(String(meta.reorderBy)).toLocaleDateString("en-GB")}
        </div>
      )}
    </div>
  );
}
