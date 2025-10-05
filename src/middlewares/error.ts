import { NextRequest, NextResponse } from "next/server";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof AppError) {
        return NextResponse.json(
          {
            error: error.message,
            statusCode: error.statusCode,
          },
          { status: error.statusCode }
        );
      }

      // Handle Prisma errors
      if (error instanceof Error) {
        if (error.message.includes("Unique constraint")) {
          return NextResponse.json(
            { error: "Resource already exists" },
            { status: 409 }
          );
        }

        if (error.message.includes("Record to update not found")) {
          return NextResponse.json(
            { error: "Resource not found" },
            { status: 404 }
          );
        }

        if (error.message.includes("Foreign key constraint")) {
          return NextResponse.json(
            { error: "Invalid reference to related resource" },
            { status: 400 }
          );
        }
      }

      // Generic error response
      return NextResponse.json(
        {
          error: process.env.NODE_ENV === "production" 
            ? "Internal server error" 
            : error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  };
}
