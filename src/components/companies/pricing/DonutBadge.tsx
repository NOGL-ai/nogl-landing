"use client";

/**
 * DonutBadge — lightweight CSS conic-gradient donut for table cells.
 * Replaces per-row inline SVG donuts; no layout recalculation cost.
 */

interface DonutBadgeProps {
  /** 0–100 percentage to fill */
  pct: number;
}

export function DonutBadge({ pct }: DonutBadgeProps) {
  const clamped = Math.min(Math.max(Math.round(pct), 0), 100);
  const filled = `var(--color-brand-600)`;
  const track = `var(--color-bg-tertiary)`;

  return (
    <div className="inline-flex items-center justify-center">
      <div
        className="relative flex h-9 w-9 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${filled} ${clamped}%, ${track} ${clamped}%)`,
        }}
      >
        {/* Inner circle to create donut hole */}
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-primary">
          <span className="text-[9px] font-semibold leading-none text-text-primary">
            {clamped}%
          </span>
        </div>
      </div>
    </div>
  );
}
