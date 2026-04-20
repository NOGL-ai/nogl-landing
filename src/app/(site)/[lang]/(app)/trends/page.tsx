    "use server";
import { Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendsGrid, TrendsGridSkeleton } from "@/components/trends/TrendsGrid";
import { PeriodSelector } from "@/components/trends/PeriodSelector";
import { ExternalTrendsWaitlist } from "@/components/trends/ExternalTrendsWaitlist";
import {
  getTrendingCompanies,
  getTrendingCategories,
  refreshTrends,
} from "@/actions/trends";
import type { Period } from "@/components/trends/PeriodSelector";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ period?: string }>;
}

const VALID_PERIODS: Period[] = ["4w", "12w", "52w"];

function isPeriod(v: string | undefined): v is Period {
  return VALID_PERIODS.includes(v as Period);
}

async function InternalTab({ lang, period }: { lang: string; period: Period }) {
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
    await refreshTrends();
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <TrendsGrid
        title="Companies — Fastest Growing"
        cards={companies}
        lang={lang}
        isCompany
        onRefresh={handleRefresh}
      />
      <TrendsGrid
        title="Product Types — Fastest Growing"
        cards={categories}
        lang={lang}
        isCompany={false}
        onRefresh={handleRefresh}
      />
    </div>
  );
}

export default async function TrendsPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const { period: rawPeriod } = await searchParams;
  const period: Period = isPeriod(rawPeriod) ? rawPeriod : "4w";

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trends</h1>
          <p className="text-sm text-muted-foreground">
            Fastest-growing companies and product types in your tracked dataset
          </p>
        </div>
        <Suspense>
          <PeriodSelector period={period} />
        </Suspense>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="internal" className="flex flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="internal">Internal</TabsTrigger>
          <TabsTrigger value="external" className="gap-1.5">
            External
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Soon
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal">
          <Suspense
            fallback={
              <div className="grid gap-8 md:grid-cols-2">
                <TrendsGridSkeleton title="Companies — Fastest Growing" />
                <TrendsGridSkeleton title="Product Types — Fastest Growing" />
              </div>
            }
          >
            <InternalTab lang={lang} period={period} />
          </Suspense>
        </TabsContent>

        <TabsContent value="external">
          <ExternalTrendsWaitlist />
        </TabsContent>
      </Tabs>
    </div>
  );
}
