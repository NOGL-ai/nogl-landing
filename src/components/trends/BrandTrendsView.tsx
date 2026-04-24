import Link from "next/link";
import { Search, Settings2 } from "lucide-react";
import { TrendsGrid } from "./TrendsGrid";
import {
  getTrendingCompanies,
  getTrendingCategories,
  refreshTrends,
} from "@/actions/trends";
import type { Period } from "./PeriodSelector";

interface Props {
  lang: string;
  period: Period;
}

/**
 * Server component — renders the legacy "Brand Trends" dashboard content.
 * Exact port of the previous inline `InternalTab` in /[lang]/trends/page.tsx
 * so we can compose it alongside the new Product Trends tab without changing
 * any visible behaviour.
 */
export async function BrandTrendsView({ lang }: Props) {
  let companies: Awaited<ReturnType<typeof getTrendingCompanies>> = [];
  let categories: Awaited<ReturnType<typeof getTrendingCategories>> = [];

  try {
    [companies, categories] = await Promise.all([
      getTrendingCompanies({ limit: 12 }),
      getTrendingCategories({ limit: 12 }),
    ]);
  } catch {
    // DB not available in this environment — show empty state
  }

  async function handleRefresh() {
    "use server";
    await refreshTrends();
  }

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4">
          {companies.slice(0, 10).map((company) => (
            <div
              key={company.id}
              className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-[#64748b]"
            >
              {company.name.slice(0, 2)}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white px-4 py-3">
          <Search className="h-5 w-5 text-[#64748b]" />
          <input
            className="w-full border-0 bg-transparent text-base text-[#111827] outline-none placeholder:text-[#94a3b8]"
            placeholder="Enter a search term"
            defaultValue=""
          />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#475569]"
            aria-label="Open advanced search"
          >
            <Settings2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <p className="text-xl font-semibold text-[#111827]">
          Stay Updated with Exploding Retail Trends
        </p>
        <p className="mt-1 text-sm text-[#64748b]">
          Get the latest exploding retail trends delivered straight to your inbox.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
            Sign up for Emails
          </button>
          <Link href={`/${lang}/settings`} className="text-sm font-medium text-[#2563eb]">
            Manage newsletter preferences
          </Link>
        </div>
      </div>

      <TrendsGrid
        title="Top Exploding Trends"
        cards={[...companies, ...categories]
          .sort((a, b) => b.growthMetric - a.growthMetric)
          .slice(0, 15)}
        lang={lang}
        onRefresh={handleRefresh}
      />

      <div className="grid gap-8 md:grid-cols-2">
        <TrendsGrid
          title="Companies — Fastest Growing"
          cards={companies}
          lang={lang}
          isCompany
          kind="company"
          onRefresh={handleRefresh}
        />
        <TrendsGrid
          title="Product Types — Fastest Growing"
          cards={categories}
          lang={lang}
          isCompany={false}
          kind="product"
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}
