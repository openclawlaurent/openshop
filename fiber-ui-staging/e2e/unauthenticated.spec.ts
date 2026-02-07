import { test, expect } from "@playwright/test";

test.describe("Unauthenticated User - Public Access and Auth Prompts", () => {
  test("loads home page with offers for unauthenticated users", async ({ page }) => {
    await page.goto("/");

    // Verify home page loads
    await expect(page.getByTestId("home-page").first()).toBeVisible();

    // Verify offers are displayed (at least one offer card should be visible)
    const offerCards = page.locator("[data-testid^='offer-card']").first();
    await expect(offerCards).toBeVisible();
  });

  test("displays offer details when clicking offer, then auth drawer when clicking visit button", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for offers to load
    await expect(page.getByTestId("home-page").first()).toBeVisible();

    // Click on the first offer
    const firstOffer = page.locator("[data-testid^='offer-card']").first();
    await firstOffer.click();

    // Verify offer detail drawer appears (not auth drawer)
    await expect(page.getByTestId("offer-detail-drawer")).toBeVisible();

    // Click the visit button inside the detail drawer
    const visitButton = page.getByTestId("visit-offer-button");
    await expect(visitButton).toBeVisible();
    await visitButton.click();

    // Verify auth drawer appears after clicking visit button
    await expect(page.getByTestId("auth-drawer")).toBeVisible();
  });

  test("displays login drawer when unauthenticated user visits tokens page", async ({ page }) => {
    await page.goto("/tokens");

    // Verify auth drawer appears instead of page content
    await expect(page.getByTestId("auth-drawer")).toBeVisible();
  });

  test("displays login drawer when unauthenticated user visits profile page", async ({ page }) => {
    await page.goto("/profile");

    // Verify auth drawer appears instead of page content
    await expect(page.getByTestId("auth-drawer")).toBeVisible();
  });
});
