"use client";
import { ChevronUp, ChevronDown, ChevronSelectorVertical as ChevronsUpDown, ChevronLeft, ChevronRight } from '@untitledui/icons';

import { ChevronUp, ChevronDown, ChevronSelectorVertical as ChevronsUpDown, ChevronLeft, ChevronRight } from '@untitledui/icons';

import { useState, useEffect, useCallback } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
  type ColumnFiltersState,
} from "@tanstack/react-table";

import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdEventSheet, type AdEventRow } from "./AdEventSheet";

const PLATFORMS = ["ALL", "META_ADS_LIBRARY", "INSTAGRAM", "FACEBOOK", "TIKTOK"] as const;
const SOURCES = ["ALL", "FB_AD_ACTOR_V2", "IG_MONITOR", "TIKTOK_SCRAPER", "MANUAL"] as const;
const EVENT_TYPES = [
  "ALL",
  "CREATIVE_SEEN",
  "CREATIVE_UPDATED",
  "POST_METRICS",
  "PROFILE_SNAPSHOT",
  "PLACEMENT_CHANGE",
] as const;

const col = createColumnHelper<AdEventRow>();

const columns = [
  col.accessor("ts", {
    header: "Time",
    cell: (i) =>
      new Date(i.getValue()).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    sortingFn: "datetime",
  }),
  col.accessor("event_type", {
    header: "Type",
    cell: (i) => (
      <span className="rounded-full bg-bg-secondary px-2 py-0.5 text-xs font-medium">
        {i.getValue()}
      </span>
    ),
  }),
  col.accessor("platform", {
    header: "Platform",
    cell: (i) => <span className="text-xs text-text-secondary">{i.getValue()}</span>,
  }),
  col.accessor("source", {
    header: "Source",
    cell: (i) => <span className="font-mono text-xs text-text-tertiary">{i.getValue()}</span>,
  }),
  col.accessor("handle", {
    header: "Account",
    cell: (i) =>
      i.getValue() ? (
        <span className="text-xs text-text-primary">@{i.getValue()}</span>
      ) : (
        <span className="text-xs text-text-tertiary">—</span>
      ),
  }),
  col.accessor("ingestion_run_id", {
    header: "Run ID",
    cell: (i) => (
      <span className="font-mono text-[10px] text-text-quaternary">
        {i.getValue().slice(0, 8)}…
      </span>
    ),
  }),
];

export function AdEventsTable() {
  const [data, setData] = useState<AdEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<string>("ALL");
  const [source, setSource] = useState<string>("ALL");
  const [eventType, setEventType] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "ts", desc: true }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedEvent, setSelectedEvent] = useState<AdEventRow | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (platform !== "ALL") params.set("platform", platform);
      if (source !== "ALL") params.set("source", source);
      if (eventType !== "ALL") params.set("event_type", eventType);
      if (search) params.set("search", search);
      const res = await fetch(`/api/ads-events/events?${params}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [platform, source, eventType, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, pagination, columnFilters },
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search account / run ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-56 text-sm"
        />
        <FilterSelect label="Platform" value={platform} options={PLATFORMS} onChange={setPlatform} />
        <FilterSelect label="Source" value={source} options={SOURCES} onChange={setSource} />
        <FilterSelect label="Type" value={eventType} options={EVENT_TYPES} onChange={setEventType} />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border-secondary">
        <table className="w-full text-sm">
          <thead className="bg-bg-secondary">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="cursor-pointer select-none px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ChevronUp className="h-3 w-3" />,
                        desc: <ChevronDown className="h-3 w-3" />,
                      }[header.column.getIsSorted() as string] ?? (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-text-tertiary">
                  Loading events…
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-text-tertiary">
                  No events match the current filters
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-t border-border-secondary hover:bg-bg-secondary/50"
                  onClick={() => setSelectedEvent(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <span>
          {table.getFilteredRowModel().rows.length} events
        </span>
        <div className="flex items-center gap-2">
          <Button
            color="secondary"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span>
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            color="secondary"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <AdEventSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-44 text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="text-xs">
            {o === "ALL" ? `All ${label}s` : o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}