/**
 * Pricing Analysis and Update Tools with HITL
 * 
 * These tools enable agents to analyze pricing data and make pricing
 * recommendations with user approval for all modifications.
 */

import { z } from "zod";
import { getPrismaContext, requireProductModification } from "../utils/prisma-context";

/**
 * Analyze price gaps tool - READ ONLY (no approval needed)
 */
export const analyzePriceGapsTool = {
  name: "analyzePriceGaps",
  description: "Analyze pricing gaps between our products and competitors to identify opportunities.",
  parameters: z.object({
    productIds: z.array(z.string()).optional().describe("Specific product IDs to analyze (optional)"),
    competitorIds: z.array(z.string()).optional().describe("Specific competitor IDs to compare against (optional)"),
    category: z.string().optional().describe("Product category to analyze"),
    minPriceDiff: z.number().optional().default(10).describe("Minimum price difference to consider significant"),
    days: z.number().optional().default(30).describe("Number of days of pricing data to analyze"),
  }),
  execute: async (params: {
    productIds?: string[];
    competitorIds?: string[];
    category?: string;
    minPriceDiff?: number;
    days?: number;
  }) => {
    const { prisma } = await getPrismaContext();
    
    const cutoffDate = new Date(Date.now() - (params.days || 30) * 24 * 60 * 60 * 1000);
    
    // Build where clause for products
    const productWhere: any = {};
    if (params.productIds) {
      productWhere.product_id = { in: params.productIds };
    }
    if (params.category) {
      productWhere.product_category = params.category;
    }
    
    // Build where clause for competitors
    const competitorWhere: any = {};
    if (params.competitorIds) {
      competitorWhere.competitorId = { in: params.competitorIds };
    }
    
    // Get recent price comparisons
    const priceComparisons = await prisma.competitorPriceComparison.findMany({
      where: {
        ...competitorWhere,
        priceDate: { gte: cutoffDate },
        deletedAt: null,
      },
      include: {
        competitor: {
          select: { name: true, domain: true },
        },
      },
    });
    
    // Group by product and analyze gaps
    const productGaps: any[] = [];
    const productGroups = new Map();
    
    for (const comparison of priceComparisons) {
      const productId = comparison.productId;
      if (!productId) continue;
      
      if (!productGroups.has(productId)) {
        productGroups.set(productId, {
          productId,
          productName: comparison.productName,
          productSku: comparison.productSku,
          myPrice: comparison.myPrice,
          competitorPrices: [],
        });
      }
      
      productGroups.get(productId).competitorPrices.push({
        competitorName: comparison.competitor.name,
        competitorPrice: comparison.competitorPrice,
        priceDiff: comparison.priceDiff,
        priceDiffPct: comparison.priceDiffPct,
        isWinning: comparison.isWinning,
        priceDate: comparison.priceDate,
      });
    }
    
    // Analyze gaps for each product
    for (const [productId, productData] of productGroups) {
      const competitorPrices = productData.competitorPrices;
      if (competitorPrices.length === 0) continue;
      
      const avgCompetitorPrice = competitorPrices.reduce((sum: number, p: any) => sum + Number(p.competitorPrice), 0) / competitorPrices.length;
      const minCompetitorPrice = Math.min(...competitorPrices.map((p: any) => Number(p.competitorPrice)));
      const maxCompetitorPrice = Math.max(...competitorPrices.map((p: any) => Number(p.competitorPrice)));
      
      const priceGap = Number(productData.myPrice) - avgCompetitorPrice;
      const minPriceGap = Number(productData.myPrice) - minCompetitorPrice;
      const maxPriceGap = Number(productData.myPrice) - maxCompetitorPrice;
      
      // Only include significant gaps
      if (Math.abs(priceGap) >= (params.minPriceDiff || 10)) {
        productGaps.push({
          productId,
          productName: productData.productName,
          productSku: productData.productSku,
          myPrice: Number(productData.myPrice),
          avgCompetitorPrice: Number(avgCompetitorPrice.toFixed(2)),
          minCompetitorPrice: Number(minCompetitorPrice),
          maxCompetitorPrice: Number(maxCompetitorPrice),
          priceGap: Number(priceGap.toFixed(2)),
          minPriceGap: Number(minPriceGap.toFixed(2)),
          maxPriceGap: Number(maxPriceGap.toFixed(2)),
          opportunity: priceGap > 0 ? "UNDERPRICED" : "OVERPRICED",
          competitorCount: competitorPrices.length,
          competitors: competitorPrices,
        });
      }
    }
    
    // Sort by opportunity size
    productGaps.sort((a, b) => Math.abs(b.priceGap) - Math.abs(a.priceGap));
    
    return {
      success: true,
      analysis: {
        productGaps,
        totalProducts: productGaps.length,
        underPricedCount: productGaps.filter(p => p.opportunity === "UNDERPRICED").length,
        overPricedCount: productGaps.filter(p => p.opportunity === "OVERPRICED").length,
        avgGap: productGaps.length > 0 ? 
          productGaps.reduce((sum, p) => sum + Math.abs(p.priceGap), 0) / productGaps.length : 0,
      },
      message: `Found ${productGaps.length} products with significant pricing gaps`,
    };
  },
};

