import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withRequestLogging, withSecurityHeaders } from "@/middlewares/security";
import { withRateLimit } from "@/middlewares/rateLimit";
import { generateLogoUrl, extractDomainFromUrl, extractMainDomain } from "@/lib/logoService";

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
      (prisma as any).products.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      (prisma as any).products.count({ where }),
    ]);

    // Map products to ProductDTO format expected by the catalog
    const mappedProducts = products.map((product: any) => {
      // Generate logo URL from brand name or domain
      let logoUrl: string | null = null;
      
      if (product.product_brand) {
        // Priority 1: Try to extract domain from product URL
        let domain = extractDomainFromUrl(product.product_url);
        
        // If domain is from a CDN or subdomain, extract the main domain
        if (domain) {
          domain = extractMainDomain(domain);
        }
        
        // Priority 2: Use brand name as fallback
        // Generate logo using extracted domain or brand name
        logoUrl = generateLogoUrl(domain || product.product_brand, {
          format: 'png',
          size: 64
        });
      }
      
      return {
        id: product.product_id,
        name: product.product_title || 'Untitled Product',
        sku: product.product_sku || 'N/A',
        image: product.product_page_image_url,
        price: product.product_original_price ? parseFloat(product.product_original_price.toString()) : 0,
        currency: product.product_currency || 'EUR',
        channel: product.product_display_mode,
        brand: product.product_brand ? {
          id: product.product_brand.toLowerCase().replace(/\s+/g, '-'),
          name: product.product_brand,
          logo: logoUrl
        } : null,
        category: product.product_category ? {
          id: product.product_category.toLowerCase().replace(/\s+/g, '-'),
          name: product.product_category,
          slug: product.product_category.toLowerCase().replace(/\s+/g, '-')
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
