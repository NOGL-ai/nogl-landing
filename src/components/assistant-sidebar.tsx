"use client";

import type { FC, PropsWithChildren } from "react";
import { Thread } from "@/components/thread";
import { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import type { ImperativePanelHandle } from "react-resizable-panels";

// localStorage helper functions with error handling
const STORAGE_KEY = "sidebar-collapsed";

const getStoredCollapsedState = (): boolean => {
  if (typeof window === "undefined") return true;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "true";
  } catch (error) {
    console.warn("Failed to read sidebar state from localStorage:", error);
    return true; // Default to collapsed on error
  }
};

const setStoredCollapsedState = (isCollapsed: boolean): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed));
  } catch (error) {
    console.warn("Failed to save sidebar state to localStorage:", error);
    // Gracefully degrade - app continues to work without persistence
  }
};

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
 * - State persistence via localStorage (panel sizes + collapse state)
 *
 * Usage: Wrap your entire app with this component
 */
export const AssistantSidebar: FC<PropsWithChildren> = ({ children }) => {
  // Initialize collapse state from localStorage
  const [isCollapsed, setIsCollapsed] = useState(getStoredCollapsedState);
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

    // Restore collapse state from localStorage on mount
    if (panelRef.current) {
      const storedCollapsed = getStoredCollapsedState();
      if (storedCollapsed) {
        panelRef.current.collapse();
      }
    }

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

  // Persist collapse state to localStorage when it changes
  const handleCollapse = useCallback(() => {
    setIsCollapsed(true);
    setStoredCollapsedState(true);
  }, []);

  const handleExpand = useCallback(() => {
    setIsCollapsed(false);
    setStoredCollapsedState(false);
  }, []);

  return (
    <AssistantSidebarContext.Provider value={{ toggleCollapse, isCollapsed }}>
      {isMounted ? (
        <ResizablePanelGroup 
          direction="horizontal" 
          className="fixed inset-0 w-full h-screen"
          autoSaveId="assistant-sidebar-layout"
          storage={{
            getItem: (name: string) => {
              try {
                const value = localStorage.getItem(name);
                return value;
              } catch (error) {
                console.warn('Failed to read panel layout from localStorage:', error);
                return null;
              }
            },
            setItem: (name: string, value: string) => {
              try {
                localStorage.setItem(name, value);
              } catch (error) {
                console.warn('Failed to save panel layout to localStorage:', error);
              }
            }
          }}
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
            onCollapse={handleCollapse}
            onExpand={handleExpand}
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
