"use client";

import React from "react";
import { Download, Plus, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

import TanStackTable from "@/components/application/table/tanstack-table";
import { extractDomainFromUrl, generateLogoUrl } from "@/lib/logoService";
import { getCompetitors } from "@/lib/services/competitorClient";
import type { CompetitorDTO } from "@/types/product";

type DashboardCompetitor = {
  id: number;
  _dbId: string;
  name: string;
  domain: string;
  avatar: string;
  products: number;
  position: number;
  trend: number;
  trendUp: boolean;
  date: string;
  categories: string[];
  competitorPrice: number;
  myPrice: number;
};

const badgeClasses: Record<string, string> = {
  ACTIVE:
    "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647] dark:border-[#067647] dark:bg-[#0a472a] dark:text-[#ABEFC6]",
  INACTIVE:
    "border-[#E9EAEB] bg-[#FAFAFA] text-[#414651] dark:border-[#414651] dark:bg-[#1a1d24] dark:text-[#D5D7DA]",
  MONITORING:
    "border-[#B2DDFF] bg-[#EFF8FF] text-[#175CD3] dark:border-[#175CD3] dark:bg-[#0a2540] dark:text-[#B2DDFF]",
  PAUSED:
    "border-[#F9DBAF] bg-[#FEF6EE] text-[#B93815] dark:border-[#B93815] dark:bg-[#4a1d0a] dark:text-[#F9DBAF]",
  ARCHIVED:
    "border-[#E9EAEB] bg-[#FAFAFA] text-[#414651] dark:border-[#414651] dark:bg-[#1a1d24] dark:text-[#D5D7DA]",
};

const secondaryButtonClasses =
  "inline-flex items-center justify-center gap-1 rounded-lg border border-border-secondary bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ProductsCell({
  competitor,
  maxProducts,
}: {
  competitor: DashboardCompetitor;
  maxProducts: number;
}) {
  const percentage = maxProducts > 0 ? Math.round((competitor.products / maxProducts) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="text-base font-semibold text-foreground">
        {competitor.products.toLocaleString()}
      </div>
      <div className="text-xs text-muted-foreground">
        {percentage}% of top catalog
      </div>
    </div>
  );
}

function PricePositionCell({
  competitorPrice,
  myPrice,
}: {
  competitorPrice: number;
  myPrice: number;
}) {
  const difference = myPrice - competitorPrice;
  const isWinning = difference < 0;
  const tone = isWinning
    ? "text-green-700 dark:text-green-300"
    : difference > 0
    ? "text-red-700 dark:text-red-300"
    : "text-muted-foreground";

  return (
    <div className="space-y-1">
      <div className="text-sm font-semibold text-foreground">
        {competitorPrice.toLocaleString("de-DE", {
          style: "currency",
          currency: "EUR",
        })}
      </div>
      <div className={`text-xs ${tone}`}>
        {difference === 0
          ? "Price matched"
          : `${isWinning ? "Ahead by" : "Behind by"} ${Math.abs(difference).toFixed(2)} EUR`}
      </div>
    </div>
  );
}

function mapCompetitor(
  competitor: CompetitorDTO,
  index: number,
  offset: number
): DashboardCompetitor {
  const normalizedDomain =
    extractDomainFromUrl(competitor.website || competitor.domain) ?? competitor.domain;
  const avatar =
    generateLogoUrl(normalizedDomain, { format: "png", size: 64 }) ??
    "https://img.logo.dev/logo.dev?format=png&size=64";

  return {
    id: offset + index + 1,
    _dbId: competitor.id,
    name: competitor.name,
    domain: competitor.domain,
    avatar,
    products: competitor.productCount,
    position: competitor.marketPosition ?? 0,
    trend: 0,
    trendUp: true,
    date: formatDate(competitor.updatedAt),
    categories: [competitor.status, ...(competitor.categories ?? [])],
    competitorPrice: 35,
    myPrice: 42,
  };
}

