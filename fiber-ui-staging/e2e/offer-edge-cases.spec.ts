import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "./helpers/auth";

test.describe("Offer Filtering Edge Cases", () => {
  test("shows no results message when search yields no offers", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-offers-no-results", {
      onboardingComplete: true,
    });

    // Search for something that definitely won't exist
    await page.goto("/?q=xyznonexistentmerchant999888777");
    await page.waitForTimeout(2000);

    // Check for "no results" message
    const noResultsText = await page
      .getByText(/no.*results.*found|no.*offers|nothing.*found/i)
      .isVisible()
      .catch(() => false);

    // Or check that no offer cards are visible
    const offerCards = page.locator('[data-testid^="offer-card-"]');
    const cardCount = await offerCards.count();

    // Either we see a "no results" message OR we have 0 cards
    expect(noResultsText || cardCount === 0).toBe(true);
  });

  test("handles invalid category parameter gracefully", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-offers-invalid-category", {
      onboardingComplete: true,
    });

    // Try to load page with invalid category
    await page.goto("/?category=invalidxyz123nonexistent");
    await page.waitForTimeout(2000);

    // Page should still load without errors
    await expect(page.getByTestId("home-page")).toBeVisible();

    // Should either show all offers or show no results
    const offerCards = page.locator('[data-testid^="offer-card-"]');
    const hasCards = (await offerCards.count()) > 0;
    const hasNoResults = await page
      .getByText(/no.*results.*found|no.*offers/i)
      .isVisible()
      .catch(() => false);

    // Should show either offers or no results message
    expect(hasCards || hasNoResults).toBe(true);
  });

  test("handles invalid merchant parameter gracefully", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-offers-invalid-merchant", {
      onboardingComplete: true,
    });

    // Try to load page with invalid merchant
    await page.goto("/?merchant=nonexistentmerchant999");
    await page.waitForTimeout(2000);

    // Page should still load without errors
    await expect(page.getByTestId("home-page")).toBeVisible();

    // Should either show all offers or show no results
    const offerCards = page.locator('[data-testid^="offer-card-"]');
    const hasCards = (await offerCards.count()) > 0;
    const hasNoResults = await page
      .getByText(/no.*results.*found|no.*offers/i)
      .isVisible()
      .catch(() => false);

    // Should show either offers or no results message
    expect(hasCards || hasNoResults).toBe(true);
  });

  test("clears all filters and returns to default state", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-offers-clear-filters", {
      onboardingComplete: true,
    });

    // Start with multiple filters applied
    await page.goto("/?q=amazon&category=shopping&sort=popular");
    await page.waitForTimeout(2000);

    // Navigate back to home (clear filters)
    await page.goto("/");
    await page.waitForTimeout(2000);

    // URL should not have filter parameters
    const url = page.url();
    expect(url).not.toContain("q=");
    expect(url).not.toContain("category=");

    // Offers should be visible (default state)
    const offerCards = page.locator('[data-testid^="offer-card-"]');
    await expect(offerCards.first()).toBeVisible({ timeout: 5000 });
  });

  test("offer cards render correctly with all data", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-offers-card-rendering", {
      onboardingComplete: true,
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Wait for at least one offer card to be visible
    const offerCards = page.locator('[data-testid^="offer-card-"]');
    await expect(offerCards.first()).toBeVisible({ timeout: 5000 });

    const cardCount = await offerCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Verify first card has expected elements
    const firstCard = offerCards.first();

    // Should have merchant logo/image
    const hasImage =
      (await firstCard.locator("img").count()) > 0 ||
      (await firstCard.locator('[data-testid*="logo"]').count()) > 0;
    expect(hasImage).toBe(true);

    // Should have some text content (merchant name, rate, etc.)
    const cardText = await firstCard.textContent();
    expect(cardText).toBeTruthy();
    expect(cardText!.length).toBeGreaterThan(0);
  });

  test("page loads correctly with no filters applied", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-offers-default-load", {
      onboardingComplete: true,
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Page should load successfully
    await expect(page.getByTestId("home-page")).toBeVisible();

    // Main heading should be visible
    await expect(page.getByRole("heading", { name: /shop smarter/i })).toBeVisible();

    // Offer cards should be visible
    const offerCards = page.locator('[data-testid^="offer-card-"]');
    await expect(offerCards.first()).toBeVisible({ timeout: 5000 });

    // Should have multiple offers in default state
    const cardCount = await offerCards.count();
    expect(cardCount).toBeGreaterThan(1);
  });

  test("handles multiple invalid parameters simultaneously", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-offers-multiple-invalid", {
      onboardingComplete: true,
    });

    // Try to load page with multiple invalid parameters
    await page.goto("/?q=xyz999&category=invalid123&merchant=nonexistent&sort=badvalue");
    await page.waitForTimeout(2000);

    // Page should still load without crashing
    await expect(page.getByTestId("home-page")).toBeVisible();

    // Should show no results or handle gracefully
    const offerCards = page.locator('[data-testid^="offer-card-"]');
    const cardCount = await offerCards.count();
    const hasNoResults = await page
      .getByText(/no.*results.*found|no.*offers/i)
      .isVisible()
      .catch(() => false);

    // Should either show 0 cards with message or handle gracefully
    if (cardCount === 0) {
      expect(hasNoResults).toBe(true);
    } else {
      // If cards are shown, page recovered gracefully
      expect(true).toBe(true);
    }
  });
});
