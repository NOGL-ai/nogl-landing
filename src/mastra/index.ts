/**
 * Mastra Instance Configuration
 * 
 * This is the main Mastra instance that registers all agents and their tools.
 * It provides a centralized way to access agents throughout the application.
 */

import { Mastra } from "@mastra/core";
import { competitorAnalyst } from "./agents/competitor-analyst";
import { dataManager } from "./agents/data-manager";
import { pricingStrategist } from "./agents/pricing-strategist";

/**
 * Main Mastra instance with all registered agents
 * 
 * Available agents:
 * - competitorAnalyst: Read-only competitor intelligence and analysis
 * - dataManager: HITL data operations (create, update, delete)
 * - pricingStrategist: Pricing analysis and strategic recommendations
 */
export const mastra = new Mastra({
  agents: {
    competitorAnalyst,
    dataManager,
    pricingStrategist,
  },
});

/**
 * Agent selection helper
 * 
 * Determines which agent to use based on user intent and context.
 * This can be enhanced with more sophisticated routing logic.
 */
export function selectAgent(userMessage: string, context?: any): string {
  const message = userMessage.toLowerCase();
  
  // Pricing and strategy related queries
  if (
    message.includes("price") ||
    message.includes("pricing") ||
    message.includes("cost") ||
    message.includes("strategy") ||
    message.includes("recommend") ||
    message.includes("suggest") ||
    message.includes("optimize") ||
    message.includes("margin") ||
    message.includes("revenue")
  ) {
    return "pricingStrategist";
  }
  
  // Data modification operations
  if (
    message.includes("create") ||
    message.includes("add") ||
    message.includes("update") ||
    message.includes("edit") ||
    message.includes("delete") ||
    message.includes("remove") ||
    message.includes("send") ||
    message.includes("email") ||
    message.includes("modify") ||
    message.includes("change")
  ) {
    return "dataManager";
  }
  
  // Competitor analysis and insights
  if (
    message.includes("competitor") ||
    message.includes("analysis") ||
    message.includes("compare") ||
    message.includes("market") ||
    message.includes("trend") ||
    message.includes("insight") ||
    message.includes("report") ||
    message.includes("show") ||
    message.includes("list") ||
    message.includes("find")
  ) {
    return "competitorAnalyst";
  }
  
  // Default to competitor analyst for general queries
  return "competitorAnalyst";
}

/**
 * Get agent by name with error handling
 */
export function getAgent(agentName: string) {
  const agent = mastra.getAgent(agentName);
  if (!agent) {
    throw new Error(`Agent '${agentName}' not found. Available agents: ${Object.keys(mastra.agents).join(", ")}`);
  }
  return agent;
}

/**
 * List all available agents
 */
export function listAgents() {
  return Object.keys(mastra.agents).map(name => ({
    name,
    description: getAgentDescription(name),
  }));
}

/**
 * Get agent description for UI display
 */
function getAgentDescription(agentName: string): string {
  const descriptions: Record<string, string> = {
    competitorAnalyst: "Analyzes competitor data and provides market insights (read-only)",
    dataManager: "Manages data operations with human approval (create, update, delete)",
    pricingStrategist: "Provides pricing analysis and strategic recommendations",
  };
  
  return descriptions[agentName] || "Unknown agent";
}

/**
 * Health check for Mastra instance
 */
export async function healthCheck() {
  try {
    const agents = listAgents();
    return {
      status: "healthy",
      agents: agents.length,
      agentNames: agents.map(a => a.name),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

