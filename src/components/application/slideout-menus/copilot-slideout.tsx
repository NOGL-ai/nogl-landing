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
import { SlideoutMenu } from "./slideout-menu";
import { BadgeWithIcon } from "@/components/base/badges/badges";
import { TextAreaBase } from "@/components/base/textarea/textarea";
import { Avatar } from "@/components/base/avatar/avatar";
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

const CopilotLogo = () => (
    <div className="flex size-14 items-center justify-center rounded-full bg-gray-950 shadow-lg dark:bg-gray-900">
        <div
            className="size-14"
            style={{
                background: `
                    radial-gradient(75% 75% at 50% 0%, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.00) 50%, rgba(255, 255, 255, 0.10) 99%, rgba(255, 255, 255, 0.00) 100%),
                    radial-gradient(43.75% 43.75% at 50% 28.75%, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.00) 100%),
                    radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0.00) 74.66%, rgba(255, 255, 255, 0.30) 100%)
                `,
            }}
        >
            <div className="flex size-full items-center justify-center">
                <svg width="30" height="38" viewBox="0 0 38 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
                    <g filter="url(#filter0_d_copilot)">
                        <path
                            d="M3.96094 18.9997C3.96094 15.7542 4.98877 12.7489 6.73669 10.2913H14.2526V11.6997C11.8695 13.2535 10.2943 15.9426 10.2943 18.9997C10.2943 23.8092 14.1931 27.708 19.0026 27.708V34.0413C10.6953 34.0413 3.96094 27.307 3.96094 18.9997Z"
                            fill="url(#paint0_linear_copilot)"
                        />
                        <path
                            d="M31.2685 27.708C33.0164 25.2505 34.0443 22.2451 34.0443 18.9997C34.0443 10.6924 27.3099 3.95801 19.0026 3.95801V10.2913C23.8121 10.2913 27.7109 14.1902 27.7109 18.9997C27.7109 22.0567 25.6357 24.7459 23.2526 26.2997V27.708H31.2685Z"
                            fill="url(#paint1_linear_copilot)"
                        />
                    </g>
                    <defs>
                        <filter id="filter0_d_copilot" x="0.794271" y="-0.791667" width="36.4166" height="44.3333" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feMorphology radius="1.58333" operator="erode" in="SourceAlpha" result="effect1_dropShadow_copilot"/>
                            <feOffset dy="2.375"/>
                            <feGaussianBlur stdDeviation="2.375"/>
                            <feComposite in2="hardAlpha" operator="out"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0.141176 0 0 0 0 0.141176 0 0 0 0 0.141176 0 0 0 0.1 0"/>
                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_copilot"/>
                            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_copilot" result="shape"/>
                        </filter>
                        <linearGradient id="paint0_linear_copilot" x1="19.0026" y1="3.95801" x2="19.0026" y2="34.0413" gradientUnits="userSpaceOnUse">
                            <stop stopColor="white" stopOpacity="0.8"/>
                            <stop offset="1" stopColor="white" stopOpacity="0.5"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear_copilot" x1="19.0026" y1="3.95801" x2="19.0026" y2="34.0413" gradientUnits="userSpaceOnUse">
                            <stop stopColor="white" stopOpacity="0.8"/>
                            <stop offset="1" stopColor="white" stopOpacity="0.5"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            {/* Reflection gradient overlay */}
            <svg width="34" height="11" viewBox="0 0 34 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-1/2 top-1.5 -translate-x-1/2">
                <path
                    d="M33.8 9.14462C33.8 13.8639 26.2783 10.8536 17 10.8536C7.72157 10.8536 0.199951 13.8639 0.199951 9.14462C0.199951 4.42534 7.72157 0.599609 17 0.599609C26.2783 0.599609 33.8 4.42534 33.8 9.14462Z"
                    fill="url(#paint0_reflection)"
                    fillOpacity="0.6"
                />
                <defs>
                    <linearGradient id="paint0_reflection" x1="17" y1="0.599609" x2="17" y2="11.7996" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white"/>
                        <stop offset="1" stopColor="white" stopOpacity="0.1"/>
                    </linearGradient>
                </defs>
            </svg>
        </div>
    </div>
);

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
                dialogClassName="max-w-full md:max-w-[440px]"
            >
                {({ close }) => (
                <>
                    {/* Header */}
                    <div className="flex w-full flex-col items-center gap-8 bg-primary px-4 pb-8 pt-12 md:px-6 md:pb-8 md:pt-16">
                        <div className="flex w-full flex-col items-center gap-5">
                            <CopilotLogo />
                            
                            <div className="flex w-full flex-col items-start gap-2">
                                <h2 className="w-full text-center font-sans text-lg font-semibold text-gray-500 dark:text-gray-400">
                                    Hi {userName},
                                </h2>
                                <h3 className="w-full text-center font-sans text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Welcome back! How can I help?
                                </h3>
                                <p className="w-full text-center font-sans text-sm font-normal text-gray-600 dark:text-gray-400">
                                    I&apos;m here to help tackle your tasks. Choose from the prompts below or tell me what you need!
                                </p>
                            </div>
                        </div>
                        
                        {/* Close button */}
                        <button
                            onClick={close}
                            className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-lg p-2 text-gray-400 transition-colors duration-100 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800"
                            aria-label="Close copilot"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>

                    {/* Content - Badge Prompts */}
                    <div className="flex w-full flex-1 flex-col gap-6 overflow-y-auto px-4 py-0 md:px-6">
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
                    <div className="flex w-full flex-col items-center gap-3 bg-primary px-4 pb-3 md:px-6 md:pb-5">
                        <div className="flex h-40 w-full flex-col items-center rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                            {/* Textarea */}
                            <div className="flex flex-1 flex-col items-start gap-1.5 self-stretch p-0">
                                <div className="flex flex-1 flex-col items-start gap-1.5 self-stretch">
                                    <div className="relative flex flex-1 items-start gap-2 self-stretch rounded-lg border border-gray-300 bg-primary p-3.5 shadow-xs ring-1 ring-gray-300 dark:border-gray-600 dark:ring-gray-600">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Message"
                                            rows={3}
                                            className="w-full flex-1 resize-none bg-transparent text-base text-gray-900 outline-hidden placeholder:text-gray-500 dark:text-gray-100 dark:placeholder:text-gray-400"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        {/* Resize handle */}
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-1.5 right-1.5 text-gray-300 dark:text-gray-600">
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
                                    <div className="flex items-center gap-1">
                                        <Avatar size="xs" src={userAvatar} alt={userName} initials={userName?.charAt(0)} />
                                        <div className="flex items-center gap-0.5">
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{userName}</span>
                                            <ChevronDown className="size-3 text-gray-400 dark:text-gray-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Right side - Actions */}
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-1 text-xs font-semibold text-gray-600 outline-focus-ring transition-colors hover:text-gray-700 focus-visible:outline-2 dark:text-gray-400 dark:hover:text-gray-300">
                                        <Square className="size-4" />
                                        <span>Shortcuts</span>
                                    </button>
                                    <button className="flex items-center gap-1 text-xs font-semibold text-gray-600 outline-focus-ring transition-colors hover:text-gray-700 focus-visible:outline-2 dark:text-gray-400 dark:hover:text-gray-300">
                                        <Attachment01 className="size-4" />
                                        <span>Attach</span>
                                    </button>
                                </div>

                                {/* Voice input button */}
                                <button
                                    className="flex size-7 items-center justify-center rounded-lg p-1.5 text-gray-400 outline-focus-ring transition-colors hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-700 focus-visible:outline-2"
                                    aria-label="Voice input"
                                >
                                    <Microphone02 className="size-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
                )}
            </SlideoutMenu>
        </DialogTrigger>
    );
};
