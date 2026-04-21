import Link from "next/link";
import { redirect } from "next/navigation";

import {
  EmptyResults,
  ExplorerError,
  ProductExplorerResearchSearchForm,
  ProductGrid,
} from "@/app/(site)/[lang]/(app)/product-explorer/_components/product-explorer-ui";
import {
  buildProductExplorerResearchHref,
  parseSearchTermsParam,
} from "@/lib/product-explorer-search";
import { getScrapedProducts } from "@/lib/scrapedProducts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Product Explorer — Research | NOGL",
  description: "Search results in the scraped product catalog",
};

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ searchTerms?: string; q?: string; limit?: string }>;
}

export default async function ProductExplorerResearchPage({ params, searchParams }: PageProps) {
  const { lang } = await params;
  const sp = await searchParams;
  const { searchTerms, q, limit: limitStr } = sp;

  const limit = Math.min(Math.max(Number(limitStr ?? "48"), 1), 100);

  if (q?.trim() && !searchTerms) {
    const next = new URLSearchParams();
    next.set("searchTerms", JSON.stringify([q.trim()]));
    if (limitStr) next.set("limit", String(limit));
    redirect(`/${lang}/product-explorer/research?${next.toString()}`);
  }

  let terms = parseSearchTermsParam(searchTerms);
  if (terms.length === 0 && q?.trim()) {
    terms = [q.trim()];
  }

  if (terms.length === 0) {
    redirect(`/${lang}/product-explorer`);
  }

  const queryLabel = terms.join(" · ");

  let products: Awaited<ReturnType<typeof getScrapedProducts>> = [];
  let error: string | null = null;

  try {
    products = await getScrapedProducts(limit, terms.length ? terms : undefined);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load products";
  }

  const explorerHref = `/${lang}/product-explorer`;
  const loadMoreHref = `${buildProductExplorerResearchHref(lang, terms)}&limit=${limit + 48}`;

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <nav className="text-sm text-muted-foreground">
        <Link href={explorerHref} className="underline underline-offset-2 hover:text-foreground">
          Product Explorer
        </Link>
        <span className="mx-2 text-border">/</span>
        <span className="text-foreground">Research</span>
      </nav>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Product Explorer</h1>
        <p className="text-sm text-muted-foreground">
          Results from the NOGL scraped product catalog
          {queryLabel ? (
            <>
              {" "}
              for <strong className="text-foreground">&ldquo;{queryLabel}&rdquo;</strong>
            </>
          ) : null}
          .
        </p>
      </div>

      <ProductExplorerResearchSearchForm lang={lang} defaultValue={terms[0] ?? ""} />

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>
          {products.length} result{products.length !== 1 ? "s" : ""}
          {terms.length > 0 ? ` · ${terms.length} search term${terms.length !== 1 ? "s" : ""}` : ""}
        </span>
        <Link
          href={explorerHref}
          className="underline underline-offset-2 hover:text-foreground"
        >
          Start over
        </Link>
      </div>

      {error && <ExplorerError message={error} />}

      {!error && products.length === 0 && (
        <EmptyResults queryLabel={queryLabel} explorerHref={explorerHref} />
      )}

      {products.length > 0 && <ProductGrid products={products} />}

      {products.length >= limit && !error && (
        <div className="text-center">
          <Link
            href={loadMoreHref}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm text-foreground shadow-sm hover:bg-accent"
          >
            Load more
          </Link>
        </div>
      )}
    </div>
  );
}
