import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  Square,
  Volume2Icon,
  VolumeXIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  HelpCircleIcon,
} from "lucide-react";

import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";

import type { FC, PropsWithChildren } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import * as m from "motion/react-m";

import { Button } from "@/components/ui/button";
import { MarkdownText } from "@/components/markdown-text";
import { ToolFallback } from "@/components/tool-fallback";
import { TooltipIconButton } from "@/components/tooltip-icon-button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from "@/components/attachment";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";
import { makeAssistantToolUI } from "@assistant-ui/react";
import { PlanApprovalUI } from "@/components/tools/plan-approval";
import { CompetitorApprovalUI } from "@/components/tools/competitor-approval";
import { EmailApprovalUI } from "@/components/tools/email-approval";

import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useAssistantApi, useAssistantState } from "@assistant-ui/react";

// Keyboard shortcuts hook
const useThreadKeyboardShortcuts = () => {
  const api = useAssistantApi();
  const isRunning = useAssistantState(({ thread }) => thread.isRunning);
  const composerText = useAssistantState(({ composer }) => composer.text);
  const messages = useAssistantState(({ thread }) => thread.messages);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+Enter to send message
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning && composerText.trim().length > 0) {
          api.composer().send();
        }
      }

      // Escape to cancel running generation
      if (e.key === "Escape" && isRunning) {
        e.preventDefault();
        api.thread().cancelRun();
      }

      // Up arrow to edit last message (when composer is empty and focused)
      if (e.key === "ArrowUp" && composerText.trim().length === 0) {
        const activeElement = document.activeElement;
        const isComposerFocused = activeElement?.closest(".aui-composer-root");
        
        if (isComposerFocused) {
          e.preventDefault();
          const lastUserMessage = messages
            .slice()
            .reverse()
            .find((m) => m.role === "user");
          
          if (lastUserMessage) {
            // Trigger edit mode on last user message
            api.thread().message({ id: lastUserMessage.id }).composer.beginEdit();
          }
        }
      }

      // Cmd/Ctrl+K to focus composer
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const composerInput = document.querySelector(
          ".aui-composer-input"
        ) as HTMLTextAreaElement;
        composerInput?.focus();
      }

      // Forward slash to focus composer (when not already in input)
      if (e.key === "/" && !isRunning) {
        const activeElement = document.activeElement;
        const isInputFocused = 
          activeElement?.tagName === "INPUT" ||
          activeElement?.tagName === "TEXTAREA";
        
        if (!isInputFocused) {
          e.preventDefault();
          const composerInput = document.querySelector(
            ".aui-composer-input"
          ) as HTMLTextAreaElement;
          composerInput?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [api, isRunning, composerText, messages]);
};

