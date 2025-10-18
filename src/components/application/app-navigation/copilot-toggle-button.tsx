"use client";

import { Stars02 } from "@untitledui/icons";
import { Button } from "react-aria-components";
import { useAssistantSidebar } from "@/components/assistant-sidebar";
import { cx } from "@/utils/cx";

interface CopilotToggleButtonProps {
    className?: string;
}

export const CopilotToggleButton = ({ className }: CopilotToggleButtonProps) => {
    const { toggleCollapse, isCollapsed } = useAssistantSidebar();

    return (
        <Button
            onPress={toggleCollapse}
            className={cx(
                "flex size-10 items-center justify-center rounded-md transition-colors duration-200 hover:bg-[#fafafa] dark:hover:bg-[#252b37]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 pressed:bg-[#fafafa] dark:pressed:bg-[#252b37]",
                isCollapsed && "bg-[#fafafa] dark:bg-[#252b37]/50", // Highlight when collapsed
                className
            )}
            aria-label="Toggle AI Copilot"
        >
            <Stars02 className="size-5 text-[#717680] dark:text-[#a4a7ae]" />
        </Button>
    );
};
