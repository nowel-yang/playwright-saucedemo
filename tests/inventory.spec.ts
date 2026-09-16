import { test, expect } from "../fixtures";
import { InventoryPage, SortOption } from "../pages/InventoryPage";
import { items } from "../test-data/items";

/**
 * One sort direction to verify: the dropdown option to select, the expected
 * active-option label, how to read the sorted values back off the page, and
 * how those values should be ordered once sorted correctly.
 */
type SortCase<T> = {
  option: SortOption;
  label: string;
  getValues: () => Promise<T[]>;
  sort: (a: T, b: T) => number;
};

/**
 * Applies one sort direction and asserts the dropdown, active-option label,
 * and resulting item order all reflect it. Wrapped in test.step so each
 * direction shows up as its own step in the report/trace.
 */
async function runSortCase<T>(inventoryPage: InventoryPage, c: SortCase<T>) {
  await test.step(`sort by ${c.label}`, async () => {
    await inventoryPage.sortBy(c.option);
    await expect(inventoryPage.sortDropdown).toHaveValue(c.option);
    await expect(inventoryPage.activeOption).toHaveText(c.label);
    const values = await c.getValues();
    expect(values).toEqual([...values].sort(c.sort));
  });
}

test.describe("Inventory", () => {
  test("sort products", async ({
    authenticatedInventoryPage: inventoryPage,
  }) => {
    // Verify all four sort directions (price low-high/high-low, name A-Z/Z-A).
    await runSortCase(inventoryPage, {
      option: "lohi",
      label: "Price (low to high)",
      getValues: () => inventoryPage.getItemPrices(),
      sort: (a, b) => a - b,
    });
    await runSortCase(inventoryPage, {
      option: "hilo",
      label: "Price (high to low)",
      getValues: () => inventoryPage.getItemPrices(),
      sort: (a, b) => b - a,
    });
    await runSortCase(inventoryPage, {
      option: "az",
      label: "Name (A to Z)",
      getValues: () => inventoryPage.getItemNames(),
      sort: (a, b) => a.localeCompare(b),
    });
    await runSortCase(inventoryPage, {
      option: "za",
      label: "Name (Z to A)",
      getValues: () => inventoryPage.getItemNames(),
      sort: (a, b) => b.localeCompare(a),
    });
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
    // Verify "Remove" button
    await expect(
      authenticatedInventoryPage
        .getInventoryItemByName(items.backpack.name)
        .locator("button")
    ).toHaveText("Remove");
    // Click "Remove" button
    await authenticatedInventoryPage
      .getInventoryItemByName(items.backpack.name)
      .locator("button")
      .click();
    // Verify "Add to cart" button
    await expect(
      authenticatedInventoryPage
        .getInventoryItemByName(items.backpack.name)
        .locator("button")
    ).toHaveText("Add to cart");
    await expect(authenticatedInventoryPage.cartBadge).toHaveCount(0);
    await expect(await authenticatedInventoryPage.getCartStorage()).toEqual([]);
  });
});