// Keyboard shortcuts help tooltip
const KeyboardShortcutsHelp: FC = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="text-muted-foreground hover:text-foreground size-5 rounded p-0.5 transition-colors"
          aria-label="Keyboard shortcuts"
        >
          <HelpCircleIcon className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1 text-xs">
          <p className="font-semibold">Keyboard Shortcuts</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <span className="text-muted-foreground">Send message:</span>
            <span>⌘/Ctrl + Enter</span>
            <span className="text-muted-foreground">Cancel:</span>
            <span>Escape</span>
            <span className="text-muted-foreground">Edit last:</span>
            <span>↑ Arrow</span>
            <span className="text-muted-foreground">Focus input:</span>
            <span>⌘/Ctrl + K or /</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export const Thread: FC = () => {
  const threadMaxWidth = "min(100%, calc(100vw - 3.5rem))";
  
  // Add keyboard shortcuts
  useThreadKeyboardShortcuts();

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <ScrollAreaPrimitive.Root asChild>
          <ThreadPrimitive.Root
            className="aui-root aui-thread-root @container flex h-full flex-col bg-background"
            style={{
              ["--thread-max-width" as string]: threadMaxWidth,
            }}
          >
            <ScrollAreaPrimitive.Viewport className="thread-viewport" asChild>
              <ThreadPrimitive.Viewport 
                autoScroll={true}
                className="aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto px-4"
              >
                <ThreadPrimitive.If empty>
                  <ThreadWelcome />
                </ThreadPrimitive.If>

                <ThreadPrimitive.Messages
                  components={{
                    UserMessage,
                    EditComposer,
                    AssistantMessage,
                  }}
                />


                <ThreadPrimitive.If disabled>
                  <div className="aui-thread-disabled mx-auto w-full max-w-[var(--thread-max-width)] px-2 py-4">
                    <div className="aui-thread-disabled-content rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-center text-sm text-destructive">
                      <span>AI is temporarily unavailable. Please try again later.</span>
                    </div>
                  </div>
                </ThreadPrimitive.If>

                <ThreadPrimitive.If empty={false}>
                  <div className="aui-thread-viewport-spacer min-h-8 grow" />
                </ThreadPrimitive.If>

                <Composer />
              </ThreadPrimitive.Viewport>
            </ScrollAreaPrimitive.Viewport>
            <ScrollBar />
          </ThreadPrimitive.Root>
        </ScrollAreaPrimitive.Root>
      </MotionConfig>
    </LazyMotion>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible dark:bg-background dark:hover:bg-accent"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const CopilotLogo = () => {
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme || theme;
  
  return (
    <div className="relative flex size-14 items-center justify-center rounded-full bg-gray-100 shadow-lg dark:bg-gray-800 mb-6">
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

const ThreadWelcome: FC = () => {
  // Personalize greeting with authenticated user's name
  // Uses next-auth session available via Providers in app
  // Falls back to a friendly generic greeting if name is unavailable
  const { data: session } = useSession();
  const name: string | undefined = session?.user?.name as string | undefined;
  const firstName = name?.trim()?.split(" ")[0] ?? "there";

  return (
    <div className="aui-thread-welcome-root flex h-full w-full flex-col">
      {/* Greeting - Centered vertically */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        {/* Logo */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.05 }}
        >
          <CopilotLogo />
        </m.div>
        
        <div className="aui-thread-welcome-message flex flex-col justify-center">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.1 }}
            className="aui-thread-welcome-message-motion-1 text-2xl font-semibold"
          >
            Hi {firstName},
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.15 }}
            className="aui-thread-welcome-message-motion-2 text-2xl text-muted-foreground/65"
          >
            How can I assist you with competitor insights today?
          </m.div>
        </div>
      </div>
      
      {/* Suggestions - Anchored to bottom */}
      <ThreadSuggestions />
    </div>
  );
};

const ThreadSuggestions: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestions grid w-full gap-2 px-4 pb-4 @md:grid-cols-2">
      {[
        {
          title: "📊 Analyze pricing",
          label: "trends",
          action: "Analyze competitor pricing trends from this month and identify key patterns",
        },
        {
          title: "⚖️ Compare prices",
          label: "with top 5",
          action: "Compare my current prices with the top 5 competitors and show where I'm winning or losing",
        },
        {
          title: "💡 Find opportunities",
          label: "to optimize",
          action: "Identify pricing opportunities where I can increase margins or gain market share",
        },
        {
          title: "🎯 Market insights",
          label: "& trends",
          action: "Provide market insights and competitive pricing recommendations for launching new products",
        },
      ].map((suggestedAction, index) => (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className="aui-thread-welcome-suggestion-display"
        >
          <ThreadPrimitive.Suggestion
            prompt={suggestedAction.action}
            send
            asChild
          >
            <Button
              variant="ghost"
              className="aui-thread-welcome-suggestion h-auto w-full flex-1 flex-wrap items-start justify-start gap-1 rounded-3xl border px-5 py-4 text-left text-sm @md:flex-col dark:hover:bg-accent/60"
              aria-label={suggestedAction.action}
            >
              <span className="aui-thread-welcome-suggestion-text-1 font-medium">
                {suggestedAction.title}
              </span>
              <span className="aui-thread-welcome-suggestion-text-2 text-muted-foreground">
                {suggestedAction.label}
              </span>
            </Button>
          </ThreadPrimitive.Suggestion>
        </m.div>
      ))}
    </div>
  );
};

