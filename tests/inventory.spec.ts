import { test, expect } from "../fixtures";
import { InventoryPage, SortOption } from "../pages/InventoryPage";
import { items } from "../test-data/items";

type SortCase<T> = {
  option: SortOption;
  label: string;
  getValues: () => Promise<T[]>;
  sort: (a: T, b: T) => number;
};

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
