import Link from "next/link";
import { redirect } from "next/navigation";

import { ProductExplorerResearchSearchForm, ProductGrid } from "@/app/(site)/[lang]/(app)/product-explorer/_components/product-explorer-ui";
import { buildProductExplorerResearchHref } from "@/lib/product-explorer-search";
import { getScrapedProducts } from "@/lib/scrapedProducts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Product Explorer | NOGL",
  description: "Search and explore the product catalog",
};

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}

const SUGGESTED_KEYWORDS: { label: string; terms: string[] }[] = [
  { label: "Shirt", terms: ["shirt"] },
  { label: "Running shoes", terms: ["running shoes"] },
  { label: "Dress", terms: ["dress"] },
  { label: "Bag", terms: ["bag"] },
  { label: "Sneakers", terms: ["sneakers"] },
];

export default async function ProductExplorerPage({ params, searchParams }: PageProps) {
  const { lang } = await params;
  const { q } = await searchParams;

  if (q?.trim()) {
    const next = new URLSearchParams();
    next.set("searchTerms", JSON.stringify([q.trim()]));
    redirect(`/${lang}/product-explorer/research?${next.toString()}`);
  }

  let preview: Awaited<ReturnType<typeof getScrapedProducts>> = [];
  let error: string | null = null;

  try {
    preview = await getScrapedProducts(12);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load products";
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Product Explorer</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Search for specific products in the NOGL scraped catalog. Results open on a dedicated
            research page with shareable URLs.
          </p>
        </div>
        <details className="rounded-lg border border-border bg-card px-3 py-2 text-sm sm:max-w-xs">
          <summary className="cursor-pointer font-medium text-foreground">How to use</summary>
          <p className="mt-2 text-muted-foreground">
            Type a query and press Search, pick a suggested keyword, or open a shared research link.
            URLs use <code className="rounded bg-muted px-1 py-0.5 text-xs">searchTerms</code> as a
            JSON array (for example{" "}
            <code className="break-all rounded bg-muted px-1 py-0.5 text-xs">
              ?searchTerms=%5B%22running+shoes%22%5D
            </code>
            ).
          </p>
        </details>
      </div>

      <ProductExplorerResearchSearchForm lang={lang} defaultValue="" />

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">Or try one of these keywords</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_KEYWORDS.map(({ label, terms }) => (
            <Link
              key={label}
              href={buildProductExplorerResearchHref(lang, terms)}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!error && preview.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Latest from the catalog</p>
          <ProductGrid products={preview} />
        </div>
      )}
    </div>
  );
}