const Composer: FC = () => {
  const isRunning = useAssistantState(({ thread }) => thread.isRunning);

  return (
    <div className="aui-composer-wrapper sticky bottom-0 mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 overflow-visible rounded-t-3xl bg-background px-3 pb-4 md:px-4 md:pb-6">
      <ThreadScrollToBottom />
      <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col rounded-3xl border border-border bg-muted px-3 pt-3 shadow-[0_9px_9px_0px_rgba(0,0,0,0.01),0_2px_5px_0px_rgba(0,0,0,0.06)] dark:border-muted-foreground/15">
        <ComposerAttachments />
        <ComposerPrimitive.Input
          placeholder="Send a message..."
          className="aui-composer-input mb-1 max-h-32 min-h-10 w-full resize-none bg-transparent px-3.5 pt-2 pb-2 text-base outline-none placeholder:text-muted-foreground focus:outline-primary"
          rows={1}
          autoFocus
          aria-label="Message input"
        />
        {/* Add keyboard hint */}
        {!isRunning && (
          <div className="flex items-center gap-1 px-3.5 pb-1">
            <span className="text-muted-foreground text-xs">
              <kbd className="bg-muted rounded px-1 py-0.5 text-xs">
                {typeof window !== 'undefined' && navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
              </kbd>{" "}
              +{" "}
              <kbd className="bg-muted rounded px-1 py-0.5 text-xs">↵</kbd> to
              send
            </span>
          </div>
        )}
        <ComposerAction />
      </ComposerPrimitive.Root>
    </div>
  );
};

const ComposerAction: FC = () => {
  return (
    <div className="aui-composer-action-wrapper relative mt-2 mb-2 flex w-full items-center justify-between gap-2 px-2">
      <div className="flex items-center gap-2">
        <ComposerAddAttachment />
        <KeyboardShortcutsHelp />
      </div>

      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send message"
            side="bottom"
            type="submit"
            variant="default"
            size="icon"
            className="aui-composer-send size-[34px] rounded-full p-1"
            aria-label="Send message"
          >
            <ArrowUpIcon className="aui-composer-send-icon size-5" />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>

      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <Button
            type="button"
            variant="default"
            size="icon"
            className="aui-composer-cancel size-[34px] rounded-full border border-muted-foreground/60 hover:bg-primary/75 dark:border-muted-foreground/90"
            aria-label="Stop generating"
          >
            <Square className="aui-composer-cancel-icon size-3.5 fill-white dark:fill-black" />
          </Button>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </div>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

/**
 * ToolGroup Component
 * 
 * Groups consecutive tool calls together in a collapsible section.
 * When the AI makes multiple tool calls in sequence, this component
 * wraps them with a summary showing the count.
 * 
 * Features:
 * - Collapsible details/summary element
 * - Shows count of tool calls in the group
 * - Proper pluralization (1 tool call vs 2 tool calls)
 * - Indented display of grouped tools
 */
const ToolGroup: FC<
  PropsWithChildren<{ startIndex: number; endIndex: number }>
> = ({ startIndex, endIndex, children }) => {
  const toolCount = endIndex - startIndex + 1;
  return (
    <details className="aui-tool-group-root my-2 rounded-lg border bg-muted/30" open>
      <summary className="aui-tool-group-summary cursor-pointer px-4 py-2 font-medium hover:bg-muted/50">
        🔧 {toolCount} tool {toolCount === 1 ? "call" : "calls"}
      </summary>
      <div className="aui-tool-group-content space-y-2 px-2 pb-2 pt-1">
        {children}
      </div>
    </details>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root asChild>
      <div
        className="aui-assistant-message-root relative mx-auto w-full max-w-[var(--thread-max-width)] animate-in py-4 duration-150 ease-out fade-in slide-in-from-bottom-1 last:mb-24"
        data-role="assistant"
      >
        <div className="aui-assistant-message-content mx-2 leading-7 break-words text-foreground">
          <MessagePrimitive.Parts
            components={{
              Text: MarkdownText,
              tools: { 
                Fallback: ToolFallback,
                // Register HITL tool UIs
                updateTodos: makeAssistantToolUI(PlanApprovalUI),
                askForPlanApproval: makeAssistantToolUI(PlanApprovalUI),
                createCompetitor: makeAssistantToolUI(CompetitorApprovalUI),
                updateCompetitor: makeAssistantToolUI(CompetitorApprovalUI),
                deleteCompetitor: makeAssistantToolUI(CompetitorApprovalUI),
                addCompetitorNote: makeAssistantToolUI(CompetitorApprovalUI),
                suggestPriceChanges: makeAssistantToolUI(PlanApprovalUI),
                updateProductPrices: makeAssistantToolUI(PlanApprovalUI),
                sendCompetitorEmail: makeAssistantToolUI(EmailApprovalUI),
                sendPricingReport: makeAssistantToolUI(EmailApprovalUI),
                sendAlertEmail: makeAssistantToolUI(EmailApprovalUI),
              },
              ToolGroup,
            }}
          />
          <UserMessageAttachments />
          <MessageError />
        </div>

        <div className="aui-assistant-message-footer mt-2 ml-2 flex">
          <MessagePrimitive.If hasBranches>
            <BranchPicker />
          </MessagePrimitive.If>
          <MessagePrimitive.If lastOrHover>
            <AssistantActionBar />
          </MessagePrimitive.If>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="aui-assistant-action-bar-root col-start-3 row-start-2 -ml-1 flex gap-1 text-muted-foreground data-floating:absolute data-floating:rounded-md data-floating:border data-floating:bg-background data-floating:p-1 data-floating:shadow-sm"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
      <ActionBarPrimitive.Speak asChild>
        <TooltipIconButton tooltip="Read aloud">
          <Volume2Icon />
        </TooltipIconButton>
      </ActionBarPrimitive.Speak>
      <ActionBarPrimitive.StopSpeaking asChild>
        <TooltipIconButton tooltip="Stop reading">
          <VolumeXIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.StopSpeaking>
      <ActionBarPrimitive.FeedbackPositive asChild>
        <TooltipIconButton tooltip="Good response">
          <ThumbsUpIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.FeedbackPositive>
      <ActionBarPrimitive.FeedbackNegative asChild>
        <TooltipIconButton tooltip="Poor response">
          <ThumbsDownIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.FeedbackNegative>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root asChild>
      <div
        className="aui-user-message-root mx-auto grid w-full max-w-[var(--thread-max-width)] animate-in auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 px-2 py-4 duration-150 ease-out fade-in slide-in-from-bottom-1 first:mt-3 last:mb-5 [&:where(>*)]:col-start-2"
        data-role="user"
      >
        <UserMessageAttachments />

        <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
          <div className="aui-user-message-content rounded-3xl bg-muted px-5 py-2.5 break-words text-foreground">
            <MessagePrimitive.Parts />
          </div>
          <MessagePrimitive.If lastOrHover>
            <div className="aui-user-action-bar-wrapper absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2">
              <UserActionBar />
            </div>
          </MessagePrimitive.If>
        </div>

        <MessagePrimitive.If hasBranches>
          <BranchPicker className="aui-user-branch-picker col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
        </MessagePrimitive.If>
      </div>
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="aui-user-action-edit p-4">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <div className="aui-edit-composer-wrapper mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 px-2 first:mt-4">
      <ComposerPrimitive.Root className="aui-edit-composer-root ml-auto flex w-full max-w-7/8 flex-col rounded-xl bg-muted">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input flex min-h-[60px] w-full resize-none bg-transparent p-4 text-foreground outline-none"
          autoFocus
        />

        <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center justify-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm" aria-label="Cancel edit">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm" aria-label="Update message">
              Update
            </Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "aui-branch-picker-root mr-2 -ml-2 inline-flex items-center text-xs text-muted-foreground",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};
