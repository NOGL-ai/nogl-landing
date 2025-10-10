"use client";

import { Stars02 } from "@untitledui/icons";
import { Button } from "react-aria-components";
import { CopilotSlideout } from "./copilot-slideout";
import { cx } from "@/utils/cx";

interface CopilotTriggerProps {
    userName?: string;
    userAvatar?: string;
    onPromptClick?: (prompt: string) => void;
    onMessageSend?: (message: string) => void;
    className?: string;
    variant?: "floating" | "button" | "icon";
}

export const CopilotTrigger = ({ 
    userName, 
    userAvatar, 
    onPromptClick, 
    onMessageSend, 
    className,
    variant = "floating" 
}: CopilotTriggerProps) => {
    const renderTrigger = () => {
        if (variant === "floating") {
            return (
                <Button
                    className={cx(
                        "fixed bottom-6 right-6 z-[70] flex size-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-all duration-200 hover:bg-brand-700 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 pressed:scale-95",
                        className
                    )}
                    aria-label="Open AI Copilot"
                >
                    <Stars02 className="size-6" />
                </Button>
            );
        }

        if (variant === "button") {
            return (
                <Button
                    className={cx(
                        "flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 pressed:scale-95",
                        className
                    )}
                    aria-label="Open AI Copilot"
                >
                    <Stars02 className="size-5" />
                    <span>AI Copilot</span>
                </Button>
            );
        }

        // icon variant - matches sidebar styling
        return (
            <Button
                className={cx(
                    "flex size-10 items-center justify-center rounded-md transition-colors duration-200 hover:bg-[#fafafa] dark:hover:bg-[#252b37]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 pressed:bg-[#fafafa] dark:pressed:bg-[#252b37]",
                    className
                )}
                aria-label="Open AI Copilot"
            >
                <Stars02 className="size-5 text-[#a4a7ae] dark:text-[#717680]" />
            </Button>
        );
    };

    return (
        <CopilotSlideout
            userName={userName}
            userAvatar={userAvatar}
            onPromptClick={onPromptClick}
            onMessageSend={onMessageSend}
            trigger={renderTrigger()}
        />
    );
};
