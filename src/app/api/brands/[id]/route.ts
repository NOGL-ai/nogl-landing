import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withAuth } from "@/middlewares/auth";
import { withValidation } from "@/middlewares/validation";
import { updateBrandSchema } from "@/lib/validations/product";

// GET /api/brands/[id] - Get single brand
export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const brand = await prisma.brand.findUnique({
    where: { id: params.id },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          status: true,
        },
        take: 10,
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!brand) {
    return NextResponse.json(
      { error: "Brand not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(brand);
});

// PUT /api/brands/[id] - Update brand
export const PUT = withAuth(
  withValidation(updateBrandSchema, async (request, data, { params }: { params: { id: string } }) => {
    const existingBrand = await prisma.brand.findUnique({
      where: { id: params.id },
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // Check name uniqueness if being updated
    if (data.name && data.name !== existingBrand.name) {
      const nameExists = await prisma.brand.findUnique({
        where: { name: data.name },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Brand with this name already exists" },
          { status: 409 }
        );
      }
    }

    const brand = await prisma.brand.update({
      where: { id: params.id },
      data,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(brand);
  })
);

// DELETE /api/brands/[id] - Delete brand
export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const brand = await prisma.brand.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!brand) {
    return NextResponse.json(
      { error: "Brand not found" },
      { status: 404 }
    );
  }

  if (brand._count.products > 0) {
    return NextResponse.json(
      { error: "Cannot delete brand with existing products" },
      { status: 400 }
    );
  }

  await prisma.brand.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: "Brand deleted successfully" });
});
