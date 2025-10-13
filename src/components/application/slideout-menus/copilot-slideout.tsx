/**
 * Copilot Slideout Component
 * 
 * Uses AssistantSidebar from @assistant-ui for proper resizable layout.
 * AssistantSidebar provides a resizable sidebar with Thread component that works
 * seamlessly with AI SDK v5 streaming format.
 * 
 * Documentation: https://www.assistant-ui.com/docs/ui/AssistantSidebar
 */

"use client";

import type { ReactNode } from "react";
import { DialogTrigger } from "react-aria-components";
import { SlideoutMenu } from "./slideout-menu";
import { AssistantSidebar } from "@/components/assistant-sidebar";
import { CopilotRuntimeProvider } from "./copilot-runtime-provider";

interface CopilotSlideoutProps {
    userName?: string;
    userAvatar?: string;
    trigger: ReactNode;
}

export const CopilotSlideout = ({ userName = "Olivia", userAvatar, trigger }: CopilotSlideoutProps) => {
    return (
        <DialogTrigger>
            {trigger}
            <SlideoutMenu
                dialogClassName="gap-0"
            >
                {({ close }) => (
                    /**
                     * Use AssistantSidebar with CopilotRuntimeProvider
                     * 
                     * AssistantSidebar provides:
                     * - Resizable sidebar layout
                     * - Built-in Thread component
                     * - AI SDK v5 integration
                     * - Custom styling to match your design
                     * 
                     * CopilotRuntimeProvider provides:
                     * - useChatRuntime for AI SDK v5 compatibility
                     * - Error handling
                     * - Runtime context
                     */
                    <CopilotRuntimeProvider>
                        <AssistantSidebar>
                            {/* Main app content - empty to let the sidebar take most space */}
                        </AssistantSidebar>
                    </CopilotRuntimeProvider>
                )}
            </SlideoutMenu>
        </DialogTrigger>
    );
};