export default function CompetitorPage() {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = React.useState<"all" | "monitored" | "paused">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(25);
  const [competitors, setCompetitors] = React.useState<DashboardCompetitor[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    async function loadCompetitors() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getCompetitors({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          status:
            activeTab === "all"
              ? undefined
              : activeTab === "monitored"
              ? "ACTIVE"
              : "PAUSED",
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        const offset = (currentPage - 1) * itemsPerPage;

        setCompetitors(
          response.competitors.map((competitor, index) =>
            mapCompetitor(competitor, index, offset)
          )
        );
        setTotalPages(response.pagination.totalPages);
        setTotal(response.pagination.total);
      } catch (loadError) {
        setCompetitors([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load competitors"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCompetitors();
  }, [activeTab, currentPage, itemsPerPage, searchQuery]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const maxProducts = React.useMemo(() => {
    return competitors.reduce((max, competitor) => Math.max(max, competitor.products), 0);
  }, [competitors]);

  return (
    <main className="mx-auto min-h-screen w-full space-y-6 bg-background px-4 pb-8 pt-6 text-foreground transition-colors md:space-y-8 md:px-8 md:pb-12 md:pt-8">
      <header className="flex flex-wrap items-start justify-between gap-3 md:gap-4">
        <div className="min-w-[200px] flex-1 md:min-w-[280px]">
          <h1 className="text-xl font-semibold text-foreground md:text-2xl">
            Competitor Analysis
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Focus only on the competitors you actively track, compare, and review.
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button className={secondaryButtonClasses} type="button">
            <Settings className="h-5 w-5 text-quaternary" />
            <span className="hidden sm:inline">Customize</span>
          </button>
          <button className={secondaryButtonClasses} type="button">
            <Download className="h-5 w-5 text-quaternary" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <a
            href="../add-ecommerce"
            className="inline-flex items-center gap-1 rounded-lg border-2 border-purple-700 bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-5 w-5 text-primary-foreground/80" />
            <span>Add Competitor</span>
          </a>
        </div>
      </header>

      <section className="rounded-xl border border-border-secondary bg-card shadow-sm transition-colors">
        <div className="border-b border-border-secondary p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 md:gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-foreground md:text-lg">
                  Tracked competitors
                </h2>
                <span className="inline-flex items-center rounded-full border border-border-secondary bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {total} competitors
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                Keep this page focused on matched competitors only.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-secondary px-4 py-3 md:px-6">
          <div
            className="flex overflow-hidden rounded-lg border border-border-secondary shadow-sm"
            role="tablist"
            aria-label="Competitor filter tabs"
          >
            {[
              { id: "all", label: "All Competitors" },
              { id: "monitored", label: "Tracking" },
              { id: "paused", label: "Paused" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as "all" | "monitored" | "paused")}
                className={`px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 ${
                  activeTab === tab.id
                    ? "bg-muted text-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                } ${tab.id !== "paused" ? "border-r border-border-secondary" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto md:gap-3">
            <div className="relative flex-1 sm:w-[260px]">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-quaternary"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search competitors by name or domain"
                className="w-full rounded-lg border border-border-secondary bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
              <p className="text-muted-foreground">Loading competitors...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center px-6">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">Failed to load competitors</h3>
              <p className="mb-4 text-muted-foreground">{error}</p>
              <button
                type="button"
                onClick={() => router.refresh()}
                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <TanStackTable
                data={competitors}
                selectedRows={selectedRows}
                onRowSelectionChange={setSelectedRows}
                onRowClick={(row) => router.push(`./${(row as DashboardCompetitor)._dbId}`)}
                maxProducts={maxProducts}
                badgeClasses={badgeClasses}
                ProductsCell={ProductsCell}
                PricePositionCell={PricePositionCell}
                showProductsColumn={true}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-secondary px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <label htmlFor="page-size" className="text-sm text-muted-foreground">
                  Rows per page:
                </label>
                <select
                  id="page-size"
                  value={itemsPerPage}
                  onChange={(event) => setItemsPerPage(Number(event.target.value))}
                  className="rounded-md border border-border-secondary bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>

                <div className="text-sm font-medium text-muted-foreground">
                  {total > 0
                    ? `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                        currentPage * itemsPerPage,
                        total
                      )} of ${total}`
                    : "No competitors found"}
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage <= 1}
                  className={secondaryButtonClasses}
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {Math.max(totalPages, 1)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages || 1, page + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className={secondaryButtonClasses}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
