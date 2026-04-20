"use server";

import { prisma } from "@/lib/prismaDb";
import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import {
  WidgetConfigSchema,
  type RGLLayout,
  type WidgetConfig,
  type GlobalFilters,
  type WidgetQueryResult,
} from "@/lib/dashboards/widgetSchemas";
import { resolveWidget } from "@/lib/dashboards/queryBuilder";

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

async function assertAuth() {
  const session = await getAuthSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

// ---------------------------------------------------------------------------
// Dashboard CRUD
// ---------------------------------------------------------------------------

export async function listDashboards() {
  const user = await assertAuth();

  const dashboards = await prisma.dashboard.findMany({
    where: {
      OR: [{ ownerId: user.id }, { isShared: true }],
    },
    include: {
      _count: { select: { widgets: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return dashboards.map((d: (typeof dashboards)[number]) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    isShared: d.isShared,
    persona: d.persona,
    widgetCount: d._count.widgets,
    ownerId: d.ownerId,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));
}

export async function createDashboard(
  name: string,
  persona: "CFO" | "CMO" | "OPS" | "GENERIC" = "GENERIC"
) {
  const user = await assertAuth();

  const dashboard = await prisma.dashboard.create({
    data: {
      name,
      persona,
      tenantId: user.id, // scoped per user until real multi-tenancy lands
      ownerId: user.id,
      globalFilters: {},
    },
  });

  revalidatePath("/en/analytics/dashboards");
  return { id: dashboard.id };
}

export async function getDashboard(id: string) {
  const user = await assertAuth();

  const dashboard = await prisma.dashboard.findFirst({
    where: {
      id,
      OR: [{ ownerId: user.id }, { isShared: true }],
    },
    include: { widgets: { orderBy: { createdAt: "asc" } } },
  });

  if (!dashboard) throw new Error("Dashboard not found");

  return {
    ...dashboard,
    createdAt: dashboard.createdAt.toISOString(),
    updatedAt: dashboard.updatedAt.toISOString(),
    globalFilters: dashboard.globalFilters as GlobalFilters,
    widgets: dashboard.widgets.map((w: (typeof dashboard.widgets)[number]) => ({
      ...w,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
      layout: w.layout as RGLLayout,
      config: w.config as WidgetConfig,
    })),
  };
}

export async function updateDashboardMeta(
  id: string,
  patch: {
    name?: string;
    description?: string;
    isShared?: boolean;
    persona?: "CFO" | "CMO" | "OPS" | "GENERIC";
    globalFilters?: GlobalFilters;
  }
) {
  const user = await assertAuth();

  await prisma.dashboard.updateMany({
    where: { id, ownerId: user.id },
    data: {
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.isShared !== undefined && { isShared: patch.isShared }),
      ...(patch.persona !== undefined && { persona: patch.persona }),
      ...(patch.globalFilters !== undefined && {
        globalFilters: patch.globalFilters as never,
      }),
    },
  });

  revalidatePath(`/en/analytics/dashboards/${id}`);
}

export async function deleteDashboard(id: string) {
  const user = await assertAuth();

  await prisma.dashboard.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath("/en/analytics/dashboards");
}

// ---------------------------------------------------------------------------
// Layout auto-save (debounced on the client, called via server action)
// ---------------------------------------------------------------------------

export async function updateDashboardLayout(
  dashboardId: string,
  layouts: RGLLayout[]
) {
  await assertAuth();

  // Bulk update each widget's layout position
  await Promise.all(
    layouts.map((l) =>
      prisma.dashboardWidget.updateMany({
        where: { id: l.i, dashboardId },
        data: { layout: l as never },
      })
    )
  );
}

// ---------------------------------------------------------------------------
// Widget CRUD
// ---------------------------------------------------------------------------

export async function createWidget(
  dashboardId: string,
  title: string,
  config: unknown,
  layout: RGLLayout
) {
  await assertAuth();

  const parsed = WidgetConfigSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(`Invalid widget config: ${parsed.error.message}`);
  }

  const widget = await prisma.dashboardWidget.create({
    data: {
      dashboardId,
      title,
      type: parsed.data.type,
      config: parsed.data as never,
      layout: layout as never,
    },
  });

  revalidatePath(`/en/analytics/dashboards/${dashboardId}`);

  return {
    ...widget,
    createdAt: widget.createdAt.toISOString(),
    updatedAt: widget.updatedAt.toISOString(),
    layout: widget.layout as RGLLayout,
    config: widget.config as WidgetConfig,
  };
}

export async function updateWidget(
  widgetId: string,
  patch: { title?: string; config?: unknown; layout?: RGLLayout }
) {
  await assertAuth();

  const data: Record<string, unknown> = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.layout !== undefined) data.layout = patch.layout;
  if (patch.config !== undefined) {
    const parsed = WidgetConfigSchema.safeParse(patch.config);
    if (!parsed.success)
      throw new Error(`Invalid widget config: ${parsed.error.message}`);
    data.config = parsed.data;
    data.type = parsed.data.type;
  }

  const widget = await prisma.dashboardWidget.update({
    where: { id: widgetId },
    data: data as never,
  });

  revalidatePath(`/en/analytics/dashboards/${widget.dashboardId}`);
  return widget;
}

export async function deleteWidget(widgetId: string) {
  await assertAuth();

  const widget = await prisma.dashboardWidget.delete({
    where: { id: widgetId },
  });

  revalidatePath(`/en/analytics/dashboards/${widget.dashboardId}`);
}

export async function cloneWidget(widgetId: string) {
  await assertAuth();

  const original = await prisma.dashboardWidget.findUniqueOrThrow({
    where: { id: widgetId },
  });

  const originalLayout = original.layout as RGLLayout;
  const newLayout: RGLLayout = {
    ...originalLayout,
    i: `placeholder`, // will be replaced after create
    y: originalLayout.y + (originalLayout.h ?? 4),
  };

  const clone = await prisma.dashboardWidget.create({
    data: {
      dashboardId: original.dashboardId,
      title: `${original.title} (copy)`,
      type: original.type,
      config: original.config,
      layout: { ...newLayout } as never,
    },
  });

  // Update the layout i to use the real id
  await prisma.dashboardWidget.update({
    where: { id: clone.id },
    data: { layout: { ...newLayout, i: clone.id } as never },
  });

  revalidatePath(`/en/analytics/dashboards/${original.dashboardId}`);
  return clone.id;
}

// ---------------------------------------------------------------------------
// Widget data query
// ---------------------------------------------------------------------------

export async function runWidgetQuery(
  widgetId: string,
  globalFilters: GlobalFilters
): Promise<WidgetQueryResult> {
  await assertAuth();

  const widget = await prisma.dashboardWidget.findUniqueOrThrow({
    where: { id: widgetId },
  });

  const config = WidgetConfigSchema.parse(widget.config);
  return resolveWidget(config, globalFilters);
}
