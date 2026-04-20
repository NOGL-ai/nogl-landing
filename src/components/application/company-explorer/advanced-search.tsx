"use client";

import { SwitchVertical01 as ArrowUpDown, InfoCircle as Info, SearchLg as Search, X, HelpCircle as CircleHelp, Expand01 as Expand, AlertTriangle as TriangleAlert } from '@untitledui/icons';

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";

import {
  getAdvancedCompanies,
  type AdvancedCompanyDataType,
  type AdvancedCompanyRow,
  type AdvancedCompanySortField,
  type AdvancedCompanySortOrder,
} from "@/lib/services/competitorClient";

const dataTypeLegend: { key: AdvancedCompanyDataType; label: string; icon: string }[] = [
  { key: "products", label: "Products", icon: "✦" },
  { key: "pricing", label: "Pricing", icon: "$" },
  { key: "reviews", label: "Reviews", icon: "☆" },
  { key: "web", label: "Web traffic", icon: "🌐" },
];

const defaultQuery = {
  search: "",
  companyVertical: "all",
  productType: "",
  dataAvailable: "",
  signatureStatus: "all" as const,
  pageSize: 25,
  pageOffset: 0,
  sortField: "relevance" as AdvancedCompanySortField,
  sortOrder: "desc" as AdvancedCompanySortOrder,
};

