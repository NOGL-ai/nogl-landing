/**
 * Copilot Slideout Component
 * 
 * A slideout menu with AI chat functionality using @assistant-ui/react-ui Thread component.
 * Thread provides complete chat interface with markdown, streaming, and message actions.
 * 
 * Documentation: https://www.assistant-ui.com/docs/ui/Thread
 */

"use client";

import type { ReactNode } from "react";
import { DialogTrigger } from "react-aria-components";
import { useTheme } from "next-themes";
import Image from "next/image";
import { SlideoutMenu } from "./slideout-menu";
import { Thread } from "@assistant-ui/react-ui";
import { CopilotRuntimeProvider } from "./copilot-runtime-provider";
import "@assistant-ui/react-ui/styles/index.css";

interface CopilotSlideoutProps {
    userName?: string;
    userAvatar?: string;
    trigger: ReactNode;
}

const CopilotLogo = () => {
    const { theme, resolvedTheme } = useTheme();
    const currentTheme = resolvedTheme || theme;
    
    return (
        <div className="relative flex size-14 items-center justify-center rounded-full bg-gray-100 shadow-lg dark:bg-gray-800">
            <Image
                src={currentTheme === "dark" ? "/images/logo/logo.svg" : "/images/logo/logo-light.svg"}
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
            />
    </div>
);
};

export const CopilotSlideout = ({ userName = "Olivia", userAvatar, trigger }: CopilotSlideoutProps) => {
    return (
        <DialogTrigger>
            {trigger}
            <SlideoutMenu
                className="md:pl-10"
                dialogClassName="max-w-full md:max-w-[440px] gap-0"
            >
                {({ close }) => (
                    /**
                     * Wrap slideout content with CopilotRuntimeProvider
                     * 
                     * This provides LocalRuntime context to Thread component:
                     * - Manages message state
                     * - Handles streaming responses from n8n
                     * - Provides built-in features (copy, retry, cancel)
                     */
                    <CopilotRuntimeProvider>
                        <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex w-full flex-col items-center gap-8 bg-white px-4 pb-8 pt-12 md:px-6 md:pb-8 md:pt-16 dark:bg-gray-950">
                        <div className="flex w-full flex-col items-center gap-5">
                            <CopilotLogo />

                            <div className="flex w-full flex-col items-start gap-2">
                                <h2 className="w-full text-center font-sans text-lg font-semibold text-[#717680] dark:text-gray-400">
                                    Hi {userName},
                                </h2>
                                <h3 className="w-full text-center font-sans text-lg font-semibold text-[#181D27] dark:text-gray-100">
                                    Welcome back! How can I help?
                                </h3>
                                <p className="w-full text-center font-sans text-sm font-normal text-[#535862] dark:text-gray-400">
                                            I&apos;m here to help tackle your tasks. Ask me anything!
                                </p>
                            </div>
                        </div>
                        
                        {/* Close button */}
                        <button
                            onClick={close}
                            className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-lg p-2 text-[#A4A7AE] transition-colors duration-100 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800"
                            aria-label="Close copilot"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>

                            {/**
                             * Thread Component - Main Chat Interface
                             * 
                             * Pre-built component from @assistant-ui/react-ui that provides:
                             * - Message list with markdown rendering
                             * - Composer (message input with send button)
                             * - Action bar per message (copy, retry, reload)
                             * - Streaming response display
                             * - Loading states
                             * - Error handling
                             * - Welcome screen with suggestions
                             * - Keyboard shortcuts (Ctrl/Cmd+Enter)
                             * - Accessibility (ARIA labels)
                             * 
                             * Thread automatically connects to LocalRuntime from
                             * CopilotRuntimeProvider for AI integration.
                             * 
                             * Documentation: https://www.assistant-ui.com/docs/ui/Thread
                             */}
                            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-950">
                                <Thread />
                            </div>
                        </div>
                    </CopilotRuntimeProvider>
                )}
            </SlideoutMenu>
        </DialogTrigger>
    );
};
