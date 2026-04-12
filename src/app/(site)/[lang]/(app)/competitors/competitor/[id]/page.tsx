import type { ReactNode } from "react";

import { statusClasses } from "@/lib/competitors/constants";
import type {
  CompetitorDetail,
  CompetitorProduct,
  CompetitorRow,
} from "@/lib/competitors/types";
import {
  formatCurrency,
  formatRelativeTime,
  getBaseUrl,
} from "@/lib/competitors/utils";
import { FEATURES } from "@/lib/featureFlags";

interface ApiPriceComparison {
  id: string;
  productId: string | null;
  productName: string | null;
  competitorPrice: string | number;
  currency: string | null;
  priceDate: string | null;
  competitorUrl: string | null;
}

interface ApiCompetitorDetail extends CompetitorRow {
  priceComparisons?: ApiPriceComparison[];
}

type LoadResult =
  | { kind: "disabled" }
  | { kind: "not-found" }
  | { kind: "error"; message: string }
  | { kind: "success"; competitor: CompetitorDetail };

function toNumber(value: string | number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getWebsiteUrl(website: string | null, domain: string): string {
  if (website && /^https?:\/\//i.test(website)) {
    return website;
  }

  if (website) {
    return `https://${website}`;
  }

  return `https://${domain}`;
}

function mapCompetitorDetail(raw: ApiCompetitorDetail): CompetitorDetail {
  const priceComparisons = Array.isArray(raw.priceComparisons)
    ? raw.priceComparisons
    : [];

  const products: CompetitorProduct[] = [];
  const seen = new Set<string>();
  const history = new Map<string, { sum: number; count: number }>();

  for (const comparison of priceComparisons) {
    const price = toNumber(comparison.competitorPrice);
    const date = comparison.priceDate;

    if (date) {
      const day = date.slice(0, 10);
      const entry = history.get(day) ?? { sum: 0, count: 0 };
      entry.sum += price;
      entry.count += 1;
      history.set(day, entry);
    }

    const key =
      comparison.productId ??
      comparison.productName ??
      comparison.competitorUrl ??
      comparison.id;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    products.push({
      id: comparison.productId ?? comparison.id,
      title: comparison.productName?.trim() || "Untitled product",
      price,
      currency: comparison.currency || "EUR",
      url:
        comparison.competitorUrl ||
        getWebsiteUrl(raw.website, raw.domain),
      lastSeenAt: comparison.priceDate,
    });

    if (products.length >= 50) {
      break;
    }
  }

  const priceHistory = Array.from(history.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({
      date,
      avgPrice: Number((value.sum / value.count).toFixed(2)),
    }));

  return {
    id: raw.id,
    name: raw.name,
    domain: raw.domain,
    website: raw.website,
    productCount: raw.productCount,
    status: raw.status,
    isMonitoring: raw.isMonitoring,
    lastScrapedAt: raw.lastScrapedAt,
    marketPosition: raw.marketPosition,
    marketShare: raw.marketShare,
    categories: raw.categories,
    createdAt: raw.createdAt,
    products,
    priceHistory: priceHistory.length > 0 ? priceHistory : undefined,
  };
}

async function getCompetitor(id: string): Promise<LoadResult> {
  if (!FEATURES.COMPETITOR_API) {
    return { kind: "disabled" };
  }

  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/competitors/${id}`, {
      cache: "no-store",
    });

    if (res.status === 404) {
      return { kind: "not-found" };
    }

    if (!res.ok) {
      return {
        kind: "error",
        message: `HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as ApiCompetitorDetail;

    return {
      kind: "success",
      competitor: mapCompetitorDetail(data),
    };
  } catch {
    return {
      kind: "error",
      message: "Network error",
    };
  }
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <a
      href="../../"
      className="inline-flex items-center text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
    >
      &larr; Competitors
    </a>
  );
}

function StateCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
        <h1 className="text-lg font-semibold text-gray-800 sm:text-xl">{title}</h1>
        <div className="mt-2 text-sm leading-relaxed text-gray-600">{description}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CompetitorRow["status"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}

function HeaderCard({ competitor }: { competitor: CompetitorDetail }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <BackLink />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-800 sm:text-xl">
              {competitor.name}
            </h1>
            <StatusBadge status={competitor.status} />
          </div>
          <a
            href={getWebsiteUrl(competitor.website, competitor.domain)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-sm text-blue-600 transition-colors duration-200 hover:text-blue-700"
          >
            {competitor.domain}
          </a>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <p className="font-medium text-gray-700">Last scraped</p>
          <p className="mt-1">{formatRelativeTime(competitor.lastScrapedAt)}</p>
        </div>
      </div>
    </div>
  );
}

function ProductsSection({ products }: { products: CompetitorProduct[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">Products</h2>
          <p className="mt-1 text-sm text-gray-500">
            Showing {products.length} tracked product{products.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4 7.5h16M7 4.5h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-800">No products found</h3>
          <p className="mt-2 max-w-md text-sm text-gray-600">
            This competitor does not have any recent tracked products yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="pb-4 pr-6">Title</th>
                <th className="pb-4 pr-6">Price</th>
                <th className="pb-4 pr-6">Last Seen</th>
                <th className="pb-4">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="align-top">
                  <td className="py-4 pr-6">
                    <p className="font-medium text-gray-900">{product.title}</p>
                  </td>
                  <td className="py-4 pr-6 text-sm tabular-nums text-gray-700">
                    {formatCurrency(product.price, product.currency)}
                  </td>
                  <td className="py-4 pr-6 text-sm text-gray-600">
                    {formatRelativeTime(product.lastSeenAt)}
                  </td>
                  <td className="py-4 text-sm">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
                    >
                      Open
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { id } = await params;
  const result = await getCompetitor(id);

  if (result.kind === "disabled") {
    return (
      <PageShell>
        <div className="mb-6">
          <BackLink />
        </div>
        <StateCard
          title="Competitor tracking coming soon"
          description="Competitor tracking is not enabled in this environment yet. Check back once the feature flag is turned on."
          icon={
            <svg
              className="h-7 w-7 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M8 15h8M8 11h8M8 7h8M4.75 5.75h.5v.5h-.5zm0 4h.5v.5h-.5zm0 4h.5v.5h-.5zM4 4h16v16H4z"
              />
            </svg>
          }
        />
      </PageShell>
    );
  }

  if (result.kind === "not-found") {
    return (
      <PageShell>
        <div className="mb-6">
          <BackLink />
        </div>
        <StateCard
          title="Competitor not found"
          description="We could not find a tracked competitor with that ID."
          icon={
            <svg
              className="h-7 w-7 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9.75 9.75h4.5v4.5h-4.5zM4.5 4.5h15v15h-15z"
              />
            </svg>
          }
        />
      </PageShell>
    );
  }

  if (result.kind === "error") {
    return (
      <PageShell>
        <div className="mb-6">
          <BackLink />
        </div>
        <StateCard
          title="Could not load competitor"
          description={<p>{result.message}</p>}
          icon={
            <svg
              className="h-7 w-7 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 9v3.75m0 3h.008v.008H12v-.008Zm8.25-.75L13.3 4.5a1.5 1.5 0 0 0-2.6 0L3.75 18a1.5 1.5 0 0 0 1.3 2.25h13.9A1.5 1.5 0 0 0 20.25 18Z"
              />
            </svg>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-8">
        <HeaderCard competitor={result.competitor} />
        <ProductsSection products={result.competitor.products} />
      </div>
    </PageShell>
  );
}
