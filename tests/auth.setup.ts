import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { PASSWORD, usernames } from "../test-data/users";

// Where the logged-in session is saved. The browser projects in
// playwright.config.ts load this same file via `storageState`.
// (playwright/.auth/ is already in .gitignore.)
export const STANDARD_USER_AUTH = "playwright/.auth/standard_user.json";

// This runs ONCE, in the "setup" project, before the browser projects.
// It is a normal UI login; the only new part is the last line.
setup("log in as standard_user", async ({ page }) => {
  await page.goto("/");
  await new LoginPage(page).login(usernames.standard_user, PASSWORD);
  await expect(page).toHaveURL(/inventory/);

  // Save this browser context's cookies + localStorage to the JSON file.
  await page.context().storageState({ path: STANDARD_USER_AUTH });
});
