"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { FC, PropsWithChildren } from "react";
import { Thread } from "@/components/thread";
import { createContext, useContext, useRef, useCallback, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";

// Context to control sidebar from anywhere
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

export const AssistantSidebar: FC<PropsWithChildren> = ({ children }) => {
  const panelRef = useRef<ImperativePanelHandle>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = useCallback(() => {
    if (panelRef.current) {
      if (isCollapsed) {
        panelRef.current.expand();
      } else {
        panelRef.current.collapse();
      }
    }
  }, [isCollapsed]);

  return (
    <AssistantSidebarContext.Provider value={{ toggleCollapse, isCollapsed }}>
      <ResizablePanelGroup direction="horizontal" className="h-screen">
        <ResizablePanel defaultSize={75} minSize={50}>
          {children}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel 
          ref={panelRef}
          defaultSize={25} 
          minSize={20} 
          maxSize={40}
          collapsible
          onCollapse={() => setIsCollapsed(true)}
          onExpand={() => setIsCollapsed(false)}
        >
          <Thread />
        </ResizablePanel>
      </ResizablePanelGroup>
    </AssistantSidebarContext.Provider>
  );
};
