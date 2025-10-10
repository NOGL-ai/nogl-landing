"use client";

import { CopilotTrigger } from "./copilot-trigger";

interface CopilotLayoutWrapperProps {
    userName?: string;
    userAvatar?: string;
}

export const CopilotLayoutWrapper = ({ userName, userAvatar }: CopilotLayoutWrapperProps) => {
    const handlePromptClick = (promptId: string) => {
        console.log("Prompt clicked:", promptId);
        // You can add your logic here, such as:
        // - Navigate to a specific page
        // - Open a specific tool
        // - Send analytics event
    };

    const handleMessageSend = (message: string) => {
        console.log("Message sent:", message);
        // You can add your logic here, such as:
        // - Send to AI API
        // - Process the message
        // - Show response
    };

    return (
        <CopilotTrigger 
            userName={userName}
            userAvatar={userAvatar}
            variant="floating"
            onPromptClick={handlePromptClick}
            onMessageSend={handleMessageSend}
        />
    );
};
