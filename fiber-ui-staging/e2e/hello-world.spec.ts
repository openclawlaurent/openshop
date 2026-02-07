import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display home page", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("home-page")).toBeVisible();
  });
});
