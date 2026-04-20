"use client";

import { useEffect, useRef } from "react";

type StreamEventKind =
  | "notification.created"
  | "notification.read"
  | "notification.allRead"
  | "notification.archived"
  | "ready";

type Handler = (kind: StreamEventKind, payload: unknown) => void;

/**
 * Subscribe to the notifications SSE stream. The `onEvent` handler is
 * called for every event kind (including `ready` when the connection
 * is established).
 */
export function useNotificationsStream(onEvent: Handler) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const es = new EventSource("/api/notifications/stream");

    const wire = (kind: StreamEventKind) => {
      es.addEventListener(kind, (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data);
          handlerRef.current(kind, data);
        } catch {
          /* ignore malformed */
        }
      });
    };

    wire("ready");
    wire("notification.created");
    wire("notification.read");
    wire("notification.allRead");
    wire("notification.archived");

    return () => {
      es.close();
    };
  }, []);
}
