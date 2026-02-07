import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "./helpers/auth";

test.describe("FAQ Page", () => {
  test("displays FAQ page for all users (no auth required)", async ({ page }) => {
    // Navigate without authentication
    await page.goto("/faq");
    await page.waitForTimeout(2000);

    // Verify page heading is visible
    await expect(page.getByRole("heading", { name: /frequently asked questions/i })).toBeVisible();

    // Verify page description
    await expect(page.getByText(/everything you need to know about earning tokens/i)).toBeVisible();
  });

  test("shows FAQ card with title and description", async ({ page }) => {
    await page.goto("/faq");
    await page.waitForTimeout(2000);

    // Verify card title (rendered as div, not heading)
    await expect(page.getByText("Common Questions")).toBeVisible();

    // Verify card description
    await expect(
      page.getByText(/find answers to the most frequently asked questions/i),
    ).toBeVisible();
  });

  test("displays all FAQ items with questions and answers", async ({ page }) => {
    await page.goto("/faq");
    await page.waitForTimeout(2000);

    // Verify key FAQ questions are visible
    await expect(page.getByText(/what is fiber and how does it work/i)).toBeVisible();
    await expect(page.getByText(/how much can I earn/i)).toBeVisible();
    await expect(page.getByText(/how and when are my token earnings paid out/i)).toBeVisible();
    await expect(page.getByText(/do I need a crypto wallet/i)).toBeVisible();

    // Verify answers are visible (check for unique text from answers)
    await expect(page.getByText(/AI-powered affiliate commerce platform/i)).toBeVisible();
    await expect(page.getByText(/typically range from 0% to 10%/i)).toBeVisible();
    await expect(page.getByText(/30-90 days for your earnings to be confirmed/i)).toBeVisible();
  });

  test("shows all 8 FAQ items", async ({ page }) => {
    await page.goto("/faq");
    await page.waitForTimeout(2000);

    // Count FAQ items - each has a unique question heading (h3)
    const questionHeadings = page.locator("h3.text-lg.font-semibold");
    const count = await questionHeadings.count();

    // Should have 8 FAQ items based on content
    expect(count).toBe(8);
  });

  test("FAQ content loads correctly with specific topics", async ({ page }) => {
    await page.goto("/faq");
    await page.waitForTimeout(2000);

    // Verify specific FAQ topics exist
    await expect(page.getByText(/how does affiliate link tracking work/i)).toBeVisible();
    await expect(page.getByText(/how do I get started earning tokens/i)).toBeVisible();
    await expect(page.getByText(/what can prevent my token earnings from tracking/i)).toBeVisible();
    await expect(page.getByText(/why is my cashback amount lower than expected/i)).toBeVisible();

    // Verify content about wallet requirement
    await expect(page.getByText(/phantom.*solflare.*solana-compatible wallets/i)).toBeVisible();
  });

  test("page is mobile responsive", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/faq");
    await page.waitForTimeout(2000);

    // Verify page loaded in mobile view
    await expect(page.getByRole("heading", { name: /frequently asked questions/i })).toBeVisible();

    // Verify card content is still accessible
    await expect(page.getByText("Common Questions")).toBeVisible();

    // Verify at least one FAQ item is visible
    await expect(page.getByText(/what is fiber and how does it work/i)).toBeVisible();
  });

  test("FAQ page accessible for authenticated users", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-faq-auth", {
      onboardingComplete: true,
    });

    // Navigate directly to FAQ page
    await page.goto("/faq");
    await page.waitForTimeout(2000);

    // Verify page loads correctly for authenticated users
    await expect(page.getByRole("heading", { name: /frequently asked questions/i })).toBeVisible();
    await expect(page.getByText("Common Questions")).toBeVisible();

    // Verify content is accessible
    await expect(page.getByText(/what is fiber and how does it work/i)).toBeVisible();
  });

  test("FAQ items are properly formatted and readable", async ({ page }) => {
    await page.goto("/faq");
    await page.waitForTimeout(2000);

    // Verify question styling (should be semibold and larger)
    const firstQuestion = page.locator("h3.text-lg.font-semibold").first();
    await expect(firstQuestion).toBeVisible();

    // Verify answer text exists below question
    const firstAnswer = page.locator("p.text-muted-foreground").first();
    await expect(firstAnswer).toBeVisible();

    // Verify dividers between items (except last)
    const itemsWithBorder = page.locator(".border-b.border-border");
    const borderCount = await itemsWithBorder.count();
    expect(borderCount).toBeGreaterThan(0);
  });
});
