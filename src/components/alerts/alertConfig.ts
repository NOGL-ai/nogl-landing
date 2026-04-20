import type { AlertAudience, AlertSeverity, AlertType } from "@prisma/client";

export const CALUMET_COMPANY_ID = "cmnw4qqo10000ltccgauemneu";

export const CMO_TYPES: AlertType[] = [
  "PRICE_DROP",
  "PRICE_INCREASE",
  "COMPETITOR_NEW_PRODUCT",
  "COMPETITOR_STOCKOUT",
  "PROMO_START",
  "PROMO_END",
  "AD_CREATIVE_CHANGE",
  "NEWSLETTER_RECEIVED",
];

export const CFO_TYPES: AlertType[] = [
  "STOCKOUT_IMMINENT",
  "LOW_INVENTORY",
  "REORDER_POINT_HIT",
  "OVERSTOCK",
  "STOCKOUT_ACTIVE",
  "LEAD_TIME_BREACH",
  "SUPPLIER_DELAY",
];

export const CFO_TYPE_GROUPS: { label: string; types: AlertType[] }[] = [
  {
    label: "Stockout Alerts",
    types: ["STOCKOUT_IMMINENT", "STOCKOUT_ACTIVE"],
  },
  {
    label: "Inventory Alerts",
    types: ["LOW_INVENTORY", "OVERSTOCK", "REORDER_POINT_HIT"],
  },
  {
    label: "Supplier Alerts",
    types: ["LEAD_TIME_BREACH", "SUPPLIER_DELAY"],
  },
];

export const CMO_TYPE_GROUPS: { label: string; types: AlertType[] }[] = [
  {
    label: "Pricing Alerts",
    types: ["PRICE_DROP", "PRICE_INCREASE"],
  },
  {
    label: "Competitor Alerts",
    types: [
      "COMPETITOR_NEW_PRODUCT",
      "COMPETITOR_STOCKOUT",
    ],
  },
  {
    label: "Promo & Creative",
    types: ["PROMO_START", "PROMO_END", "AD_CREATIVE_CHANGE", "NEWSLETTER_RECEIVED"],
  },
];

export const TYPE_LABELS: Record<AlertType, string> = {
  PRICE_DROP: "Price Dropped",
  PRICE_INCREASE: "Price Increased",
  COMPETITOR_NEW_PRODUCT: "New Competitor Product",
  COMPETITOR_STOCKOUT: "Competitor Stockout",
  PROMO_START: "Promo Started",
  PROMO_END: "Promo Ended",
  AD_CREATIVE_CHANGE: "Ad Creative Changed",
  NEWSLETTER_RECEIVED: "Newsletter Received",
  STOCKOUT_IMMINENT: "Stockout Imminent",
  LOW_INVENTORY: "Low Inventory",
  REORDER_POINT_HIT: "Reorder Point Hit",
  OVERSTOCK: "Overstock",
  STOCKOUT_ACTIVE: "Stockout Active",
  LEAD_TIME_BREACH: "Lead Time Breach",
  SUPPLIER_DELAY: "Supplier Delay",
};

export const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  HOT: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  WARM: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  COLD: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  SNOOZED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  RESOLVED: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

export const SEVERITY_DOT: Record<AlertSeverity, string> = {
  HOT: "bg-red-500",
  WARM: "bg-orange-400",
  COLD: "bg-blue-400",
  SNOOZED: "bg-gray-400",
  RESOLVED: "bg-green-500",
};

export type TabKey =
  | "ALL"
  | "HOT"
  | "WARM"
  | "COLD"
  | "ASSIGNED"
  | "RESOLVED";

export interface TabDefinition {
  key: TabKey;
  label: string;
}

export function getTabsForAudience(_audience: AlertAudience): TabDefinition[] {
  return [
    { key: "ALL", label: "All" },
    { key: "HOT", label: "Hot" },
    { key: "WARM", label: "Warm" },
    { key: "COLD", label: "Cold" },
    { key: "ASSIGNED", label: "Assigned to me" },
    { key: "RESOLVED", label: "Resolved" },
  ];
}
