"use client";

import { Stars02 } from "@untitledui/icons";
import { Button } from "react-aria-components";
import { useAssistantSidebar } from "@/components/assistant-sidebar";
import { cx } from "@/utils/cx";

interface CopilotToggleButtonProps {
    className?: string;
}

export const CopilotToggleButton = ({ className }: CopilotToggleButtonProps) => {
    const { toggleCollapse, isCollapsed, isMounted } = useAssistantSidebar();

    return (
        <Button
            onPress={toggleCollapse}
            className={cx(
                "flex size-10 items-center justify-center rounded-md transition-colors duration-200 hover:bg-(--color-gray-50) dark:hover:bg-(--color-gray-800)/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 pressed:bg-(--color-gray-50) dark:pressed:bg-(--color-gray-800)",
                isMounted && isCollapsed && "bg-(--color-gray-50) dark:bg-(--color-gray-800)/50", // Highlight when collapsed (only after hydration)
                className
            )}
            aria-label="Toggle AI Copilot"
        >
            <Stars02 className="size-5 text-(--color-gray-500) dark:text-(--color-gray-400)" />
        </Button>
    );
};
