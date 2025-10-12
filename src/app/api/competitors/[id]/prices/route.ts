import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withRequestLogging, withSecurityHeaders } from "@/middlewares/security";
import { withRateLimit } from "@/middlewares/rateLimit";
import { FEATURES } from "@/lib/featureFlags";

// GET /api/competitors/[id]/prices - Get price history for competitor
export const GET = withRequestLogging(
  withRateLimit(100, 15 * 60 * 1000)(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      if (!FEATURES.COMPETITOR_API) {
        return NextResponse.json(
          { error: "Competitor API is disabled" },
          { status: 503 }
        );
      }

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      try {
        // Check if competitor exists
        const competitor = await prisma.competitor.findFirst({
          where: { id: params.id, deletedAt: null },
        });

        if (!competitor) {
          return NextResponse.json(
            { error: "Competitor not found" },
            { status: 404 }
          );
        }

        // Build where clause
        const where: any = {
          competitorId: params.id,
          deletedAt: null,
        };

        if (startDate || endDate) {
          where.priceDate = {};
          if (startDate) where.priceDate.gte = new Date(startDate);
          if (endDate) where.priceDate.lte = new Date(endDate);
        }

        // Get price history
        const [prices, total] = await Promise.all([
          prisma.competitorPriceComparison.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { priceDate: 'desc' },
          }),
          prisma.competitorPriceComparison.count({ where }),
        ]);

        const responseData = {
          prices,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          competitor: {
            id: competitor.id,
            name: competitor.name,
            domain: competitor.domain,
          },
        };

        const response = withSecurityHeaders(NextResponse.json(responseData));
        response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60');
        return response;
      } catch (error) {
        console.error('Database query error:', error);
        return NextResponse.json(
          { error: "Failed to fetch price history" },
          { status: 500 }
        );
      }
    }
  )
);

// POST /api/competitors/[id]/prices - Add new price comparison
export const POST = withRequestLogging(
  withRateLimit(20, 15 * 60 * 1000)(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      if (!FEATURES.COMPETITOR_API || !FEATURES.COMPETITOR_WRITE) {
        return NextResponse.json(
          { error: "Price creation is disabled" },
          { status: 503 }
        );
      }

      try {
        const body = await request.json();
        
        // Validation
        if (!body.competitorPrice || !body.myPrice) {
          return NextResponse.json(
            { error: "Competitor price and my price are required" },
            { status: 400 }
          );
        }

        // Check if competitor exists
        const competitor = await prisma.competitor.findFirst({
          where: { id: params.id, deletedAt: null },
        });

        if (!competitor) {
          return NextResponse.json(
            { error: "Competitor not found" },
            { status: 404 }
          );
        }

        // Calculate trend if previous price exists
        const lastPrice = await prisma.competitorPriceComparison.findFirst({
          where: {
            competitorId: params.id,
            deletedAt: null,
          },
          orderBy: { priceDate: 'desc' },
        });

        let trend = null;
        if (lastPrice) {
          const priceChange = Number(body.competitorPrice) - Number(lastPrice.competitorPrice);
          trend = (priceChange / Number(lastPrice.competitorPrice)) * 100;
        }

        // Create price comparison
        const priceComparison = await prisma.competitorPriceComparison.create({
          data: {
            competitorId: params.id,
            productId: body.productId,
            competitorPrice: body.competitorPrice,
            myPrice: body.myPrice,
            priceDate: body.priceDate ? new Date(body.priceDate) : new Date(),
            currency: body.currency || 'EUR',
            trend: trend ? Number(trend.toFixed(2)) : null,
            notes: body.notes,
            sourceUrl: body.sourceUrl,
          },
        });

        return NextResponse.json(priceComparison, { status: 201 });
      } catch (error) {
        console.error('Error creating price comparison:', error);
        return NextResponse.json(
          { error: "Failed to create price comparison" },
          { status: 500 }
        );
      }
    }
  )
);
