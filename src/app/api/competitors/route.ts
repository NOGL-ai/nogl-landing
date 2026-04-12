import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withRequestLogging, withSecurityHeaders } from "@/middlewares/security";
import { withRateLimit } from "@/middlewares/rateLimit";
import { FEATURES } from "@/lib/featureFlags";
import { scraperPool, isScraperAvailable } from "@/lib/scraperPool";
import { SCRAPER_SOURCES } from "@/lib/constants/scraperSources";

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const queryCache = new Map<string, { data: any; timestamp: number }>();

interface CreateCompetitorBody {
  name: string;
  domain: string;
  website?: string;
  categories?: string[];
}

// syncScraperMetrics — reads aggregated counts from the external scraper DB
// and non-destructively upserts them into prisma.Competitor.
// Safe to call on every request: failures are caught and logged, never rethrown.
async function syncScraperMetrics(): Promise<void> {
  if (!isScraperAvailable || !scraperPool) {
    console.warn('[competitors] SCRAPY_DATABASE_URL not set — skipping scraper sync');
    return;
  }
  try {
    const result = await scraperPool.query<{
      source: string;
      product_count: string; // pg returns bigint as string
      last_scraped_at: Date;
    }>(`
      SELECT
        source,
        COUNT(*)::text AS product_count,
        MAX(updated_at)  AS last_scraped_at
      FROM scraping.scraped_items
      WHERE item_type = 'product'
        AND source != 'test'
      GROUP BY source
    `);

    for (const row of result.rows) {
      const scraperSource =
        SCRAPER_SOURCES[row.source as keyof typeof SCRAPER_SOURCES];
      const displayName = scraperSource?.name ?? row.source;
      const website = scraperSource?.website ?? null;
      const count      = Number(row.product_count);
      const scrapedAt  = new Date(row.last_scraped_at);

      await prisma.competitor.upsert({
        where:  { domain: row.source },
        // On UPDATE: only touch metrics — never overwrite user-set name/status/categories/website
        update: {
          productCount:  count,
          lastScrapedAt: scrapedAt,
          // updatedAt is @updatedAt in schema — Prisma sets it automatically, do NOT include it here
        },
        // On CREATE: set all required fields from the SCRAPER_SOURCES map
        create: {
          name:          displayName,
          domain:        row.source,
          website:       website,
          productCount:  count,
          lastScrapedAt: scrapedAt,
          status:        'ACTIVE',
          categories:    [],
        },
      });
    }

    // Invalidate query cache so the next findMany reflects updated counts
    queryCache.clear();
  } catch (error) {
    // Log but never rethrow — a dead scraper DB must not break the competitor list
    console.error('[competitors] scraper sync failed:', error);
  }
}

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

      // Sync scraper metrics before serving — failures are swallowed inside syncScraperMetrics
      await syncScraperMetrics();

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
        console.error('[competitors] GET failed:', error instanceof Error ? error.stack : error);
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
        const body = (await request.json()) as Partial<CreateCompetitorBody>;
        const name = body.name?.trim() ?? "";
        const domain = (body.domain?.trim() ?? "")
          .replace(/^https?:\/\//i, "")
          .replace(/\/.*$/, "");

        if (!name || !domain) {
          return NextResponse.json(
            { error: "name and domain are required" },
            { status: 400 }
          );
        }

        const competitor = await prisma.competitor.create({
          data: {
            name,
            domain,
            website: body.website?.trim() || null,
            status: "ACTIVE",
            isMonitoring: true,
            categories: body.categories || [],
            productCount: 0,
          },
        });

        queryCache.clear();

        return NextResponse.json(competitor, { status: 201 });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002" &&
          ((Array.isArray(error.meta?.target) &&
            error.meta.target.includes("domain")) ||
            error.meta?.target === "domain")
        ) {
          return NextResponse.json(
            { error: "Competitor with this domain already exists" },
            { status: 409 }
          );
        }

        console.error('Error creating competitor:', error);
        return NextResponse.json(
          { error: "Failed to create competitor" },
          { status: 500 }
        );
      }
    }
  )
);
