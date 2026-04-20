"use client";

import { useEffect, useRef, useState } from "react";
import { runWidgetQuery } from "@/actions/dashboards";
import type {
  DashboardWidgetRow,
  GlobalFilters,
  WidgetQueryResult,
} from "@/lib/dashboards/widgetSchemas";

export function useWidgetData(
  widget: DashboardWidgetRow,
  globalFilters: GlobalFilters
) {
  const [data, setData] = useState<WidgetQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable serialised key so we only refetch when filters actually change
  const filterKey = JSON.stringify(globalFilters);
  const prevKey = useRef<string>(filterKey);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    runWidgetQuery(widget.id, globalFilters)
      .then((result) => {
        if (cancelled) return;
        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Query failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget.id, filterKey]);

  return { data, loading, error };
}
