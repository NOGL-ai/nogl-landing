/**
 * Pricing timeseries types — used by usePricingTimeseries hook and PricingOverTimeChart.
 * Kept separate from company.ts to avoid hook → component import violations.
 */

export interface PricingTimeseriesPoint {
  /** ISO date string "YYYY-MM-DD" */
  date: string;
  /** Raw value — discount is 0–1 fraction; prices are currency units */
  value: number;
}

export interface PricingTimeseriesData {
  discount: PricingTimeseriesPoint[];
  current_price: PricingTimeseriesPoint[];
  full_price: PricingTimeseriesPoint[];
}
