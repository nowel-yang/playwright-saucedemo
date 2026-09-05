import { test, expect } from "../fixtures";
import { items } from "../test-data/items";
import { PASSWORD, usernames } from "../test-data/users";

test.describe("Inventory", () => {
  test("sort products by price (low to high)", async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(usernames.standard_user, PASSWORD);
    await inventoryPage.sortBy("lohi");
    // Add assertions here
    await expect(inventoryPage.sortDropdown).toHaveValue("lohi");

    // Compare price
    const prices = await inventoryPage.getItemPrices();
    const priceValues = prices.map((price) =>
      parseFloat(price.replace("$", ""))
    );
    const sortedValues = [...priceValues].sort((a, b) => a - b);
    expect(priceValues).toEqual(sortedValues);
  });

  test("add item to cart", async ({ authenticatedInventoryPage }) => {
    await authenticatedInventoryPage.clearCartStorage();
    await authenticatedInventoryPage.addItemToCart(items.backpack.name);
    await expect(authenticatedInventoryPage.cartBadge).toHaveText("1");
    await expect(
      authenticatedInventoryPage
        .getInventoryItemByName(items.backpack.name)
        .locator("button")
    ).toHaveText("Remove");
  });

  test("remove item from cart", async ({ authenticatedInventoryPage }) => {
    await authenticatedInventoryPage.setCartStorage([items.backpack.id]);
    await authenticatedInventoryPage.page.reload();
    await expect(
      authenticatedInventoryPage
        .getInventoryItemByName(items.backpack.name)
        .locator("button")
    ).toHaveText("Remove");
    await authenticatedInventoryPage
      .getInventoryItemByName(items.backpack.name)
      .locator("button")
      .click();
    await expect(authenticatedInventoryPage.cartBadge).toHaveCount(0);
    await expect(await authenticatedInventoryPage.getCartStorage()).toEqual([]);
  });
});
