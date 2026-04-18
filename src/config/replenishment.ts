/**
 * Replenishment configuration — source of truth for the Kanban PO pipeline.
 *
 * DACH_SUPPLIERS is consumed by both the seed script and any UI that needs
 * to reference the canonical supplier list for Calumet Photographic.
 *
 * PO_STATUSES, PO_STATUS_LABELS, PO_STATUS_COLUMN_ORDER drive the Kanban board
 * columns and optimistic updates in the ReplenishmentBoard client.
 */

export const DACH_SUPPLIERS = [
  { name: "Ringfoto GmbH",              city: "Fürth",        country: "DE", leadTimeDays: 14, paymentTerms: "Net 30" },
  { name: "Comline Elektronik GmbH",    city: "Erlangen",     country: "DE", leadTimeDays: 21, paymentTerms: "Net 45" },
  { name: "Kaiser Fototechnik GmbH",    city: "Buchen",       country: "DE", leadTimeDays: 28, paymentTerms: "Net 30" },
  { name: "Dörr GmbH",                  city: "Neu-Ulm",      country: "DE", leadTimeDays: 18, paymentTerms: "Net 30" },
  { name: "Novoflex Präzisionstechnik", city: "Memmingen",    country: "DE", leadTimeDays: 35, paymentTerms: "Net 60" },
  { name: "Rollei (RCP-Technik GmbH)",  city: "Hamburg",      country: "DE", leadTimeDays: 21, paymentTerms: "Net 30" },
  { name: "Hama GmbH & Co KG",          city: "Monheim",      country: "DE", leadTimeDays: 14, paymentTerms: "Net 30" },
  { name: "Cullmann Germany GmbH",      city: "Langenzenn",   country: "DE", leadTimeDays: 21, paymentTerms: "Net 45" },
  { name: "Hapa Team GmbH",             city: "Leverkusen",   country: "DE", leadTimeDays: 28, paymentTerms: "Net 30" },
  { name: "Walser / mantona",           city: "Memmingen",    country: "DE", leadTimeDays: 21, paymentTerms: "Net 30" },
  { name: "Leica Camera AG",            city: "Wetzlar",      country: "DE", leadTimeDays: 45, paymentTerms: "Net 60" },
  { name: "Carl Zeiss AG",              city: "Oberkochen",   country: "DE", leadTimeDays: 60, paymentTerms: "Net 60" },
  { name: "Manfrotto Distribution DE",  city: "München",      country: "DE", leadTimeDays: 28, paymentTerms: "Net 30" },
  { name: "Foto Meyer KG",              city: "Berlin",       country: "DE", leadTimeDays: 14, paymentTerms: "Net 30" },
  { name: "Sigma Deutschland GmbH",     city: "Rödermark",    country: "DE", leadTimeDays: 35, paymentTerms: "Net 45" },
  { name: "Tamron Europe GmbH",         city: "Köln",         country: "DE", leadTimeDays: 28, paymentTerms: "Net 30" },
  { name: "Nikon GmbH Deutschland",     city: "Düsseldorf",   country: "DE", leadTimeDays: 30, paymentTerms: "Net 30" },
  { name: "Canon Deutschland GmbH",     city: "Krefeld",      country: "DE", leadTimeDays: 30, paymentTerms: "Net 30" },
  { name: "Sony Europe B.V. (DE)",      city: "Berlin",       country: "DE", leadTimeDays: 25, paymentTerms: "Net 30" },
  { name: "FUJIFILM Europe GmbH",       city: "Düsseldorf",   country: "DE", leadTimeDays: 35, paymentTerms: "Net 45" },
  { name: "Panasonic Deutschland",      city: "Hamburg",      country: "DE", leadTimeDays: 30, paymentTerms: "Net 30" },
  { name: "Profoto AB (DACH)",          city: "Wien",         country: "AT", leadTimeDays: 28, paymentTerms: "Net 30" },
  { name: "Elinchrom SA (DACH)",        city: "Renens",       country: "CH", leadTimeDays: 35, paymentTerms: "Net 45" },
  { name: "Gitzo / Vitec Imaging",      city: "Cassola",      country: "IT", leadTimeDays: 42, paymentTerms: "Net 45" },
] as const;

export const PO_STATUSES = ["draft", "approved", "partially_arrived", "arrived", "cancelled"] as const;
export type PurchaseOrderStatus = (typeof PO_STATUSES)[number];

export const PO_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  partially_arrived: "Partially arrived",
  arrived: "Arrived",
  cancelled: "Cancelled",
};

// The main Kanban board renders these four columns left-to-right. The
// "cancelled" status is excluded from the board and shown in a filtered view.
export const PO_STATUS_COLUMN_ORDER: PurchaseOrderStatus[] = [
  "draft",
  "approved",
  "partially_arrived",
  "arrived",
];

// Per-status accent colour used for the 2px top stripe on POCard.
export const PO_STATUS_ACCENT: Record<PurchaseOrderStatus, string> = {
  draft: "#1D2939",
  approved: "#DC6803",
  partially_arrived: "#F472B6",
  arrived: "#12B76A",
  cancelled: "#98A2B3",
};
