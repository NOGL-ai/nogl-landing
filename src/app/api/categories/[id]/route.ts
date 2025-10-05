import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { withAuth } from "@/middlewares/auth";
import { withValidation } from "@/middlewares/validation";
import { updateCategorySchema } from "@/lib/validations/product";

// GET /api/categories/[id] - Get single category
export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
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

  if (!category) {
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(category);
});

// PUT /api/categories/[id] - Update category
export const PUT = withAuth(
  withValidation(updateCategorySchema, async (request, data, { params }: { params: { id: string } }) => {
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check name uniqueness if being updated
    if (data.name && data.name !== existingCategory.name) {
      const nameExists = await prisma.category.findUnique({
        where: { name: data.name },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Category with this name already exists" },
          { status: 409 }
        );
      }
    }

    // Check slug uniqueness if being updated
    if (data.slug && data.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Category with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
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

    return NextResponse.json(category);
  })
);

// DELETE /api/categories/[id] - Delete category
export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: {
      children: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404 }
    );
  }

  if (category._count.products > 0) {
    return NextResponse.json(
      { error: "Cannot delete category with existing products" },
      { status: 400 }
    );
  }

  if (category.children.length > 0) {
    return NextResponse.json(
      { error: "Cannot delete category with subcategories" },
      { status: 400 }
    );
  }

  await prisma.category.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: "Category deleted successfully" });
});
