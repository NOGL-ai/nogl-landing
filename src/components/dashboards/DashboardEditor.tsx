"use client";
import { Plus as PlusIcon, Loading01 as LoaderCircleIcon, Pencil01 as Pencil, Trash01 as Trash2, ChevronRight as ChevronRightIcon, Settings02 as Settings2Icon, Lock01 as LockIcon, LockUnlocked01 as UnlockIcon, Share01 as Share2Icon, DotsHorizontal as MoreHorizontalIcon, CheckCircle as CheckCircle2Icon, HelpCircle as HelpCircleIcon, Copy01 as Copy } from '@untitledui/icons';


import { Plus as PlusIcon, Loading01 as LoaderCircleIcon, Pencil01 as Pencil, Trash01 as Trash2, ChevronRight as ChevronRightIcon, Settings02 as Settings2Icon, Lock01 as LockIcon, LockUnlocked01 as UnlockIcon, Share01 as Share2Icon, DotsHorizontal as MoreHorizontalIcon, CheckCircle as CheckCircle2Icon, HelpCircle as HelpCircleIcon, Copy01 as Copy } from '@untitledui/icons';


import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
// Lazy-load react-grid-layout (uses window, must be client-only)
import type { Layout as RGLLayoutItem, ResponsiveProps } from "react-grid-layout";
import {
  updateDashboardLayout,
  deleteWidget,
  cloneWidget,
  updateDashboardMeta,
} from "@/actions/dashboards";
import type {
  DashboardWidgetRow,
  GlobalFilters,
  RGLLayout,
} from "@/lib/dashboards/widgetSchemas";
import { WidgetFrame } from "./widgets/WidgetFrame";
import { WidgetRenderer } from "./widgets/WidgetRenderer";
import { WidgetEditorModal } from "./WidgetEditorModal";
import { GlobalFilterBar } from "./GlobalFilterBar";
import { Button } from '@/components/base/buttons/button';
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Locale } from "@/i18n";