/**
 * Get pricing trends tool - READ ONLY (no approval needed)
 */
export const getPricingTrendsTool = {
  name: "getPricingTrends",
  description: "Get pricing trends for products and competitors over time.",
  parameters: z.object({
    productIds: z.array(z.string()).optional().describe("Product IDs to analyze"),
    competitorIds: z.array(z.string()).optional().describe("Competitor IDs to include"),
    days: z.number().optional().default(90).describe("Number of days to analyze"),
    groupBy: z.enum(["day", "week", "month"]).optional().default("week").describe("Group data by time period"),
  }),
  execute: async (params: {
    productIds?: string[];
    competitorIds?: string[];
    days?: number;
    groupBy?: "day" | "week" | "month";
  }) => {
    const { prisma } = await getPrismaContext();
    
    const cutoffDate = new Date(Date.now() - (params.days || 90) * 24 * 60 * 60 * 1000);
    
    // Get price history data
    const priceHistory = await prisma.competitorPriceHistory.findMany({
      where: {
        recordDate: { gte: cutoffDate },
        ...(params.competitorIds && { competitorId: { in: params.competitorIds } }),
      },
      include: {
        Competitor: {
          select: { name: true, domain: true },
        },
      },
      orderBy: { recordDate: "asc" },
    });
    
    // Group by time period
    const trends: any[] = [];
    const groups = new Map();
    
    for (const record of priceHistory) {
      let groupKey: string;
      const date = new Date(record.recordDate);
      
      switch (params.groupBy) {
        case "day":
          groupKey = date.toISOString().split("T")[0];
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          groupKey = weekStart.toISOString().split("T")[0];
          break;
        case "month":
          groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        default:
          groupKey = date.toISOString().split("T")[0];
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          period: groupKey,
          competitors: new Map(),
          totalProducts: 0,
          avgPrice: 0,
          minPrice: Infinity,
          maxPrice: Infinity,
        });
      }
      
      const group = groups.get(groupKey);
      group.competitors.set(record.Competitor.name, {
        name: record.Competitor.name,
        domain: record.Competitor.domain,
        avgPrice: Number(record.averagePrice),
        minPrice: Number(record.minPrice || record.averagePrice),
        maxPrice: Number(record.maxPrice || record.averagePrice),
        productCount: record.productCount,
      });
      group.totalProducts += record.productCount;
    }
    
    // Calculate averages and convert to array
    for (const [period, group] of groups) {
      const competitorData = Array.from(group.competitors.values());
      const totalPrice = competitorData.reduce((sum, c) => sum + c.avgPrice, 0);
      
      group.avgPrice = competitorData.length > 0 ? totalPrice / competitorData.length : 0;
      group.minPrice = competitorData.length > 0 ? Math.min(...competitorData.map(c => c.minPrice)) : 0;
      group.maxPrice = competitorData.length > 0 ? Math.max(...competitorData.map(c => c.maxPrice)) : 0;
      group.competitors = competitorData;
      
      trends.push(group);
    }
    
    trends.sort((a, b) => a.period.localeCompare(b.period));
    
    return {
      success: true,
      trends,
      period: params.groupBy,
      totalPeriods: trends.length,
      message: `Analyzed pricing trends over ${trends.length} ${params.groupBy} periods`,
    };
  },
};

/**
 * Suggest price changes tool - REQUIRES APPROVAL
 */
