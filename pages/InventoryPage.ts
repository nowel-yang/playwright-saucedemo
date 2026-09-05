import { Page, Locator } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly inventoryList: Locator;
  readonly inventoryItemImages: Locator;
  readonly inventoryItemNames: Locator;
  readonly inventoryItem: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator(".shopping_cart_link");
    this.cartBadge = page.locator(".shopping_cart_badge");
    this.inventoryList = page.locator(".inventory_list");
    this.inventoryItem = page.locator(".inventory_item");
    this.inventoryItemImages = page.locator(".inventory_item_img");
    this.inventoryItemNames = page.locator(".inventory_item_name");
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  async getItemCount(): Promise<number> {
    return this.inventoryList.locator(".inventory_item").count();
  }

  async addItemToCart(itemName: string) {
    await this.getInventoryItemByName(itemName).locator("button").click();
  }

  async sortBy(option: "az" | "za" | "lohi" | "hilo") {
    await this.sortDropdown.selectOption(option);
  }

  async getItemPrices(): Promise<string[]> {
    return this.inventoryList
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();
  }

  getInventoryItemByName(itemName: string): Locator {
    return this.inventoryItem.filter({
      has: this.inventoryItemNames.filter({ hasText: itemName }),
    });
  }

  async getBrokenImages(): Promise<string[]> {
    return await this.inventoryItemImages.evaluateAll((imgs) => {
      const brokenImgs = imgs.filter((img) =>
        img.getAttribute("src")?.includes("404")
      );
      return brokenImgs.map((img) => img.getAttribute("src") || "");
    });
  }

  async clearCartStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.removeItem("cart-contents"));
  }

  async setCartStorage(value: Array<number>): Promise<void> {
    await this.page.evaluate(
      (val) => localStorage.setItem("cart-contents", JSON.stringify(val)),
      value
    );
  }

  async getCartStorage(): Promise<Array<number> | null> {
    const cartContents = await this.page.evaluate(() =>
      localStorage.getItem("cart-contents")
    );
    return cartContents ? JSON.parse(cartContents) : null;
  }
}
