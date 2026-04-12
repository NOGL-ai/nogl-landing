import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { FEATURES } from "@/lib/featureFlags";
import { prisma } from "@/lib/prismaDb";
import { withSecurityHeaders } from "@/middlewares/security";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!FEATURES.COMPETITOR_API) {
    return NextResponse.json(
      { error: "Competitor API is disabled" },
      { status: 503 }
    );
  }

  try {
    const competitor = await prisma.competitor.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        priceComparisons: {
          where: { deletedAt: null },
          orderBy: { priceDate: "desc" },
          take: 10,
        },
        _count: {
          select: { priceComparisons: true },
        },
      },
    });

    if (!competitor) {
      return NextResponse.json(
        { error: "Competitor not found" },
        { status: 404 }
      );
    }

    const response = withSecurityHeaders(NextResponse.json(competitor));
    response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
    return response;
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!FEATURES.COMPETITOR_API || !FEATURES.COMPETITOR_WRITE) {
    return NextResponse.json(
      { error: "Competitor updates are disabled" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    const existing = await prisma.competitor.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Competitor not found" },
        { status: 404 }
      );
    }

    if (body.domain && body.domain !== existing.domain) {
      const domainConflict = await prisma.competitor.findUnique({
        where: { domain: body.domain },
      });

      if (domainConflict && !domainConflict.deletedAt && domainConflict.id !== id) {
        return NextResponse.json(
          { error: "Domain already exists" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.competitor.update({
      where: { id },
      data: {
        name: body.name,
        domain: body.domain,
        website: body.website,
        description: body.description,
        productCount: body.productCount,
        marketPosition: body.marketPosition,
        status: body.status,
        categories: body.categories,
        lastScrapedAt: body.lastScrapedAt,
      },
      include: {
        _count: {
          select: { priceComparisons: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating competitor:", error);
    return NextResponse.json(
      { error: "Failed to update competitor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.competitor.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { isMonitoring?: boolean; status?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.isMonitoring === "boolean") {
    data.isMonitoring = body.isMonitoring;
  }
  if (typeof body.status === "string") {
    data.status = body.status;
  }

  if (Object.keys(data).length === 0) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    const updated = await prisma.competitor.update({
      where: { id },
      data,
    });
    return Response.json(updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
