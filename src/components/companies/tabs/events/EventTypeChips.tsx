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
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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
