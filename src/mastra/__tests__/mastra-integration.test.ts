/**
 * Mastra Integration Tests
 * 
 * Basic tests to verify Mastra agents and tools are working correctly.
 */

import { mastra, selectAgent, healthCheck } from "../index";

describe("Mastra Integration", () => {
  test("should initialize Mastra instance", () => {
    expect(mastra).toBeDefined();
    expect(mastra.agents).toBeDefined();
  });

  test("should have all required agents", () => {
    const agentNames = Object.keys(mastra.agents);
    expect(agentNames).toContain("competitorAnalyst");
    expect(agentNames).toContain("dataManager");
    expect(agentNames).toContain("pricingStrategist");
  });

  test("should select correct agent based on message", () => {
    expect(selectAgent("Show me competitors")).toBe("competitorAnalyst");
    expect(selectAgent("Create a new competitor")).toBe("dataManager");
    expect(selectAgent("Analyze pricing trends")).toBe("pricingStrategist");
    expect(selectAgent("Update product prices")).toBe("dataManager");
    expect(selectAgent("Send an email")).toBe("dataManager");
  });

  test("should pass health check", async () => {
    const health = await healthCheck();
    expect(health.status).toBe("healthy");
    expect(health.agents).toBe(3);
    expect(health.agentNames).toContain("competitorAnalyst");
  });

  test("should get agent by name", () => {
    const competitorAgent = mastra.getAgent("competitorAnalyst");
    expect(competitorAgent).toBeDefined();
    expect(competitorAgent.name).toBe("competitor-analyst");
  });

  test("should throw error for invalid agent", () => {
    expect(() => mastra.getAgent("invalidAgent")).toThrow();
  });
});

