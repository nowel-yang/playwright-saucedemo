import { test, expect } from "../fixtures";
import { InventoryPage, SortOption } from "../pages/InventoryPage";
import { items } from "../test-data/items";

test.describe("Burger Menu", () => {
  test("open and close the burger menu", async ({
    authenticatedInventoryPage: inventoryPage,
  }) => {
    // Open the burger menu
    await inventoryPage.burgerMenuButton.open();
    await expect(inventoryPage.burgerMenuButton.menuContainer).toBeVisible();

    // Close the burger menu
    await inventoryPage.burgerMenuButton.close();
    await expect(inventoryPage.burgerMenuButton.menuContainer).toBeHidden();
  });
});
