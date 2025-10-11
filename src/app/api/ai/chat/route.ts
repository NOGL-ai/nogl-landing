import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { ChatRequestSchema } from "@/types/copilot";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/security";

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
    
    // 5. n8n Webhook Configuration
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      console.error("N8N_WEBHOOK_URL not configured");
      return NextResponse.json(
        { error: "AI service temporarily unavailable" },
        { status: 503 }
      );
    }
    
    // 6. Call n8n Workflow
    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_API_KEY && {
          "Authorization": `Bearer ${process.env.N8N_API_KEY}`
        }),
      },
      body: JSON.stringify({
        message: userMessage,
        conversationHistory: messages.slice(0, -1).map((m) => ({
          role: m.role,
          content: m.content
            .filter((c) => c.type === "text")
            .map((c) => c.text)
            .join("\n"),
        })),
        userId,
        timestamp: new Date().toISOString(),
        metadata: {
          userAgent: req.headers.get("user-agent"),
          referer: req.headers.get("referer"),
        },
      }),
      signal: AbortSignal.timeout(25000), // 25s timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("n8n workflow error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      return NextResponse.json(
        { 
          error: "AI service error. Please try again.",
          retryable: response.status >= 500
        },
        { status: response.status }
      );
    }
    
    const contentType = response.headers.get("content-type");
    
    // 7. Handle Streaming Response
    if (contentType?.includes("text/event-stream") || contentType?.includes("text/plain")) {
      const duration = Date.now() - startTime;
      
      // Log analytics (non-blocking)
      if (process.env.ENABLE_COPILOT_ANALYTICS === "true") {
        logAnalytics({
          event: "copilot_message",
          userId,
          messageLength: userMessage.length,
          duration,
          streaming: true,
        }).catch(console.error);
      }
      
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache, no-transform",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    
    // 8. Handle JSON Response
    const data = await response.json();
    const duration = Date.now() - startTime;
    
    // Log analytics
    if (process.env.ENABLE_COPILOT_ANALYTICS === "true") {
      logAnalytics({
        event: "copilot_message",
        userId,
        messageLength: userMessage.length,
        responseLength: data.reply?.length || 0,
        duration,
        streaming: false,
      }).catch(console.error);
    }
    
    return NextResponse.json({
      text: data.reply || data.message || data.text || "No response",
      metadata: {
        duration,
        tokens: data.tokens,
        model: data.model,
      },
    });
    
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

