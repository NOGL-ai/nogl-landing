# Copilot Slideout Menu Component

A responsive AI copilot slideout menu component that provides users with quick access to AI-powered features and interactions.

## Features

- ✨ **Responsive Design**: Optimized for both desktop and mobile devices
- 🎨 **Theme Aware**: Fully supports light and dark modes
- ♿ **Accessible**: Built with ARIA labels and keyboard navigation support
- 🎯 **Customizable**: Multiple trigger variants and callback handlers
- 📱 **Mobile Optimized**: Background overlay and touch-friendly interactions
- 💾 **Conversation Persistence**: Automatically saves conversation history and draft messages
- 🔄 **Minimize/Maximize**: Minimize to a corner button without losing conversation
- 🔔 **Unread Notifications**: Shows unread message count when minimized
- ⚡ **Loading States**: Visual feedback when AI is processing
- 🚨 **Error Handling**: Clear error messages with retry functionality
- 💬 **Message History**: Full conversation display with timestamps and actions

## Components

### CopilotWithMinimize (Recommended)

The enhanced copilot component with minimize functionality, conversation persistence, and full message history.

**Props:**
- `userName` (string, optional): User's display name (default: "Olivia")
- `userAvatar` (string, optional): URL to user's avatar image
- `onPromptClick` (function, optional): Callback when a prompt badge is clicked
- `onMessageSend` (function, optional): Async callback when a message is sent
- `className` (string, optional): Additional CSS classes for the trigger button

**Features:**
- ✅ Minimize to corner button
- ✅ Conversation persistence (localStorage)
- ✅ Draft message auto-save
- ✅ Message history display
- ✅ Loading and error states
- ✅ Unread message counter
- ✅ Copy message functionality
- ✅ Clear conversation
- ✅ Retry failed messages

### CopilotSlideout (Basic)

The basic copilot slideout panel component without persistence features.

**Props:**
- `userName` (string, optional): User's display name (default: "Olivia")
- `userAvatar` (string, optional): URL to user's avatar image
- `onPromptClick` (function, optional): Callback when a prompt badge is clicked
- `onMessageSend` (function, optional): Callback when a message is sent
- `trigger` (ReactNode, required): Custom trigger element

### CopilotTrigger (Basic)

A flexible trigger button component for opening the basic copilot.

**Props:**
- `userName` (string, optional): User's display name
- `userAvatar` (string, optional): URL to user's avatar image
- `onPromptClick` (function, optional): Callback when a prompt badge is clicked
- `onMessageSend` (function, optional): Callback when a message is sent
- `className` (string, optional): Additional CSS classes
- `variant` ("floating" | "button" | "icon", default: "floating"): Trigger button style

**Variants:**
- `floating`: Fixed floating action button (bottom-right corner)
- `button`: Standard button with text and icon
- `icon`: Icon-only button

### CopilotLayoutWrapper

A client-side wrapper for use in server components (like app layouts). Now uses `CopilotWithMinimize` by default.

**Props:**
- `userName` (string, optional): User's display name
- `userAvatar` (string, optional): URL to user's avatar image

## Usage

### Basic Usage (Already Implemented) ✅

The copilot is already integrated into the app layout and available on all `(app)` pages:

```tsx
// src/app/(site)/[lang]/(app)/layout.tsx
import { CopilotLayoutWrapper } from "@/components/application/slideout-menus";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    // ... auth logic
    
    return (
        <SidebarLayout user={user} className="bg-background">
            {children}
            {/* AI Copilot - Available on all app pages */}
            <CopilotLayoutWrapper 
                userName={user.name}
                userAvatar={user.avatar}
            />
        </SidebarLayout>
    );
}
```

The copilot now includes:
- ✅ Floating button in bottom-right corner
- ✅ Minimize to button (conversation preserved)
- ✅ Automatic conversation saving
- ✅ Draft message persistence
- ✅ Unread message indicators
- ✅ Full message history
- ✅ Loading and error states

### Custom Implementation

#### Using CopilotTrigger Directly

```tsx
"use client";

import { CopilotTrigger } from "@/components/application/slideout-menus";

export default function MyPage() {
    const handlePromptClick = (promptId: string) => {
        console.log("Prompt clicked:", promptId);
        // Handle prompt click
    };

    const handleMessageSend = (message: string) => {
        console.log("Message:", message);
        // Handle message send
    };

    return (
        <div>
            {/* Floating button variant */}
            <CopilotTrigger 
                userName="John Doe"
                userAvatar="/avatar.jpg"
                variant="floating"
                onPromptClick={handlePromptClick}
                onMessageSend={handleMessageSend}
            />

            {/* Button variant */}
            <CopilotTrigger 
                variant="button"
                className="my-4"
            />

            {/* Icon variant */}
            <CopilotTrigger 
                variant="icon"
            />
        </div>
    );
}
```

#### Using DialogTrigger with CopilotSlideout

For more control over the trigger and state:

```tsx
"use client";

import { useState } from "react";
import { DialogTrigger } from "react-aria-components";
import { CopilotSlideout } from "@/components/application/slideout-menus";

export default function MyPage() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <button onClick={() => setIsOpen(true)}>
                Open Copilot
            </button>
            <CopilotSlideout 
                userName="Jane Smith"
                userAvatar="/jane.jpg"
                onPromptClick={(id) => console.log(id)}
                onMessageSend={(msg) => console.log(msg)}
            />
        </DialogTrigger>
    );
}
```

