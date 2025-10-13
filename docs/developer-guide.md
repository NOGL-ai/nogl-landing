# Mastra HITL Developer Guide

This guide explains how to develop with the Mastra HITL system, including adding new agents, creating HITL tools, and implementing approval workflows.

## Architecture Overview

```
User Input → Thread → LocalRuntime → MastraAdapter → /api/ai/chat → Mastra Agent → AI
                                                                    ↓
                                                              HITL Approval UI
                                                                    ↓
                                                              User Approval
                                                                    ↓
                                                              /api/tools/execute
                                                                    ↓
                                                              Database/External API
```

## Project Structure

```
src/
├── mastra/
│   ├── agents/           # AI agent definitions
│   ├── tools/           # Tool definitions with HITL
│   ├── utils/           # Utilities (Prisma context, etc.)
│   └── __tests__/       # Unit tests
├── components/
│   └── tools/           # HITL UI components
├── app/
│   └── api/
│       ├── ai/chat/     # Main chat endpoint
│       └── tools/execute/ # HITL execution endpoint
└── docs/                # Documentation
```

## Adding a New Agent

### 1. Create Agent File

Create `src/mastra/agents/your-agent.ts`:

```typescript
import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { yourTool1, yourTool2 } from "../tools/your-tools";

export const yourAgent = new Agent({
  name: "your-agent",
  instructions: `
    You are a [role description]. Your primary goal is to [main objective].
    
    Key responsibilities:
    - [responsibility 1]
    - [responsibility 2]
    - [responsibility 3]
    
    IMPORTANT: For any operations that modify data or send external communications,
    you MUST use the appropriate HITL tools that require human approval.
  `,
  model: openai("gpt-4o-mini"),
  tools: {
    yourTool1,
    yourTool2,
    // Include HITL tools for data modifications
    askForPlanApproval,
    updateTodos,
  },
});
```

### 2. Register Agent

Add to `src/mastra/index.ts`:

```typescript
import { yourAgent } from "./agents/your-agent";

export const mastra = new Mastra({
  agents: {
    competitorAnalyst,
    dataManager,
    pricingStrategist,
    yourAgent, // Add here
  },
});

// Update selectAgent function
export function selectAgent(userMessage: string, context?: any): string {
  const message = userMessage.toLowerCase();
  
  // Add your agent selection logic
  if (message.includes("your-keyword")) {
    return "yourAgent";
  }
  
  // ... existing logic
}
```

## Creating HITL Tools

### 1. Define Tool

Create `src/mastra/tools/your-tools.ts`:

```typescript
import { makeAssistantTool } from "@assistant-ui/react-ai-sdk";
import { z } from "zod";
import { getPrismaContext, requireYourPermission } from "../utils/prisma-context";

export const yourHITLTool = makeAssistantTool({
  name: "yourHITLTool",
  description: "Description of what this tool does. Requires human approval.",
  input: z.object({
    // Define your input schema
    field1: z.string().describe("Description of field1"),
    field2: z.number().optional().describe("Description of field2"),
  }),
  call: async (input) => {
    // Validate permissions
    const { userRole } = await getPrismaContext();
    requireYourPermission(userRole);
    
    // Return HITL request
    return {
      requiresApproval: true,
      action: "YOUR_ACTION",
      data: input,
      reason: "Human approval required for [operation type]",
      preview: `This will [describe what will happen]`,
    };
  },
});
```

### 2. Create UI Component

Create `src/components/tools/your-approval.tsx`:

```typescript
"use client";

import { makeAssistantToolUI } from "@assistant-ui/react-ai-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export const YourApprovalUI = makeAssistantToolUI(
  yourHITLTool,
  ({ toolCall, render }) => {
    const [formData, setFormData] = useState(toolCall.args);
    const [approved, setApproved] = useState(false);

    const updateField = (field: string, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleApprove = async () => {
      try {
        const response = await fetch("/api/tools/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "YOUR_ACTION",
            data: formData,
            approved: true,
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          toolCall.stop({
            approved: true,
            data: formData,
            executionResult: result,
          });
        } else {
          throw new Error(result.message || "Failed to execute action");
        }
      } catch (error) {
        console.error("Action execution failed:", error);
        toolCall.stop({
          approved: false,
          error: error instanceof Error ? error.message : "Failed to execute action",
        });
      }
    };

    const handleReject = () => {
      toolCall.stop({
        approved: false,
        reason: "User rejected the operation",
      });
    };

    return (
      <div className="p-4 border rounded-lg shadow-sm bg-card text-card-foreground">
        <h3 className="text-lg font-semibold mb-4">Approve Your Operation</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="field1">Field 1</Label>
            <Input
              id="field1"
              value={formData.field1}
              onChange={(e) => updateField("field1", e.target.value)}
            />
          </div>
          
          {/* Add more form fields as needed */}
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleApprove} disabled={approved}>
            Approve
          </Button>
          <Button variant="outline" onClick={handleReject} disabled={approved}>
            Reject
          </Button>
        </div>
      </div>
    );
  }
);
```

### 3. Register UI Component

Add to `src/components/thread.tsx`:

```typescript
import { YourApprovalUI } from "@/components/tools/your-approval";

// In MessagePrimitive.Parts components:
tools: { 
  Fallback: ToolFallback,
  // ... existing tools
  yourHITLTool: makeAssistantToolUI(YourApprovalUI),
},
```

### 4. Add Execution Handler

Add to `src/app/api/tools/execute/route.ts`:

