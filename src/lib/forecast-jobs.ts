const ENABLED = process.env.FORECAST_JOBS_ENABLED === "true";

export function initForecastJobs() {
  if (!ENABLED) return;
  console.info("[forecast-jobs] jobs enabled but not yet wired to a scheduler");
}

// Stub: sync forecast data to Google Sheets (via googleapis)
// Requires: GOOGLE_APP_CLIENT_ID, GOOGLE_APP_CLIENT_SECRET, GOOGLE_APP_REFRESH_TOKEN
export async function googleSheetSyncJob(_companyId: string): Promise<void> {
  throw new Error("not implemented — see Phase 9 notes");
}

// Stub: detect new products in scraping DB and alert
export async function newProductsDetectionJob(_companyId: string): Promise<void> {
  throw new Error("not implemented");
}

// Stub: detect variants with recent zero sales (potential stockouts)
export async function procurementTrackerJob(_companyId: string): Promise<void> {
  throw new Error("not implemented");
}
