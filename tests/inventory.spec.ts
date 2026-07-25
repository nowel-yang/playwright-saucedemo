import { test, expect } from "../fixtures";
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
    const priceValues = prices.map((price) => parseFloat(price.replace("$", "")));
    const sortedValues = [...priceValues].sort((a, b) => a - b);
    expect(priceValues).toEqual(sortedValues);
  });
});
