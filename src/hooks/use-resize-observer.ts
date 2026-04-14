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
    const win = globalThis as unknown as Window;

    // Fire once to initialize measurements
    try {
      onResize();
    } catch {}

    if ("ResizeObserver" in win) {
      const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        onResize(entry);
      });

      try {
        ro.observe(el, { box } as ResizeObserverOptions);
      } catch {
        ro.observe(el);
      }

      return () => {
        try {
          ro.unobserve(el);
          ro.disconnect();
        } catch {}
      };
    }

    const handler = () => {
      try {
        onResize();
      } catch {}
    };
    win.addEventListener("resize", handler);
    return () => win.removeEventListener("resize", handler);
  }, [ref, onResize, box]);
}

