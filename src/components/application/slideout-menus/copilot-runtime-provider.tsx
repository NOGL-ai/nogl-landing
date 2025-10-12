/**
 * Copilot Runtime Provider for Slideout Menu
 * 
 * Provides LocalRuntime context for the slideout copilot.
 * This enables the Thread component to work with streaming AI responses.
 * 
 * Key Features:
 * - LocalRuntime with built-in state management
 * - N8n adapter for AI backend integration
 * - Streaming response support
 * - Error handling with user-friendly toasts
 * 
 * Architecture:
 * User Input → Thread → LocalRuntime → N8nAdapter → /api/ai/chat → n8n → AI
 * 
 * Documentation:
 * - LocalRuntime: https://www.assistant-ui.com/docs/runtimes/custom/local
 * - ChatModelAdapter: https://www.assistant-ui.com/docs/runtimes/chat-model-adapter
 */

"use client";

import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from "@assistant-ui/react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";

/**
 * N8n Chat Model Adapter
 * 
 * Connects LocalRuntime to n8n via /api/ai/chat endpoint.
 * 
 * How it works:
 * 1. LocalRuntime calls run() when user sends message
 * 2. Fetch /api/ai/chat (validates, rate limits, calls n8n)
 * 3. n8n returns streaming or JSON response
 * 4. Yield chunks incrementally
 * 5. LocalRuntime updates Thread UI automatically
 * 
 * Error Handling:
 * - 429: Rate limit exceeded
 * - 400: Invalid message format
 * - 500+: Service unavailable
 * - AbortError: User cancelled
 */
const N8nAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    try {
      // Call secure API endpoint with validation and rate limiting
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
        signal: abortSignal, // Enable cancellation
      });

      // Handle HTTP errors with user-friendly messages
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error("Too many requests. Please wait a moment.");
        } else if (response.status === 400) {
          throw new Error("Invalid message. Please try again.");
        } else if (response.status >= 500) {
          throw new Error("AI service unavailable. Please try again.");
        } else {
          throw new Error(errorData.error || "Failed to get response");
        }
      }

      const contentType = response.headers.get("content-type");

      // Handle streaming response (preferred for better UX)
      if (contentType?.includes("text/plain") || contentType?.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response received");
        }

        let fullText = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;

            // Yield incremental update for real-time display
            yield {
              content: [{ type: "text", text: fullText }],
            };
          }
        } catch (streamError: any) {
          if (streamError.name === "AbortError") {
            console.log("[Slideout Copilot] Stream cancelled");
            return;
          }
          throw streamError;
        }
      } else {
        // Handle JSON response (fallback)
        const data = await response.json();
        yield {
          content: [{ type: "text", text: data.text }],
        };
      }
    } catch (error: any) {
      // Handle user cancellation
      if (error.name === "AbortError") {
        console.log("[Slideout Copilot] Request cancelled");
        return;
      }

      // Log error
      console.error("[Slideout Copilot] Error:", error);

      // Show user-friendly toast
      toast.error(error.message || "Failed to get AI response");

      // Re-throw to show error in Thread UI
      throw error;
    }
  },
};

/**
 * Copilot Runtime Provider Component
 * 
 * Wraps slideout with LocalRuntime context.
 * Provides Thread component with AI chat capabilities.
 * 
 * Usage:
 * <CopilotRuntimeProvider>
 *   <Thread />
 * </CopilotRuntimeProvider>
 */
export function CopilotRuntimeProvider({ children }: { children: ReactNode }) {
  /**
   * Initialize LocalRuntime with N8n adapter and attachment support
   * 
   * LocalRuntime automatically handles:
   * - Message state management
   * - Streaming updates
   * - Loading states
   * - Error states
   * - Built-in actions (copy, retry, cancel)
   * - File attachments (with adapter)
   */
  const runtime = useLocalRuntime(N8nAdapter, {
    maxSteps: 5, // Max tool call iterations
    adapters: {
      /**
       * Attachment Adapter - UI-only file handling
       * 
       * This enables file attachment UI in the composer.
       * Files are stored in memory for display but not uploaded to backend.
       * 
       * To enable actual file uploads:
       * 1. Create /api/ai/upload endpoint
       * 2. Update this adapter to POST files to that endpoint
       * 3. Return the uploaded file URL from backend
       * 4. Include attachment data in messages sent to n8n
       * 
       * Supported file types:
       * - Images: .jpg, .jpeg, .png, .gif, .webp
       * - Documents: .pdf, .txt, .doc, .docx
       * - Other: Add to accept string below
       */
      attachments: {
        accept: "image/*,application/pdf,text/plain,.doc,.docx",
        async upload(file: File) {
          // For UI-only: Create temporary preview URL
          // File will be available for display but not sent to backend
          return {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            type: file.type,
            // Create temporary URL for preview (revoked on page refresh)
            url: URL.createObjectURL(file),
          };
        },
      },
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

