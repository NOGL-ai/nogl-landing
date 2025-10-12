/**
 * Competitor CRUD Tools with HITL (Human-in-the-Loop)
 * 
 * These tools enable agents to manage competitor data with explicit
 * user approval for all modifications. Read operations don't require approval.
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getPrismaContext, requireCompetitorModification } from "../utils/prisma-context";
import { CompetitorStatus } from "@prisma/client";

/**
 * Get competitor list tool - READ ONLY (no approval needed)
 */
export const getCompetitorListTool = createTool({
  id: "getCompetitorList",
  description: "Get a list of competitors with optional filtering. This is a read-only operation.",
  inputSchema: z.object({
    status: z.nativeEnum(CompetitorStatus).optional().describe("Filter by competitor status"),
    limit: z.number().optional().default(50).describe("Maximum number of competitors to return"),
    search: z.string().optional().describe("Search term for competitor name or domain"),
    includeInactive: z.boolean().optional().default(false).describe("Include inactive competitors"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    competitors: z.array(z.any()),
    count: z.number(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const { status, limit = 50, search, includeInactive = false } = context;
    const { prisma } = await getPrismaContext();
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    } else if (!includeInactive) {
      where.status = { not: "ARCHIVED" };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { domain: { contains: search, mode: "insensitive" } },
      ];
    }
    
    const competitors = await prisma.competitor.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        domain: true,
        website: true,
        description: true,
        status: true,
        productCount: true,
        marketPosition: true,
        marketShare: true,
        isMonitoring: true,
        lastScrapedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return {
      success: true,
      competitors,
      count: competitors.length,
      message: `Found ${competitors.length} competitors`,
    };
  },
});

/**
 * Get competitor details tool - READ ONLY (no approval needed)
 */
export const getCompetitorDetailsTool = createTool({
  id: "getCompetitorDetails",
  description: "Get detailed information about a specific competitor including pricing data.",
  inputSchema: z.object({
    competitorId: z.string().describe("ID of the competitor to get details for"),
    includePricing: z.boolean().optional().default(true).describe("Include recent pricing comparisons"),
    pricingDays: z.number().optional().default(30).describe("Number of days of pricing data to include"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    competitor: z.any().optional(),
    error: z.string().optional(),
    competitorId: z.string().optional(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { competitorId, includePricing = true, pricingDays = 30 } = context;
    const { prisma } = await getPrismaContext();
    
    const competitor = await prisma.competitor.findUnique({
      where: { id: competitorId },
      include: {
        CompetitorNote: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        priceComparisons: includePricing ? {
          where: {
            priceDate: {
              gte: new Date(Date.now() - pricingDays * 24 * 60 * 60 * 1000),
            },
          },
          orderBy: { priceDate: "desc" },
          take: 100,
        } : false,
        CompetitorPriceHistory: {
          orderBy: { recordDate: "desc" },
          take: 30,
        },
      },
    });
    
    if (!competitor) {
      return {
        success: false,
        error: "Competitor not found",
        competitorId,
      };
    }
    
    return {
      success: true,
      competitor,
      message: `Retrieved details for ${competitor.name}`,
    };
  },
});

/**
 * Create competitor tool - REQUIRES APPROVAL
 */
export const createCompetitorTool = createTool({
  id: "createCompetitor",
  description: "Create a new competitor entry. This requires user approval before execution.",
  inputSchema: z.object({
    name: z.string().min(1).describe("Competitor name"),
    domain: z.string().min(1).describe("Competitor domain (e.g., 'nike.com')"),
    website: z.string().url().optional().describe("Full website URL"),
    description: z.string().optional().describe("Description of the competitor"),
    categories: z.array(z.string()).optional().default([]).describe("Product categories they compete in"),
    marketPosition: z.number().optional().describe("Estimated market position (1-10)"),
    marketShare: z.number().optional().describe("Estimated market share percentage"),
    dataSource: z.string().optional().describe("Source of competitor data"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    requiresApproval: z.boolean(),
    action: z.string(),
    data: z.any(),
    preview: z.string(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const params = context;
    const { userRole } = await getPrismaContext();
    requireCompetitorModification(userRole);
    
    // Return approval request instead of creating directly
    return {
      success: true,
      requiresApproval: true,
      action: "CREATE_COMPETITOR",
      data: params,
      preview: `Create competitor: ${params.name} (${params.domain})`,
      message: `I need approval to create a new competitor: ${params.name}`,
    };
  },
});

/**
 * Update competitor tool - REQUIRES APPROVAL
 */
export const updateCompetitorTool = createTool({
  id: "updateCompetitor",
  description: "Update an existing competitor. This requires user approval before execution.",
  inputSchema: z.object({
    competitorId: z.string().describe("ID of the competitor to update"),
    name: z.string().optional().describe("New competitor name"),
    domain: z.string().optional().describe("New domain"),
    website: z.string().url().optional().describe("New website URL"),
    description: z.string().optional().describe("New description"),
    status: z.nativeEnum(CompetitorStatus).optional().describe("New status"),
    categories: z.array(z.string()).optional().describe("Updated categories"),
    marketPosition: z.number().optional().describe("Updated market position"),
    marketShare: z.number().optional().describe("Updated market share"),
    isMonitoring: z.boolean().optional().describe("Whether to monitor this competitor"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    requiresApproval: z.boolean().optional(),
    action: z.string().optional(),
    data: z.any().optional(),
    currentData: z.any().optional(),
    preview: z.string().optional(),
    message: z.string().optional(),
    error: z.string().optional(),
    competitorId: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const params = context;
    const { userRole } = await getPrismaContext();
    requireCompetitorModification(userRole, params.competitorId);
    
    // Get current competitor data for preview
    const { prisma } = await getPrismaContext();
    const currentCompetitor = await prisma.competitor.findUnique({
      where: { id: params.competitorId },
      select: { name: true, domain: true, status: true },
    });
    
    if (!currentCompetitor) {
      return {
        success: false,
        error: "Competitor not found",
        competitorId: params.competitorId,
      };
    }
    
    return {
      success: true,
      requiresApproval: true,
      action: "UPDATE_COMPETITOR",
      data: params,
      currentData: currentCompetitor,
      preview: `Update competitor: ${currentCompetitor.name} → ${params.name || currentCompetitor.name}`,
      message: `I need approval to update competitor: ${currentCompetitor.name}`,
    };
  },
});

/**
 * Delete competitor tool - REQUIRES APPROVAL + CONFIRMATION
 */
export const deleteCompetitorTool = createTool({
  id: "deleteCompetitor",
  description: "Delete a competitor and all associated data. This requires user approval and confirmation.",
  inputSchema: z.object({
    competitorId: z.string().describe("ID of the competitor to delete"),
    reason: z.string().describe("Reason for deletion"),
    deletePricingData: z.boolean().optional().default(true).describe("Whether to delete associated pricing data"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    requiresApproval: z.boolean().optional(),
    action: z.string().optional(),
    data: z.any().optional(),
    competitorData: z.any().optional(),
    preview: z.string().optional(),
    warning: z.string().optional(),
    message: z.string().optional(),
    error: z.string().optional(),
    competitorId: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const params = context;
    const { userRole } = await getPrismaContext();
    requireCompetitorModification(userRole, params.competitorId);
    
    // Get competitor data for preview
    const { prisma } = await getPrismaContext();
    const competitor = await prisma.competitor.findUnique({
      where: { id: params.competitorId },
      select: { 
        name: true, 
        domain: true, 
        productCount: true,
        priceComparisons: { select: { id: true } },
        CompetitorNote: { select: { id: true } },
      },
    });
    
    if (!competitor) {
      return {
        success: false,
        error: "Competitor not found",
        competitorId: params.competitorId,
      };
    }
    
    return {
      success: true,
      requiresApproval: true,
      action: "DELETE_COMPETITOR",
      data: params,
      competitorData: competitor,
      preview: `Delete competitor: ${competitor.name} (${competitor.domain})`,
      warning: `This will permanently delete ${competitor.name} and all associated data (${competitor.productCount} products, ${competitor.priceComparisons.length} price records, ${competitor.CompetitorNote.length} notes)`,
      message: `I need approval to delete competitor: ${competitor.name}. This action cannot be undone.`,
    };
  },
});

/**
 * Add competitor note tool - REQUIRES APPROVAL (for sensitive data)
 */
export const addCompetitorNoteTool = createTool({
  id: "addCompetitorNote",
  description: "Add a note to a competitor. Requires approval if the note contains sensitive information.",
  inputSchema: z.object({
    competitorId: z.string().describe("ID of the competitor"),
    note: z.string().min(1).describe("Note content"),
    category: z.string().optional().describe("Note category (e.g., 'strategy', 'pricing', 'general')"),
    isSensitive: z.boolean().optional().default(false).describe("Whether this note contains sensitive information"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    requiresApproval: z.boolean().optional(),
    action: z.string().optional(),
    data: z.any().optional(),
    competitorData: z.any().optional(),
    preview: z.string().optional(),
    message: z.string().optional(),
    note: z.any().optional(),
    error: z.string().optional(),
    competitorId: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const params = context;
    const { userRole, userId } = await getPrismaContext();
    requireCompetitorModification(userRole, params.competitorId);
    
    // Get competitor name for preview
    const { prisma } = await getPrismaContext();
    const competitor = await prisma.competitor.findUnique({
      where: { id: params.competitorId },
      select: { name: true, domain: true },
    });
    
    if (!competitor) {
      return {
        success: false,
        error: "Competitor not found",
        competitorId: params.competitorId,
      };
    }
    
    // Always require approval for sensitive notes, or if note is long
    const requiresApproval = params.isSensitive || params.note.length > 200;
    
    if (requiresApproval) {
      return {
        success: true,
        requiresApproval: true,
        action: "ADD_COMPETITOR_NOTE",
        data: { ...params, userId },
        competitorData: competitor,
        preview: `Add note to ${competitor.name}: ${params.note.substring(0, 100)}${params.note.length > 100 ? "..." : ""}`,
        message: `I need approval to add a note to ${competitor.name}`,
      };
    }
    
    // For short, non-sensitive notes, create directly
    const newNote = await prisma.competitorNote.create({
      data: {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        competitorId: params.competitorId,
        note: params.note,
        category: params.category,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    return {
      success: true,
      note: newNote,
      message: `Note added to ${competitor.name}`,
    };
  },
});

/**
 * All competitor tools exported as named object for agent registration
 */
export const competitorTools = {
  getCompetitorList: getCompetitorListTool,
  getCompetitorDetails: getCompetitorDetailsTool,
  createCompetitor: createCompetitorTool,
  updateCompetitor: updateCompetitorTool,
  deleteCompetitor: deleteCompetitorTool,
  addCompetitorNote: addCompetitorNoteTool,
};
