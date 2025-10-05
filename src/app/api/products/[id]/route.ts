import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withAuth } from "@/middlewares/auth";
import { withValidation } from "@/middlewares/validation";
import { updateProductSchema } from "@/lib/validations/product";

// GET /api/products/[id] - Get single product
export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const product = await prisma.product.findFirst({
    where: {
      id: params.id,
      userId: request.user.id,
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
      priceHistory: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          competitors: true,
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(product);
});

// PUT /api/products/[id] - Update product
export const PUT = withAuth(
  withValidation(updateProductSchema, async (request, data, { params }: { params: { id: string } }) => {
    const existingProduct = await prisma.product.findFirst({
      where: { id: params.id, userId: request.user.id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check SKU uniqueness if being updated
    if (data.sku && data.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (skuExists) {
        return NextResponse.json(
          { error: "Product with this SKU already exists" },
          { status: 409 }
        );
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
      where: { id: params.id },
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

    return NextResponse.json(product);
  })
);

// DELETE /api/products/[id] - Delete product
export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const product = await prisma.product.findFirst({
    where: { id: params.id, userId: request.user.id },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  await prisma.product.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: "Product deleted successfully" });
});
