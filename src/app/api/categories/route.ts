import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withAuth } from "@/middlewares/auth";
import { withValidation } from "@/middlewares/validation";
import { createCategorySchema } from "@/lib/validations/product";

// GET /api/categories - Get all categories with hierarchy
export const GET = withAuth(async (request: NextRequest) => {
  const categories = await prisma.category.findMany({
    include: {
      children: {
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      },
      parent: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
});

// POST /api/categories - Create new category
export const POST = withAuth(
  withValidation(createCategorySchema, async (request, data) => {
    // Check if category name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }

    // Check if slug already exists
    const existingSlug = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data,
      include: {
        children: true,
        parent: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  })
);
