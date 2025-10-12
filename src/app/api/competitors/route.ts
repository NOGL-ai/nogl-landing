import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withRequestLogging, withSecurityHeaders } from "@/middlewares/security";
import { withRateLimit } from "@/middlewares/rateLimit";
import { FEATURES } from "@/lib/featureFlags";

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const queryCache = new Map<string, { data: any; timestamp: number }>();

// GET /api/competitors - List with pagination, filters, search
export const GET = withRequestLogging(
  withRateLimit(100, 15 * 60 * 1000)(
    async (request: NextRequest) => {
      if (!FEATURES.COMPETITOR_API) {
        return NextResponse.json(
          { error: "Competitor API is disabled" },
          { status: 503 }
        );
      }

      // Parse query params
      const { searchParams } = new URL(request.url);
      const pageRaw = parseInt(searchParams.get('page') || '1');
      const limitRaw = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
      const search = searchParams.get('search') || '';
      const status = searchParams.get('status') || undefined;
      const sortByParam = searchParams.get('sortBy') || 'createdAt';
      const sortOrderParam = (searchParams.get('sortOrder') || 'desc').toLowerCase();

      // Validate pagination and sorting inputs
      const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
      const limit = Number.isNaN(limitRaw) || limitRaw < 1 ? 10 : limitRaw;

      const allowedSortFields = new Set(['id','name','domain','createdAt','updatedAt','productCount','marketPosition','status']);
      const sortBy = allowedSortFields.has(sortByParam) ? sortByParam : 'createdAt';
      const sortOrder = sortOrderParam === 'asc' ? 'asc' : 'desc';

      // Cache key
      const cacheKey = JSON.stringify({ page, limit, search, status, sortBy, sortOrder });
      const cached = queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return withSecurityHeaders(NextResponse.json(cached.data));
      }

      // Build where clause
      const where: any = {
        deletedAt: null, // Exclude soft-deleted
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { domain: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) {
        where.status = status;
      }

      try {
        // Execute queries
        const [competitors, total] = await Promise.all([
          prisma.competitor.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
              _count: {
                select: { priceComparisons: true },
              },
            },
          }),
          prisma.competitor.count({ where }),
        ]);

        const responseData = {
          competitors,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          filters: { search, status },
        };

        // Cache result
        queryCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

        // Cleanup cache
        if (queryCache.size > 100) {
          const entries = Array.from(queryCache.entries());
          entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
          queryCache.clear();
          entries.slice(0, 100).forEach(([k, v]) => queryCache.set(k, v));
        }

        const response = withSecurityHeaders(NextResponse.json(responseData));
        response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
        return response;
      } catch (error: any) {
        console.error('Database query error:', error?.stack || error);
        const message = (error && error.message) ? error.message : 'Database query failed';
        return NextResponse.json(
          { error: "Failed to fetch competitors", message },
          { status: 500 }
        );
      }
    }
  )
);

// POST /api/competitors - Create new competitor
export const POST = withRequestLogging(
  withRateLimit(20, 15 * 60 * 1000)(
    async (request: NextRequest) => {
      if (!FEATURES.COMPETITOR_API || !FEATURES.COMPETITOR_WRITE) {
        return NextResponse.json(
          { error: "Competitor creation is disabled" },
          { status: 503 }
        );
      }

      try {
        const body = await request.json();
        
        // Validation
        if (!body.name || !body.domain) {
          return NextResponse.json(
            { error: "Name and domain are required" },
            { status: 400 }
          );
        }

        // Check for duplicates
        const existing = await prisma.competitor.findUnique({
          where: { domain: body.domain },
        });

        if (existing && !existing.deletedAt) {
          return NextResponse.json(
            { error: "Competitor with this domain already exists" },
            { status: 409 }
          );
        }

        // Create competitor
        const competitor = await prisma.competitor.create({
          data: {
            name: body.name,
            domain: body.domain,
            website: body.website,
            description: body.description,
            productCount: body.productCount || 0,
            marketPosition: body.marketPosition,
            status: body.status || 'ACTIVE',
            categories: body.categories || [],
          },
        });

        // Invalidate cache
        queryCache.clear();

        return NextResponse.json(competitor, { status: 201 });
      } catch (error) {
        console.error('Error creating competitor:', error);
        return NextResponse.json(
          { error: "Failed to create competitor" },
          { status: 500 }
        );
      }
    }
  )
);
