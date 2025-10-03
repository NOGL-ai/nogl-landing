"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
}

const PopoverContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  ({ children, open: controlledOpen, onOpenChange, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = React.useCallback((newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [controlledOpen, onOpenChange]);

    return (
      <PopoverContext.Provider value={{ open, setOpen }}>
        <div ref={ref} {...props}>
          {children}
        </div>
      </PopoverContext.Provider>
    );
  }
);

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, asChild = false, children, onClick, ...props }, ref) => {
    const { open, setOpen } = React.useContext(PopoverContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(!open);
      onClick?.(e);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...children.props,
        onClick: handleClick,
        ref,
      });
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ 
    className, 
    children, 
    side = 'bottom', 
    align = 'center',
    sideOffset = 4,
    alignOffset = 0,
    ...props 
  }, ref) => {
    const { open } = React.useContext(PopoverContext);

    if (!open) return null;

    const getPositionClasses = () => {
      const sideClasses = {
        top: 'bottom-full mb-2',
        right: 'left-full ml-2',
        bottom: 'top-full mt-2',
        left: 'right-full mr-2',
      };

      const alignClasses = {
        start: align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2',
        center: 'left-1/2 -translate-x-1/2',
        end: align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2',
      };

      return `${sideClasses[side]} ${alignClasses[align]}`;
    };

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
          getPositionClasses(),
          className
        )}
        style={{
          marginTop: side === 'top' ? -sideOffset : side === 'bottom' ? sideOffset : 0,
          marginLeft: side === 'left' ? -sideOffset : side === 'right' ? sideOffset : 0,
          marginTop: side === 'top' ? -sideOffset : side === 'bottom' ? sideOffset : 0,
          ...(align === 'start' && { left: alignOffset }),
          ...(align === 'end' && { right: alignOffset }),
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Popover.displayName = "Popover";
PopoverTrigger.displayName = "PopoverTrigger";
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };