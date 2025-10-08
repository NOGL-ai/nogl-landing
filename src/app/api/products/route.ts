import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withRequestLogging, withSecurityHeaders } from "@/middlewares/security";
import { withRateLimit } from "@/middlewares/rateLimit";
import { generateLogoUrl, extractDomainFromUrl, extractMainDomain, isMarketplaceDomain } from "@/lib/logoService";

// In-memory cache for query results
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Connection pooling optimization
const CONNECTION_POOL_CONFIG = {
  maxConnections: 10,
  minConnections: 2,
  connectionTimeout: 30000,
  idleTimeout: 60000
};

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
      // Build WHERE clause for raw SQL with optimized pushdown
      const whereConditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      // Optimize search with better indexing support
      if (search) {
        params.push(`%${search}%`);
        whereConditions.push(`(product_title ILIKE $${paramIndex} OR variant_sku ILIKE $${paramIndex} OR brand_name ILIKE $${paramIndex})`);
        paramIndex++;
      }
      // Use exact matches for better performance
      if (status) {
        params.push(status === 'active' ? true : false);
        whereConditions.push(`variant_available = $${paramIndex}`);
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
      // Optimize price range queries
      if (minPrice !== undefined) {
        params.push(minPrice);
        whereConditions.push(`variant_price >= $${paramIndex}`);
        paramIndex++;
      }
      if (maxPrice !== undefined) {
        params.push(maxPrice);
        whereConditions.push(`variant_price <= $${paramIndex}`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Map sortBy to actual column name in BigQuery table
      const sortColumn = getSortField(sortBy) === 'product_title' ? 'product_title' : 
                        getSortField(sortBy) === 'product_original_price' ? 'variant_price' : 
                        getSortField(sortBy) === 'product_discount_price' ? 'variant_compare_at_price' : 
                        getSortField(sortBy) === 'id' ? 'variant_id' : 'variant_id';

      const startTime = Date.now();
      
      // Create cache key for this query
      const cacheKey = `products_${JSON.stringify({ page, limit, search, status, featured, channel, categoryId, brandId, minPrice, maxPrice, sortBy, sortOrder })}`;
      
      // Check cache first
      const cached = queryCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log('Cache hit - returning cached data');
        return withSecurityHeaders(NextResponse.json(cached.data));
      }
      
    try {
      // Get products and total count in parallel using raw SQL for Supabase FDW table
      console.log('Supabase FDW query starting...');
      
      // Retry logic for FDW connection issues
      let retryCount = 0;
      const maxRetries = 3;
      let productsResult: any[] = [];
      let totalResult: any[] = [];
      
      // Optimize query with pushdown - only select needed columns
      const selectColumns = 'variant_id, product_id, product_title, variant_title, variant_sku, variant_price, variant_compare_at_price, brand_name, product_type, featured_image_src, product_image_urls_csv, handle, variant_available';
      
      // Optimize FDW fetch size for better performance
      const fetchSize = Math.min(limit * 2, 1000); // Optimize fetch size
      
      // Add query plan analysis for debugging
      const enableQueryAnalysis = process.env.NODE_ENV === 'development';
      
      // Optimize batch size based on query complexity
      const batchSize = search ? Math.min(limit, 50) : Math.min(limit, 100);
      const optimizedLimit = Math.min(limit, batchSize);
      
      while (retryCount < maxRetries) {
        try {
            // Execute queries with optional plan analysis
            const queries = [
              prisma.$queryRawUnsafe(
                `SELECT ${selectColumns} FROM nogl.shopify_product_variants_bq 
                 ${whereClause}
                 ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}
                 LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
                ...params,
                optimizedLimit,
                skip
              ),
              prisma.$queryRawUnsafe(
                `SELECT COUNT(*) as count FROM nogl.shopify_product_variants_bq ${whereClause}`,
                ...params
              ),
            ];
            
            // Add query plan analysis in development
            if (enableQueryAnalysis) {
              console.log('Query Plan Analysis:');
              console.log('Main Query:', queries[0]);
              console.log('Count Query:', queries[1]);
              console.log('Parameters:', params);
              console.log('Where Clause:', whereClause);
            }
            
            [productsResult, totalResult] = await Promise.all(queries) as [any[], any[]];
            
            // If we get here, the query succeeded
            break;
          } catch (fdwError: unknown) {
            retryCount++;
            const errorMessage = fdwError instanceof Error ? fdwError.message : 'Unknown error';
            console.log(`FDW query attempt ${retryCount} failed:`, errorMessage);
            
            if (retryCount >= maxRetries) {
              throw fdwError;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
        
        const endTime = Date.now();
        const queryTime = endTime - startTime;
        
        // Advanced performance monitoring
        console.log('BigQuery query completed successfully in', queryTime, 'ms');
        console.log('Products returned:', productsResult?.length || 0);
        console.log('Total products available:', totalResult?.[0]?.count || 0);
        console.log('Query complexity:', {
          hasSearch: !!search,
          hasFilters: !!(status || channel || brandId || minPrice || maxPrice),
          batchSize: optimizedLimit,
          cacheHit: false
        });
        
        // Performance categorization
        if (queryTime > 10000) {
          console.warn('⚠️ Very slow query:', queryTime, 'ms - Consider adding indexes');
        } else if (queryTime > 5000) {
          console.warn('⚠️ Slow query:', queryTime, 'ms - Monitor for optimization');
        } else if (queryTime > 1000) {
          console.log('⚠️ Moderate query:', queryTime, 'ms');
        } else {
          console.log('✅ Fast query:', queryTime, 'ms');
        }

        const products = productsResult || [];
        const total = parseInt(totalResult?.[0]?.count || '0');

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

        // Store in cache
        const responseData = {
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
        };
        
        queryCache.set(cacheKey, {
          data: responseData,
          timestamp: Date.now()
        });
        
        // Clean old cache entries (keep only last 100)
        if (queryCache.size > 100) {
          const entries = Array.from(queryCache.entries());
          entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
          queryCache.clear();
          entries.slice(0, 100).forEach(([key, value]) => queryCache.set(key, value));
        }
        
        // Add caching headers for better performance
        const cachedResponse = withSecurityHeaders(NextResponse.json(responseData));
        cachedResponse.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300'); // 5 minutes cache
        cachedResponse.headers.set('ETag', `"${Date.now()}-${page}-${limit}"`);
        
        return cachedResponse;
      } catch (error) {
        console.error('Database query error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
          { 
            error: "Failed to fetch products", 
            message: "Database query failed",
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
          },
          { status: 500 }
        );
      }
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
