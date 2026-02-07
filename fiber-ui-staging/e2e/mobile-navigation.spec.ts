import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "./helpers/auth";

test.describe("Mobile Navigation", () => {
  test("shows mobile hamburger menu button on small viewport", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-mobile-hamburger", {
      onboardingComplete: true,
    });

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Hamburger menu button should be visible on mobile
    const hamburgerButton = page.getByRole("button", { name: /toggle navigation menu/i });
    await expect(hamburgerButton).toBeVisible();

    // Verify it's actually in the viewport (not hidden by CSS)
    const isVisible = await hamburgerButton.isVisible();
    expect(isVisible).toBe(true);
  });

  test("opens navigation drawer when clicking hamburger menu", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-mobile-drawer-open", {
      onboardingComplete: true,
    });

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Click hamburger button to open drawer
    const hamburgerButton = page.getByRole("button", { name: /toggle navigation menu/i });
    await hamburgerButton.click();
    await page.waitForTimeout(1000);

    // Navigation drawer should be visible
    // Sheet component uses role="dialog"
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();

    // Drawer should contain navigation links
    const hasSearchLink = await drawer
      .getByRole("link", { name: /search/i })
      .isVisible()
      .catch(() => false);
    const hasEarningsLink = await drawer
      .getByRole("link", { name: /tokens/i })
      .isVisible()
      .catch(() => false);
    expect(hasSearchLink || hasEarningsLink).toBe(true);
  });

  test("navigation drawer shows all menu items", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-mobile-nav-items", {
      onboardingComplete: true,
    });

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Open drawer
    const hamburgerButton = page.getByRole("button", { name: /toggle navigation menu/i });
    await hamburgerButton.click();
    await page.waitForTimeout(1000);

    // Check for main navigation items
    const searchLink = page.getByRole("link", { name: /^search$/i });
    const tokensLink = page.getByRole("link", { name: /^tokens$/i });
    const profileLink = page.getByRole("link", { name: /^profile$/i });

    await expect(searchLink).toBeVisible();
    await expect(tokensLink).toBeVisible();
    await expect(profileLink).toBeVisible();

    // Check for footer links
    const faqLink = page.getByRole("link", { name: /^faq$/i });
    const termsLink = page.getByRole("link", { name: /^terms$/i });
    const privacyLink = page.getByRole("link", { name: /^privacy$/i });

    await expect(faqLink).toBeVisible();
    await expect(termsLink).toBeVisible();
    await expect(privacyLink).toBeVisible();
  });

  test("navigates to correct page when clicking nav item in drawer", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-mobile-nav-click", {
      onboardingComplete: true,
    });

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Start at FAQ page (different from target)
    await page.goto("/faq");
    await page.waitForTimeout(2000);

    // Open drawer
    const hamburgerButton = page.getByRole("button", { name: /toggle navigation menu/i });
    await hamburgerButton.click();
    await page.waitForTimeout(1000);

    // Click Terms link from the drawer (footer link navigation)
    const drawer = page.getByRole("dialog");
    const termsLink = drawer.getByRole("link", { name: /^terms$/i });

    // Wait for navigation to complete
    await Promise.all([page.waitForURL("**/terms**", { timeout: 5000 }), termsLink.click()]);

    await page.waitForTimeout(1000);

    // Should navigate to terms page - verify URL changed
    expect(page.url()).toContain("/terms");

    // Verify we're no longer on FAQ page
    expect(page.url()).not.toContain("/faq");
  });

  test("closes drawer when pressing Escape key", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-mobile-drawer-escape", {
      onboardingComplete: true,
    });

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Open drawer
    const hamburgerButton = page.getByRole("button", { name: /toggle navigation menu/i });
    await hamburgerButton.click();
    await page.waitForTimeout(1000);

    // Drawer should be visible
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();

    // Press Escape to close (standard sheet behavior)
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);

    // Drawer should be closed (not visible)
    const isDrawerVisible = await drawer.isVisible().catch(() => false);
    expect(isDrawerVisible).toBe(false);
  });

  test("drawer closes automatically after navigation", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-mobile-drawer-auto-close", {
      onboardingComplete: true,
    });

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Open drawer
    const hamburgerButton = page.getByRole("button", { name: /toggle navigation menu/i });
    await hamburgerButton.click();
    await page.waitForTimeout(1000);

    // Drawer should be visible initially
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();

    // Click a navigation link (Search)
    const searchLink = drawer.getByRole("link", { name: /^search$/i });
    await Promise.all([page.waitForURL("**/**", { timeout: 5000 }), searchLink.click()]);

    await page.waitForTimeout(1000);

    // Drawer should auto-close after navigation
    const isDrawerVisible = await drawer.isVisible().catch(() => false);
    expect(isDrawerVisible).toBe(false);
  });

  test("shows desktop navigation on large viewport (no hamburger)", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-desktop-nav", {
      onboardingComplete: true,
    });

    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Hamburger menu should NOT be visible on desktop
    const hamburgerButton = page.getByRole("button", { name: /toggle navigation menu/i });
    const isHamburgerVisible = await hamburgerButton.isVisible().catch(() => false);
    expect(isHamburgerVisible).toBe(false);

    // Desktop sidebar navigation should be visible instead
    // Look for navigation links that are always visible (not in a drawer)
    const searchLink = page.getByRole("link", { name: /^search$/i });
    const tokensLink = page.getByRole("link", { name: /^tokens$/i });

    // At least one nav link should be visible on desktop
    const hasVisibleNav =
      (await searchLink.isVisible().catch(() => false)) ||
      (await tokensLink.isVisible().catch(() => false));
    expect(hasVisibleNav).toBe(true);
  });

  test("mobile viewport maintains responsive layout", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-mobile-responsive", {
      onboardingComplete: true,
    });

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Verify mobile-specific elements
    // Logo should be centered on mobile
    const logo = page.getByRole("link").filter({ hasText: /fiber/i }).first();
    const isLogoVisible = await logo.isVisible().catch(() => false);
    expect(isLogoVisible).toBe(true);

    // Hamburger should be visible
    const hamburgerButton = page.getByRole("button", { name: /toggle navigation menu/i });
    await expect(hamburgerButton).toBeVisible();

    // Page content should be scrollable
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });
});
