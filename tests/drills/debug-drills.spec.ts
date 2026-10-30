import { test, expect } from "../../fixtures";
import { items } from "../../test-data/items";
import { PASSWORD, usernames } from "../../test-data/users";

/**
 * Debugging drills. Every test here is broken on purpose.
 * Instructions: docs/debug-drills.md. Answers: docs/debug-drills-answers.md.
 */
test.describe("Debug drills", () => {
  test(
    "log out from the burger menu",
    { tag: "@DRILL-1" },
    async ({ authenticatedInventoryPage: inventoryPage }) => {
      const page = inventoryPage.page;
      await page.getByRole("button", { name: "Open Menu" }).click();
      await page.getByTestId("logout-link").click();
      await expect(page).toHaveURL("https://www.saucedemo.com/");
    }
  );

  test(
    "add the backpack to the cart",
    { tag: "@DRILL-2" },
    async ({ authenticatedInventoryPage: inventoryPage }) => {
      const page = inventoryPage.page;
      await page.getByRole("button", { name: "Add to cart" }).click();
      await expect(inventoryPage.cartBadge).toHaveText("1");
    }
  );

  test(
    "cart badge shows items already in the cart",
    { tag: "@DRILL-3" },
    async ({ authenticatedInventoryPage: inventoryPage }) => {
      const cartItemIds = [items.backpack.id, 0];
      await inventoryPage.setCartStorage(cartItemIds);
      await expect(inventoryPage.cartBadge).toHaveText(
        String(cartItemIds.length)
      );
    }
  );

  test(
    "cart link is shown after login",
    { tag: "@DRILL-4" },
    async ({ loginPage, inventoryPage }) => {
      await loginPage.login(usernames.standard_user, PASSWORD);
      expect(await inventoryPage.cartLink.isVisible()).toBe(true);
    }
  );

  test(
    "performance glitch user sees the products",
    { tag: "@DRILL-5" },
    async ({ loginPage, inventoryPage }) => {
      await loginPage.login(usernames.performance_glitch_user, PASSWORD);
      await expect(inventoryPage.inventoryItem).toHaveCount(6, {
        timeout: 3000,
      });
    }
  );

  test(
    "sort products by name Z to A",
    { tag: "@DRILL-6" },
    async ({ loginPage, inventoryPage }) => {
      const user = usernames.problem_user;
      await loginPage.login(user, PASSWORD);
      await inventoryPage.sortBy("za");
      await expect(inventoryPage.inventoryItemNames.first()).toHaveText(
        "Test.allTheThings() T-Shirt (Red)"
      );
    }
  );
});
