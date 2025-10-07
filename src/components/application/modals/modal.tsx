"use client";

import type { DialogProps as AriaDialogProps, ModalOverlayProps as AriaModalOverlayProps } from "react-aria-components";
import { Dialog as AriaDialog, DialogTrigger as AriaDialogTrigger, Modal as AriaModal, ModalOverlay as AriaModalOverlay } from "react-aria-components";
import { cx } from "@/utils/cx";

export const DialogTrigger = AriaDialogTrigger;

type ModalVariant = "plain" | "glass" | "brand" | "sheet" | "fullscreen";

interface ModalOverlayPropsWithVariant extends AriaModalOverlayProps {
    variant?: ModalVariant;
}

interface ModalPropsWithVariant extends AriaModalOverlayProps {
    variant?: ModalVariant;
}

const overlayVariantClasses: Record<ModalVariant, string> = {
    plain: "bg-overlay/70 backdrop-blur-[6px]",
    glass: "bg-black/10 backdrop-blur-xl",
    brand: "bg-brand-950/60 backdrop-blur",
    sheet: "bg-overlay/60 sm:bg-overlay/70",
    fullscreen: "bg-overlay/70",
};

const modalVariantClasses: Record<ModalVariant, string> = {
    plain: "bg-white shadow-xl sm:rounded-xl",
    glass: "bg-white/10 ring-1 ring-white/20 backdrop-blur-xl sm:rounded-2xl",
    brand: "bg-gradient-to-b from-brand-600 to-brand-700 text-white sm:rounded-2xl",
    sheet: "bg-white shadow-xl max-sm:rounded-t-2xl sm:rounded-2xl",
    fullscreen: "bg-white w-screen h-screen sm:w-screen sm:h-screen sm:rounded-none",
};

export const ModalOverlay = (props: ModalOverlayPropsWithVariant) => {
    return (
        <AriaModalOverlay
            {...props}
            className={(state) =>
                cx(
                    "fixed inset-0 z-50 flex min-h-dvh w-full items-end justify-center overflow-y-auto px-4 pt-4 pb-[clamp(16px,8vh,64px)] outline-hidden sm:items-center sm:justify-center sm:p-8",
                    overlayVariantClasses[props.variant ?? "plain"],
                    state.isEntering && "duration-300 ease-out animate-in fade-in",
                    state.isExiting && "duration-200 ease-in animate-out fade-out",
                    typeof props.className === "function" ? props.className(state) : props.className,
                )
            }
        />
    );
};

export const Modal = (props: ModalPropsWithVariant) => (
    <AriaModal
        {...props}
        className={(state) =>
            cx(
                "max-h-full w-full align-middle outline-hidden max-sm:overflow-y-auto",
                modalVariantClasses[props.variant ?? "plain"],
                state.isEntering && "duration-300 ease-out animate-in zoom-in-95",
                state.isExiting && "duration-200 ease-in animate-out zoom-out-95",
                typeof props.className === "function" ? props.className(state) : props.className,
            )
        }
    />
);

export const Dialog = (props: AriaDialogProps) => (
    <AriaDialog {...props} className={cx("flex w-full items-center justify-center outline-hidden", props.className)} />
);
