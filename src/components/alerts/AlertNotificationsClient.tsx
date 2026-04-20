"use client";

import React, { useState, useTransition } from "react";
import type { AlertType } from "@prisma/client";
import { upsertSubscription } from "@/actions/alerts";
import type { SubscriptionRow } from "@/actions/alerts";
import { TYPE_LABELS } from "./alertConfig";
import { Button } from '@/components/base/buttons/button';
import { cn } from "@/lib/utils";
import { Bell01, BellOff01, CheckCircle, Save01 } from "@untitledui/icons";
import { toast } from "react-hot-toast";

interface Props {
  userId: string;
  companyId: string;
  initialSubscriptions: SubscriptionRow[];
  groups: { label: string; types: AlertType[] }[];
}

export function AlertNotificationsClient({
  userId,
  companyId,
  initialSubscriptions,
  groups,
}: Props) {
  const [subs, setSubs] = useState<Map<AlertType, boolean>>(() => {
    const m = new Map<AlertType, boolean>();
    for (const group of groups) {
      for (const type of group.types) {
        m.set(type, true); // default enabled
      }
    }
    for (const s of initialSubscriptions) {
      m.set(s.alertType, s.enabled);
    }
    return m;
  });

  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toggle = (type: AlertType) => {
    setSubs((prev) => {
      const next = new Map(prev);
      next.set(type, !prev.get(type));
      return next;
    });
    setSaved(false);
  };

  const setGroupAll = (types: AlertType[], enabled: boolean) => {
    setSubs((prev) => {
      const next = new Map(prev);
      for (const t of types) next.set(t, enabled);
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      const promises = [...subs.entries()].map(([alertType, enabled]) =>
        upsertSubscription({
          userId,
          companyId,
          audience: "CFO",
          alertType,
          enabled,
        }),
      );
      await Promise.all(promises);
      setSaved(true);
      toast.success("Preferences saved");
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-sm font-semibold text-foreground">
            Notification Preferences
          </h1>
          <p className="text-sm text-secondary mt-1">
            Choose which CFO alert types you want to receive in real-time.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isPending || saved}
          className="gap-2"
        >
          {saved ? (
            <CheckCircle className="size-4" />
          ) : (
            <Save01 className="size-4" />
          )}
          {saved ? "Saved" : isPending ? "Saving…" : "Save Preferences"}
        </Button>
      </div>

      {/* Groups */}
      <div className="space-y-6">
        {groups.map((group) => {
          const allOn = group.types.every((t) => subs.get(t));
          const allOff = group.types.every((t) => !subs.get(t));

          return (
            <div
              key={group.label}
              className="rounded-xl border border-border overflow-hidden"
            >
              {/* Group header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-utility-gray-50 dark:bg-utility-gray-900 border-b border-border">
                <p className="font-semibold text-sm text-foreground">
                  {group.label}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGroupAll(group.types, true)}
                    disabled={allOn}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-md font-medium transition-colors",
                      allOn
                        ? "text-tertiary cursor-not-allowed"
                        : "text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30",
                    )}
                  >
                    Enable all
                  </button>
                  <button
                    onClick={() => setGroupAll(group.types, false)}
                    disabled={allOff}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-md font-medium transition-colors",
                      allOff
                        ? "text-tertiary cursor-not-allowed"
                        : "text-secondary hover:bg-utility-gray-100 dark:hover:bg-utility-gray-800",
                    )}
                  >
                    Disable all
                  </button>
                </div>
              </div>

              {/* Type rows */}
              <div className="divide-y divide-border">
                {group.types.map((type) => {
                  const enabled = subs.get(type) ?? true;
                  return (
                    <div
                      key={type}
                      className="flex items-center justify-between px-5 py-3.5"
                    >
                      <div className="flex items-center gap-3">
                        {enabled ? (
                          <Bell01 className="size-4 text-brand-600 dark:text-brand-400" />
                        ) : (
                          <BellOff01 className="size-4 text-tertiary" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {TYPE_LABELS[type]}
                          </p>
                          <p className="text-xs text-tertiary mt-0.5">
                            Real-time · In-app inbox
                          </p>
                        </div>
                      </div>

                      {/* Toggle */}
                      <button
                        role="switch"
                        aria-checked={enabled}
                        onClick={() => toggle(type)}
                        className={cn(
                          "relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                          enabled ? "bg-brand-600" : "bg-utility-gray-200 dark:bg-utility-gray-700",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block size-4 rounded-full bg-white shadow-sm transition-transform",
                            enabled ? "translate-x-4" : "translate-x-0",
                          )}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Digest mode note */}
      <p className="text-xs text-tertiary mt-6 text-center">
        Digest mode (daily / weekly) is coming soon — all alerts are
        delivered in real-time for now.
      </p>
    </div>
  );
}
