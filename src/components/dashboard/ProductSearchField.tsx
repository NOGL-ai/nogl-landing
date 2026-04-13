"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type ProductSearchFieldProps = {
  className?: string;
};

export function ProductSearchField({ className }: ProductSearchFieldProps) {
  const t = useTranslations("companies");
  const [query, setQuery] = useState("");

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
      }}
      role="search"
    >
      <label className="sr-only" htmlFor="dashboard-product-search">
        {t("chrome.productSearchPlaceholder")}
      </label>
      <div className="relative flex w-full min-w-0 max-w-xl items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" aria-hidden />
        <input
          id="dashboard-product-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("chrome.productSearchPlaceholder")}
          className="h-10 w-full rounded-full border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </form>
  );
}
