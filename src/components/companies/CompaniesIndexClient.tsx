"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Grid01, List, Plus, SearchLg } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { UntitledPagination } from "@/components/application/pagination/pagination-untitled";
import { CountryPill } from "@/components/companies/CountryPill";
import { Badge } from "@/components/ui/badge";
import type { CompanyListItem } from "@/types/company";
import type { PageMeta } from "@/types/product";

const RECENTLY_VIEWED_KEY = "nogl:recently-viewed-companies";

type RecentCompany = { slug: string; name: string; domain: string };

type Props = {
  companies: CompanyListItem[];
  pagination: PageMeta;
  lang: string;
  error?: string | null;
};

function TrackingBadge({ status }: { status: CompanyListItem["tracking_status"] }) {
  if (status === "TRACKED") return <Badge variant="success" size="sm">Tracked</Badge>;
  if (status === "PAUSED") return <Badge variant="warning" size="sm">Paused</Badge>;
  return <Badge variant="secondary" size="sm">Untracked</Badge>;
}

function SelectFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative inline-flex shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-lg border border-border-primary bg-bg-primary py-0 pl-3 pr-8 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-border-brand cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
    </div>
  );
}

function RecentlyViewedStrip({ items, lang }: { items: RecentCompany[]; lang: string }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-medium text-text-tertiary">Recently viewed</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <a
            key={item.slug}
            href={`/${lang}/companies/${item.slug}/overview`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-primary bg-bg-primary px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-secondary"
          >
            <span className="font-semibold text-text-primary">{item.name}</span>
            <span className="text-text-tertiary">{item.domain}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function CompanyCard({
  company,
  lang,
  onVisit,
}: {
  company: CompanyListItem;
  lang: string;
  onVisit: () => void;
}) {
  return (
    <a
      href={`/${lang}/companies/${company.slug}/overview`}
      onClick={onVisit}
      className="group rounded-xl border border-border-primary bg-bg-primary p-5 shadow-xs transition-colors hover:border-border-secondary hover:bg-bg-secondary"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-tertiary text-sm font-semibold text-text-tertiary">
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">{company.name}</p>
            <p className="truncate text-xs text-text-tertiary">{company.domain}</p>
          </div>
        </div>
        <CountryPill country_code={company.country_code} />
      </div>

      <div className="my-4 h-px bg-border-secondary" />

      <div className="flex items-center justify-between">
        <TrackingBadge status={company.tracking_status} />
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-tertiary">
            Products
          </p>
          <p className="mt-0.5 tabular-nums text-base font-semibold text-text-primary">
            {company.total_products.toLocaleString()}
          </p>
        </div>
      </div>
    </a>
  );
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function CompaniesIndexClient({ companies, pagination, lang, error = null }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [recentlyViewed, setRecentlyViewed] = useState<RecentCompany[]>([]);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRecentlyViewed(parsed.slice(0, 5));
      }
    } catch {}
  }, []);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => updateParam("search", value), 400);
  }

  function handleCompanyVisit(company: CompanyListItem) {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      const existing: RecentCompany[] = stored ? JSON.parse(stored) : [];
      const updated = [
        { slug: company.slug, name: company.name, domain: company.domain },
        ...existing.filter((c) => c.slug !== company.slug),
      ].slice(0, 5);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      setRecentlyViewed(updated);
    } catch {}
  }

  const country = searchParams.get("country") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "name";
  const page = Number(searchParams.get("page")) || 1;

  const countryOptions = [
    { label: "All Countries", value: "" },
    { label: "🇩🇪 DE", value: "DE" },
    { label: "🇦🇹 AT", value: "AT" },
    { label: "🇨🇭 CH", value: "CH" },
    { label: "🇫🇷 FR", value: "FR" },
    { label: "🇬🇧 GB", value: "GB" },
    { label: "🇳🇱 NL", value: "NL" },
    { label: "🇵🇱 PL", value: "PL" },
    { label: "🇮🇹 IT", value: "IT" },
    { label: "🇪🇸 ES", value: "ES" },
  ];

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Tracked", value: "TRACKED" },
    { label: "Paused", value: "PAUSED" },
    { label: "Untracked", value: "UNTRACKED" },
  ];

  const sortOptions = [
    { label: "Name A→Z", value: "name" },
    { label: "Most products", value: "total_products_desc" },
    { label: "Least products", value: "total_products_asc" },
    { label: "Recently scraped", value: "last_scraped_at" },
  ];

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "total_products_desc") {
      params.set("sort", "total_products");
      params.set("sort_dir", "desc");
    } else if (value === "total_products_asc") {
      params.set("sort", "total_products");
      params.set("sort_dir", "asc");
    } else if (value === "last_scraped_at") {
      params.set("sort", "last_scraped_at");
      params.set("sort_dir", "desc");
    } else {
      params.set("sort", "name");
      params.delete("sort_dir");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  const sortDir = searchParams.get("sort_dir") ?? "asc";
  const sortValue =
    sort === "total_products" && sortDir === "desc"
      ? "total_products_desc"
      : sort === "total_products" && sortDir === "asc"
      ? "total_products_asc"
      : sort === "last_scraped_at"
      ? "last_scraped_at"
      : "name";

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
              Company Explorer
            </p>
            <h1 className="mt-2 text-display-sm font-semibold text-text-primary">
              {pagination.total.toLocaleString()} companies tracked
            </h1>
          </div>
          <Button color="primary" iconLeading={Plus} size="sm">
            Add competitor
          </Button>
        </div>

        {/* Recently viewed */}
        <RecentlyViewedStrip items={recentlyViewed} lang={lang} />

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[200px] flex-1">
            <Input
              icon={SearchLg}
              placeholder="Search by name or domain…"
              value={searchInput}
              onChange={handleSearchChange}
            />
          </div>

          <SelectFilter
            value={country}
            onChange={(v) => updateParam("country", v)}
            options={countryOptions}
          />

          <SelectFilter
            value={status}
            onChange={(v) => updateParam("status", v)}
            options={statusOptions}
          />

          <SelectFilter
            value={sortValue}
            onChange={handleSortChange}
            options={sortOptions}
          />

          <div className="flex overflow-hidden rounded-lg border border-border-primary">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={`px-3 py-2 transition-colors ${
                view === "grid"
                  ? "bg-bg-secondary text-text-primary"
                  : "bg-bg-primary text-text-tertiary hover:bg-bg-secondary/50"
              }`}
            >
              <Grid01 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              className={`border-l border-border-primary px-3 py-2 transition-colors ${
                view === "list"
                  ? "bg-bg-secondary text-text-primary"
                  : "bg-bg-primary text-text-tertiary hover:bg-bg-secondary/50"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Results */}
        {companies.length === 0 && !error ? (
          <div className="mt-12 flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-medium text-text-primary">No companies found</p>
            <p className="text-sm text-text-tertiary">Try adjusting your filters.</p>
          </div>
        ) : view === "grid" ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                lang={lang}
                onVisit={() => handleCompanyVisit(company)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-border-primary">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {["Company", "Country", "Status", "Products", "Last scraped"].map((h) => (
                    <th
                      key={h}
                      className="border-b border-border-primary bg-bg-secondary px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className="cursor-pointer border-b border-border-secondary last:border-0 hover:bg-bg-secondary"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={`/${lang}/companies/${company.slug}/overview`}
                        onClick={() => handleCompanyVisit(company)}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-tertiary text-xs font-semibold text-text-tertiary">
                          {company.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{company.name}</p>
                          <p className="text-xs text-text-tertiary">{company.domain}</p>
                        </div>
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <CountryPill country_code={company.country_code} />
                    </td>
                    <td className="px-4 py-3">
                      <TrackingBadge status={company.tracking_status} />
                    </td>
                    <td className="px-4 py-3 tabular-nums text-text-primary">
                      {company.total_products.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-text-tertiary">
                      {formatDate(company.last_scraped_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <UntitledPagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => updateParam("page", String(p))}
            className="mt-6"
          />
        )}
      </div>
    </div>
  );
}
