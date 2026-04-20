"use client";
import { SearchLg as Search, X } from '@untitledui/icons';


import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState, useCallback } from "react";

type ProductSearchFieldProps = {
  className?: string;
};

export function ProductSearchField({ className }: ProductSearchFieldProps) {
  const t = useTranslations("companies");
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Extract the current locale from the path (e.g. /en/dashboard → "en")
  const lang = pathname.split("/")[1] || "en";

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;
      router.push(`/${lang}/product-explorer?q=${encodeURIComponent(trimmed)}`);
    },
    [query, lang, router],
  );

  const handleClear = useCallback(() => {
    setQuery("");
  }, []);

  return (
    <form className={className} onSubmit={handleSubmit} role="search">
      <label className="sr-only" htmlFor="dashboard-product-search">
        {t("chrome.productSearchPlaceholder")}
      </label>
      <div className="relative flex w-full min-w-0 max-w-xl items-center">
        <Search
          className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
          aria-hidden
        />
        <input
          id="dashboard-product-search"
          data-testid="dashboard-product-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("chrome.productSearchPlaceholder")}
          className="h-10 w-full rounded-full border border-border bg-background py-2 pl-10 pr-10 text-sm text-foreground shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}
