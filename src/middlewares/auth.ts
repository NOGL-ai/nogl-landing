import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export function withAuth<T extends any[] = []>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T) => {
    try {
      // Check if we're in a build context
      if (typeof window === 'undefined' && !request.headers) {
        // During build time, skip auth check
        return NextResponse.json(
          { error: "Build time - auth skipped" },
          { status: 200 }
        );
      }

      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Get user details from database
      const { prisma } = await import("@/lib/prismaDb");
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = user;

      return handler(authenticatedRequest, ...args);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

export function withRole<T extends any[] = []>(
  allowedRoles: UserRole[],
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withAuth<T>(async (req, ...args: T) => {
    if (!req.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    return handler(req, ...args);
  });
}

export function withAdmin<T extends any[] = []>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withRole<T>([UserRole.ADMIN], handler);
}

export function withUserOrAdmin<T extends any[] = []>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withRole<T>([UserRole.USER, UserRole.ADMIN], handler);
}
