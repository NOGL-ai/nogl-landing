"use client";
import { useEffect } from "react";
import { useAssistantRuntime } from "@assistant-ui/react";
import { tool } from "@assistant-ui/react";
import { z } from "zod";
import { useScreenContext } from "@/context/ScreenContext";

/**
 * Register screen data tools with the AI runtime
 * 
 * This hook dynamically registers tools that allow the AI to fetch
 * data currently visible on the user's screen.
 * 
 * Tools:
 * - getVisiblePricing: Fetch pricing data visible on current page
 * - getVisibleCompetitors: Fetch competitor data visible on current page
 * 
 * These tools are only available when the corresponding data types
 * are present on the current page (determined by ScreenContext).
 */
export function useScreenDataTools() {
  // ✅ FIX: Wrap in try-catch to handle when runtime isn't ready yet
  let runtime;
  try {
    runtime = useAssistantRuntime();
  } catch (error) {
    console.warn("[ScreenDataTools] Runtime not available yet, will retry on next render");
    return; // Early return if runtime not available
  }
  
  const screenContext = useScreenContext();
  
  useEffect(() => {
    // Double-check runtime is available
    if (!runtime) {
      console.warn("[ScreenDataTools] Runtime is null, skipping tool registration");
      return;
    }
    // ✅ VERIFIED: Define tools
    const getVisiblePricingTool = tool({
      description: "Fetch pricing plan data currently visible on the user's screen. Use this when user asks about pricing, plans, or costs.",
      parameters: z.object({}),  // No parameters needed
      execute: async () => {
        const data = screenContext.getData("pricing");
        if (!data) {
          return { error: "No pricing data available on current page" };
        }
        return data;
      }
    });
    
    const getVisibleCompetitorsTool = tool({
      description: "Fetch competitor analysis data currently visible on the user's screen. Use this when user asks about competitors or market analysis.",
      parameters: z.object({}),
      execute: async () => {
        const data = screenContext.getData("competitors");
        if (!data) {
          return { error: "No competitor data available on current page" };
        }
        return data;
      }
    });
    
    // ✅ VERIFIED: Register with runtime using registerModelContextProvider
    const unregister = runtime.registerModelContextProvider({
      getModelContext: () => ({
        tools: {
          getVisiblePricing: getVisiblePricingTool,
          getVisibleCompetitors: getVisibleCompetitorsTool,
        },
        priority: 10, // High priority to ensure tools are available
      })
    });
    
    // Cleanup
    return unregister;
  }, [runtime, screenContext]);
}
