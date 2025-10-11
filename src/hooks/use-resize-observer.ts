"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

export type ResizeObserverBox = "border-box" | "content-box" | "device-pixel-content-box";

interface UseResizeObserverOptions {
  ref: RefObject<Element | null>;
  onResize: (entry?: ResizeObserverEntry) => void;
  box?: ResizeObserverBox;
}

/**
 * Subscribes to element size changes and calls onResize.
 * Falls back to window resize if ResizeObserver is unavailable.
 */
export function useResizeObserver({ ref, onResize, box = "content-box" }: UseResizeObserverOptions) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fire once to initialize measurements
    try {
      onResize();
    } catch {}

    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        onResize(entry);
      });

      try {
        // @ts-expect-error - older TS lib DOM may not include options typing on observe
        ro.observe(el, { box });
      } catch {
        ro.observe(el as Element);
      }

      return () => {
        try {
          ro.unobserve(el as Element);
          ro.disconnect();
        } catch {}
      };
    }

    const handler = () => {
      try {
        onResize();
      } catch {}
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [ref, onResize, box]);
}
