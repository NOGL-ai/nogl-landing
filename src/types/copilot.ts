import { z } from "zod";

// Message types
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    duration?: number;
  };
}

// API Request/Response schemas with Zod validation
export const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.array(z.object({
      type: z.enum(["text", "tool-call", "tool-result"]),
      text: z.string().optional(),
    })),
  })),
  conversationId: z.string().optional(),
  userId: z.string().optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatResponseSchema = z.object({
  text: z.string(),
  metadata: z.object({
    model: z.string().optional(),
    tokens: z.number().optional(),
    duration: z.number().optional(),
  }).optional(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

// Error types
export interface CopilotError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

