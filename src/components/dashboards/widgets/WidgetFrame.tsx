"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Pencil,
  Trash2Icon,
  Copy,
  GripVertical,
  MoreHorizontalIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DashboardWidgetRow } from "@/lib/dashboards/widgetSchemas";

interface WidgetFrameProps {
  widget: DashboardWidgetRow;
  arrangeMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClone: () => void;
  children: ReactNode;
}

export function WidgetFrame({
  widget,
  arrangeMode,
  onEdit,
  onDelete,
  onClone,
  children,
}: WidgetFrameProps) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* ── Widget header ─────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
        {/* Drag handle (only active in arrange mode) */}
        <div className="flex min-w-0 items-center gap-2">
          {arrangeMode && (
            <GripVertical className="drag-handle h-4 w-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
          )}
          <h3 className="truncate text-sm font-medium leading-tight">
            {widget.title}
          </h3>
        </div>

        {/* Toolbar — visible on hover (or always in arrange mode) */}
        <div
          className={cn(
            "flex shrink-0 items-center gap-0.5 transition-opacity",
            arrangeMode
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onEdit}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Edit</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onClone}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Duplicate</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <MoreHorizontalIcon className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit widget
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onClone}>
                <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2Icon className="mr-2 h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Widget body ───────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-auto p-3">
        <ErrorBoundary widgetId={widget.id}>
          {children}
        </ErrorBoundary>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simple error boundary
// ---------------------------------------------------------------------------

class ErrorBoundary extends Component<
  { children: ReactNode; widgetId: string },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[WidgetFrame] Widget ${this.props.widgetId} threw:`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-medium text-destructive">Widget failed</p>
          <p className="text-xs text-muted-foreground">
            {(this.state.error as Error).message}
          </p>
          <button
            className="text-xs text-primary underline"
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
