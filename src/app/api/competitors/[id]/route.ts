import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withRequestLogging, withSecurityHeaders } from "@/middlewares/security";
import { withRateLimit } from "@/middlewares/rateLimit";
import { FEATURES } from "@/lib/featureFlags";

// GET /api/competitors/[id] - Get single competitor
export const GET = withRequestLogging(
  withRateLimit(100, 15 * 60 * 1000)(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      if (!FEATURES.COMPETITOR_API) {
        return NextResponse.json(
          { error: "Competitor API is disabled" },
          { status: 503 }
        );
      }

      try {
        const competitor = await prisma.competitor.findFirst({
          where: {
            id: params.id,
            deletedAt: null,
          },
          include: {
            priceComparisons: {
              where: { deletedAt: null },
              orderBy: { priceDate: 'desc' },
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
        response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
        return response;
      } catch (error) {
        console.error('Database query error:', error);
        return NextResponse.json(
          { error: "Failed to fetch competitor" },
          { status: 500 }
        );
      }
    }
  )
);

// PUT /api/competitors/[id] - Update competitor
export const PUT = withRequestLogging(
  withRateLimit(20, 15 * 60 * 1000)(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      if (!FEATURES.COMPETITOR_API || !FEATURES.COMPETITOR_WRITE) {
        return NextResponse.json(
          { error: "Competitor updates are disabled" },
          { status: 503 }
        );
      }

      try {
        const body = await request.json();
        
        // Check if competitor exists
        const existing = await prisma.competitor.findFirst({
          where: { id: params.id, deletedAt: null },
        });

        if (!existing) {
          return NextResponse.json(
            { error: "Competitor not found" },
            { status: 404 }
          );
        }

        // Check for domain conflicts (if domain is being changed)
        if (body.domain && body.domain !== existing.domain) {
          const domainConflict = await prisma.competitor.findUnique({
            where: { domain: body.domain },
          });

          if (domainConflict && !domainConflict.deletedAt && domainConflict.id !== params.id) {
            return NextResponse.json(
              { error: "Domain already exists" },
              { status: 409 }
            );
          }
        }

        // Update competitor
        const updated = await prisma.competitor.update({
          where: { id: params.id },
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
        console.error('Error updating competitor:', error);
        return NextResponse.json(
          { error: "Failed to update competitor" },
          { status: 500 }
        );
      }
    }
  )
);

// DELETE /api/competitors/[id] - Soft delete competitor
export const DELETE = withRequestLogging(
  withRateLimit(10, 15 * 60 * 1000)(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      if (!FEATURES.COMPETITOR_API || !FEATURES.COMPETITOR_WRITE) {
        return NextResponse.json(
          { error: "Competitor deletion is disabled" },
          { status: 503 }
        );
      }

      try {
        // Check if competitor exists
        const existing = await prisma.competitor.findFirst({
          where: { id: params.id, deletedAt: null },
        });

        if (!existing) {
          return NextResponse.json(
            { error: "Competitor not found" },
            { status: 404 }
          );
        }

        // Soft delete competitor
        await prisma.competitor.update({
          where: { id: params.id },
          data: {
            deletedAt: new Date(),
          },
        });

        // Also soft delete related price comparisons
        await prisma.competitorPriceComparison.updateMany({
          where: { competitorId: params.id },
          data: {
            deletedAt: new Date(),
          },
        });

        return NextResponse.json({ message: "Competitor deleted successfully" });
      } catch (error) {
        console.error('Error deleting competitor:', error);
        return NextResponse.json(
          { error: "Failed to delete competitor" },
          { status: 500 }
        );
      }
    }
  )
);
