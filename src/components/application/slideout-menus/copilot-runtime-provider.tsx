/**
 * Copilot Runtime Provider for Slideout Menu
 * 
 * Provides useChatRuntime context for the slideout copilot.
 * This enables the Thread component to work with streaming AI responses.
 * 
 * Key Features:
 * - useChatRuntime with AI SDK v5 integration
 * - Direct integration with /api/ai/chat endpoint
 * - Streaming response support
 * - Error handling with user-friendly toasts
 * - Built-in attachment, speech, and feedback support
 * 
 * Architecture:
 * User Input → Thread → useChatRuntime → /api/ai/chat → Mastra Agent → AI
 * 
 * Documentation:
 * - useChatRuntime: https://www.assistant-ui.com/docs/runtimes/ai-sdk
 */

"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import type { ReactNode } from "react";
import toast from "react-hot-toast";


/**
 * Copilot Runtime Provider Component
 * 
 * Wraps slideout with useChatRuntime context.
 * Provides Thread component with AI chat capabilities.
 * 
 * Usage:
 * <CopilotRuntimeProvider>
 *   <Thread />
 * </CopilotRuntimeProvider>
 */
export function CopilotRuntimeProvider({ children }: { children: ReactNode }) {
  /**
   * Initialize useChatRuntime with AI SDK v5 integration
   * 
   * useChatRuntime automatically handles:
   * - AI SDK v5 streaming format parsing
   * - Message state management
   * - Streaming updates
   * - Loading states
   * - Error states
   * - Built-in actions (copy, retry, cancel)
   * - Tool calls and attachments
   */
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/ai/chat",
    }),
    onError: (error) => {
      console.error("[Slideout Copilot] Error:", error);
      toast.error(error.message || "Failed to get AI response");
    },
    // Note: useChatRuntime handles attachments, speech, and feedback automatically
    // through the AI SDK v5 format. Custom adapters are not needed.
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

