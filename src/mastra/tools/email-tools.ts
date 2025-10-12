/**
 * Email Tools with HITL (Human-in-the-Loop)
 * 
 * These tools enable agents to compose and send emails with user approval.
 * All email sending requires explicit user confirmation.
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getPrismaContext, requireEmailSending } from "../utils/prisma-context";

/**
 * Send competitor analysis email tool - REQUIRES APPROVAL
 */
export const sendCompetitorEmailTool = createTool({
  id: "sendCompetitorEmail",
  description: "Send a competitor analysis email to stakeholders. This requires user approval.",
  inputSchema: z.object({
    to: z.string().email().describe("Recipient email address"),
    cc: z.array(z.string().email()).optional().describe("CC recipients"),
    bcc: z.array(z.string().email()).optional().describe("BCC recipients"),
    subject: z.string().min(1).describe("Email subject line"),
    body: z.string().min(1).describe("Email body content (HTML supported)"),
    attachments: z.array(z.string()).optional().describe("Attachment URLs or file paths"),
    priority: z.enum(["low", "normal", "high"]).optional().default("normal").describe("Email priority"),
    competitorIds: z.array(z.string()).optional().describe("Competitor IDs referenced in the email"),
    includeCharts: z.boolean().optional().default(false).describe("Whether to include pricing charts"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    requiresApproval: z.boolean().optional(),
    action: z.string().optional(),
    data: z.any().optional(),
    preview: z.any().optional(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const params = context;
    const { userRole, userId } = await getPrismaContext();
    requireEmailSending(userRole);
    
    // Get competitor data for preview if referenced
    let competitorData: any[] = [];
    if (params.competitorIds && params.competitorIds.length > 0) {
      const { prisma } = await getPrismaContext();
      competitorData = await prisma.competitor.findMany({
        where: { id: { in: params.competitorIds } },
        select: {
          id: true,
          name: true,
          domain: true,
          status: true,
          productCount: true,
          marketPosition: true,
          marketShare: true,
        },
      });
    }
    
    // Prepare email preview
    const emailPreview = {
      to: params.to,
      cc: params.cc || [],
      bcc: params.bcc || [],
      subject: params.subject,
      body: params.body,
      attachments: params.attachments || [],
      priority: params.priority,
      competitorData,
      includeCharts: params.includeCharts,
      from: userId, // Will be replaced with actual sender
      timestamp: new Date().toISOString(),
    };
    
    return {
      success: true,
      requiresApproval: true,
      action: "SEND_EMAIL",
      data: {
        ...params,
        userId,
        competitorIds: params.competitorIds,
      },
      preview: emailPreview,
      message: `I need approval to send an email to ${params.to} about competitor analysis`,
    };
  },
});

/**
 * Send pricing report email tool - REQUIRES APPROVAL
 */
export const sendPricingReportTool = createTool({
  id: "sendPricingReport",
  description: "Send a pricing analysis report to stakeholders. This requires user approval.",
  inputSchema: z.object({
    to: z.string().email().describe("Recipient email address"),
    cc: z.array(z.string().email()).optional().describe("CC recipients"),
    bcc: z.array(z.string().email()).optional().describe("BCC recipients"),
    reportType: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "CUSTOM"]).describe("Type of pricing report"),
    productIds: z.array(z.string()).optional().describe("Specific product IDs to include in report"),
    competitorIds: z.array(z.string()).optional().describe("Specific competitor IDs to include"),
    includeRecommendations: z.boolean().optional().default(true).describe("Whether to include pricing recommendations"),
    includeCharts: z.boolean().optional().default(true).describe("Whether to include pricing charts"),
    customMessage: z.string().optional().describe("Custom message to include in the email"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    requiresApproval: z.boolean().optional(),
    action: z.string().optional(),
    data: z.any().optional(),
    preview: z.any().optional(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const params = context;
    const { userRole, userId } = await getPrismaContext();
    requireEmailSending(userRole);
    
    // Generate report data for preview
    const { prisma } = await getPrismaContext();
    
    // Get date range based on report type
    let days = 7;
    switch (params.reportType) {
      case "WEEKLY":
        days = 7;
        break;
      case "MONTHLY":
        days = 30;
        break;
      case "QUARTERLY":
        days = 90;
        break;
      case "CUSTOM":
        days = 30; // Default for custom
        break;
    }
    
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Get pricing data for the report
    const priceComparisons = await prisma.competitorPriceComparison.findMany({
      where: {
        priceDate: { gte: cutoffDate },
        deletedAt: null,
        ...(params.productIds && { productId: { in: params.productIds } }),
        ...(params.competitorIds && { competitorId: { in: params.competitorIds } }),
      },
      include: {
        competitor: {
          select: { name: true, domain: true },
        },
      },
      orderBy: { priceDate: "desc" },
    });
    
    // Generate report summary
    const reportSummary = {
      period: params.reportType,
      days,
      totalComparisons: priceComparisons.length,
      uniqueProducts: new Set(priceComparisons.map(p => p.productId)).size,
      uniqueCompetitors: new Set(priceComparisons.map(p => p.competitorId)).size,
      avgPriceDiff: priceComparisons.length > 0 ? 
        priceComparisons.reduce((sum, p) => sum + Number(p.priceDiff || 0), 0) / priceComparisons.length : 0,
      winningCount: priceComparisons.filter(p => p.isWinning).length,
      losingCount: priceComparisons.filter(p => !p.isWinning).length,
    };
    
    // Generate subject and body
    const subject = `${params.reportType} Pricing Report - ${new Date().toLocaleDateString()}`;
    const body = `
      <h2>${params.reportType} Pricing Analysis Report</h2>
      <p><strong>Report Period:</strong> ${days} days ending ${new Date().toLocaleDateString()}</p>
      
      <h3>Summary</h3>
      <ul>
        <li>Total price comparisons: ${reportSummary.totalComparisons}</li>
        <li>Unique products analyzed: ${reportSummary.uniqueProducts}</li>
        <li>Competitors included: ${reportSummary.uniqueCompetitors}</li>
        <li>Average price difference: ${reportSummary.avgPriceDiff.toFixed(2)}%</li>
        <li>Winning positions: ${reportSummary.winningCount}</li>
        <li>Losing positions: ${reportSummary.losingCount}</li>
      </ul>
      
      ${params.customMessage ? `<p><strong>Note:</strong> ${params.customMessage}</p>` : ""}
      
      ${params.includeRecommendations ? `
        <h3>Recommendations</h3>
        <p>Based on the analysis, consider reviewing pricing for products with significant price gaps.</p>
      ` : ""}
      
      <p>This report was generated automatically by the pricing analysis system.</p>
    `;
    
    const emailPreview = {
      to: params.to,
      cc: params.cc || [],
      bcc: params.bcc || [],
      subject,
      body,
      attachments: [],
      priority: "normal" as const,
      reportSummary,
      includeCharts: params.includeCharts,
      from: userId,
      timestamp: new Date().toISOString(),
    };
    
    return {
      success: true,
      requiresApproval: true,
      action: "SEND_PRICING_REPORT",
      data: {
        ...params,
        userId,
        reportSummary,
        subject,
        body,
      },
      preview: emailPreview,
      message: `I need approval to send a ${params.reportType} pricing report to ${params.to}`,
    };
  },
});

/**
 * Send alert email tool - REQUIRES APPROVAL
 */
export const sendAlertEmailTool = createTool({
  id: "sendAlertEmail",
  description: "Send an alert email about significant pricing changes or market events. This requires user approval.",
  inputSchema: z.object({
    to: z.string().email().describe("Recipient email address"),
    cc: z.array(z.string().email()).optional().describe("CC recipients"),
    bcc: z.array(z.string().email()).optional().describe("BCC recipients"),
    alertType: z.enum(["PRICE_CHANGE", "COMPETITOR_ACTIVITY", "MARKET_SHIFT", "SYSTEM_ALERT"]).describe("Type of alert"),
    severity: z.enum(["low", "medium", "high", "critical"]).describe("Alert severity level"),
    title: z.string().min(1).describe("Alert title"),
    description: z.string().min(1).describe("Detailed alert description"),
    affectedProducts: z.array(z.string()).optional().describe("Product IDs affected by this alert"),
    affectedCompetitors: z.array(z.string()).optional().describe("Competitor IDs related to this alert"),
    actionRequired: z.boolean().optional().default(false).describe("Whether immediate action is required"),
    suggestedActions: z.array(z.string()).optional().describe("Suggested actions to take"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    requiresApproval: z.boolean().optional(),
    action: z.string().optional(),
    data: z.any().optional(),
    preview: z.any().optional(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const params = context;
    const { userRole, userId } = await getPrismaContext();
    requireEmailSending(userRole);
    
    // Get affected data for preview
    let productData: any[] = [];
    let competitorData: any[] = [];
    
    if (params.affectedProducts && params.affectedProducts.length > 0) {
      const { prisma } = await getPrismaContext();
      productData = await prisma.products.findMany({
        where: { product_id: { in: params.affectedProducts } },
        select: {
          product_id: true,
          product_title: true,
          product_sku: true,
          product_original_price: true,
          product_discount_price: true,
        },
      });
    }
    
    if (params.affectedCompetitors && params.affectedCompetitors.length > 0) {
      const { prisma } = await getPrismaContext();
      competitorData = await prisma.competitor.findMany({
        where: { id: { in: params.affectedCompetitors } },
        select: {
          id: true,
          name: true,
          domain: true,
          status: true,
        },
      });
    }
    
    // Generate subject based on severity
    const severityPrefix = {
      low: "[INFO]",
      medium: "[NOTICE]",
      high: "[WARNING]",
      critical: "[URGENT]",
    }[params.severity];
    
    const subject = `${severityPrefix} ${params.title}`;
    
    // Generate body
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: ${params.severity === 'critical' ? '#d32f2f' : params.severity === 'high' ? '#f57c00' : '#1976d2'};">
          ${params.title}
        </h2>
        
        <p><strong>Alert Type:</strong> ${params.alertType.replace('_', ' ')}</p>
        <p><strong>Severity:</strong> ${params.severity.toUpperCase()}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        
        <h3>Description</h3>
        <p>${params.description}</p>
        
        ${productData.length > 0 ? `
          <h3>Affected Products (${productData.length})</h3>
          <ul>
            ${productData.map(p => `<li>${p.product_title} (${p.product_sku})</li>`).join('')}
          </ul>
        ` : ''}
        
        ${competitorData.length > 0 ? `
          <h3>Related Competitors (${competitorData.length})</h3>
          <ul>
            ${competitorData.map(c => `<li>${c.name} (${c.domain})</li>`).join('')}
          </ul>
        ` : ''}
        
        ${params.actionRequired ? `
          <div style="background-color: #ffebee; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0;">
            <h3 style="color: #d32f2f; margin-top: 0;">Action Required</h3>
            <p>This alert requires immediate attention and action.</p>
          </div>
        ` : ''}
        
        ${params.suggestedActions && params.suggestedActions.length > 0 ? `
          <h3>Suggested Actions</h3>
          <ul>
            ${params.suggestedActions.map(action => `<li>${action}</li>`).join('')}
          </ul>
        ` : ''}
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
        <p style="color: #666; font-size: 12px;">
          This alert was generated automatically by the pricing monitoring system.
        </p>
      </div>
    `;
    
    const emailPreview = {
      to: params.to,
      cc: params.cc || [],
      bcc: params.bcc || [],
      subject,
      body,
      attachments: [],
      priority: params.severity === 'critical' ? 'high' : 'normal' as const,
      alertType: params.alertType,
      severity: params.severity,
      productData,
      competitorData,
      actionRequired: params.actionRequired,
      from: userId,
      timestamp: new Date().toISOString(),
    };
    
    return {
      success: true,
      requiresApproval: true,
      action: "SEND_ALERT_EMAIL",
      data: {
        ...params,
        userId,
        subject,
        body,
      },
      preview: emailPreview,
      message: `I need approval to send a ${params.severity} alert email to ${params.to}`,
    };
  },
});

/**
 * All email tools exported as named object for agent registration
 */
export const emailTools = {
  sendCompetitorEmail: sendCompetitorEmailTool,
  sendPricingReport: sendPricingReportTool,
  sendAlertEmail: sendAlertEmailTool,
};
