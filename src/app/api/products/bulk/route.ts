import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withAuth } from "@/middlewares/auth";
import { withValidation } from "@/middlewares/validation";
import { bulkUpdateSchema, bulkDeleteSchema } from "@/lib/validations/product";

// POST /api/products/bulk - Bulk update products
export const POST = withAuth(
  withValidation(bulkUpdateSchema, async (request, data) => {
    const { productIds, updates } = data;

    // Verify all products belong to user
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        userId: request.user.id,
      },
      select: { id: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products not found" },
        { status: 404 }
      );
    }

    const result = await prisma.product.updateMany({
      where: {
        id: { in: productIds },
        userId: request.user.id,
      },
      data: {
        ...updates,
        lastUpdated: new Date(),
      },
    });

    return NextResponse.json({ 
      message: `${result.count} products updated successfully`,
      count: result.count 
    });
  })
);

// DELETE /api/products/bulk - Bulk delete products
export const DELETE = withAuth(
  withValidation(bulkDeleteSchema, async (request, data) => {
    const { productIds } = data;

    // Verify all products belong to user
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        userId: request.user.id,
      },
      select: { id: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products not found" },
        { status: 404 }
      );
    }

    const result = await prisma.product.deleteMany({
      where: {
        id: { in: productIds },
        userId: request.user.id,
      },
    });

    return NextResponse.json({ 
      message: `${result.count} products deleted successfully`,
      count: result.count 
    });
  })
);
