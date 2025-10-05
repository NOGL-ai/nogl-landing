import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withAuth } from "@/middlewares/auth";

// GET /api/products/stats - Get product statistics
export const GET = withAuth(async (request: NextRequest) => {
  const [
    totalProducts,
    activeProducts,
    featuredProducts,
    totalValue,
    averagePrice,
    categoriesCount,
    brandsCount,
    statusBreakdown,
    channelBreakdown,
  ] = await Promise.all([
    // Total products
    prisma.product.count({ where: { userId: request.user.id } }),
    
    // Active products
    prisma.product.count({ where: { userId: request.user.id, status: "ACTIVE" } }),
    
    // Featured products
    prisma.product.count({ where: { userId: request.user.id, featured: true } }),
    
    // Total value
    prisma.product.aggregate({
      where: { userId: request.user.id },
      _sum: { price: true },
    }),
    
    // Average price
    prisma.product.aggregate({
      where: { userId: request.user.id },
      _avg: { price: true },
    }),
    
    // Categories count
    prisma.product.groupBy({
      by: ["categoryId"],
      where: { userId: request.user.id },
      _count: { categoryId: true },
    }),
    
    // Brands count
    prisma.product.groupBy({
      by: ["brandId"],
      where: { userId: request.user.id },
      _count: { brandId: true },
    }),
    
    // Status breakdown
    prisma.product.groupBy({
      by: ["status"],
      where: { userId: request.user.id },
      _count: { status: true },
    }),
    
    // Channel breakdown
    prisma.product.groupBy({
      by: ["channel"],
      where: { 
        userId: request.user.id,
        channel: { not: null }
      },
      _count: { channel: true },
    }),
  ]);

  return NextResponse.json({
    overview: {
      totalProducts,
      activeProducts,
      featuredProducts,
      totalValue: totalValue._sum.price || 0,
      averagePrice: averagePrice._avg.price || 0,
      categoriesCount: categoriesCount.length,
      brandsCount: brandsCount.length,
    },
    breakdown: {
      status: statusBreakdown.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      channels: channelBreakdown.map(item => ({
        channel: item.channel,
        count: item._count.channel,
      })),
    },
  });
});
