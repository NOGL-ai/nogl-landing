"use client";
/**
 * AlertDialog — built on @radix-ui/react-dialog (already installed).
 * Matches the shadcn/ui AlertDialog API so usage is identical.
 */
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const AlertDialog = Dialog.Root;
const AlertDialogTrigger = Dialog.Trigger;
const AlertDialogPortal = Dialog.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <Dialog.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border-primary bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-xl",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn("text-lg font-semibold text-text-primary", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn("text-sm text-text-secondary", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

// AlertDialogAction — a confirm button that closes the dialog
const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const closeCtx = React.useContext(CloseCtx);
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md bg-brand-solid px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-brand-solid_hover focus:outline-none focus:ring-2 focus:ring-brand-solid focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        closeCtx?.();
      }}
      {...props}
    />
  );
});
AlertDialogAction.displayName = "AlertDialogAction";

// AlertDialogCancel — a cancel button that closes the dialog
const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const closeCtx = React.useContext(CloseCtx);
  return (
    <button
      ref={ref}
      className={cn(
        "mt-2 inline-flex h-9 items-center justify-center rounded-md border border-border-primary bg-background px-4 py-2 text-sm font-medium text-text-secondary shadow-sm transition-colors hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-brand-solid focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0",
        className
      )}
      onClick={(e) => {
        props.onClick?.(e);
        closeCtx?.();
      }}
      {...props}
    />
  );
});
AlertDialogCancel.displayName = "AlertDialogCancel";

// Internal context so Cancel/Action can close the dialog without a ref
const CloseCtx = React.createContext<(() => void) | undefined>(undefined);

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
