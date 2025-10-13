import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { ChatRequestSchema } from "@/types/copilot";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/security";
import { mastra, selectAgent } from "@/mastra";
// AI SDK imports removed - using Mastra's built-in streaming

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
    
    // 3. Request Validation - Accept AI SDK v5 format directly
    const body = await req.json();
    
    // Debug logging to see what we're receiving
    console.log('[API-DEBUG] Received request body:', JSON.stringify(body, null, 2));
    
    // Accept AI SDK v5 format messages directly
    const messages = body.messages;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { 
          error: "Invalid request format - missing messages array"
        },
        { status: 400 }
      );
    }
    
    // 4. Input Sanitization
    const lastMessage = messages[messages.length - 1];
    let userMessage;
    
    // Handle AI SDK v5 format where content is a string
    if (typeof lastMessage.content === 'string') {
      userMessage = sanitizeInput(lastMessage.content);
    } else if (Array.isArray(lastMessage.content)) {
      // Handle legacy format where content is an array
      userMessage = lastMessage.content
        .filter((c: any) => c.type === "text")
        .map((c: any) => sanitizeInput(c.text || ""))
        .join("\n");
    } else {
      userMessage = sanitizeInput(String(lastMessage.content || ''));
    }
    
    // Validate message length
    if (userMessage.length > 4000) {
      return NextResponse.json(
        { error: "Message too long. Maximum 4000 characters." },
        { status: 400 }
      );
    }
    
    // 5. Select appropriate Mastra agent
    const agentName = selectAgent(userMessage);
    const agent = mastra.getAgent(agentName as "competitorAnalyst" | "dataManager" | "pricingStrategist");
    
    if (!agent) {
      console.error(`Agent '${agentName}' not found`);
      return NextResponse.json(
        { error: "AI service temporarily unavailable" },
        { status: 503 }
      );
    }
    
    // 6. Stream response using Mastra agent with proper UI stream format
    try {
      const stream = await agent.stream(messages as any, {    
        format: "aisdk",
        maxSteps: 10,
        modelSettings: {},
        onError: ({ error }: { error: any }) => {
          console.error("Mastra stream onError", error);
        },
      });

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
      
      // Return proper UI message stream response
      return stream.toUIMessageStreamResponse();
      
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

