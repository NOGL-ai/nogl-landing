/**
 * Copilot Layout Wrapper
 * 
 * Renders the floating copilot trigger button.
 * When clicked, opens slideout with Thread component for AI chat.
 * 
 * Integration:
 * - CopilotTrigger: Floating button
 * - CopilotSlideout: Contains Thread component
 * - CopilotRuntimeProvider: Inside slideout, provides AI integration
 * 
 * Note: onPromptClick and onMessageSend handlers are no longer needed.
 * The Thread component inside the slideout handles all interactions automatically.
 * It connects to LocalRuntime → N8n adapter → /api/ai/chat → n8n → AI
 */

"use client";

import { CopilotTrigger } from "./copilot-trigger";

interface CopilotLayoutWrapperProps {
    userName?: string;
    userAvatar?: string;
}

export const CopilotLayoutWrapper = ({ userName, userAvatar }: CopilotLayoutWrapperProps) => {
    return (
        <CopilotTrigger 
            userName={userName}
            userAvatar={userAvatar}
            variant="floating"
        />
    );
};
