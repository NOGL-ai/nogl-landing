"use client";

// eslint-disable-next-line no-restricted-imports -- icon has no @untitledui/icons equivalent; keep in lucide-react until UUI ships it
import { GripVertical } from 'lucide-react';
import { Download01 as Download, Plus, SearchLg as Search, Settings01 as Settings } from '@untitledui/icons';

import React from "react";

import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { getCompetitors } from "@/lib/services/competitorClient";
import { extractDomainFromUrl, generateLogoUrl } from "@/lib/logoService";
import { reorderTrackedCompetitors } from "@/actions/trackedCompetitors";
import { RowActionsMenu } from "@/components/tracked-competitors/RowActionsMenu";
import { AddCompetitorDialog } from "@/components/tracked-competitors/AddCompetitorDialog";
import type { CompetitorDTO, TrackedCompetitorStatus } from "@/types/product";

const CALUMET_COMPANY_ID = "cmnw4qqo10000ltccgauemneu";

type Tab = "all" | "active" | "paused";

const TAB_STATUS_MAP: Record<Tab, string | undefined> = {
  all: undefined,
  active: "ACTIVE",
  paused: "PAUSED",
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:
    "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647] dark:border-[#067647] dark:bg-[#0a472a] dark:text-[#ABEFC6]",
  PAUSED:
    "border-[#F9DBAF] bg-[#FEF6EE] text-[#B93815] dark:border-[#B93815] dark:bg-[#4a1d0a] dark:text-[#F9DBAF]",
  ARCHIVED:
    "border-[#E9EAEB] bg-[#FAFAFA] text-[#414651] dark:border-[#414651] dark:bg-[#1a1d24] dark:text-[#D5D7DA]",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function FlagEmoji({ code }: { code?: string | null }) {
  if (!code || code.length !== 2) return null;
  const emoji = code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
  return <span className="text-sm">{emoji}</span>;
}

const secondaryBtn =
  "inline-flex items-center justify-center gap-1 rounded-lg border border-border-secondary bg-bg-primary px-3.5 py-2.5 text-sm font-semibold text-text-primary shadow-sm transition-colors hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60";

interface RowProps {
  competitor: CompetitorDTO;
  onMutated: () => void;
  onRowClick: (id: string) => void;
}

function SortableRow({ competitor, onMutated, onRowClick }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: competitor.trackedId ?? competitor.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const domain = extractDomainFromUrl(competitor.website ?? competitor.domain) ?? competitor.domain;
  const avatar = generateLogoUrl(domain, { format: "png", size: 64 }) ?? undefined;
  const status = (competitor.trackedStatus ?? competitor.status) as TrackedCompetitorStatus;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="group border-b border-border-secondary transition-colors hover:bg-bg-secondary cursor-pointer"
      onClick={() => onRowClick(competitor.id)}
    >
      {/* Drag handle */}
      <td className="w-8 px-3 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab touch-none text-text-tertiary opacity-0 group-hover:opacity-100 active:cursor-grabbing"
          aria-label="Reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>

      {/* Logo + name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full border border-border-primary bg-bg-tertiary p-1">
            {avatar ? (
              <img
                src={avatar}
                alt={`${competitor.name} logo`}
                className="h-8 w-8 rounded-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-tertiary text-xs font-semibold text-text-tertiary">
                {competitor.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <FlagEmoji code={competitor.country_code} />
              <span className="truncate text-sm font-semibold text-text-primary">
                {competitor.nickname ?? competitor.name}
              </span>
            </div>
            {competitor.nickname && (
              <span className="block text-xs text-text-tertiary truncate">{competitor.name}</span>
            )}
            <span className="block text-xs text-text-tertiary truncate">{competitor.domain}</span>
          </div>
        </div>
      </td>

      {/* Products */}
      <td className="px-4 py-3 text-sm text-text-primary">
        {competitor.productCount.toLocaleString()}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[status] ?? STATUS_BADGE.ARCHIVED}`}
        >
          {status.toLowerCase()}
        </span>
      </td>

      {/* Tracked since */}
      <td className="px-4 py-3 text-sm text-text-tertiary">
        {competitor.addedAt ? formatDate(competitor.addedAt) : "—"}
      </td>

      {/* Actions */}
      <td
        className="px-3 py-3 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {competitor.trackedId && (
          <RowActionsMenu
            trackedId={competitor.trackedId}
            competitorName={competitor.name}
            currentStatus={status as "ACTIVE" | "PAUSED" | "ARCHIVED"}
            currentNickname={competitor.nickname}
            onMutated={onMutated}
          />
        )}
      </td>
    </tr>
  );
}

export default function CompetitorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<Tab>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(25);
  const [competitors, setCompetitors] = React.useState<CompetitorDTO[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogKey, setDialogKey] = React.useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function loadCompetitors() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getCompetitors({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        status: TAB_STATUS_MAP[activeTab],
        sortBy: "createdAt",
        sortOrder: "desc",
        tenantCompanyId: CALUMET_COMPANY_ID,
      });
      setCompetitors(response.competitors);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err) {
      setCompetitors([]);
      setError(err instanceof Error ? err.message : "Failed to load competitors");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    loadCompetitors();
  }, [activeTab, currentPage, itemsPerPage, searchQuery]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = competitors.findIndex(
      (c) => (c.trackedId ?? c.id) === active.id
    );
    const newIndex = competitors.findIndex(
      (c) => (c.trackedId ?? c.id) === over.id
    );
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(competitors, oldIndex, newIndex);
    setCompetitors(reordered); // optimistic

    // All rows in the tenant path must have trackedId; if any are missing, revert.
    const ids = reordered.map((c) => c.trackedId);
    if (ids.some((id) => !id)) {
      await loadCompetitors();
      return;
    }
    try {
      await reorderTrackedCompetitors(ids as string[]);
    } catch {
      await loadCompetitors(); // revert on failure
    }
  }

  const sortableIds = competitors.map((c) => c.trackedId ?? c.id);

  return (
    <main className="mx-auto min-h-screen w-full space-y-6 bg-bg-primary px-4 pb-8 pt-6 text-text-primary transition-colors md:space-y-8 md:px-8 md:pb-12 md:pt-8">
      <header className="flex flex-wrap items-start justify-between gap-3 md:gap-4">
        <div className="min-w-[200px] flex-1">
          <h1 className="text-xl font-semibold text-text-primary md:text-2xl">
            Competitor Analysis
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Focus only on the competitors you actively track, compare, and review.
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button className={secondaryBtn} type="button">
            <Settings className="h-5 w-5 text-quaternary" />
            <span className="hidden sm:inline">Customize</span>
          </button>
          <button className={secondaryBtn} type="button">
            <Download className="h-5 w-5 text-quaternary" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            type="button"
            onClick={() => { setDialogOpen(true); setDialogKey((k) => k + 1); }}
            className="inline-flex items-center gap-1 rounded-lg border-2 border-purple-700 bg-bg-brand-solid px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <Plus className="h-5 w-5 text-white/80" />
            <span>Add Competitor</span>
          </button>
        </div>
      </header>

      <section className="rounded-xl border border-border-secondary bg-bg-primary shadow-sm transition-colors">
        {/* Section header */}
        <div className="border-b border-border-secondary p-4 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-text-primary md:text-lg">
              Tracked competitors
            </h2>
            <span className="inline-flex items-center rounded-full border border-border-secondary bg-bg-tertiary px-2 py-0.5 text-xs font-medium text-text-tertiary">
              {total} {total === 1 ? "competitor" : "competitors"}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-tertiary md:text-sm">
            Keep this page focused on matched competitors only.
          </p>
        </div>

        {/* Tabs + search */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-secondary px-4 py-3 md:px-6">
          <div
            className="flex overflow-hidden rounded-lg border border-border-secondary shadow-sm"
            role="tablist"
          >
            {(["all", "active", "paused"] as Tab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 ${
                  activeTab === tab
                    ? "bg-bg-tertiary text-text-primary"
                    : "bg-bg-primary text-text-tertiary hover:bg-bg-secondary"
                } ${tab !== "paused" ? "border-r border-border-secondary" : ""}`}
              >
                {tab === "all" ? "All Competitors" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:w-[260px] sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-quaternary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or domain"
              className="w-full rounded-lg border border-border-secondary bg-bg-primary py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600" />
              <p className="text-text-tertiary">Loading competitors…</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center px-6">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">Failed to load competitors</h3>
              <p className="mb-4 text-text-tertiary">{error}</p>
              <button
                type="button"
                onClick={loadCompetitors}
                className="rounded-lg bg-bg-brand-solid px-4 py-2 text-white hover:bg-brand-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : competitors.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 px-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-text-primary">No competitors tracked yet</h3>
              <p className="mt-1 text-sm text-text-tertiary">
                Add competitors to start monitoring their pricing and products.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setDialogOpen(true); setDialogKey((k) => k + 1); }}
              className="inline-flex items-center gap-1 rounded-lg bg-bg-brand-solid px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Add your first competitor
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-border-secondary bg-bg-secondary">
                        <th className="w-8 px-3 py-3" />
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                          Competitor
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                          Products
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                          Tracked since
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitors.map((competitor) => (
                        <SortableRow
                          key={competitor.trackedId ?? competitor.id}
                          competitor={competitor}
                          onMutated={loadCompetitors}
                          onRowClick={(id) => router.push(`./${id}` as any)}
                        />
                      ))}
                    </tbody>
                  </table>
                </SortableContext>
              </DndContext>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-secondary px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <label htmlFor="page-size" className="text-sm text-text-tertiary">
                  Rows per page:
                </label>
                <select
                  id="page-size"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="rounded-md border border-border-secondary bg-bg-primary px-2 py-1 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm font-medium text-text-tertiary">
                  {total > 0
                    ? `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, total)} of ${total}`
                    : "No results"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className={secondaryBtn}
                >
                  Previous
                </button>
                <span className="text-sm text-text-tertiary">
                  Page {currentPage} of {Math.max(totalPages, 1)}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
                  disabled={currentPage >= totalPages}
                  className={secondaryBtn}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Add Competitor dialog */}
      <AddCompetitorDialog
        key={dialogKey}
        tenantCompanyId={CALUMET_COMPANY_ID}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdded={loadCompetitors}
      />
    </main>
  );
}