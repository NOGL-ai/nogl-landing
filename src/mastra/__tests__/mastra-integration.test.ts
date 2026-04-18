/**
 * Mastra Integration Tests
 *
 * Basic tests to verify Mastra agents and tools are working correctly.
 */

// Mock the OpenAI provider so creating agents (which call `openai("gpt-4o")`
// at module load time) doesn't require a real API key in CI.
jest.mock("@/lib/ai-config", () => {
  const stubModel = { specificationVersion: "v1", provider: "openai", modelId: "gpt-4o" };
  const openai = jest.fn(() => stubModel);
  return {
    openai,
    openaiProvider: openai,
  };
});

// Auth is pulled in transitively by the prisma context utils.
jest.mock("@/lib/auth", () => ({
  getAuthSession: jest.fn(async () => null),
}));

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

