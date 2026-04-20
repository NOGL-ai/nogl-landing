import { SearchLg as Search } from '@untitledui/icons';
"use client";


import { useMemo, useState } from "react";

import { CountryPill } from "@/components/companies/CountryPill";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CompanyListItem } from "@/types/company";

type CompaniesIndexClientProps = {
  companies: CompanyListItem[];
  lang: string;
  error?: string | null;
};

function TrackingBadge({ status }: { status: CompanyListItem["tracking_status"] }) {
  if (status === "TRACKED") {
    return <Badge variant="success" size="sm">Tracked</Badge>;
  }

  if (status === "PAUSED") {
    return <Badge variant="warning" size="sm">Paused</Badge>;
  }

  return <Badge variant="secondary" size="sm">Untracked</Badge>;
}

export function CompaniesIndexClient({
  companies,
  lang,
  error = null,
}: CompaniesIndexClientProps) {
  const [search, setSearch] = useState("");

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return companies;
    }

    return companies.filter((company) => {
      return (
        company.name.toLowerCase().includes(normalizedSearch) ||
        company.domain.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [companies, search]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Company Explorer
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Browse the company world-model foundation.
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                Open a company record to inspect overview, pricing, events, and asset collection from the new company APIs.
              </p>
            </div>

            <div className="relative max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter by company name or domain"
                className="h-12 rounded-2xl border-border pl-11"
              />
            </div>

            {error ? (
              <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {error}
              </Card>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCompanies.map((company) => (
                <a
                  key={company.id}
                  href={`/${lang}/companies/${company.slug}/overview`}
                  className="rounded-3xl border border-border bg-background p-5 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-foreground">
                        {company.name}
                      </h2>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {company.domain}
                      </p>
                    </div>
                    <CountryPill country_code={company.country_code} />
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <TrackingBadge status={company.tracking_status} />
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Products
                      </p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {company.total_products.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {filteredCompanies.length === 0 ? (
              <Card className="p-6 text-sm text-muted-foreground">
                No companies match your current filter.
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
