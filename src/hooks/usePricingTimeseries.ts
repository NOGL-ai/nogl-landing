import { useEffect, useState } from "react";
import type { PricingTimeseriesData } from "@/components/companies/pricing/PricingOverTimeChart";

interface UsePricingTimeseriesOptions {
  slug: string;
  enabled?: boolean;
}

interface UsePricingTimeseriesResult {
  data: PricingTimeseriesData | null;
  loading: boolean;
  error: string | null;
}

export function usePricingTimeseries({
  slug,
  enabled = true,
}: UsePricingTimeseriesOptions): UsePricingTimeseriesResult {
  const [state, setState] = useState<UsePricingTimeseriesResult>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function fetchData() {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await fetch(`/api/companies/${slug}/pricing/timeseries`);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = (await response.json()) as PricingTimeseriesData;
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          setState({ data: null, loading: false, error: errorMessage });
        }
      }
    }

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [slug, enabled]);

  return state;
}
