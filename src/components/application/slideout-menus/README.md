# Copilot Slideout Menu Component

A responsive AI copilot slideout menu component that provides users with quick access to AI-powered features and interactions.

## Features

- ✨ **Responsive Design**: Optimized for both desktop and mobile devices
- 🎨 **Theme Aware**: Fully supports light and dark modes
- ♿ **Accessible**: Built with ARIA labels and keyboard navigation support
- 🎯 **Customizable**: Multiple trigger variants and callback handlers
- 📱 **Mobile Optimized**: Background overlay and touch-friendly interactions

## Components

### CopilotSlideout

The main copilot slideout panel component.

**Props:**
- `userName` (string, optional): User's display name (default: "Olivia")
- `userAvatar` (string, optional): URL to user's avatar image
- `onPromptClick` (function, optional): Callback when a prompt badge is clicked
- `onMessageSend` (function, optional): Callback when a message is sent

### CopilotTrigger

A flexible trigger button component for opening the copilot.

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

A client-side wrapper for use in server components (like app layouts).

**Props:**
- `userName` (string, optional): User's display name
- `userAvatar` (string, optional): URL to user's avatar image

## Usage

### Basic Usage (Already Implemented)

The copilot is already integrated into the app layout and available on all `(app)` pages:

```tsx
// src/app/(site)/[lang]/(app)/layout.tsx
import { CopilotLayoutWrapper } from "@/components/application/slideout-menus/copilot-layout-wrapper";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    // ... auth logic
    
    return (
        <SidebarLayout user={user} className="bg-background">
            {children}
            <CopilotLayoutWrapper 
                userName={user.name}
                userAvatar={user.avatar}
            />
        </SidebarLayout>
    );
}
```

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

## Keyboard Support

- **Cmd/Ctrl + Enter**: Send message (when textarea is focused)
- **Escape**: Close copilot
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
        body: JSON.stringify({ message }),
    });
    // Handle response
};
```

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
