import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withRequestLogging, withSecurityHeaders } from "@/middlewares/security";
import { withRateLimit } from "@/middlewares/rateLimit";
import { generateLogoUrl, extractDomainFromUrl, extractMainDomain, isMarketplaceDomain } from "@/lib/logoService";

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

    // Query from BigQuery Foreign Data Wrapper table in nogl schema
    // Build WHERE clause for raw SQL
    const whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      params.push(`%${search}%`);
      whereConditions.push(`(product_title ILIKE $${paramIndex} OR variant_sku ILIKE $${paramIndex} OR brand_name ILIKE $${paramIndex})`);
      paramIndex++;
    }
    if (status) {
      params.push(status);
      whereConditions.push(`variant_available = $${paramIndex}::boolean`);
      paramIndex++;
    }
    if (channel) {
      params.push(channel);
      whereConditions.push(`product_type = $${paramIndex}`);
      paramIndex++;
    }
    if (brandId) {
      params.push(brandId);
      whereConditions.push(`brand_name = $${paramIndex}`);
      paramIndex++;
    }
    if (minPrice) {
      params.push(minPrice);
      whereConditions.push(`variant_price >= $${paramIndex}::numeric`);
      paramIndex++;
    }
    if (maxPrice) {
      params.push(maxPrice);
      whereConditions.push(`variant_price <= $${paramIndex}::numeric`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Map sortBy to actual column name in BigQuery table
    const sortColumn = getSortField(sortBy) === 'product_title' ? 'product_title' : 
                      getSortField(sortBy) === 'product_original_price' ? 'variant_price' : 
                      getSortField(sortBy) === 'product_discount_price' ? 'variant_compare_at_price' : 
                      getSortField(sortBy) === 'id' ? 'variant_id' : 'variant_id';

    // Get products and total count in parallel using raw SQL for BigQuery table
    const [productsResult, totalResult] = await Promise.all([
      prisma.$queryRawUnsafe(
        `SELECT * FROM nogl.shopify_product_variants_bq 
         ${whereClause}
         ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        ...params,
        limit,
        skip
      ),
      prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM nogl.shopify_product_variants_bq ${whereClause}`,
        ...params
      ),
    ]) as [any[], any[]];

    const products = productsResult;
    const total = parseInt(totalResult[0]?.count || '0');

    // Map products from BigQuery table to ProductDTO format expected by the catalog
    const mappedProducts = products.map((product: any) => {
      // Generate logo URL from brand_name
      let logoUrl: string | null = null;
      
      if (product.brand_name) {
        // Generate logo using brand name
        logoUrl = generateLogoUrl(product.brand_name, {
          format: 'png',
          size: 64
        });
      }
      
      // Use featured_image_src if available, otherwise construct from handle
      let imageUrl: string | null = null;
      if (product.featured_image_src) {
        imageUrl = product.featured_image_src;
      } else if (product.product_image_urls_csv) {
        // Get first image from CSV if available
        const images = product.product_image_urls_csv.split(',');
        imageUrl = images[0]?.trim() || null;
      } else if (product.handle) {
        // Fallback: Construct Shopify image URL pattern
        imageUrl = `https://cdn.shopify.com/s/files/1/placeholder/files/${product.handle}-${product.variant_id || 'main'}.jpg`;
      }

      return {
        id: product.variant_id?.toString() || product.product_id?.toString(),
        name: product.product_title || product.variant_title || 'Untitled Product',
        sku: product.variant_sku || 'N/A',
        image: imageUrl,
        price: product.variant_price ? parseFloat(product.variant_price.toString()) : 0,
        currency: 'EUR', // Changed to EUR based on your sample data
        channel: 'shopify',
        brand: product.brand_name ? {
          id: product.brand_name.toLowerCase().replace(/\s+/g, '-'),
          name: product.brand_name,
          logo: logoUrl
        } : null,
        category: product.product_type ? {
          id: product.product_type.toLowerCase().replace(/\s+/g, '-'),
          name: product.product_type,
          slug: product.product_type.toLowerCase().replace(/\s+/g, '-')
        } : null,
        competitors: [], // No competitor data in current table structure
        _count: {
          competitors: 0
        }
      };
    });

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
