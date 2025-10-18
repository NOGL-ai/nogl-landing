"use client";

import type { FC, PropsWithChildren } from "react";
import { Thread } from "@/components/thread";
import { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import type { ImperativePanelHandle } from "react-resizable-panels";

// Context to control copilot sidebar from anywhere
const AssistantSidebarContext = createContext<{
  toggleCollapse: () => void;
  isCollapsed: boolean;
} | null>(null);

export const useAssistantSidebar = () => {
  const context = useContext(AssistantSidebarContext);
  if (!context) {
    throw new Error("useAssistantSidebar must be used within AssistantSidebar");
  }
  return context;
};

/**
 * AssistantSidebar Component
 *
 * VSCode/Cursor-style split-pane layout with resizable copilot sidebar:
 * - Split-pane layout where main content and copilot share viewport space
 * - Content reflows when sidebar opens/closes (no overlay)
 * - Resizable with native drag handle
 * - Collapsible with smooth animations
 * - Programmatic control via context
 *
 * Usage: Wrap your entire app with this component
 */
export const AssistantSidebar: FC<PropsWithChildren> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const panelRef = useRef<ImperativePanelHandle>(null);

  const toggleCollapse = useCallback(() => {
    if (panelRef.current) {
      panelRef.current.isCollapsed() 
        ? panelRef.current.expand() 
        : panelRef.current.collapse();
    }
  }, []);

  // Handle client-side hydration and responsive behavior
  useEffect(() => {
    setIsMounted(true);

    // Auto-collapse on small screens when resizing
    const mediaQuery = window.matchMedia('(min-width: 1280px)');
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const isLargeScreen = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
      if (panelRef.current && !isLargeScreen) {
        // Only auto-collapse on small screens, never auto-expand
        panelRef.current.collapse();
      }
    };

    mediaQuery.addEventListener('change', handleChange as (ev: MediaQueryListEvent) => void);
    return () => {
      mediaQuery.removeEventListener('change', handleChange as (ev: MediaQueryListEvent) => void);
    };
  }, []);

  return (
    <AssistantSidebarContext.Provider value={{ toggleCollapse, isCollapsed }}>
      {isMounted ? (
        <ResizablePanelGroup 
          direction="horizontal" 
          className="fixed inset-0 w-full h-screen"
        >
          {/* Main Content Panel */}
          <ResizablePanel 
            defaultSize={70} 
            minSize={30}
            className="overflow-auto"
          >
            {children}
          </ResizablePanel>
          
          {/* Resize Handle */}
          <ResizableHandle 
            withHandle 
            className="w-1 bg-border hover:bg-primary transition-colors" 
          />
          
          {/* Copilot Sidebar Panel */}
          <ResizablePanel 
            ref={panelRef}
            collapsible={true}
            defaultSize={30}
            minSize={20}
            maxSize={50}
            collapsedSize={0}
            onCollapse={() => setIsCollapsed(true)}
            onExpand={() => setIsCollapsed(false)}
            className="border-l bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 flex flex-col"
          >
            <Thread />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        // SSR fallback
        children
      )}
    </AssistantSidebarContext.Provider>
  );
};
