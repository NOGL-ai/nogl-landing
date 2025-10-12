/**
 * Prisma Context for Mastra Agents
 * 
 * Provides database access and user context for agents.
 * This enables agents to query and modify data with proper
 * authentication and authorization.
 */

import { prisma } from "@/lib/prismaDb";
import { getAuthSession } from "@/lib/auth";

export interface PrismaContext {
  prisma: typeof prisma;
  userId: string;
  userRole: string;
  userEmail: string | null;
}

/**
 * Get Prisma context with user session for agent operations
 * 
 * @returns Prisma client with user context
 */
export async function getPrismaContext(): Promise<PrismaContext> {
  const session = await getAuthSession();
  
  return {
    prisma,
    userId: session?.user?.id || "anonymous",
    userRole: (session?.user as any)?.role || "USER",
    userEmail: session?.user?.email || null,
  };
}

/**
 * Get Prisma context for anonymous operations (read-only)
 * 
 * @returns Prisma client without user context
 */
export function getAnonymousPrismaContext(): PrismaContext {
  return {
    prisma,
    userId: "anonymous",
    userRole: "USER",
    userEmail: null,
  };
}

/**
 * Check if user has admin privileges
 * 
 * @param userRole - User role from context
 * @returns true if user is admin
 */
export function isAdmin(userRole: string): boolean {
  return userRole === "ADMIN";
}

/**
 * Check if user can modify competitor data
 * 
 * @param userRole - User role from context
 * @param competitorId - Optional competitor ID for ownership checks
 * @returns true if user can modify competitor
 */
export function canModifyCompetitor(userRole: string, competitorId?: string): boolean {
  // Admin can modify any competitor
  if (userRole === "ADMIN") return true;
  
  // Expert can modify any competitor
  if (userRole === "EXPERT") return true;
  
  // Regular users cannot modify competitors
  return false;
}

/**
 * Check if user can modify product data
 * 
 * @param userRole - User role from context
 * @returns true if user can modify products
 */
export function canModifyProducts(userRole: string): boolean {
  return userRole === "ADMIN" || userRole === "EXPERT";
}

/**
 * Check if user can send emails
 * 
 * @param userRole - User role from context
 * @returns true if user can send emails
 */
export function canSendEmails(userRole: string): boolean {
  return userRole === "ADMIN" || userRole === "EXPERT";
}

/**
 * Require admin privileges or throw error
 * 
 * @param userRole - User role from context
 * @throws Error if user is not admin
 */
export function requireAdmin(userRole: string): void {
  if (!isAdmin(userRole)) {
    throw new Error("This operation requires admin privileges");
  }
}

/**
 * Require competitor modification permissions or throw error
 * 
 * @param userRole - User role from context
 * @param competitorId - Optional competitor ID
 * @throws Error if user cannot modify competitor
 */
export function requireCompetitorModification(userRole: string, competitorId?: string): void {
  if (!canModifyCompetitor(userRole, competitorId)) {
    throw new Error("You don't have permission to modify competitor data");
  }
}

/**
 * Require product modification permissions or throw error
 * 
 * @param userRole - User role from context
 * @throws Error if user cannot modify products
 */
export function requireProductModification(userRole: string): void {
  if (!canModifyProducts(userRole)) {
    throw new Error("You don't have permission to modify product data");
  }
}

/**
 * Require email sending permissions or throw error
 * 
 * @param userRole - User role from context
 * @throws Error if user cannot send emails
 */
export function requireEmailSending(userRole: string): void {
  if (!canSendEmails(userRole)) {
    throw new Error("You don't have permission to send emails");
  }
}
