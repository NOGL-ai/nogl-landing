"use client";
import { ChevronDown, Download01 as Download } from '@untitledui/icons';





import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ExportMenuProps = {
  onExportCsv: () => void;
  disabled?: boolean;
};

export function ExportMenu({ onExportCsv, disabled }: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-full border border-border-primary bg-bg-primary px-3 py-1.5 text-xs font-medium text-text-tertiary transition-colors hover:bg-bg-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          Export
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportCsv}>Export CSV</DropdownMenuItem>
        <DropdownMenuItem disabled>
          Export PDF
          <span className="ml-2 text-[10px] text-text-tertiary">Coming soon</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}