function formatSince(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function parseNumber(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseSortField(value: string | null): AdvancedCompanySortField {
  const candidate = (value ?? "").toLowerCase();
  if (candidate === "keyword_rank" || candidate === "name" || candidate === "data_since") {
    return candidate;
  }
  return "relevance";
}

function parseSortOrder(value: string | null): AdvancedCompanySortOrder {
  return value?.toLowerCase() === "asc" ? "asc" : "desc";
}

function parseSignatureStatus(value: string | null): "all" | "normal" | "signature" {
  if (value === "normal" || value === "signature") {
    return value;
  }
  return "all";
}

function PopularityBar({ score }: { score: number }) {
  const totalBars = 10;
  const activeBars = Math.max(1, Math.min(totalBars, Math.round((score / 100) * totalBars)));

  return (
    <div className="flex min-h-[18px] min-w-[131px] items-center justify-end overflow-hidden px-[10px]">
      <div className="flex items-center">
        {Array.from({ length: totalBars }).map((_, index) => {
          const isActive = index < activeBars;
          return (
            <div
              key={`popularity-segment-${index}`}
              className={`mr-[2px] h-[18px] w-[4px] rounded ${
                isActive ? "bg-[#3b82f6]" : "bg-slate-200"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function AdvancedSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryState = React.useMemo(() => {
    return {
      search: searchParams.get("search") ?? defaultQuery.search,
      companyVertical: searchParams.get("companyVertical") ?? defaultQuery.companyVertical,
      productType: searchParams.get("productType") ?? defaultQuery.productType,
      dataAvailable: searchParams.get("dataAvailable") ?? defaultQuery.dataAvailable,
      signatureStatus: parseSignatureStatus(searchParams.get("signatureStatus")),
      pageSize: parseNumber(searchParams.get("pageSize"), defaultQuery.pageSize),
      pageOffset: parseNumber(searchParams.get("pageOffset"), defaultQuery.pageOffset),
      sortField: parseSortField(searchParams.get("sortField")),
      sortOrder: parseSortOrder(searchParams.get("sortOrder")),
    };
  }, [searchParams]);
  const companiesBasePath = React.useMemo(
    () => pathname.replace(/\/advanced-search$/, ""),
    [pathname]
  );

  const [dismissedBanner, setDismissedBanner] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState(queryState.search);
  const [data, setData] = React.useState<AdvancedCompanyRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSearchInput(queryState.search);
  }, [queryState.search]);

  const updateQuery = React.useCallback(
    (patch: Partial<typeof queryState>, resetOffset = false) => {
      const next = {
        ...queryState,
        ...patch,
        pageOffset: resetOffset ? 0 : patch.pageOffset ?? queryState.pageOffset,
      };

      const nextParams = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined) {
          nextParams.delete(key);
          return;
        }
        nextParams.set(key, String(value));
      });

      const targetUrl = `${pathname}?${nextParams.toString()}`;
      router.replace(targetUrl as never);
    },
    [pathname, queryState, router, searchParams]
  );

  React.useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    getAdvancedCompanies(queryState)
      .then((response) => {
        if (!active) return;
        setData(response.results);
        setTotal(response.total);
      })
      .catch((loadError) => {
        if (!active) return;
        setData([]);
        setTotal(0);
        setError(loadError instanceof Error ? loadError.message : "Failed to load advanced search results");
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [queryState]);

  const columns = React.useMemo<ColumnDef<AdvancedCompanyRow>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <img
              src={row.original.logoUrl}
              alt={`${row.original.name} logo`}
              className="h-8 w-8 rounded object-contain"
              loading="lazy"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{row.original.name}</p>
              <a
                href={`https://${row.original.domain}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-500 hover:text-[#3b5bdb]"
                onClick={(event) => event.stopPropagation()}
              >
                {row.original.domain}
              </a>
            </div>
          </div>
        ),
      },
      {
        header: "Vertical",
        accessorKey: "vertical",
        cell: ({ row }) => <p className="truncate text-sm text-slate-700">{row.original.vertical}</p>,
      },
      {
        header: "Data Types",
        accessorKey: "dataTypes",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            {dataTypeLegend.map((item) => {
              const active = row.original.dataTypes.includes(item.key);
              return (
                <span key={item.key} className={active ? "opacity-100" : "opacity-30"} title={item.label}>
                  {item.icon}
                </span>
              );
            })}
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-2 text-sm text-slate-700">
            <span
              className={`h-2 w-2 rounded-full ${
                row.original.status === "Signature" ? "bg-amber-500" : "border border-slate-400"
              }`}
            />
            {row.original.status}
          </span>
        ),
      },
      {
        header: "Popularity",
        accessorKey: "popularityScore",
        cell: ({ row }) => <PopularityBar score={row.original.popularityScore} />,
      },
      {
        header: "Data Since",
        accessorKey: "dataSince",
        cell: ({ row }) => <span className="text-sm text-slate-700">{formatSince(row.original.dataSince)}</span>,
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => {
          if (!row.original.trackedCompetitorId) {
            return (
              <button
                type="button"
                className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
              >
                Request
              </button>
            );
          }

          return (
            <a
              href={`${companiesBasePath}/competitor/${row.original.trackedCompetitorId}`}
              onClick={(event) => event.stopPropagation()}
              className="rounded border border-[#3b5bdb] px-3 py-1 text-sm text-[#3b5bdb] hover:bg-indigo-50"
            >
              Explore
            </a>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.max(1, Math.ceil(total / queryState.pageSize));
  const pageIndex = Math.floor(queryState.pageOffset / queryState.pageSize);

  return (
    <main className="min-h-screen bg-[#f5f6fa] pb-10">
      {!dismissedBanner && (
        <div className="flex h-9 items-center justify-between bg-[#fef2f2] px-4 text-xs text-[#991b1b]">
          <p className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4" />
            Your paid access to Nogl is ending after April 26, 2026. To continue using paid features,{" "}
            <a href="#" className="underline">
              resubscribe here.
            </a>
          </p>
          <button
            type="button"
            className="rounded p-1 hover:bg-red-100"
            onClick={() => setDismissedBanner(true)}
            aria-label="Dismiss warning banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="border-b bg-white px-6 py-4">
        <nav className="text-sm text-slate-700">
          <a href={companiesBasePath} className="hover:text-[#3b5bdb]">
            Company Explorer
          </a>{" "}
          <span className="mx-2">›</span>
          <span>Advanced Search</span>
        </nav>
        <p className="mt-2 text-xs text-slate-500">
          All brands available through Nogl, with extra filters and options to sort results in tabular format
        </p>
      </div>

      <section className="mx-6 mt-4 rounded-xl border border-[#e2e8f0] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Filters</h2>
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              updateQuery(defaultQuery, true);
            }}
            className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <label className="text-xs font-semibold text-slate-600">
            <span className="mb-1 inline-flex items-center gap-1">
              Search <Info className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchInput(value);
                  updateQuery({ search: value }, true);
                }}
                placeholder="lululemon.com..."
                className="w-full rounded border border-slate-300 py-2 pl-8 pr-3 text-sm font-normal text-slate-900 outline-none focus:border-[#3b5bdb]"
              />
            </span>
          </label>

          <label className="text-xs font-semibold text-slate-600">
            <span className="mb-1 inline-flex items-center gap-1">
              Competitor Vertical <Info className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <select
              value={queryState.companyVertical}
              onChange={(event) => updateQuery({ companyVertical: event.target.value }, true)}
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm font-normal text-slate-900 outline-none focus:border-[#3b5bdb]"
            >
              <option value="all">(All verticals)</option>
              <option value="Electronics">Electronics</option>
              <option value="Luggage & Bags">Luggage & Bags</option>
              <option value="Baby & Toddler">Baby & Toddler</option>
              <option value="Apparel & Accessories">Apparel & Accessories</option>
              <option value="Home & Living">Home & Living</option>
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-600">
            <span className="mb-1 inline-flex items-center gap-1">
              Product Type <Info className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <input
              value={queryState.productType}
              onChange={(event) => updateQuery({ productType: event.target.value }, true)}
              placeholder="Leggings..."
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm font-normal text-slate-900 outline-none focus:border-[#3b5bdb]"
            />
          </label>

          <label className="text-xs font-semibold text-slate-600">
            <span className="mb-1 inline-flex items-center gap-1">
              Data Available <Info className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <select
              value={queryState.dataAvailable}
              onChange={(event) => updateQuery({ dataAvailable: event.target.value }, true)}
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm font-normal text-slate-900 outline-none focus:border-[#3b5bdb]"
            >
              <option value="">(All data types)</option>
              {dataTypeLegend.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-600">
            <span className="mb-1 inline-flex items-center gap-1">
              Signature Status <Info className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <select
              value={queryState.signatureStatus}
              onChange={(event) =>
                updateQuery({ signatureStatus: parseSignatureStatus(event.target.value) }, true)
              }
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm font-normal text-slate-900 outline-none focus:border-[#3b5bdb]"
            >
              <option value="all">(All competitors)</option>
              <option value="normal">Normal</option>
              <option value="signature">Signature</option>
            </select>
          </label>
        </div>
      </section>

      <section className="mx-6 mt-4 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded bg-[#3b5bdb] px-2 py-1 text-sm font-semibold text-white">
              All Competitor Datasets
              <Info className="h-3.5 w-3.5" />
            </span>
            <button id="fullscreen-icon" type="button" className="rounded p-1 text-slate-500 hover:bg-slate-100">
              <Expand className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-500" />
            <select
              value={`${queryState.sortField}:${queryState.sortOrder}`}
              onChange={(event) => {
                const [sortField, sortOrder] = event.target.value.split(":") as [
                  AdvancedCompanySortField,
                  AdvancedCompanySortOrder
                ];
                updateQuery({ sortField, sortOrder });
              }}
              className="rounded border border-slate-300 px-2 py-1 text-sm outline-none"
            >
              <option value="relevance:desc">Relevance</option>
              <option value="keyword_rank:desc">Keyword Rank</option>
              <option value="name:asc">Name A-Z</option>
              <option value="data_since:desc">Newest Data</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading advanced search results...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3 font-semibold">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b hover:bg-[#f0f4ff]"
                    onClick={() => {
                      if (row.original.trackedCompetitorId) {
                        const targetUrl = `${companiesBasePath}/competitor/${row.original.trackedCompetitorId}`;
                        router.push(targetUrl as never);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={columns.length}>
                      No companies match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            Rows per page:
            <select
              value={queryState.pageSize}
              onChange={(event) => updateQuery({ pageSize: Number(event.target.value), pageOffset: 0 })}
              className="rounded border border-slate-300 px-2 py-1"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>
              {total === 0
                ? "0 results"
                : `${queryState.pageOffset + 1}-${Math.min(queryState.pageOffset + queryState.pageSize, total)} of ${total}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pageIndex <= 0}
              onClick={() =>
                updateQuery({
                  pageOffset: Math.max(0, queryState.pageOffset - queryState.pageSize),
                })
              }
              className="rounded border border-slate-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-slate-600">
              Page {pageIndex + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={pageIndex + 1 >= totalPages}
              onClick={() =>
                updateQuery({
                  pageOffset: queryState.pageOffset + queryState.pageSize,
                })
              }
              className="rounded border border-slate-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <div className="mt-6 flex justify-center">
        <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-white">
          Looking for a different company?
        </button>
      </div>

      <button
        id="help-menu-button"
        type="button"
        className="fixed bottom-6 right-6 rounded-full border border-slate-200 bg-white p-3 text-slate-700 shadow-md"
      >
        <CircleHelp className="h-5 w-5" />
      </button>

      <div className="fixed bottom-6 left-6 text-[11px] text-slate-500">
        <p>© 2026 Nogl · All Rights Reserved</p>
        <p>Version ID: a10cd</p>
      </div>
    </main>
  );
}