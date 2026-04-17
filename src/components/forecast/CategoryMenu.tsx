"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import type { CategoryWithVariants } from "@/types/forecast";

interface CategoryMenuProps {
  categories: CategoryWithVariants[];
  selectedCategories: string[];
  selectedVariants: string[];
  onCategoryChange: (categories: string[]) => void;
  onVariantChange: (variants: string[]) => void;
}

export function CategoryMenu({
  categories,
  selectedCategories,
  selectedVariants,
  onCategoryChange,
  onVariantChange,
}: CategoryMenuProps) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = categories.filter(
    (c) =>
      !query ||
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.variants.some((v) => v.title.toLowerCase().includes(query.toLowerCase()))
  );

  const toggleCategory = (cat: string) => {
    onCategoryChange(
      selectedCategories.includes(cat)
        ? selectedCategories.filter((c) => c !== cat)
        : [...selectedCategories, cat]
    );
  };

  const toggleVariant = (id: string) => {
    onVariantChange(
      selectedVariants.includes(id)
        ? selectedVariants.filter((v) => v !== id)
        : [...selectedVariants, id]
    );
  };

  const toggleExpand = (cat: string) =>
    setExpanded((e) => ({ ...e, [cat]: !e[cat] }));

  return (
    <div className="flex flex-col gap-1">
      {/* Search */}
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {filtered.map((c) => (
        <div key={c.category}>
          <div className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/50">
            <button
              type="button"
              onClick={() => toggleExpand(c.category)}
              className="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
            >
              {expanded[c.category] ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
            <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedCategories.includes(c.category)}
                onChange={() => toggleCategory(c.category)}
                className="h-3.5 w-3.5 rounded border-border accent-primary"
              />
              <span className="font-medium capitalize text-foreground">{c.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">{c.variants.length}</span>
            </label>
          </div>

          {expanded[c.category] && (
            <div className="ml-7 flex flex-col gap-0.5 border-l border-border pl-3 pt-1">
              {c.variants.map((v) => (
                <label key={v.id} className="flex cursor-pointer items-center gap-2 py-0.5">
                  <input
                    type="checkbox"
                    checked={selectedVariants.includes(v.id)}
                    onChange={() => toggleVariant(v.id)}
                    className="h-3 w-3 rounded border-border accent-primary"
                  />
                  <span className="truncate text-xs text-muted-foreground" title={v.title}>
                    {v.title}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="py-4 text-center text-xs text-muted-foreground">No categories found.</p>
      )}
    </div>
  );
}
