import { test, expect } from "@playwright/test";

const now = () => new Date().toISOString();

test.describe("Company dashboard (Particl-style chrome)", () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await page.route("**/api/companies/calumet-de", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          company: {
            id: "test-company",
            slug: "calumet-de",
            name: "Test Company",
            domain: "example.com",
            country_code: "DE",
            product_types: [],
            tracking_status: "TRACKED",
            dataset_quality_score: 80,
            createdAt: now(),
            updatedAt: now(),
          },
          snapshot: {
            id: "snap-1",
            company_id: "test-company",
            total_products: 12,
            total_variants: 3,
            total_datapoints: 40,
            total_discounted: 1,
            avg_price: 10,
            avg_discount_pct: 5,
            computed_at: now(),
          },
          socials: { facebook: null, instagram: null, tiktok: null },
          competitors: [],
          datasetQualityUiStatus: "ok",
        }),
      });
    });
  });

  test("shows dashboard chrome, company profile heading, and overview tab", async ({ page }) => {
    await page.goto("/en/companies/calumet-de#overview", {
      waitUntil: "load",
      timeout: 90_000,
    });

    await expect(page.getByTestId("dashboard-product-search")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole("link", { name: "Company Explorer" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole("heading", { name: /Company Profile/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole("tab", { name: "Ratings" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Pivot Table" })).toBeVisible();
  });
});
