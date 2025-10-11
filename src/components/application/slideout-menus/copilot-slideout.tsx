"use client";

import { useState, type ReactNode } from "react";
import {
    ImageUser,
    BarChart04,
    Zap,
    File02,
    Edit04,
    Stars02,
    ChevronDown,
    Microphone02,
    Attachment01,
    ItalicSquare as Square
} from "@untitledui/icons";
import { DialogTrigger } from "react-aria-components";
import { useTheme } from "next-themes";
import Image from "next/image";
import { SlideoutMenu } from "./slideout-menu";
import { BadgeWithIcon } from "@/components/base/badges/badges";
import { TextAreaBase } from "@/components/base/textarea/textarea";
import { cx } from "@/utils/cx";

interface CopilotSlideoutProps {
    userName?: string;
    userAvatar?: string;
    onPromptClick?: (prompt: string) => void;
    onMessageSend?: (message: string) => void;
    trigger: ReactNode;
}

const prompts = [
    { id: "create-image", label: "Create image", icon: ImageUser, color: "success" as const },
    { id: "analyze-data", label: "Analyze data", icon: BarChart04, color: "blue" as const },
    { id: "make-plan", label: "Make a plan", icon: Zap, color: "purple" as const },
    { id: "summarize", label: "Summarize text", icon: File02, color: "pink" as const },
    { id: "help-write", label: "Help me write", icon: Edit04, color: "orange" as const },
    { id: "more", label: "More", icon: Stars02, color: "gray" as const },
];

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

export const CopilotSlideout = ({ userName = "Olivia", userAvatar, onPromptClick, onMessageSend, trigger }: CopilotSlideoutProps) => {
    const [message, setMessage] = useState("");

    const handlePromptClick = (promptId: string, label: string) => {
        onPromptClick?.(promptId);
    };

    const handleSendMessage = () => {
        if (message.trim()) {
            onMessageSend?.(message);
            setMessage("");
        }
    };

    return (
        <DialogTrigger>
            {trigger}
            <SlideoutMenu
                className="md:pl-10"
                dialogClassName="max-w-full md:max-w-[440px] gap-0"
            >
                {({ close }) => (
                <>
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
                                    I&apos;m here to help tackle your tasks. Choose from the prompts below or tell me what you need!
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

                    {/* Content - Badge Prompts */}
                    <div className="flex w-full flex-1 flex-col gap-6 overflow-y-auto bg-white px-4 py-0 md:px-6 dark:bg-gray-950">
                        <div className="flex flex-wrap items-start justify-center gap-2">
                            {prompts.map((prompt) => (
                                <button
                                    key={prompt.id}
                                    onClick={() => handlePromptClick(prompt.id, prompt.label)}
                                    className="outline-focus-ring rounded-lg transition-transform duration-100 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2"
                                    aria-label={`${prompt.label} prompt`}
                                >
                                    <BadgeWithIcon
                                        type="color"
                                        size="lg"
                                        color={prompt.color}
                                        iconLeading={prompt.icon}
                                        className="pointer-events-none"
                                    >
                                        {prompt.label}
                                    </BadgeWithIcon>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex w-full flex-col items-center gap-3 bg-white px-4 pb-3 md:px-6 md:pb-5 dark:bg-gray-950">
                        <div className="flex h-40 w-full flex-col items-center rounded-xl border border-[#E9EAEB] bg-[#FAFAFA] dark:border-gray-700 dark:bg-gray-900">
                            {/* Textarea */}
                            <div className="flex flex-1 flex-col items-start gap-1.5 self-stretch p-0">
                                <div className="flex flex-1 flex-col items-start gap-1.5 self-stretch">
                                    <div className="relative flex flex-1 items-start gap-2 self-stretch rounded-lg border border-[#D5D7DA] bg-white p-3.5 pr-10 shadow-xs dark:border-gray-600 dark:bg-gray-950">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Message"
                                            rows={3}
                                            className="w-full flex-1 resize-none bg-transparent text-base text-[#0A0D12] outline-hidden placeholder:text-[#717680] dark:text-gray-100 dark:placeholder:text-gray-500"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        {/* Voice input button - inside textarea */}
                                        <button
                                            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-lg p-1.5 text-[#A4A7AE] outline-focus-ring transition-colors hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800 focus-visible:outline-2"
                                            aria-label="Voice input"
                                        >
                                            <Microphone02 className="size-4" />
                                        </button>
                                        {/* Resize handle */}
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-1.5 right-1.5 text-[#D5D7DA] dark:text-gray-600">
                                            <path d="M10 2L2 10" stroke="currentColor" strokeLinecap="round"/>
                                            <path d="M11 7L7 11" stroke="currentColor" strokeLinecap="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Controls */}
                            <div className="flex w-full items-center gap-3 px-3 pb-2">
                                {/* Left side - Avatar and name */}
                                <div className="flex flex-1 items-center gap-2">
                                    <button
                                        type="button"
                                        className="flex w-4 h-4 items-center justify-center rounded-full border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] overflow-hidden transition-all duration-200"
                                    >
                                        {userAvatar ? (
                                            <img
                                                src={userAvatar}
                                                alt={userName || 'User'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                                <span className="text-white text-[8px] font-medium">
                                                    {userName?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                    <div className="flex items-center gap-0.5">
                                        <span className="text-xs font-semibold text-[#535862] dark:text-gray-400">{userName}</span>
                                        <ChevronDown className="size-3 text-[#A4A7AE] dark:text-gray-500" />
                                    </div>
                                </div>

                                {/* Right side - Actions */}
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-1 text-xs font-semibold text-[#535862] outline-focus-ring transition-colors hover:text-[#414651] focus-visible:outline-2 dark:text-gray-400 dark:hover:text-gray-300">
                                        <Square className="size-4" />
                                        <span>Shortcuts</span>
                                    </button>
                                    <button className="flex items-center gap-1 text-xs font-semibold text-[#535862] outline-focus-ring transition-colors hover:text-[#414651] focus-visible:outline-2 dark:text-gray-400 dark:hover:text-gray-300">
                                        <Attachment01 className="size-4" />
                                        <span>Attach</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
                )}
            </SlideoutMenu>
        </DialogTrigger>
    );
};
