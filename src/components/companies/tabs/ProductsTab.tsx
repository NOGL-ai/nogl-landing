"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { fetchJson, InlineError } from "./shared";
import type {
  CompanyProductsListResponse,
  ProductListItem,
} from "@/types/companyProducts";

// ── Price formatter ───────────────────────────────────────────────────────────

function fmtPrice(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n === 0) return "€0";
  if (n >= 1) return `€${Math.round(n).toLocaleString("en-US")}`;
  return `€${n.toFixed(2)}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-square bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted" />
      </div>
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────

function ProductCard({
  product,
  slug,
  lang,
}: {
  product: ProductListItem;
  slug: string;
  lang: string;
}) {
  const href = `/${lang}/companies/${slug}/products/${encodeURIComponent(product.id)}`;

  return (
    <Link href={href as `/${string}`}>
      <article
        data-testid="product-card"
        className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-contain p-2 transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <svg
                className="h-12 w-12 opacity-30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          {product.discount_pct != null && product.discount_pct > 0 && (
            <span className="absolute right-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
              -{Math.round(product.discount_pct)}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-1">
          <p className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
            {product.title}
          </p>
          {product.brand && (
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          )}
          {product.category && (
            <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {product.category}
            </span>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-foreground">
              {fmtPrice(product.current_price)}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeAgo(product.first_seen)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type ProductsTabProps = {
  slug: string;
  lang: string;
};

type State = {
  data: CompanyProductsListResponse | null;
  loading: boolean;
  error: string | null;
};

export function ProductsTab({ slug, lang }: ProductsTabProps) {
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildUrl = useCallback(
    (q: string, cat: string | null, min: string, max: string, p: number) => {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", "24");
      if (q) params.set("search", q);
      if (cat) params.set("category", cat);
      if (min) params.set("min_price", min);
      if (max) params.set("max_price", max);
      return `/api/companies/${slug}/products?${params.toString()}`;
    },
    [slug]
  );

  const load = useCallback(
    (q: string, cat: string | null, min: string, max: string, p: number) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      fetchJson<CompanyProductsListResponse>(buildUrl(q, cat, min, max, p))
        .then((data) => setState({ data, loading: false, error: null }))
        .catch((err: unknown) =>
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : "Failed to load",
          })
        );
    },
    [buildUrl]
  );

  // Initial load + reload when page changes (not search — that's debounced)
  useEffect(() => {
    load(search, category, minPrice, maxPrice, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category]);

  // Debounced search + price filters
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => load(value, category, minPrice, maxPrice, 1),
      300
    );
  };

  const handlePriceFilter = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => load(search, category, min, max, 1),
      400
    );
  };

  const handleCategory = (cat: string | null) => {
    setCategory(cat);
    setPage(1);
    // category change triggers useEffect → load
  };

  const clearFilters = () => {
    setSearch("");
    setCategory(null);
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
    load("", null, "", "", 1);
  };

  const hasFilters = Boolean(search || category || minPrice || maxPrice);
  const products = state.data?.products ?? [];
  const pagination = state.data?.pagination;

  return (
    <div className="space-y-6">
      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Price range */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min €"
            value={minPrice}
            onChange={(e) => handlePriceFilter(e.target.value, maxPrice)}
            className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-muted-foreground text-sm">–</span>
          <input
            type="number"
            placeholder="Max €"
            value={maxPrice}
            onChange={(e) => handlePriceFilter(minPrice, e.target.value)}
            className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Category chips */}
      {state.data && state.data.products.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategory(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !category
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {Array.from(
            new Set(
              state.data.products
                .map((p) => p.category)
                .filter((c): c is string => Boolean(c))
            )
          )
            .slice(0, 10)
            .map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat === category ? null : cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  category === cat
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
        </div>
      )}

      {/* Error */}
      {state.error && <InlineError message={state.error} />}

      {/* Grid */}
      {state.loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            No products found
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-xs text-muted-foreground underline hover:text-foreground"
            >
              Clear filters
            </button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              slug={slug}
              lang={lang}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
            {" · "}
            {pagination.total.toLocaleString("en-US")} products
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
