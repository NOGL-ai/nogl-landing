import { NextRequest, NextResponse } from "next/server";

import { getProductDetail } from "@/lib/companies/productHelpers";

type RouteContext = {
  params: Promise<{ slug: string; productId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug, productId } = await context.params;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    const response = await getProductDetail({ slug, productId });

    if (!response) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "[api/companies/[slug]/products/[productId]] GET failed:",
      error
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load product detail",
      },
      { status: 500 }
    );
  }
}
