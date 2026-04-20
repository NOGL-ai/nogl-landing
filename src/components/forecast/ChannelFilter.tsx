"use client";

import type { ForecastChannelConfig } from "@/types/forecast";

interface ChannelFilterProps {
  channels: ForecastChannelConfig[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function ChannelFilter({ channels, selected, onChange }: ChannelFilterProps) {
  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((s) => s !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {channels.map((ch) => (
        <label key={ch.name} className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={selected.includes(ch.name)}
            onChange={() => toggle(ch.name)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: ch.colorFg }}
          />
          <span className="text-sm text-foreground">{ch.label}</span>
        </label>
      ))}
    </div>
  );
}
