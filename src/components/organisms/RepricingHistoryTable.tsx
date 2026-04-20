"use client";

import { ChevronDown, ChevronRight, RefreshCcw01 as RotateCcw, Eye } from '@untitledui/icons';

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatDistanceToNow, format } from "date-fns";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/base/buttons/button";
import { RepricingPreviewTable } from "./RepricingPreviewTable";
import { rollbackJob, getJob } from "@/actions/repricing/execution";
import type { RepricingJobDTO, JobWithProposals } from "@/lib/repricing/types";
import { cn } from "@/lib/utils";

const JOB_STATUS_STYLES: Record<
  RepricingJobDTO["status"],
  { label: string; className: string }
> = {
  SIMULATED:   { label: "Pending review", className: "bg-brand-secondary text-brand-secondary" },
  APPLIED:     { label: "Applied",         className: "bg-success-secondary text-success-primary" },
  ROLLED_BACK: { label: "Rolled back",     className: "bg-bg-secondary text-text-secondary" },
  FAILED:      { label: "Failed",          className: "bg-error-secondary text-error-primary" },
};

interface Props {
  jobs: (RepricingJobDTO & { ruleName: string })[];
}

export function RepricingHistoryTable({ jobs }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<JobWithProposals | null>(null);
  const [loadingExpand, setLoadingExpand] = useState<string | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<RepricingJobDTO | null>(null);

  // ─── Expand row ───────────────────────────────────────────────────────────
  async function toggleExpand(job: RepricingJobDTO) {
    if (expandedJobId === job.id) {
      setExpandedJobId(null);
      setExpandedDetails(null);
      return;
    }
    setLoadingExpand(job.id);
    try {
      const details = await getJob(job.id);
      setExpandedDetails(details);
      setExpandedJobId(job.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load details");
    } finally {
      setLoadingExpand(null);
    }
  }

  // ─── Rollback ─────────────────────────────────────────────────────────────
  function handleRollback() {
    if (!rollbackTarget) return;
    const jobId = rollbackTarget.id;
    setRollbackTarget(null);
    startTransition(async () => {
      try {
        toast.loading("Rolling back…", { id: `rollback-${jobId}` });
        await rollbackJob(jobId);
        toast.success("Prices rolled back", { id: `rollback-${jobId}` });
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Rollback failed", {
          id: `rollback-${jobId}`,
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-border-primary bg-background">
        <table className="min-w-full divide-y divide-border-primary text-sm">
          <thead>
            <tr className="bg-bg-secondary">
              <th className="w-8 px-3 py-2.5" />
              <Th>Executed at</Th>
              <Th>Rule name</Th>
              <Th className="text-right">Repriced</Th>
              <Th className="text-right">Blocked</Th>
              <Th className="text-right">Impact</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary">
            {jobs.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-sm text-text-tertiary"
                >
                  No repricing runs yet.
                </td>
              </tr>
            )}
            {jobs.map((job) => (
              <React.Fragment key={job.id}>
                <tr className="hover:bg-bg-secondary/60">
                  {/* Expand toggle */}
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => toggleExpand(job)}
                      disabled={loadingExpand === job.id}
                      className="text-text-tertiary hover:text-text-primary disabled:opacity-50"
                      aria-label={expandedJobId === job.id ? "Collapse" : "View details"}
                    >
                      {loadingExpand === job.id ? (
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : expandedJobId === job.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </td>

                  {/* Executed at */}
                  <Td>
                    <div>
                      <p className="font-medium text-text-primary">
                        {formatDistanceToNow(new Date(job.startedAt), { addSuffix: true })}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {format(new Date(job.startedAt), "MMM d, yyyy HH:mm")}
                      </p>
                    </div>
                  </Td>

                  {/* Rule name */}
                  <Td className="font-medium text-text-primary">{job.ruleName}</Td>

                  {/* Repriced */}
                  <Td className="text-right text-text-primary">{job.productsChanged}</Td>

                  {/* Blocked */}
                  <Td className={cn("text-right", job.productsBlocked > 0 ? "text-warning-primary" : "text-text-tertiary")}>
                    {job.productsBlocked}
                  </Td>

                  {/* Impact */}
                  <Td className="text-right font-mono text-text-primary">
                    {job.totalImpact != null ? `€${job.totalImpact.toFixed(2)}` : "—"}
                  </Td>

                  {/* Status */}
                  <Td>
                    <StatusBadge status={job.status} />
                  </Td>

                  {/* Actions */}
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleExpand(job)}
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-text-secondary hover:bg-bg-secondary"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </button>
                      {job.status === "APPLIED" && !job.rollbackOfId && (
                        <button
                          onClick={() => setRollbackTarget(job)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-error-primary hover:bg-error-secondary disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Rollback
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>

                {/* Expanded detail row */}
                {expandedJobId === job.id && expandedDetails && (
                  <tr>
                    <td
                      colSpan={8}
                      className="border-t border-border-primary bg-bg-secondary px-4 py-4"
                    >
                      <div className="rounded-lg border border-border-primary bg-background p-4">
                        <p className="mb-3 text-sm font-semibold text-text-primary">
                          Proposals for this run
                        </p>
                        <RepricingPreviewTable
                          job={{ ...expandedDetails, ruleName: job.ruleName }}
                          proposals={expandedDetails.proposals}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Rollback confirm ──────────────────────────────────────────── */}
      <AlertDialog
        open={rollbackTarget !== null}
        onOpenChange={(open: boolean) => !open && setRollbackTarget(null)}
      >
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-text-primary">
              Rollback this run?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              This will revert{" "}
              <strong className="text-text-primary">
                {rollbackTarget?.productsChanged} products
              </strong>{" "}
              to their pre-run prices. A new audit entry will be created. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-border-primary bg-background text-text-secondary">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRollback}
              className="bg-error-solid text-white hover:bg-error-solid_hover"
            >
              Rollback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RepricingJobDTO["status"] }) {
  const { label, className } = JOB_STATUS_STYLES[status] ?? JOB_STATUS_STYLES.SIMULATED;
  return (
    <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium", className)}>
      {label}
    </span>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary ${className ?? ""}`}>
      {children}
    </th>
  );
}

function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2.5 text-sm ${className ?? ""}`}>{children}</td>;
}