"use client";

import { X } from "@untitledui/icons";
import type { Supplier } from "@/types/replenishment";

interface FilterBarProps {
  suppliers: Supplier[];
  variants: { id: string; title: string; sku: string | null }[];
  supplierId: string;
  variantId: string;
  onSupplierChange: (id: string) => void;
  onVariantChange: (id: string) => void;
  onClear: () => void;
}

export function FilterBar({
  suppliers,
  variants,
  supplierId,
  variantId,
  onSupplierChange,
  onVariantChange,
  onClear,
}: FilterBarProps) {
  const hasFilter = supplierId !== "" || variantId !== "";

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border-secondary bg-bg-primary p-4">
      <div className="flex min-w-[12rem] flex-1 flex-col gap-1.5">
        <label
          htmlFor="filter-supplier"
          className="text-xs font-medium text-tertiary"
        >
          Supplier
        </label>
        <select
          id="filter-supplier"
          value={supplierId}
          onChange={(e) => onSupplierChange(e.target.value)}
          className="h-10 rounded-lg border border-border-secondary bg-bg-primary px-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-brand"
        >
          <option value="">All suppliers</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-[12rem] flex-1 flex-col gap-1.5">
        <label
          htmlFor="filter-variant"
          className="text-xs font-medium text-tertiary"
        >
          Variant
        </label>
        <select
          id="filter-variant"
          value={variantId}
          onChange={(e) => onVariantChange(e.target.value)}
          className="h-10 rounded-lg border border-border-secondary bg-bg-primary px-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-brand"
        >
          <option value="">All variants</option>
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title}
            </option>
          ))}
        </select>
      </div>

      {hasFilter ? (
        <button
          type="button"
          onClick={onClear}
          className="flex h-10 items-center gap-1 rounded-lg border border-border-secondary bg-bg-primary px-3 text-sm font-medium text-secondary transition-colors hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-border-brand"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
