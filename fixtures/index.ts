import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";
import { PASSWORD, usernames } from "../test-data/users";

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  authenticatedInventoryPage: InventoryPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await page.goto("/");
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  authenticatedInventoryPage: async ({ loginPage, inventoryPage }, use) => {
    await loginPage.login(usernames.standard_user, PASSWORD);
    await expect(loginPage.page).toHaveURL(/inventory/);
    await use(inventoryPage);
  },
});

export { expect } from "@playwright/test";
