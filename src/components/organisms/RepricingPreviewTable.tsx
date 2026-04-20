"use client";
import { FilterFunnel01 as Filter, CheckSquare, XSquare, ChevronDown } from '@untitledui/icons';


import { FilterFunnel01 as Filter, CheckSquare, XSquare, ChevronDown } from '@untitledui/icons';


import React, { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/base/buttons/button";
import { DeltaChip } from "@/components/molecules/repricing/DeltaChip";
import { ProposalStatusBadge } from "@/components/molecules/repricing/ProposalStatusBadge";
import { ConfirmApplyDialog } from "@/components/molecules/repricing/ConfirmApplyDialog";
import { applyJob, rejectProposals } from "@/actions/repricing/execution";
import type { RepricingJobDTO, RepricingProposalDTO } from "@/lib/repricing/types";
import type { Route } from 'next';

const ROWS_PER_PAGE = 10;

type StatusFilter = "ALL" | RepricingProposalDTO["status"];

interface Props {
  job: RepricingJobDTO & { ruleName?: string };
  proposals: RepricingProposalDTO[];
}

export function RepricingPreviewTable({ job, proposals }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ─── Selection ────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ─── Filter ───────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // ─── Pagination ───────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // ─── Confirm dialog ───────────────────────────────────────────────────────
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingApplyIds, setPendingApplyIds] = useState<string[] | undefined>(undefined);

  const filtered = useMemo(
    () =>
      statusFilter === "ALL"
        ? proposals
        : proposals.filter((p) => p.status === statusFilter),
    [proposals, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageRows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const willApplyRows = proposals.filter((p) => p.status === "WILL_APPLY");
  const totalImpact = willApplyRows.reduce((sum, p) => {
    if (p.proposedPrice == null) return sum;
    return sum + Math.abs(p.proposedPrice - p.currentPrice);
  }, 0);

  // ─── Bulk selection ───────────────────────────────────────────────────────
  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  function toggleAll() {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        pageRows.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        pageRows.forEach((r) => next.add(r.id));
        return next;
      });
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ─── Apply ────────────────────────────────────────────────────────────────
  function requestApply(proposalIds?: string[]) {
    setPendingApplyIds(proposalIds);
    setShowConfirm(true);
  }

  function handleConfirmApply() {
    setShowConfirm(false);
    startTransition(async () => {
      try {
        await applyJob(job.id, pendingApplyIds);
        toast.success("Prices applied successfully");
        router.push("/repricing/auto-history" as Route);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to apply");
      }
    });
  }

  // ─── Reject ───────────────────────────────────────────────────────────────
  function handleRejectSelected() {
    const ids = [...selected];
    if (!ids.length) return;
    startTransition(async () => {
      try {
        await rejectProposals(job.id, ids);
        setSelected(new Set());
        toast.success(`${ids.length} proposals rejected`);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to reject");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Analyzed" value={job.productsAnalyzed} />
        <StatCard
          label="Will apply"
          value={job.productsChanged}
          className="text-success-primary"
        />
        <StatCard
          label="Blocked"
          value={job.productsBlocked}
          className="text-warning-primary"
        />
        <StatCard
          label="Total impact"
          value={`€${totalImpact.toFixed(2)}`}
        />
      </div>

      {/* ─── Toolbar ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border-primary bg-background px-3 py-2">
        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="appearance-none rounded-md border border-border-primary bg-bg-secondary py-1.5 pl-3 pr-8 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-solid"
          >
            <option value="ALL">All statuses</option>
            <option value="WILL_APPLY">Will apply</option>
            <option value="BLOCKED">Blocked</option>
            <option value="NO_CHANGE">No change</option>
            <option value="APPLIED">Applied</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-text-tertiary" />
        </div>

        {/* Bulk actions — only show when rows are selected */}
        {selected.size > 0 && (
          <>
            <span className="text-sm text-text-secondary">{selected.size} selected</span>
            <Button
              color="primary"
              size="sm"
              className="flex items-center gap-1 bg-success-solid hover:bg-success-solid_hover"
              onClick={() => requestApply([...selected])}
              isDisabled={isPending}
            >
              <CheckSquare className="h-4 w-4" />
              Apply selected
            </Button>
            <Button
              color="secondary"
              size="sm"
              className="flex items-center gap-1 border border-border-primary bg-background text-error-primary hover:bg-error-secondary"
              onClick={handleRejectSelected}
              isDisabled={isPending}
            >
              <XSquare className="h-4 w-4" />
              Reject selected
            </Button>
          </>
        )}

        {/* Apply all CTA */}
        <div className="ml-auto">
          <Button
            color="primary"
            size="sm"
            className="bg-success-solid hover:bg-success-solid_hover"
            onClick={() => requestApply(undefined)}
            isDisabled={isPending || willApplyRows.length === 0}
          >
            Apply all ({willApplyRows.length})
          </Button>
        </div>
      </div>

      {/* ─── Table ──────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-border-primary bg-background">
        <table className="min-w-full divide-y divide-border-primary text-sm">
          <thead>
            <tr className="bg-bg-secondary">
              <Th className="w-10">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-border-primary text-brand-solid focus:ring-brand-solid"
                  aria-label="Select all on this page"
                />
              </Th>
              <Th>Product</Th>
              <Th>Triggered rule</Th>
              <Th className="text-right">Price</Th>
              <Th className="text-right">Cost</Th>
              <Th className="text-right">Markup</Th>
              <Th className="text-right">New price</Th>
              <Th>Min / Max</Th>
              <Th>Competitor prices</Th>
              <Th>Status</Th>
              <Th>Executed</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary">
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={12}
                  className="py-10 text-center text-sm text-text-tertiary"
                >
                  No proposals match the current filter.
                </td>
              </tr>
            )}
            {pageRows.map((proposal) => (
              <ProposalRow
                key={proposal.id}
                proposal={proposal}
                jobName={job.ruleName}
                executedAt={job.finishedAt ?? job.startedAt}
                selected={selected.has(proposal.id)}
                onToggleSelect={() => toggleRow(proposal.id)}
                onApprove={() => requestApply([proposal.id])}
                onReject={() => {
                  startTransition(async () => {
                    try {
                      await rejectProposals(job.id, [proposal.id]);
                      toast.success("Proposal rejected");
                      router.refresh();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Failed");
                    }
                  });
                }}
                isPending={isPending}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Pagination ─────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            Showing {(page - 1) * ROWS_PER_PAGE + 1}–
            {Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1">
            <PageBtn
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              label="Previous"
            />
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
              (p) => (
                <PageBtn
                  key={p}
                  label={String(p)}
                  onClick={() => setPage(p)}
                  active={p === page}
                />
              )
            )}
            <PageBtn
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              label="Next"
            />
          </div>
        </div>
      )}

      {/* ─── Confirm dialog ─────────────────────────────────────────────── */}
      <ConfirmApplyDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmApply}
        isLoading={isPending}
        willApplyCount={
          pendingApplyIds
            ? pendingApplyIds.length
            : willApplyRows.length
        }
        totalImpact={totalImpact}
      />
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function ProposalRow({
  proposal,
  jobName,
  executedAt,
  selected,
  onToggleSelect,
  onApprove,
  onReject,
  isPending,
}: {
  proposal: RepricingProposalDTO;
  jobName?: string;
  executedAt: Date | string | null | undefined;
  selected: boolean;
  onToggleSelect: () => void;
  onApprove: () => void;
  onReject: () => void;
  isPending: boolean;
}) {
  const markup =
    proposal.costAtRun != null
      ? proposal.currentPrice - proposal.costAtRun
      : null;

  return (
    <tr
      className={
        selected ? "bg-brand-secondary/20" : "hover:bg-bg-secondary/60"
      }
    >
      {/* Checkbox */}
      <Td>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="h-4 w-4 rounded border-border-primary text-brand-solid focus:ring-brand-solid"
        />
      </Td>

      {/* Product */}
      <Td>
        <div>
          <p className="font-medium text-text-primary">{proposal.productSku}</p>
          {proposal.productName && (
            <p className="text-xs text-text-secondary line-clamp-1">
              {proposal.productName}
            </p>
          )}
        </div>
      </Td>

      {/* Triggered rule */}
      <Td className="text-text-secondary">{jobName ?? "—"}</Td>

      {/* Price */}
      <Td className="text-right font-mono text-text-primary">
        €{proposal.currentPrice.toFixed(2)}
      </Td>

      {/* Cost */}
      <Td className="text-right font-mono text-text-tertiary">
        {proposal.costAtRun != null ? `€${proposal.costAtRun.toFixed(2)}` : "—"}
      </Td>

      {/* Markup */}
      <Td className="text-right font-mono text-text-tertiary">
        {markup != null ? `€${markup.toFixed(2)}` : "—"}
      </Td>

      {/* New price + delta */}
      <Td className="text-right">
        {proposal.proposedPrice != null ? (
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono font-medium text-text-primary">
              €{proposal.proposedPrice.toFixed(2)}
            </span>
            <DeltaChip
              currentPrice={proposal.currentPrice}
              proposedPrice={proposal.proposedPrice}
            />
          </div>
        ) : (
          <span className="text-text-tertiary">—</span>
        )}
      </Td>

      {/* Min / Max */}
      <Td>
        <div className="flex flex-col gap-0.5 text-xs text-text-tertiary">
          <span>{proposal.minGuardrail != null ? `Min: €${proposal.minGuardrail.toFixed(2)}` : "Min: —"}</span>
          <span>{proposal.maxGuardrail != null ? `Max: €${proposal.maxGuardrail.toFixed(2)}` : "Max: —"}</span>
        </div>
      </Td>

      {/* Competitor prices */}
      <Td>
        <div className="flex flex-col gap-0.5 text-xs">
          <CompetitorPricePill label="Cheapest" value={proposal.cheapestCompetitorPrice} />
          <CompetitorPricePill label="Avg" value={proposal.avgCompetitorPrice} />
          <CompetitorPricePill label="Highest" value={proposal.highestCompetitorPrice} />
        </div>
      </Td>

      {/* Status */}
      <Td>
        <ProposalStatusBadge
          status={proposal.status}
          blockedReason={proposal.blockedReason}
        />
      </Td>

      {/* Executed at */}
      <Td className="whitespace-nowrap text-xs text-text-tertiary">
        {executedAt
          ? formatDistanceToNow(new Date(executedAt), { addSuffix: true })
          : "—"}
      </Td>

      {/* Row actions */}
      <Td>
        <div className="flex gap-1.5">
          {(proposal.status === "WILL_APPLY") && (
            <>
              <button
                className="rounded px-2 py-0.5 text-xs font-medium text-success-primary hover:bg-success-secondary disabled:opacity-50"
                onClick={onApprove}
                disabled={isPending}
              >
                Approve
              </button>
              <button
                className="rounded px-2 py-0.5 text-xs font-medium text-error-primary hover:bg-error-secondary disabled:opacity-50"
                onClick={onReject}
                disabled={isPending}
              >
                Reject
              </button>
            </>
          )}
        </div>
      </Td>
    </tr>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <div className="rounded-xl border border-border-primary bg-background px-4 py-3">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className={`mt-1 text-xl font-bold text-text-primary ${className ?? ""}`}>
        {value}
      </p>
    </div>
  );
}

function CompetitorPricePill({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  return (
    <span className="text-text-tertiary">
      <span className="font-medium text-text-secondary">{label}:</span>{" "}
      {value != null ? `€${value.toFixed(2)}` : "—"}
    </span>
  );
}

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-3 py-2.5 text-sm ${className ?? ""}`}>{children}</td>
  );
}

function PageBtn({
  label,
  onClick,
  disabled,
  active,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-brand-solid text-white"
          : disabled
          ? "cursor-not-allowed text-text-tertiary opacity-50"
          : "border border-border-primary bg-background text-text-secondary hover:bg-bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}