export const suggestPriceChangesTool = {
  name: "suggestPriceChanges",
  description: "Suggest price changes based on competitor analysis. This requires user approval.",
  parameters: z.object({
    productIds: z.array(z.string()).describe("Product IDs to suggest changes for"),
    strategy: z.enum(["COMPETITIVE", "PREMIUM", "BUDGET", "MATCH_LOWEST"]).describe("Pricing strategy to apply"),
    maxChangePercent: z.number().optional().default(20).describe("Maximum percentage change allowed"),
    reason: z.string().optional().describe("Reason for the price changes"),
  }),
  execute: async (params: {
    productIds: string[];
    strategy: "COMPETITIVE" | "PREMIUM" | "BUDGET" | "MATCH_LOWEST";
    maxChangePercent?: number;
    reason?: string;
  }) => {
    const { userRole } = await getPrismaContext();
    requireProductModification(userRole);
    
    // Get current product prices and competitor data
    const { prisma } = await getPrismaContext();
    
    const products = await prisma.products.findMany({
      where: { product_id: { in: params.productIds } },
      select: {
        product_id: true,
        product_title: true,
        product_sku: true,
        product_original_price: true,
        product_discount_price: true,
        product_currency: true,
      },
    });
    
    if (products.length === 0) {
      return {
        success: false,
        error: "No products found with the provided IDs",
      };
    }
    
    // Get recent competitor pricing for these products
    const priceComparisons = await prisma.competitorPriceComparison.findMany({
      where: {
        productId: { in: params.productIds },
        priceDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        deletedAt: null,
      },
      include: {
        competitor: {
          select: { name: true, domain: true },
        },
      },
    });
    
    // Group by product and calculate suggestions
    const suggestions: any[] = [];
    const productGroups = new Map();
    
    for (const comparison of priceComparisons) {
      if (!comparison.productId) continue;
      
      if (!productGroups.has(comparison.productId)) {
        productGroups.set(comparison.productId, {
          productId: comparison.productId,
          competitorPrices: [],
        });
      }
      
      productGroups.get(comparison.productId).competitorPrices.push({
        competitorName: comparison.competitor.name,
        price: Number(comparison.competitorPrice),
      });
    }
    
    for (const product of products) {
      const currentPrice = Number(product.product_discount_price || product.product_original_price || 0);
      const productGroup = productGroups.get(product.product_id);
      
      if (!productGroup || productGroup.competitorPrices.length === 0) {
        suggestions.push({
          productId: product.product_id,
          productName: product.product_title,
          productSku: product.product_sku,
          currentPrice,
          suggestedPrice: currentPrice,
          changePercent: 0,
          reason: "No competitor data available",
          strategy: params.strategy,
        });
        continue;
      }
      
      const competitorPrices = productGroup.competitorPrices.map((p: any) => p.price);
      const avgCompetitorPrice = competitorPrices.reduce((sum: number, p: number) => sum + p, 0) / competitorPrices.length;
      const minCompetitorPrice = Math.min(...competitorPrices);
      const maxCompetitorPrice = Math.max(...competitorPrices);
      
      let suggestedPrice = currentPrice;
      let reason = "";
      
      switch (params.strategy) {
        case "COMPETITIVE":
          suggestedPrice = avgCompetitorPrice;
          reason = `Match average competitor price (${avgCompetitorPrice.toFixed(2)})`;
          break;
        case "PREMIUM":
          suggestedPrice = maxCompetitorPrice * 1.1;
          reason = `Set 10% above highest competitor (${maxCompetitorPrice.toFixed(2)})`;
          break;
        case "BUDGET":
          suggestedPrice = minCompetitorPrice * 0.9;
          reason = `Set 10% below lowest competitor (${minCompetitorPrice.toFixed(2)})`;
          break;
        case "MATCH_LOWEST":
          suggestedPrice = minCompetitorPrice;
          reason = `Match lowest competitor price (${minCompetitorPrice.toFixed(2)})`;
          break;
      }
      
      // Apply max change limit
      const changePercent = ((suggestedPrice - currentPrice) / currentPrice) * 100;
      const maxChange = (params.maxChangePercent || 20) / 100;
      
      if (Math.abs(changePercent) > (params.maxChangePercent || 20)) {
        if (changePercent > 0) {
          suggestedPrice = currentPrice * (1 + maxChange);
        } else {
          suggestedPrice = currentPrice * (1 - maxChange);
        }
        reason += ` (limited to ${params.maxChangePercent || 20}% change)`;
      }
      
      suggestions.push({
        productId: product.product_id,
        productName: product.product_title,
        productSku: product.product_sku,
        currentPrice,
        suggestedPrice: Number(suggestedPrice.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        reason,
        strategy: params.strategy,
        competitorData: {
          avgPrice: Number(avgCompetitorPrice.toFixed(2)),
          minPrice: Number(minCompetitorPrice.toFixed(2)),
          maxPrice: Number(maxCompetitorPrice.toFixed(2)),
          competitorCount: competitorPrices.length,
        },
      });
    }
    
    return {
      success: true,
      requiresApproval: true,
      action: "SUGGEST_PRICE_CHANGES",
      data: {
        suggestions,
        strategy: params.strategy,
        reason: params.reason,
        maxChangePercent: params.maxChangePercent,
      },
      preview: `Suggest price changes for ${suggestions.length} products using ${params.strategy} strategy`,
      message: `I need approval to suggest price changes for ${suggestions.length} products`,
    };
  },
};

/**
 * Update product prices tool - REQUIRES APPROVAL
 */
export const updateProductPricesTool = {
  name: "updateProductPrices",
  description: "Update product prices based on approved suggestions. This requires user approval.",
  parameters: z.object({
    updates: z.array(z.object({
      productId: z.string().describe("Product ID to update"),
      newPrice: z.number().describe("New price to set"),
      updateOriginalPrice: z.boolean().optional().default(false).describe("Whether to update original price or discount price"),
      reason: z.string().describe("Reason for the price change"),
    })).describe("List of price updates to apply"),
    batchId: z.string().optional().describe("Optional batch ID for tracking"),
  }),
  execute: async (params: {
    updates: Array<{
      productId: string;
      newPrice: number;
      updateOriginalPrice?: boolean;
      reason: string;
    }>;
    batchId?: string;
  }) => {
    const { userRole } = await getPrismaContext();
    requireProductModification(userRole);
    
    // Get current product data for preview
    const { prisma } = await getPrismaContext();
    
    const productIds = params.updates.map(u => u.productId);
    const products = await prisma.products.findMany({
      where: { product_id: { in: productIds } },
      select: {
        product_id: true,
        product_title: true,
        product_sku: true,
        product_original_price: true,
        product_discount_price: true,
        product_currency: true,
      },
    });
    
    const productMap = new Map(products.map(p => [p.product_id, p]));
    
    // Prepare update preview
    const updatePreview = params.updates.map(update => {
      const product = productMap.get(update.productId);
      if (!product) {
        return {
          productId: update.productId,
          error: "Product not found",
        };
      }
      
      const currentPrice = Number(update.updateOriginalPrice ? 
        product.product_original_price : 
        product.product_discount_price || product.product_original_price || 0
      );
      
      const changePercent = ((update.newPrice - currentPrice) / currentPrice) * 100;
      
      return {
        productId: update.productId,
        productName: product.product_title,
        productSku: product.product_sku,
        currentPrice,
        newPrice: update.newPrice,
        changePercent: Number(changePercent.toFixed(2)),
        reason: update.reason,
        updateOriginalPrice: update.updateOriginalPrice,
      };
    });
    
    const totalValueChange = updatePreview.reduce((sum, u) => {
      if (u.error) return sum;
      return sum + (u.newPrice - u.currentPrice);
    }, 0);
    
    return {
      success: true,
      requiresApproval: true,
      action: "UPDATE_PRODUCT_PRICES",
      data: {
        updates: params.updates,
        batchId: params.batchId,
      },
      preview: updatePreview,
      summary: {
        totalProducts: updatePreview.length,
        totalValueChange: Number(totalValueChange.toFixed(2)),
        avgChangePercent: updatePreview.length > 0 ? 
          updatePreview.reduce((sum, u) => sum + (u.changePercent || 0), 0) / updatePreview.length : 0,
      },
      message: `I need approval to update prices for ${updatePreview.length} products`,
    };
  },
};

/**
 * All pricing tools exported as array for easy registration
 */
export const pricingTools = [
  analyzePriceGapsTool,
  getPricingTrendsTool,
  suggestPriceChangesTool,
  updateProductPricesTool,
];
