"use client";

import { cn } from "@/lib/utils";

interface QueueDepthCardProps {
  label: string;
  value: number | string;
  sub?: string;
  variant?: "default" | "warning" | "error" | "success";
  className?: string;
}

const variantStyles = {
  default: "bg-bg-primary border-border-secondary",
  warning: "bg-warning-50 border-warning-200 dark:bg-warning-950 dark:border-warning-800",
  error: "bg-error-50 border-error-200 dark:bg-error-950 dark:border-error-800",
  success: "bg-success-50 border-success-200 dark:bg-success-950 dark:border-success-800",
};

const valueStyles = {
  default: "text-text-primary",
  warning: "text-warning-700 dark:text-warning-300",
  error: "text-error-700 dark:text-error-300",
  success: "text-success-700 dark:text-success-300",
};

export function QueueDepthCard({
  label,
  value,
  sub,
  variant = "default",
  className,
}: QueueDepthCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border p-4",
        variantStyles[variant],
        className,
      )}
    >
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <span className={cn("text-3xl font-bold tabular-nums", valueStyles[variant])}>
        {value}
      </span>
      {sub && <span className="text-xs text-text-tertiary">{sub}</span>}
    </div>
  );
}
