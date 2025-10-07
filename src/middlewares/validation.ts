import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";

export interface ValidationError {
  field: string;
  message: string;
}

export function withValidation<T, U extends any[] = []>(
  schema: yup.Schema<T>,
  handler: (req: NextRequest, data: T, ...args: U) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: U) => {
    try {
      const body = await request.json();
      const validatedData = await schema.validate(body, { abortEarly: false });
      return handler(request, validatedData, ...args);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const validationErrors: ValidationError[] = error.inner.map((err) => ({
          field: err.path || "unknown",
          message: err.message,
        }));

        return NextResponse.json(
          {
            error: "Validation failed",
            details: validationErrors,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
  };
}

export function withQueryValidation<T, U extends any[] = []>(
  schema: yup.Schema<T>,
  handler: (req: NextRequest, data: T, ...args: U) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: U) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryObject = Object.fromEntries(searchParams.entries());
      
      // Convert string values to appropriate types for Yup
      const processedQuery = {
        ...queryObject,
        page: queryObject.page ? parseInt(queryObject.page) : undefined,
        limit: queryObject.limit ? parseInt(queryObject.limit) : undefined,
        featured: queryObject.featured !== undefined ? (queryObject.featured === "true" ? true : queryObject.featured === "false" ? false : queryObject.featured) : undefined,
        minPrice: queryObject.minPrice ? parseFloat(queryObject.minPrice) : undefined,
        maxPrice: queryObject.maxPrice ? parseFloat(queryObject.maxPrice) : undefined,
      };

      const validatedData = await schema.validate(processedQuery, { abortEarly: false });
      return handler(request, validatedData, ...args);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const validationErrors: ValidationError[] = error.inner.map((err) => ({
          field: err.path || "unknown",
          message: err.message,
        }));

        return NextResponse.json(
          {
            error: "Query validation failed",
            details: validationErrors,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }
  };
}