// react-grid-layout must be loaded client-side only (uses document).
// We wrap it in a thin module shim so next/dynamic gets a default export.
const ResponsiveGridLayout = dynamic(
  async () => {
    const { WidthProvider, Responsive } = await import("react-grid-layout");
    const Wrapped = WidthProvider(Responsive);
    // next/dynamic expects { default: Component }
    const Shim = (props: ResponsiveProps) => <Wrapped {...props} />;
    Shim.displayName = "ResponsiveGridLayout";
    return { default: Shim };
  },
  { ssr: false }
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardData {
  id: string;
  name: string;
  description?: string | null;
  isShared: boolean;
  persona: string;
  globalFilters: GlobalFilters;
  widgets: DashboardWidgetRow[];
}

type SaveState = "saved" | "saving" | "unsaved";

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DashboardEditor({
  dashboard: initial,
  lang,
}: {
  dashboard: DashboardData;
  lang: Locale;
}) {
  const router = useRouter();
  const [dashboard, setDashboard] = useState(initial);
  const [widgets, setWidgets] = useState<DashboardWidgetRow[]>(initial.widgets);
  const [arrangeMode, setArrangeMode] = useState(false);
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>(
    initial.globalFilters ?? {}
  );
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editWidget, setEditWidget] = useState<DashboardWidgetRow | null>(null);

  // Layout state (react-grid-layout)
  const [layouts, setLayouts] = useState<Record<string, RGLLayout[]>>(() => {
    const lg = widgets.map((w) => ({ ...w.layout, i: w.id }));
    return { lg };
  });

  // Debounced auto-save ref
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-save layouts ────────────────────────────────────────────────────

  const scheduleSave = useCallback(
    (newLayouts: Record<string, RGLLayout[]>) => {
      setSaveState("unsaved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        setSaveState("saving");
        try {
          await updateDashboardLayout(dashboard.id, newLayouts.lg ?? []);
          setSaveState("saved");
          setSavedAt(new Date());
        } catch {
          setSaveState("unsaved");
        }
      }, 500);
    },
    [dashboard.id]
  );

  function handleLayoutChange(
    _: RGLLayout[],
    allLayouts: Record<string, RGLLayout[]>
  ) {
    setLayouts(allLayouts);
    scheduleSave(allLayouts);
  }

  // ── Widget actions ───────────────────────────────────────────────────────

  async function handleDeleteWidget(widgetId: string) {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    await deleteWidget(widgetId);
  }

  async function handleCloneWidget(widgetId: string) {
    await cloneWidget(widgetId);
    router.refresh();
  }

  function handleWidgetCreated(widget: DashboardWidgetRow) {
    setWidgets((prev) => [...prev, widget]);
    setLayouts((prev) => ({
      ...prev,
      lg: [...(prev.lg ?? []), { ...widget.layout, i: widget.id }],
    }));
    setAddModalOpen(false);
    setEditWidget(null);
  }

  function handleWidgetUpdated(widget: DashboardWidgetRow) {
    setWidgets((prev) => prev.map((w) => (w.id === widget.id ? widget : w)));
    setEditWidget(null);
  }

  // ── Global filter sync ───────────────────────────────────────────────────

  async function handleFiltersChange(filters: GlobalFilters) {
    setGlobalFilters(filters);
    await updateDashboardMeta(dashboard.id, { globalFilters: filters });
  }

  // ── Arrange mode toggle ──────────────────────────────────────────────────

  function toggleArrangeMode() {
    setArrangeMode((v) => !v);
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-0 flex-1 flex-col">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 flex flex-col gap-0 border-b bg-background/95 backdrop-blur">
          {/* Top row */}
          <div className="flex items-center justify-between gap-3 px-5 py-2.5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
              <Link
                href={`/${lang}/analytics/dashboards`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboards
              </Link>
              <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{dashboard.name}</span>
              {dashboard.isShared && (
                <Badge color="secondary" className="ml-1 text-xs">
                  Shared
                </Badge>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-1 text-muted-foreground hover:text-foreground">
                    <HelpCircleIcon className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-xs">
                  Build custom charts from your scraped data. Toggle{" "}
                  <strong>Arrange mode</strong> to drag and resize widgets.
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Auto-save indicator */}
              <AutoSaveIndicator state={saveState} savedAt={savedAt} />

              {/* Arrange mode toggle — matches Particl's lock/unlock pattern */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    color={arrangeMode ? "primary" : "secondary"}
                    size="sm"
                    className="gap-1.5"
                    onClick={toggleArrangeMode}
                  >
                    {arrangeMode ? (
                      <UnlockIcon className="h-3.5 w-3.5" />
                    ) : (
                      <LockIcon className="h-3.5 w-3.5" />
                    )}
                    <span className="hidden sm:inline">
                      {arrangeMode ? "In arrange mode" : "Arrange"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {arrangeMode
                    ? "Click to lock layout"
                    : "Click to drag & resize widgets"}
                </TooltipContent>
              </Tooltip>

              {/* + Add Chart */}
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setAddModalOpen(true)}
              >
                <PlusIcon className="h-4 w-4" />
                Add Chart
              </Button>

              {/* Settings / share / more */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button color="secondary" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      handleFiltersChange({
                        ...globalFilters,
                      })
                    }
                  >
                    <Settings2Icon className="mr-2 h-4 w-4" />
                    Dashboard settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      updateDashboardMeta(dashboard.id, {
                        isShared: !dashboard.isShared,
                      })
                    }
                  >
                    <Share2Icon className="mr-2 h-4 w-4" />
                    {dashboard.isShared ? "Make private" : "Share with team"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-3 border-t px-5 py-2 text-sm">
            <span className="text-xs font-medium text-muted-foreground">
              Dashboard Filter Controls
            </span>
            <GlobalFilterBar
              filters={globalFilters}
              onChange={handleFiltersChange}
            />
          </div>
        </header>

        {/* ── Canvas ─────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-auto p-4">
          {widgets.length === 0 ? (
            <EmptyCanvas onAdd={() => setAddModalOpen(true)} />
          ) : (
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={60}
              isDraggable={arrangeMode}
              isResizable={arrangeMode}
              onLayoutChange={handleLayoutChange}
              draggableHandle=".drag-handle"
              margin={[12, 12]}
              containerPadding={[0, 0]}
            >
              {widgets.map((widget) => (
                <div key={widget.id} className="min-h-0">
                  <WidgetFrame
                    widget={widget}
                    arrangeMode={arrangeMode}
                    onEdit={() => setEditWidget(widget)}
                    onDelete={() => handleDeleteWidget(widget.id)}
                    onClone={() => handleCloneWidget(widget.id)}
                  >
                    <WidgetRenderer
                      widget={widget}
                      globalFilters={globalFilters}
                    />
                  </WidgetFrame>
                </div>
              ))}
            </ResponsiveGridLayout>
          )}

          {/* "+ Add Another Chart" footer link — matches Particl screenshot */}
          {widgets.length > 0 && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <PlusIcon className="h-4 w-4" />
              Add Another Chart
            </button>
          )}
        </main>

        {/* ── Modals ─────────────────────────────────────────────────────── */}
        <WidgetEditorModal
          open={addModalOpen || editWidget !== null}
          dashboardId={dashboard.id}
          existingWidget={editWidget ?? undefined}
          onCreated={handleWidgetCreated}
          onUpdated={handleWidgetUpdated}
          onClose={() => {
            setAddModalOpen(false);
            setEditWidget(null);
          }}
        />
      </div>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Auto-save indicator
// ---------------------------------------------------------------------------

function AutoSaveIndicator({
  state,
  savedAt,
}: {
  state: SaveState;
  savedAt: Date | null;
}) {
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <LoaderCircleIcon className="h-3 w-3 animate-spin" />
        Saving…
      </span>
    );
  }
  if (state === "saved" && savedAt) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <CheckCircle2Icon className="h-3 w-3 text-emerald-500" />
        Auto-saved:{" "}
        {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Empty canvas
// ---------------------------------------------------------------------------

function EmptyCanvas({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-32">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed">
        <PlusIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="font-medium">No widgets yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Click <strong>+ Add Chart</strong> to add your first widget, or use the
          Copilot to generate one from a prompt.
        </p>
      </div>
      <Button onClick={onAdd} className="gap-1.5">
        <PlusIcon className="h-4 w-4" />
        Add Chart
      </Button>
    </div>
  );
}