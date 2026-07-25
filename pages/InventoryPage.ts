import { Page, Locator } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;
  readonly inventoryList: Locator;
  readonly cartLink: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inventoryList = page.locator(".inventory_list");
    this.cartLink = page.locator(".shopping_cart_link");
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  async getItemCount(): Promise<number> {
    return this.inventoryList.locator(".inventory_item").count();
  }

  async addItemToCart(itemName: string) {
    await this.page
      .locator(".inventory_item")
      .filter({ hasText: itemName })
      .locator("button")
      .click();
  }

  async getCartBadgeCount(): Promise<string | null> {
    return this.cartLink.locator(".shopping_cart_badge").textContent();
  }

  async sortBy(option: "az" | "za" | "lohi" | "hilo") {
    await this.sortDropdown.selectOption(option);
  }

  async getItemPrices(): Promise<string[]> {
    return this.inventoryList
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();
  }
}
