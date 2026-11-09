import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";

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
  // No UI login here anymore: the browser context already has the
  // standard_user session cookie (loaded from storageState in the config),
  // so we can open the inventory page directly.
  authenticatedInventoryPage: async ({ page, inventoryPage }, use) => {
    await page.goto("/inventory.html");
    await expect(page).toHaveURL(/inventory/);
    await use(inventoryPage);
  },
});

export { expect } from "@playwright/test";
