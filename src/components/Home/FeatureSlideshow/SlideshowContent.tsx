"use client";

import React, { forwardRef } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

type SlideshowContentProps = {
  children: React.ReactNode;
  className?: string;
} & Accordion.AccordionContentProps;

const SlideshowContent = forwardRef<HTMLDivElement, SlideshowContentProps>(
  ({ children, className, ...props }, ref) => (
    <Accordion.Content
      className={cn(
        "overflow-hidden text-[15px] font-medium data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down",
        className
      )}
      {...props}
      ref={ref}
    >
      <div className="px-5 py-2">{children}</div>
    </Accordion.Content>
  )
);

SlideshowContent.displayName = "SlideshowContent";

export default SlideshowContent;
