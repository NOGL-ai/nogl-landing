"use client";

import { useMemo } from "react";
import { useScreenContext } from "@/context/ScreenContext";

export interface SuggestionAction {
  title: string;
  label: string;
  action: string;
}

/**
 * Generate context-aware AI Copilot suggestions based on current screen data
 * 
 * Follows best practices from GitHub Copilot, VSCode Copilot, and ChatGPT:
 * - Relevance: Suggestions match available actions/data
 * - Actionable: Clear, specific prompts that drive value
 * - Fresh: Updates when user navigates or data changes
 * - Limited: 3-4 suggestions (not overwhelming)
 * - Fallback: Generic options when context is unclear
 */
export function useDynamicSuggestions(): SuggestionAction[] {
  const { availableDataTypes } = useScreenContext();
  
  // ✅ FIX: Convert to stable string key for comparison
  const dataTypesKey = useMemo(() => 
    [...availableDataTypes].sort().join(','), 
    [availableDataTypes]
  );
  
  return useMemo(() => {
    const hasPricing = availableDataTypes.includes("pricing");
    const hasCompetitors = availableDataTypes.includes("competitors");
    
    // Dashboard: Both pricing + competitor data
    if (hasPricing && hasCompetitors) {
      return [
        {
          title: "💰 Analyze pricing gaps",
          label: "vs competitors",
          action: "Which products should I reprice to increase margins based on competitor pricing?",
        },
        {
          title: "📊 Market positioning",
          label: "insights",
          action: "How do we compare against top competitors in key categories?",
        },
        {
          title: "🎯 Revenue opportunities",
          label: "to prioritize",
          action: "What are the top 5 revenue optimization opportunities I should focus on?",
        },
      ];
    }
    
    // Competitors Page: Only competitor data
    if (hasCompetitors && !hasPricing) {
      return [
        {
          title: "🔍 Competitor threats",
          label: "analysis",
          action: "Which competitors are winning on price and why?",
        },
        {
          title: "📈 Market trends",
          label: "& insights",
          action: "What pricing trends should I be aware of across competitors?",
        },
        {
          title: "⚡ Quick wins",
          label: "to capture",
          action: "Where can I undercut competitors to gain market share?",
        },
      ];
    }
    
    // Pricing Page: Only pricing data
    if (hasPricing && !hasCompetitors) {
      return [
        {
          title: "💡 Pricing optimization",
          label: "strategy",
          action: "Analyze my current pricing strategy and suggest optimizations",
        },
        {
          title: "📊 Price distribution",
          label: "analysis",
          action: "Show me the distribution of my pricing across categories",
        },
        {
          title: "🎯 Margin opportunities",
          label: "to explore",
          action: "Where can I increase prices without losing competitiveness?",
        },
      ];
    }
    
    // Fallback: Generic suggestions when no specific data available
    return [
      {
        title: "💡 Find opportunities",
        label: "to optimize",
        action: "Identify pricing opportunities where I can increase margins or gain market share",
      },
      {
        title: "🎯 Market insights",
        label: "& trends",
        action: "Provide market insights and competitive pricing recommendations for launching new products",
      },
      {
        title: "🤖 AI capabilities",
        label: "overview",
        action: "What can you help me with? Show me your capabilities.",
      },
    ];
  }, [dataTypesKey, availableDataTypes]); // Use stable string key + keep original for logic
}

