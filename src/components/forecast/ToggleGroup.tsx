"use client";

interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ToggleGroup({ options, value, onChange, disabled }: ToggleGroupProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
