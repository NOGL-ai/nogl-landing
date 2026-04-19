import React from "react";
import { cn } from "@/lib/utils";
import type { RepricingProposalDTO } from "@/lib/repricing/types";

const STYLES: Record<
  RepricingProposalDTO["status"],
  { label: string; className: string }
> = {
  WILL_APPLY:  { label: "Will apply",  className: "bg-success-secondary text-success-primary" },
  BLOCKED:     { label: "Blocked",     className: "bg-warning-secondary text-warning-primary" },
  NO_CHANGE:   { label: "No change",   className: "bg-bg-secondary text-text-tertiary" },
  APPLIED:     { label: "Applied",     className: "bg-brand-secondary text-brand-secondary" },
  REJECTED:    { label: "Rejected",    className: "bg-error-secondary text-error-primary" },
  ROLLED_BACK: { label: "Rolled back", className: "bg-bg-secondary text-text-secondary" },
};

interface Props {
  status: RepricingProposalDTO["status"];
  blockedReason?: string | null;
  className?: string;
}

export function ProposalStatusBadge({ status, blockedReason, className }: Props) {
  const { label, className: styleClass } = STYLES[status] ?? STYLES.NO_CHANGE;

  const badge = (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        styleClass,
        className
      )}
    >
      {label}
    </span>
  );

  if (blockedReason) {
    return (
      <span title={blockedReason} className="cursor-help">
        {badge}
      </span>
    );
  }

  return badge;
}
