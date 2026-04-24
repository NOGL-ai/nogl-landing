import Link from "next/link";
import { Suspense } from "react";
import { TrendsGridSkeleton } from "@/components/trends/TrendsGrid";
import { BrandTrendsView } from "@/components/trends/BrandTrendsView";
import { ProductTrendsView } from "@/components/trends/ProductTrendsView";
import { TrendsTabs } from "@/components/trends/TrendsTabs";
import type { Period } from "@/components/trends/PeriodSelector";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ period?: string; tab?: string }>;
}

const VALID_PERIODS: Period[] = ["4w", "12w", "52w"];

function isPeriod(v: string | undefined): v is Period {
  return VALID_PERIODS.includes(v as Period);
}

function BrandTrendsSkeleton() {
  return (
    <div className="space-y-8">
      <TrendsGridSkeleton title="Top Exploding Trends" />
      <div className="grid gap-8 md:grid-cols-2">
        <TrendsGridSkeleton title="Companies — Fastest Growing" />
        <TrendsGridSkeleton title="Product Types — Fastest Growing" />
      </div>
    </div>
  );
}

function ProductTrendsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-16 animate-pulse rounded-xl border border-[#e5e7eb] bg-white" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-32 animate-pulse rounded-2xl border border-[#e5e7eb] bg-white" />
        <div className="h-32 animate-pulse rounded-2xl border border-[#e5e7eb] bg-white" />
        <div className="md:col-span-2 h-64 animate-pulse rounded-2xl border border-[#e5e7eb] bg-white" />
        <div className="md:col-span-2 h-64 animate-pulse rounded-2xl border border-[#e5e7eb] bg-white" />
      </div>
    </div>
  );
}

export default async function TrendsPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const { period: rawPeriod, tab } = await searchParams;
  const period: Period = isPeriod(rawPeriod) ? rawPeriod : "4w";
  const initialTab: "brand" | "product" = tab === "product" ? "product" : "brand";

  const PERIOD_LINKS = [
    { label: "2y", value: "52w" as const },
    { label: "1y", value: "12w" as const },
    { label: "6m", value: "12w" as const },
    { label: "3m", value: "4w" as const },
    { label: "1m", value: "4w" as const },
  ];

  return (
    <div className="bg-white px-6 py-5 lg:px-8">
      <div className="w-full max-w-[821px] space-y-5 xl:ml-[120px]">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-[32px] font-semibold leading-none text-[#111827]">Trends</h1>
              <button className="rounded-md border border-[#e5e7eb] bg-white px-3 py-1.5 text-sm font-medium text-[#6b7280]">
                How to use
              </button>
            </div>
            <p className="text-base text-[#64748b]">
              Explore trend charts to gain insight into the evolution of competitors, product types, and more.
            </p>
          </div>
          <button className="ml-auto shrink-0 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
            Subscribe
          </button>
        </div>

        <div className="inline-flex rounded-lg border border-[#e5e7eb] bg-white p-1">
          {PERIOD_LINKS.map((opt) => {
            const active = period === opt.value;
            return (
              <Link
                key={opt.label}
                href={`/${lang}/trends?period=${opt.value}`}
                className={`rounded-md px-4 py-1.5 text-sm font-semibold ${
                  active ? "bg-[#f1f5f9] text-[#111827]" : "text-[#6b7280]"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>

        <TrendsTabs
          initial={initialTab}
          brandView={
            <Suspense fallback={<BrandTrendsSkeleton />}>
              <BrandTrendsView lang={lang} period={period} />
            </Suspense>
          }
          productView={
            <Suspense fallback={<ProductTrendsSkeleton />}>
              <ProductTrendsView />
            </Suspense>
          }
        />
      </div>
    </div>
  );
}
