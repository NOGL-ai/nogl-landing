import type { PurchaseOrderStatus } from "@/config/replenishment";

export interface Supplier {
  id: string;
  name: string;
  city: string | null;
  country: string;
  leadTimeDays: number;
  paymentTerms: string | null;
  isActive: boolean;
}

export interface PurchaseOrderLine {
  id: string;
  variantId: string;
  variantTitle: string;
  sku: string | null;
  quantity: number;
  unitCost: number;
  arrivedQty: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string | null;
  supplierName: string | null;
  status: PurchaseOrderStatus;
  totalAmount: number;
  currency: string;
  /** YYYY-MM-DD */
  eta: string | null;
  /** ISO timestamp */
  approvedAt: string | null;
  /** ISO timestamp */
  arrivedAt: string | null;
  notes: string | null;
  lineCount: number;
  lineItems?: PurchaseOrderLine[];
  /** Derived: eta < today && status not in [arrived, cancelled] */
  isLate: boolean;
}
