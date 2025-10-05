import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withAuth } from "@/middlewares/auth";
import { withQueryValidation, withValidation } from "@/middlewares/validation";
import { withRequestLogging, withSecurityHeaders } from "@/middlewares/security";
import { withRateLimit } from "@/middlewares/rateLimit";
import { productQuerySchema, createProductSchema } from "@/lib/validations/product";

// GET /api/products - List products with filtering, sorting, and pagination
export const GET = withRequestLogging(
  withRateLimit(100, 15 * 60 * 1000)(
    withAuth(
      withQueryValidation(productQuerySchema, async (request, query) => {
    const {
      page,
      limit,
      search,
      status,
      featured,
      channel,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      userId: request.user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(status && { status }),
      ...(featured !== undefined && { featured }),
      ...(channel && { channel }),
      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { lte: maxPrice } }),
    };

    // Build orderBy clause
    const orderBy = {
      [sortBy]: sortOrder,
    };

    // Get products and total count in parallel
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          competitors: {
            select: {
              id: true,
              name: true,
              cheapest: true,
              avg: true,
              highest: true,
              cheapestColor: true,
            },
          },
          _count: {
            select: {
              competitors: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const response = NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        search,
        status,
        featured,
        channel,
        categoryId,
        brandId,
        minPrice,
        maxPrice,
      },
    });

    return withSecurityHeaders(response);
  })
    )
  )
);

// POST /api/products - Create new product
export const POST = withRequestLogging(
  withRateLimit(50, 15 * 60 * 1000)(
    withAuth(
      withValidation(createProductSchema, async (request, data) => {
    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 409 }
      );
    }

    // Calculate margin if not provided
    const margin = data.margin ?? (data.cost > 0 ? ((data.price - data.cost) / data.cost) * 100 : 0);

    const product = await prisma.product.create({
      data: {
        ...data,
        userId: request.user.id,
        margin,
        lastUpdated: new Date(),
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        competitors: {
          select: {
            id: true,
            name: true,
            cheapest: true,
            avg: true,
            highest: true,
            cheapestColor: true,
          },
        },
        _count: {
          select: {
            competitors: true,
          },
        },
      },
    });

    const response = NextResponse.json(product, { status: 201 });
    return withSecurityHeaders(response);
  })
    )
  )
);
