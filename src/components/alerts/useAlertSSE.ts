"use client";

import { useEffect } from "react";
import type { AlertAudience } from "@prisma/client";

export function useAlertSSE(
  companyId: string,
  audience: AlertAudience,
  onAlert: (alert: unknown) => void,
) {
  useEffect(() => {
    const url = `/api/alerts/stream?companyId=${encodeURIComponent(companyId)}&audience=${audience}`;
    const es = new EventSource(url);

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        onAlert(data);
      } catch {
        // ignore malformed frames
      }
    };

    es.onerror = () => {
      // Browser auto-reconnects on EventSource errors
    };

    return () => {
      es.close();
    };
  }, [companyId, audience, onAlert]);
}
