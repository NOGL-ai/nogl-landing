import { SearchLg as Search, Package, LinkExternal01 as ExternalLink } from '@untitledui/icons';
import Link from "next/link";

import type { ScrapedProduct } from "@/lib/scrapedProducts";

export function formatPrice(price: string, currency: string): string {
  if (!price) return "—";
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency || "EUR",
    minimumFractionDigits: 2,
  }).format(num);
}

export function truncateUrl(url: string, max = 40): string {
  try {
    const u = new URL(url);
    const path = u.pathname;
    return path.length > max ? path.slice(0, max) + "…" : path;
  } catch {
    return url.length > max ? url.slice(0, max) + "…" : url;
  }
}

/** GET form that submits plain `q`; research page redirects to canonical `searchTerms`. */
export function ProductExplorerResearchSearchForm({
  lang,
  defaultValue,
}: {
  lang: string;
  defaultValue: string;
}) {
  return (
    <form method="GET" action={`/${lang}/product-explorer/research`} className="flex w-full max-w-xl gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search products by name, brand, category…"
          className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
      >
        Search
      </button>
    </form>
  );
}

export function ProductGrid({ products }: { products: ScrapedProduct[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, idx) => (
        <a
          key={`${product.url}-${idx}`}
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {product.source}
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{product.title}</p>

          <p className="mt-auto text-sm font-semibold text-foreground">
            {formatPrice(product.price, product.currency)}
          </p>

          <p className="truncate text-xs text-muted-foreground" title={product.url}>
            {truncateUrl(product.url)}
          </p>
        </a>
      ))}
    </div>
  );
}

export function ExplorerError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      <strong>Error:</strong> {message}
    </div>
  );
}

export function EmptyResults({
  queryLabel,
  explorerHref,
}: {
  queryLabel: string;
  explorerHref: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
      <Package className="h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm font-medium text-muted-foreground">
        {queryLabel ? `No products match “${queryLabel}”` : "No products found"}
      </p>
      {queryLabel && (
        <Link href={explorerHref} className="text-sm text-primary underline underline-offset-2">
          Back to Product Explorer
        </Link>
      )}
    </div>
  );
}
