import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";

export interface ValidationError {
  field: string;
  message: string;
}

export function withValidation<T>(
  schema: yup.Schema<T>,
  handler: (req: NextRequest, data: T) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validatedData = await schema.validate(body, { abortEarly: false });
      return handler(request, validatedData);
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

export function withQueryValidation<T>(
  schema: yup.Schema<T>,
  handler: (req: NextRequest, data: T) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryObject = Object.fromEntries(searchParams.entries());
      
      // Convert string values to appropriate types for Yup
      const processedQuery = {
        ...queryObject,
        page: queryObject.page ? parseInt(queryObject.page) : 1,
        limit: queryObject.limit ? parseInt(queryObject.limit) : 10,
        featured: queryObject.featured === "true",
        minPrice: queryObject.minPrice ? parseFloat(queryObject.minPrice) : undefined,
        maxPrice: queryObject.maxPrice ? parseFloat(queryObject.maxPrice) : undefined,
      };

      const validatedData = await schema.validate(processedQuery, { abortEarly: false });
      return handler(request, validatedData);
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
