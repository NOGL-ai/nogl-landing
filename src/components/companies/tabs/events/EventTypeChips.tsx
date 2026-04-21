"use client";

import { KNOWN_EVENT_TYPES } from "@/types/company";
import { eventTypeMeta } from "@/lib/events/format";

type EventTypeChipsProps = {
  selected: string[];
  onChange: (next: string[]) => void;
};

export function EventTypeChips({ selected, onChange }: EventTypeChipsProps) {
  const allActive = selected.length === 0;

  const toggle = (type: string) => {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange([])}
        aria-pressed={allActive}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          allActive
            ? "border-border-brand bg-brand-50 text-text-brand"
            : "border-border-primary bg-bg-primary text-text-tertiary hover:bg-bg-secondary hover:text-text-primary"
        }`}
      >
        All
      </button>
      {KNOWN_EVENT_TYPES.map((type) => {
        const active = selected.includes(type);
        const meta = eventTypeMeta(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "border-border-brand bg-brand-50 text-text-brand"
                : "border-border-primary bg-bg-primary text-text-tertiary hover:bg-bg-secondary hover:text-text-primary"
            }`}
          >
            <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
