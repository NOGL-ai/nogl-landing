"use client";

import React, { forwardRef } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

type SlideshowTriggerProps = {
  children: React.ReactNode;
  className?: string;
};

const SlideshowTrigger = forwardRef<HTMLButtonElement, SlideshowTriggerProps>(
  ({ children, className, ...props }, ref) => (
    <Accordion.Header className="flex">
      <Accordion.Trigger
        className={cn(
          "group flex h-[45px] flex-1 cursor-pointer items-center justify-between px-5 text-[15px] leading-none outline-none",
          className
        )}
        {...props}
        ref={ref}
      >
        {children}
      </Accordion.Trigger>
    </Accordion.Header>
  )
);

SlideshowTrigger.displayName = "SlideshowTrigger";

export default SlideshowTrigger;