```typescript
// In the switch statement:
case "YOUR_ACTION":
  // Validate permissions
  requireYourPermission(userRole);
  
  // Execute your operation
  result = await yourOperation(data);
  break;
```

## Permission System

### 1. Define Permission Functions

Add to `src/mastra/utils/prisma-context.ts`:

```typescript
export function canPerformYourOperation(userRole: string): boolean {
  return ["ADMIN", "EXPERT"].includes(userRole);
}

export function requireYourPermission(userRole: string, resourceId?: string): void {
  if (!canPerformYourOperation(userRole)) {
    throw new Error("You don't have permission to perform this operation");
  }
}
```

### 2. Use in Tools

```typescript
export const yourTool = makeAssistantTool({
  // ... tool definition
  call: async (input) => {
    const { userRole } = await getPrismaContext();
    requireYourPermission(userRole);
    
    // ... tool logic
  },
});
```

## Testing HITL Tools

### 1. Unit Tests

Create `src/mastra/__tests__/your-tools.test.ts`:

```typescript
import { yourHITLTool } from "../tools/your-tools";

describe("Your HITL Tool", () => {
  test("should require approval for data modification", async () => {
    const result = await yourHITLTool.call({
      field1: "test value",
      field2: 123,
    });

    expect(result.requiresApproval).toBe(true);
    expect(result.action).toBe("YOUR_ACTION");
    expect(result.data).toEqual({
      field1: "test value",
      field2: 123,
    });
  });

  test("should validate permissions", async () => {
    // Mock user role
    jest.spyOn(require, "../utils/prisma-context").mockReturnValue({
      userRole: "USER",
    });

    await expect(yourHITLTool.call({ field1: "test" }))
      .rejects.toThrow("You don't have permission");
  });
});
```

### 2. Integration Tests

Create `src/mastra/__tests__/hitl-workflow.test.ts`:

```typescript
import { mastra } from "../index";

describe("HITL Workflow", () => {
  test("should complete full HITL workflow", async () => {
    // 1. Agent proposes action
    const agent = mastra.getAgent("yourAgent");
    const result = await agent.run([
      { role: "user", content: "Perform your operation" }
    ]);

    // 2. Verify HITL request
    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls[0].name).toBe("yourHITLTool");

    // 3. Simulate approval
    const approvalResponse = await fetch("/api/tools/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "YOUR_ACTION",
        data: { field1: "test" },
        approved: true,
      }),
    });

    const approvalResult = await approvalResponse.json();
    expect(approvalResult.success).toBe(true);
  });
});
```

## Best Practices

### Tool Design

1. **Clear descriptions** - Make tool purposes obvious
2. **Comprehensive validation** - Validate all inputs
3. **Permission checks** - Always check user permissions
4. **Error handling** - Provide meaningful error messages
5. **HITL when needed** - Use HITL for any data modifications

### UI Components

1. **User-friendly** - Make approval dialogs intuitive
2. **Editable data** - Allow users to modify proposed changes
3. **Clear actions** - Make approve/reject buttons obvious
4. **Error feedback** - Show errors clearly
5. **Loading states** - Indicate when operations are in progress

### API Design

1. **Consistent responses** - Use standard response format
2. **Proper HTTP codes** - Use appropriate status codes
3. **Error details** - Include helpful error information
4. **Validation** - Validate all inputs
5. **Logging** - Log all operations for audit

### Testing

1. **Unit tests** - Test individual tools and functions
2. **Integration tests** - Test complete workflows
3. **Permission tests** - Test role-based access
4. **Error tests** - Test error conditions
5. **E2E tests** - Test user interactions

## Common Patterns

### Data Modification Pattern

```typescript
// 1. Tool returns HITL request
return {
  requiresApproval: true,
  action: "MODIFY_DATA",
  data: input,
  reason: "Human approval required for data modification",
};

// 2. UI component allows editing
const [formData, setFormData] = useState(input);

// 3. API endpoint executes after approval
case "MODIFY_DATA":
  result = await prisma.yourModel.update({
    where: { id: data.id },
    data: data.updates,
  });
  break;
```

### Email Sending Pattern

```typescript
// 1. Tool returns HITL request
return {
  requiresApproval: true,
  action: "SEND_EMAIL",
  data: {
    to: recipients,
    subject: subject,
    body: content,
  },
  reason: "Human approval required for sending email",
};

// 2. UI component shows email preview
<div dangerouslySetInnerHTML={{ __html: formData.body }} />

// 3. API endpoint sends email
case "SEND_EMAIL":
  result = await sendEmail({
    to: data.to,
    subject: data.subject,
    html: data.body,
  });
  break;
```

## Troubleshooting

### Common Issues

**Tool not appearing in agent**
- Check tool is imported in agent file
- Verify tool is added to tools object
- Check for TypeScript errors

**UI component not rendering**
- Check component is imported in thread.tsx
- Verify tool name matches in registration
- Check for React errors in console

**Permission errors**
- Verify permission functions are defined
- Check user role is correct
- Ensure permission checks are called

**API execution fails**
- Check action case in switch statement
- Verify data format matches expected
- Check database constraints

### Debugging Tips

1. **Use console.log** - Add logging to track execution flow
2. **Check network tab** - Monitor API calls and responses
3. **Review error messages** - Look for specific error details
4. **Test permissions** - Verify user roles and permissions
5. **Validate data** - Check input data format and content

## Resources

- [Mastra Documentation](https://mastra.ai/docs)
- [Assistant UI Documentation](https://www.assistant-ui.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

