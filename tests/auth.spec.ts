import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test("navigate to saucedemo and create login page object", async ({ page }) => {
  // load the page first
  await page.goto("https://www.saucedemo.com/");
  const successfulLogin = new LoginPage(page);

  await successfulLogin.login("standard_user", "secret_sauce");

  await expect(page.locator(".inventory_container")).toBeVisible();
});

test.describe("todo tests", () => {
  let todoPage;

  test.beforeEach("", () => {});
  test.afterEach("", () => {});
});
