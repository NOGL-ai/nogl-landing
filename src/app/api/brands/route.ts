import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withAuth } from "@/middlewares/auth";
import { withValidation } from "@/middlewares/validation";
import { createBrandSchema } from "@/lib/validations/product";

// GET /api/brands - Get all brands
export const GET = withAuth(async (request: NextRequest) => {
  const brands = await prisma.brand.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ brands });
});

// POST /api/brands - Create new brand
export const POST = withAuth(
  withValidation(createBrandSchema, async (request, data) => {
    // Check if brand name already exists
    const existingBrand = await prisma.brand.findUnique({
      where: { name: data.name },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "Brand with this name already exists" },
        { status: 409 }
      );
    }

    const brand = await prisma.brand.create({
      data,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(brand, { status: 201 });
  })
);
