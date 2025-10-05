import { prisma } from "@/lib/prismaDb";
import { Product, ProductStatus, Prisma } from "@prisma/client";
import { NotFoundError, ConflictError } from "@/middlewares/error";
import { ProductQuery, CreateProductInput, UpdateProductInput } from "@/lib/validations/product";

export interface ProductWithRelations extends Product {
  brand?: {
    id: string;
    name: string;
    logo: string | null;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  competitors: Array<{
    id: string;
    name: string;
    cheapest: number;
    avg: number;
    highest: number;
    cheapestColor: string;
  }>;
  _count?: {
    competitors: number;
  };
}

export interface ProductListResponse {
  products: ProductWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search?: string;
    status?: ProductStatus;
    featured?: boolean;
    channel?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

export class ProductService {
  // Get products with filtering, sorting, and pagination
  static async getProducts(
    userId: string,
    query: ProductQuery
  ): Promise<ProductListResponse> {
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
    const where: Prisma.ProductWhereInput = {
      userId,
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
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
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

    return {
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
    };
  }

  // Get single product by ID
  static async getProductById(id: string, userId: string): Promise<ProductWithRelations> {
    const product = await prisma.product.findFirst({
      where: {
        id,
        userId,
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

    if (!product) {
      throw new NotFoundError("Product");
    }

    return product;
  }

  // Create new product
  static async createProduct(
    userId: string,
    data: CreateProductInput
  ): Promise<ProductWithRelations> {
    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingProduct) {
      throw new ConflictError("Product with this SKU already exists");
    }

    // Calculate margin if not provided
    const margin = data.margin ?? (data.cost > 0 ? ((data.price - data.cost) / data.cost) * 100 : 0);

    const product = await prisma.product.create({
      data: {
        ...data,
        userId,
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

    return product;
  }

  // Update product
  static async updateProduct(
    id: string,
    userId: string,
    data: UpdateProductInput
  ): Promise<ProductWithRelations> {
    // Check if product exists and belongs to user
    const existingProduct = await prisma.product.findFirst({
      where: { id, userId },
    });

    if (!existingProduct) {
      throw new NotFoundError("Product");
    }

    // Check SKU uniqueness if being updated
    if (data.sku && data.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (skuExists) {
        throw new ConflictError("Product with this SKU already exists");
      }
    }

    // Calculate margin if price or cost is being updated
    let margin = data.margin;
    if (data.price !== undefined || data.cost !== undefined) {
      const newPrice = data.price ?? existingProduct.price;
      const newCost = data.cost ?? existingProduct.cost;
      margin = newCost > 0 ? ((newPrice - newCost) / newCost) * 100 : 0;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
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

    return product;
  }

  // Delete product
  static async deleteProduct(id: string, userId: string): Promise<void> {
    const product = await prisma.product.findFirst({
      where: { id, userId },
    });

    if (!product) {
      throw new NotFoundError("Product");
    }

    await prisma.product.delete({
      where: { id },
    });
  }

  // Bulk update products
  static async bulkUpdateProducts(
    userId: string,
    productIds: string[],
    updates: Partial<UpdateProductInput>
  ): Promise<{ count: number }> {
    // Verify all products belong to user
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        userId,
      },
      select: { id: true },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundError("One or more products not found");
    }

    // Calculate margin if price or cost is being updated
    let updateData = { ...updates };
    if (updates.price !== undefined || updates.cost !== undefined) {
      // This is a simplified approach - in production, you might want to handle this differently
      updateData.margin = updates.margin;
    }

    const result = await prisma.product.updateMany({
      where: {
        id: { in: productIds },
        userId,
      },
      data: {
        ...updateData,
        lastUpdated: new Date(),
      },
    });

    return { count: result.count };
  }

  // Bulk delete products
  static async bulkDeleteProducts(
    userId: string,
    productIds: string[]
  ): Promise<{ count: number }> {
    // Verify all products belong to user
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        userId,
      },
      select: { id: true },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundError("One or more products not found");
    }

    const result = await prisma.product.deleteMany({
      where: {
        id: { in: productIds },
        userId,
      },
    });

    return { count: result.count };
  }

  // Get product statistics
  static async getProductStats(userId: string) {
    const [
      totalProducts,
      activeProducts,
      featuredProducts,
      totalValue,
      averagePrice,
      categoriesCount,
      brandsCount,
    ] = await Promise.all([
      prisma.product.count({ where: { userId } }),
      prisma.product.count({ where: { userId, status: "ACTIVE" } }),
      prisma.product.count({ where: { userId, featured: true } }),
      prisma.product.aggregate({
        where: { userId },
        _sum: { price: true },
      }),
      prisma.product.aggregate({
        where: { userId },
        _avg: { price: true },
      }),
      prisma.product.groupBy({
        by: ["categoryId"],
        where: { userId },
        _count: { categoryId: true },
      }),
      prisma.product.groupBy({
        by: ["brandId"],
        where: { userId },
        _count: { brandId: true },
      }),
    ]);

    return {
      totalProducts,
      activeProducts,
      featuredProducts,
      totalValue: totalValue._sum.price || 0,
      averagePrice: averagePrice._avg.price || 0,
      categoriesCount: categoriesCount.length,
      brandsCount: brandsCount.length,
    };
  }
}