## Prompts

The copilot includes 6 pre-configured prompts:

1. **Create image** (Success/Green icon) - `id: "create-image"`
2. **Analyze data** (Blue icon) - `id: "analyze-data"`
3. **Make a plan** (Purple icon) - `id: "make-plan"`
4. **Summarize text** (Pink icon) - `id: "summarize"`
5. **Help me write** (Orange icon) - `id: "help-write"`
6. **More** (Gray icon) - `id: "more"`

## Key Features

### 1. Minimize to Button

Click the minimize button (−) in the header to collapse the copilot to a corner button:
- Conversation is preserved
- Draft message is saved
- Unread messages show a counter badge
- Click the button to expand again

### 2. Conversation Persistence

All conversations are automatically saved to localStorage:
- Survives page reloads
- Persists across sessions
- Can be cleared via "Clear conversation" button
- Works offline (until you connect AI backend)

### 3. Draft Message Auto-Save

As you type, your draft is automatically saved every 500ms:
- Prevents loss of typed content
- Restored when reopening copilot
- Cleared when message is sent

### 4. Message History

Full conversation display with:
- User messages (right-aligned, blue)
- AI messages (left-aligned, gray)
- Timestamps
- Copy message button
- Auto-scroll to latest message

### 5. Loading & Error States

- **Loading**: Animated dots indicator when AI is thinking
- **Error**: Clear error message with retry button
- **Empty**: Helpful prompts when no conversation exists

## Keyboard Support

- **Cmd/Ctrl + Enter**: Send message (when textarea is focused)
- **Escape**: Close copilot (minimizes to button)
- **Tab**: Navigate between interactive elements

## Customization

### Modifying Prompts

Edit `src/components/application/slideout-menus/copilot-slideout.tsx`:

```tsx
const prompts = [
    { id: "custom-id", label: "Custom Label", icon: YourIcon, color: "blue" as const },
    // ... more prompts
];
```

### Styling

The component uses Tailwind CSS and automatically adapts to:
- System color scheme (light/dark mode via `next-themes`)
- Responsive breakpoints (mobile/tablet/desktop)
- Custom CSS variables from your theme

### Callbacks

Implement the callback handlers in `CopilotLayoutWrapper` or your custom implementation:

```tsx
const handlePromptClick = (promptId: string) => {
    switch(promptId) {
        case "create-image":
            // Navigate to image generation page
            router.push("/image-generator");
            break;
        case "analyze-data":
            // Open data analysis tool
            // ...
            break;
        // ... handle other prompts
    }
};

const handleMessageSend = async (message: string) => {
    // Send to AI API
    const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
    });
    const data = await response.json();
    return data.reply;
};
```

## Connecting to AI Backend

The copilot UI is ready, but you need to connect it to an AI service. Here's how:

### Option 1: OpenAI ChatGPT API

1. **Create API Route** (`src/app/api/ai/chat/route.ts`):

```typescript
import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        ...conversationHistory,
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    return NextResponse.json({
      reply: completion.choices[0].message.content,
      tokens: completion.usage?.total_tokens
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
```

2. **Update Layout Wrapper**:

```typescript
const handleMessageSend = async (message: string) => {
    const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message,
            conversationHistory: messages // if you want context
        }),
    });
    
    if (!response.ok) {
        throw new Error('Failed to get AI response');
    }
    
    const data = await response.json();
    return data.reply;
};
```

3. **Add Environment Variable** (`.env.local`):

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Option 2: Anthropic Claude API

Similar setup, but use Anthropic's SDK:

```bash
npm install @anthropic-ai/sdk
```

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [{ role: "user", content: userMessage }],
});
```

### Option 3: Custom AI Service

Point to your own AI backend:

```typescript
const handleMessageSend = async (message: string) => {
    const response = await fetch('https://your-ai-backend.com/chat', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.AI_API_KEY}`
        },
        body: JSON.stringify({ message }),
    });
    
    const data = await response.json();
    return data.response;
};
```

### Streaming Responses (Advanced)

For real-time streaming responses like ChatGPT:

```typescript
export async function POST(req: NextRequest) {
  const { message } = await req.json();
  
  const stream = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: message }],
    stream: true,
  });
  
  const encoder = new TextEncoder();
  const customStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });
  
  return new Response(customStream);
}
```

### Cost & Rate Limiting

Consider implementing:

1. **Rate Limiting** (per user):
   - Use Redis or database to track usage
   - Limit messages per hour/day
   - Show limits in UI

2. **Cost Tracking**:
   - Log token usage per request
   - Show monthly costs
   - Set budget alerts

3. **Caching**:
   - Cache common responses
   - Use RAG for documentation queries
   - Reduce API calls

## Responsive Behavior

### Desktop (≥1024px)
- Width: 440px max
- Positioned on the right side
- Sliding animation from right
- Overlay with blur effect

### Mobile (<1024px)
- Full width (max 375px)
- Dark background overlay with blur
- Touch-optimized controls
- Adjusted padding and spacing

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management
- Screen reader announcements
- Semantic HTML structure

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled

## Dependencies

- `react-aria-components`: Dialog and overlay components
- `@untitledui/icons`: Icon library
- `next-themes`: Theme support
- Existing badge and avatar components from the design system

## Notes

- The copilot is only available in the `(app)` section of the application
- Make sure to handle the `onPromptClick` and `onMessageSend` callbacks for full functionality
- The component automatically uses the authenticated user's information when available
