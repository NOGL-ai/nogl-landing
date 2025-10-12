import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { ChatRequestSchema } from "@/types/copilot";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/security";
import { mastra, selectAgent } from "@/mastra";

export const maxDuration = 30;

// Initialize rate limiter (20 requests per minute per user)
const limiter = rateLimit({
  interval: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"),
  uniqueTokenPerInterval: 500,
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. Authentication
    const session = await getAuthSession();
    const userId = session?.user?.email || req.headers.get("x-forwarded-for") || "anonymous";
    
    // 2. Rate Limiting
    try {
      await limiter.check(
        req,
        parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "20"),
        userId
      );
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": "60"
          }
        }
      );
    }
    
    // 3. Request Validation
    const body = await req.json();
    const validationResult = ChatRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid request format",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }
    
    const { messages } = validationResult.data;
    
    // 4. Input Sanitization
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content
      .filter((c) => c.type === "text")
      .map((c) => sanitizeInput(c.text || ""))
      .join("\n");
    
    // Validate message length
    if (userMessage.length > 4000) {
      return NextResponse.json(
        { error: "Message too long. Maximum 4000 characters." },
        { status: 400 }
      );
    }
    
    // 5. Select appropriate Mastra agent
    const agentName = selectAgent(userMessage);
    const agent = mastra.getAgent(agentName);
    
    if (!agent) {
      console.error(`Agent '${agentName}' not found`);
      return NextResponse.json(
        { error: "AI service temporarily unavailable" },
        { status: 503 }
      );
    }
    
    // 6. Convert messages to Mastra format
    const mastraMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("\n"),
    }));
    
    // 7. Stream response using Mastra agent
    try {
      const result = await agent.stream(mastraMessages);
      
      const duration = Date.now() - startTime;
      
      // Log analytics (non-blocking)
      if (process.env.ENABLE_COPILOT_ANALYTICS === "true") {
        logAnalytics({
          event: "copilot_message",
          userId,
          messageLength: userMessage.length,
          duration,
          streaming: true,
          agent: agentName,
        }).catch(console.error);
      }
      
      // Return Mastra's streaming response
      return result.toDataStreamResponse();
      
    } catch (agentError: any) {
      console.error("Mastra agent error:", {
        agent: agentName,
        error: agentError.message,
        stack: agentError.stack,
      });
      
      return NextResponse.json(
        { 
          error: "AI service error. Please try again.",
          retryable: true
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Log error
    console.error("Copilot API error:", {
      error: error.message,
      stack: error.stack,
      duration,
    });
    
    // Log error analytics
    if (process.env.ENABLE_COPILOT_ANALYTICS === "true") {
      logAnalytics({
        event: "copilot_error",
        error: error.message,
        duration,
      }).catch(console.error);
    }
    
    // Handle specific error types
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      return NextResponse.json(
        { 
          error: "Request timeout. Please try again.",
          retryable: true
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "An unexpected error occurred. Please try again.",
        retryable: true
      },
      { status: 500 }
    );
  }
}

// Analytics helper (async, non-blocking)
async function logAnalytics(data: any) {
  // Implement your analytics service (PostHog, Mixpanel, etc.)
  // Example:
  // await fetch("/api/analytics", {
  //   method: "POST",
  //   body: JSON.stringify(data),
  // });
  console.log("[Analytics]", data);
}

