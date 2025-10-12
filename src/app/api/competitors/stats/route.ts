import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withRequestLogging, withSecurityHeaders } from "@/middlewares/security";
import { withRateLimit } from "@/middlewares/rateLimit";
import { FEATURES } from "@/lib/featureFlags";

// Cache for stats (heavily cached)
const statsCache = new Map<string, { data: any; timestamp: number }>();
const STATS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// GET /api/competitors/stats - Get competitor statistics
export const GET = withRequestLogging(
  withRateLimit(50, 15 * 60 * 1000)(
    async (request: NextRequest) => {
      if (!FEATURES.COMPETITOR_API) {
        return NextResponse.json(
          { error: "Competitor API is disabled" },
          { status: 503 }
        );
      }

      // Check cache
      const cacheKey = 'competitor-stats';
      const cached = statsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < STATS_CACHE_TTL) {
        return withSecurityHeaders(NextResponse.json(cached.data));
      }

      try {
        const [
          totalCompetitors,
          activeCompetitors,
          inactiveCompetitors,
          monitoringCompetitors,
          pausedCompetitors,
          totalPriceComparisons,
          averagePriceComparisons,
          statusBreakdown,
          categoryBreakdown,
          recentActivity,
        ] = await Promise.all([
          // Total competitors
          prisma.competitor.count({
            where: { deletedAt: null },
          }),
          
          // Active competitors
          prisma.competitor.count({
            where: { status: 'ACTIVE', deletedAt: null },
          }),
          
          // Inactive competitors
          prisma.competitor.count({
            where: { status: 'INACTIVE', deletedAt: null },
          }),
          
          // Monitoring competitors
          prisma.competitor.count({
            where: { status: 'MONITORING', deletedAt: null },
          }),
          
          // Paused competitors
          prisma.competitor.count({
            where: { status: 'PAUSED', deletedAt: null },
          }),
          
          // Total price comparisons
          prisma.competitorPriceComparison.count({
            where: { deletedAt: null },
          }),
          
          // Average price comparisons per competitor
          prisma.competitorPriceComparison.aggregate({
            where: { deletedAt: null },
            _avg: { competitorPrice: true },
          }),
          
          // Status breakdown
          prisma.competitor.groupBy({
            by: ['status'],
            where: { deletedAt: null },
            _count: { status: true },
          }),
          
          // Category breakdown (flattened)
          prisma.competitor.findMany({
            where: { deletedAt: null },
            select: { categories: true },
          }),
          
          // Recent activity (last 7 days)
          prisma.competitorPriceComparison.count({
            where: {
              deletedAt: null,
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          }),
        ]);

        // Process category breakdown
        const categoryCounts: Record<string, number> = {};
        categoryBreakdown.forEach(competitor => {
          competitor.categories.forEach(category => {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          });
        });

        const topCategories = Object.entries(categoryCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([category, count]) => ({ category, count }));

        const responseData = {
          overview: {
            totalCompetitors,
            activeCompetitors,
            inactiveCompetitors,
            monitoringCompetitors,
            pausedCompetitors,
            totalPriceComparisons,
            averagePriceComparisons: averagePriceComparisons._avg.competitorPrice || 0,
            recentActivity,
          },
          breakdown: {
            status: statusBreakdown.map(item => ({
              status: item.status,
              count: item._count.status,
            })),
            categories: topCategories,
          },
          trends: {
            recentActivity,
            averagePriceComparisonsPerCompetitor: totalCompetitors > 0 
              ? Math.round(totalPriceComparisons / totalCompetitors) 
              : 0,
          },
        };

        // Cache result
        statsCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

        const response = withSecurityHeaders(NextResponse.json(responseData));
        response.headers.set('Cache-Control', 'public, max-age=600, s-maxage=600');
        return response;
      } catch (error) {
        console.error('Database query error:', error);
        return NextResponse.json(
          { error: "Failed to fetch competitor statistics" },
          { status: 500 }
        );
      }
    }
  )
);
