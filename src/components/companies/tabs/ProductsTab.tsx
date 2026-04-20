"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";

import { Card } from "@/components/ui/card";
import { fetchJson, InlineError } from "./shared";
import type {
  CompanyProductsListResponse,
  ProductListItem,
} from "@/types/companyProducts";

type ViewMode = "grid" | "list";

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
      <div className="aspect-[4/3] bg-muted" />
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
        {/* Image — aspect-[4/3] for better product fit */}
        <div className="relative aspect-[4/3] overflow-hidden bg-white border-b border-border">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-contain p-3 transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/30">
              <svg
                className="h-12 w-12"
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

          {/* Discount badge */}
          {product.discount_pct != null && product.discount_pct > 0 && (
            <span className="absolute right-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
              -{Math.round(product.discount_pct)}%
            </span>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-all group-hover:bg-foreground/[0.08]">
            <span className="scale-90 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground opacity-0 shadow-sm transition-all group-hover:scale-100 group-hover:opacity-100">
              View details →
            </span>
          </div>
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

// ── Product list row ─────────────────────────────────────────────────────────

function ProductRow({
  product,
  slug,
  lang,
}: {
  product: ProductListItem;
  slug: string;
  lang: string;
}) {
  const href = `/${lang}/companies/${slug}/products/${encodeURIComponent(product.id)}`;
  const hasDiscount =
    product.discount_pct != null && product.discount_pct > 0;

  return (
    <Link href={href as `/${string}`}>
      <article
        data-testid="product-row"
        className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40"
      >
        {/* Thumbnail */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-contain p-1"
              sizes="48px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Title + brand */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground group-hover:text-foreground">
            {product.title}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            {product.brand && (
              <span className="text-xs text-muted-foreground">{product.brand}</span>
            )}
            {product.category && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {product.category}
              </span>
            )}
          </div>
        </div>

        {/* Discount badge */}
        {hasDiscount && (
          <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
            -{Math.round(product.discount_pct!)}%
          </span>
        )}

        {/* Price */}
        <div className="shrink-0 text-right">
          <span className="text-sm font-semibold text-foreground">
            {fmtPrice(product.current_price)}
          </span>
          <p className="text-xs text-muted-foreground">{timeAgo(product.first_seen)}</p>
        </div>
      </article>
    </Link>
  );
}

function ProductRowSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3">
      <div className="h-12 w-12 shrink-0 rounded-lg bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/3 rounded bg-muted" />
      </div>
      <div className="h-4 w-16 rounded bg-muted" />
    </div>
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

  // FIX 5 — Pre-populate filters from URL search params
  const [category, setCategory] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("category");
  });
  const [search, setSearch] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("search") ?? "";
  });

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FIX 2 — Stable categories fetched once on mount
  const [allCategories, setAllCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchJson<CompanyProductsListResponse>(
      `/api/companies/${slug}/products?limit=100&page=1`
    )
      .then((data) => {
        const cats = Array.from(
          new Set(
            data.products
              .map((p) => p.category)
              .filter((c): c is string => Boolean(c))
          )
        ).sort();
        setAllCategories(cats);
      })
      .catch(() => {});
  }, [slug]);

  // FIX 5 — Sync URL when filters change (shallow replace)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (category) url.searchParams.set("category", category);
    else url.searchParams.delete("category");
    if (search) url.searchParams.set("search", search);
    else url.searchParams.delete("search");
    window.history.replaceState({}, "", url.toString());
  }, [category, search]);

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

  // Initial load + reload when page/category changes
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

        {/* View mode toggle */}
        <div className="ml-auto flex items-center rounded-lg border border-border p-1">
          <button
            onClick={() => setViewMode("grid")}
            title="Grid view"
            className={`rounded p-1.5 transition-colors ${viewMode === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            title="List view"
            className={`rounded p-1.5 transition-colors ${viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* FIX 2 — Stable category chips from one-time fetch */}
      {allCategories.length > 0 && (
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
          {allCategories.slice(0, 12).map((cat) => (
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

      {/* FIX 3 — Result count */}
      {!state.loading && pagination && (
        <p className="text-xs text-muted-foreground">
          {pagination.total.toLocaleString("en-US")} products
          {category ? ` in "${category}"` : ""}
          {search ? ` matching "${search}"` : ""}
        </p>
      )}

      {/* Error */}
      {state.error && <InlineError message={state.error} />}

      {/* Products */}
      {state.loading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductRowSkeleton key={i} />
            ))}
          </div>
        )
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
      ) : viewMode === "grid" ? (
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
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <ProductRow
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
