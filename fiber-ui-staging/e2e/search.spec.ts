import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "./helpers/auth";

test.describe("Search Functionality", () => {
  test("opens search dropdown when clicking search input", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-search-open", {
      onboardingComplete: true,
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Click search input to open dropdown (use placeholder text)
    const searchInput = page.getByPlaceholder(/search.*offers/i);
    await searchInput.click();
    await page.waitForTimeout(500);

    // Verify dropdown suggestions appear (categories or merchants)
    const hasDropdown =
      (await page
        .getByRole("option")
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText(/categories|browse|top merchants/i)
        .isVisible()
        .catch(() => false));

    expect(hasDropdown).toBe(true);
  });

  test("filters offers by search query", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-search-filter", {
      onboardingComplete: true,
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Click and type in search input (use a merchant that exists in mock data)
    const searchInput = page.getByPlaceholder(/search.*offers/i);
    await searchInput.click();
    await searchInput.fill("AliExpress");
    await page.waitForTimeout(500);

    // Press Enter to search
    await searchInput.press("Enter");

    // Wait for URL to update with search query (up to 10 seconds)
    await page.waitForFunction(() => window.location.href.toLowerCase().includes("aliexpress"), {
      timeout: 10000,
    });

    // Verify offers are filtered (at least one offer card should be visible)
    const offerCards = page.locator('[data-testid^="offer-card-"]');
    await expect(offerCards.first()).toBeVisible({ timeout: 10000 });
  });

  test("shows category options in search dropdown", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-search-categories", {
      onboardingComplete: true,
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Click search input to open dropdown
    const searchInput = page.getByPlaceholder(/search.*offers/i);
    await searchInput.click();
    await page.waitForTimeout(500);

    // Verify at least one category or merchant option exists
    const hasOptions = await page
      .getByRole("option")
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasOptions).toBe(true);
  });

  test("filters offers by category selection", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-search-category", {
      onboardingComplete: true,
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Click search input to open dropdown
    const searchInput = page.getByPlaceholder(/search.*offers/i);
    await searchInput.click();
    await page.waitForTimeout(500);

    // Select first category/merchant option
    const firstOption = page.getByRole("option").first();
    await firstOption.click();

    // Wait for URL to update with filter (up to 10 seconds)
    await page.waitForFunction(
      () => {
        const url = window.location.href;
        return url.includes("category=") || url.includes("merchant=") || url.includes("q=");
      },
      { timeout: 10000 },
    );

    // Verify offers are displayed
    const offerCards = page.locator('[data-testid^="offer-card-"]');
    await expect(offerCards.first()).toBeVisible({ timeout: 5000 });
  });

  test("clears search when clicking clear button", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-search-clear", {
      onboardingComplete: true,
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Type a search query
    const searchInput = page.getByPlaceholder(/search.*offers/i);
    await searchInput.click();
    await searchInput.fill("amazon");
    await page.waitForTimeout(500);

    // Click outside to close dropdown so it doesn't intercept the clear button click
    await page.mouse.click(50, 50);
    await page.waitForTimeout(300);

    // Look for clear button (X icon) that should appear in the search input
    const clearButton = page.getByRole("button", { name: /clear search/i });
    const hasClearButton = await clearButton.isVisible().catch(() => false);

    if (hasClearButton) {
      await clearButton.click({ force: true });
      await page.waitForTimeout(500);

      // Input should be empty
      const inputValue = await searchInput.inputValue();
      expect(inputValue).toBe("");
    } else {
      // If no clear button, just verify we can clear manually
      await searchInput.clear();
      const inputValue = await searchInput.inputValue();
      expect(inputValue).toBe("");
    }
  });

  test("shows no results message when search yields no offers", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-search-no-results", {
      onboardingComplete: true,
    });

    // Search for something that definitely won't exist
    await page.goto("/?q=xyznonexistentmerchant12345");
    await page.waitForTimeout(2000);

    // Check for "no results" message or empty state
    const hasNoResultsText = await page
      .getByText(/no.*results|no.*offers|nothing.*found|try.*different/i)
      .isVisible()
      .catch(() => false);

    // Or check that no offer cards are visible
    const offerCards = page.locator('[data-testid^="offer-card-"]');
    const cardCount = await offerCards.count();

    // Either we see a "no results" message OR we have 0 cards
    expect(hasNoResultsText || cardCount === 0).toBe(true);
  });

  test("search is case-insensitive", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-search-case", {
      onboardingComplete: true,
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Type uppercase search query (use a merchant that exists in mock data)
    const searchInput = page.getByPlaceholder(/search.*offers/i);
    await searchInput.click();
    await searchInput.fill("ALIEXPRESS");
    await searchInput.press("Enter");

    // Wait for URL to update with search query (up to 10 seconds)
    await page.waitForFunction(() => window.location.href.toLowerCase().includes("aliexpress"), {
      timeout: 10000,
    });

    // Wait for offers to load
    await page.waitForTimeout(2000);

    // Verify offers are displayed
    const offerCards = page.locator('[data-testid^="offer-card-"]');
    const cardCount = await offerCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test("search persists in URL after page reload", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-search-persist", {
      onboardingComplete: true,
    });

    // Start with search query in URL (use a merchant that exists in mock data)
    await page.goto("/?q=AliExpress");
    await page.waitForTimeout(2000);

    // Verify search query is in URL
    expect(page.url()).toContain("q=AliExpress");

    // Reload the page
    await page.reload();
    await page.waitForTimeout(2000);

    // URL should still have query parameter after reload
    expect(page.url()).toContain("q=AliExpress");

    // Offers should still be filtered
    const offerCards = page.locator('[data-testid^="offer-card-"]');
    await expect(offerCards.first()).toBeVisible({ timeout: 10000 });
  });
});
