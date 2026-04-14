/**
 * Tool Execution API Route
 * 
 * Handles post-approval execution of database operations and external actions.
 * This completes the HITL (Human-in-the-Loop) workflow by executing approved actions.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getPrismaContext, requireCompetitorModification, requireProductModification, requireEmailSending } from "@/mastra/utils/prisma-context";
import { sendEmail } from "@/lib/email";

export const maxDuration = 30;

type ActionPayload = Record<string, unknown>;

type ToolExecutionRequest = {
  action?: string;
  data?: ActionPayload;
  approved?: boolean;
  modifications?: unknown[];
};

type ProductPriceUpdate = {
  productId: string;
  newPrice: number;
  updateOriginalPrice?: boolean;
};

type ApiError = {
  message?: string;
  code?: string;
  stack?: string;
};

export async function POST(req: NextRequest) {
  let currentAction: string | undefined;

  try {
    // 1. Authentication
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request
    const {
      action,
      data = {},
      approved = false,
      modifications = [],
    } = (await req.json()) as ToolExecutionRequest;
    currentAction = action;
    
    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    // 3. Handle rejection
    if (!approved) {
      return NextResponse.json({ 
        success: false, 
        message: "Action cancelled by user",
        action,
        cancelled: true
      });
    }

    // 4. Get Prisma context
    const { prisma, userRole, userId } = await getPrismaContext();

    // 5. Execute based on action type
    let result;
    
    switch (action) {
      case "CREATE_COMPETITOR":
        // Validate permissions
        requireCompetitorModification(userRole);
        
        // Create competitor
        result = await prisma.competitor.create({
          data: {
            id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: String(data.name ?? ""),
            domain: String(data.domain ?? ""),
            website: (data.website as string | undefined) ?? undefined,
            description: (data.description as string | undefined) ?? undefined,
            categories: Array.isArray(data.categories) ? data.categories : [],
            marketPosition: (data.marketPosition as number | undefined) ?? undefined,
            marketShare: (data.marketShare as number | undefined) ?? undefined,
            dataSource: (data.dataSource as string | undefined) ?? undefined,
            status: "ACTIVE",
            isMonitoring: true,
            productCount: 0,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        break;

      case "UPDATE_COMPETITOR":
        // Validate permissions
        requireCompetitorModification(
          userRole,
          typeof data.competitorId === "string" ? data.competitorId : undefined
        );
        
        // Update competitor
        const updateData: Record<string, unknown> = {
          updatedAt: new Date(),
        };
        
        if (data.name) updateData.name = data.name;
        if (data.domain) updateData.domain = data.domain;
        if (data.website !== undefined) updateData.website = data.website;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.categories) updateData.categories = data.categories;
        if (data.marketPosition !== undefined) updateData.marketPosition = data.marketPosition;
        if (data.marketShare !== undefined) updateData.marketShare = data.marketShare;
        if (data.status) updateData.status = data.status;
        if (data.isMonitoring !== undefined) updateData.isMonitoring = data.isMonitoring;
        
        result = await prisma.competitor.update({
          where: { id: String(data.competitorId ?? "") },
          data: updateData,
        });
        break;

      case "DELETE_COMPETITOR":
        // Validate permissions
        requireCompetitorModification(
          userRole,
          typeof data.competitorId === "string" ? data.competitorId : undefined
        );
        
        // Delete competitor and related data
        await prisma.$transaction(async (tx: any) => {
          // Delete related records first
          await tx.competitorNote.deleteMany({
            where: { competitorId: String(data.competitorId ?? "") },
          });
          
          await tx.competitorPriceComparison.deleteMany({
            where: { competitorId: String(data.competitorId ?? "") },
          });
          
          await tx.competitorPriceHistory.deleteMany({
            where: { competitorId: String(data.competitorId ?? "") },
          });
          
          // Delete competitor
          result = await tx.competitor.delete({
            where: { id: String(data.competitorId ?? "") },
          });
        });
        break;

      case "ADD_COMPETITOR_NOTE":
        // Validate permissions
        requireCompetitorModification(
          userRole,
          typeof data.competitorId === "string" ? data.competitorId : undefined
        );
        
        // Add note
        result = await prisma.competitorNote.create({
          data: {
            id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            competitorId: String(data.competitorId ?? ""),
            note: String(data.note ?? ""),
            category: (data.category as string | undefined) ?? undefined,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        break;

      case "UPDATE_PRODUCT_PRICES":
        // Validate permissions
        requireProductModification(userRole);
        
        // Update product prices
        const updates = Array.isArray(data.updates) ? (data.updates as ProductPriceUpdate[]) : [];
        const updatePromises = updates.map((update) =>
          prisma.products.update({
            where: { product_id: update.productId },
            data: update.updateOriginalPrice 
              ? { product_original_price: update.newPrice }
              : { product_discount_price: update.newPrice },
          })
        );
        
        result = await Promise.all(updatePromises);
        break;

      case "SEND_EMAIL":
      case "SEND_PRICING_REPORT":
      case "SEND_ALERT_EMAIL":
        // Validate permissions
        requireEmailSending(userRole);
        
        // Send email
        const emailResult = await sendEmail({
          to: data.to as string | string[],
          cc: (data.cc as string | string[] | undefined) ?? undefined,
          bcc: (data.bcc as string | string[] | undefined) ?? undefined,
          subject: String(data.subject ?? ""),
          html: String(data.body ?? ""),
          attachments: (data.attachments as Array<{ filename: string; content: Buffer | string; contentType?: string }> | undefined) ?? undefined,
        });
        
        result = {
          success: emailResult.success,
          messageId: emailResult.messageId,
          message: emailResult.success ? "Email sent successfully" : "Failed to send email",
        };
        break;

      case "CONFIRM_PLAN_EXECUTION":
        // Plan execution confirmation - no database operation needed
        result = {
          success: true,
          message: "Plan execution confirmed",
          planId: data.planId as string | undefined,
          modifications,
        };
        break;

      default:
        return NextResponse.json({ 
          error: `Unknown action: ${action}` 
        }, { status: 400 });
    }

    // 6. Log successful execution
    console.log(`[Tool Execution] Action ${action} completed successfully`, {
      userId,
      userRole,
      action,
      modifications,
      timestamp: new Date().toISOString(),
    });

    // 7. Return success response
    return NextResponse.json({
      success: true,
      action,
      data: result,
      message: `Action ${action} completed successfully`,
      modifications,
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    const normalizedError = (error ?? {}) as ApiError;
    const message = normalizedError.message ?? "An unexpected error occurred";

    console.error("[Tool Execution] Error:", {
      error: message,
      stack: normalizedError.stack,
      action: currentAction,
    });

    // Handle permission errors
    if (message.includes("permission") || message.includes("privileges")) {
      return NextResponse.json({
        success: false,
        error: "Insufficient permissions",
        message,
      }, { status: 403 });
    }

    // Handle validation errors
    if (normalizedError.code === "P2002") {
      return NextResponse.json({
        success: false,
        error: "Duplicate entry",
        message: "A record with this information already exists",
      }, { status: 409 });
    }

    // Handle not found errors
    if (normalizedError.code === "P2025") {
      return NextResponse.json({
        success: false,
        error: "Record not found",
        message: "The requested record could not be found",
      }, { status: 404 });
    }

    // Generic error
    return NextResponse.json({
      success: false,
      error: "Execution failed",
      message,
    }, { status: 500 });
  }
}


