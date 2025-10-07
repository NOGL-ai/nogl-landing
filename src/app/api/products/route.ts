import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withRequestLogging, withSecurityHeaders } from "@/middlewares/security";
import { withRateLimit } from "@/middlewares/rateLimit";

// GET /api/products - List products with filtering, sorting, and pagination (no auth required)
export const GET = withRequestLogging(
  withRateLimit(100, 15 * 60 * 1000)(
    async (request) => {
      // Parse query parameters
      const { searchParams } = new URL(request.url);
      const query = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '10'),
        search: searchParams.get('search') || undefined,
        status: searchParams.get('status') || undefined,
        featured: searchParams.get('featured') ? searchParams.get('featured') === 'true' : undefined,
        channel: searchParams.get('channel') || undefined,
        categoryId: searchParams.get('categoryId') || undefined,
        brandId: searchParams.get('brandId') || undefined,
        minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
        maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
      };
    
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

    // Build where clause for products table
    const where = {
      ...(search && {
        OR: [
          { product_title: { contains: search, mode: "insensitive" as const } },
          { product_sku: { contains: search, mode: "insensitive" as const } },
          { product_description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(status && { product_condition: status }),
      ...(channel && { product_display_mode: channel }),
      ...(categoryId && { product_category: categoryId }),
      ...(brandId && { product_brand: brandId }),
      ...(minPrice && { product_original_price: { gte: minPrice } }),
      ...(maxPrice && { product_original_price: { lte: maxPrice } }),
    };

    // Build orderBy clause for products table
    const getSortField = (sortBy: string) => {
      switch (sortBy) {
        case 'name': return 'product_title';
        case 'price': return 'product_original_price';
        case 'cost': return 'product_discount_price';
        case 'createdAt': return 'id';
        case 'updatedAt': return 'id';
        default: return 'id';
      }
    };
    
    const orderBy = {
      [getSortField(sortBy)]: sortOrder,
    };

    // Get products and total count in parallel
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.products.count({ where }),
    ]);

    // Map products to API-friendly format
    const mappedProducts = products.map((product: any) => ({
      id: product.product_id,
      name: product.product_title,
      sku: product.product_sku,
      description: product.product_description,
      image: product.product_page_image_url,
      url: product.product_url,
      price: product.product_original_price,
      discountPrice: product.product_discount_price,
      currency: product.product_currency,
      brand: product.product_brand,
      category: product.product_category,
      condition: product.product_condition,
      color: product.product_color,
      material: product.product_material,
      gender: product.product_gender,
      hasPromotion: product.product_has_promotion,
      imageCount: product.product_image_count,
      variantsCount: product.product_variants_count,
      availableSizes: product.product_available_sizes,
      extractionTimestamp: product.extraction_timestamp,
    }));

    const response = NextResponse.json({
      products: mappedProducts,
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
    }
  )
);

// POST /api/products - Not available (read-only Supabase data)
export const POST = async () => {
  return NextResponse.json(
    { error: "POST not supported - this is read-only data from Supabase" },
    { status: 405 }
  );
};
