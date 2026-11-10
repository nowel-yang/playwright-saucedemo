import { Page, Locator } from "@playwright/test";
import { BurgerMenu } from "./components/BurgerMenu";

export type SortOption = "az" | "za" | "lohi" | "hilo";

export class InventoryPage {
  readonly page: Page;
  readonly burgerMenuButton: BurgerMenu;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly inventoryList: Locator;
  readonly inventoryItemImages: Locator;
  readonly inventoryItemNames: Locator;
  readonly inventoryItem: Locator;
  readonly sortDropdown: Locator;
  readonly activeOption: Locator;

  constructor(page: Page) {
    this.page = page;
    this.burgerMenuButton = new BurgerMenu(page);
    this.cartLink = page.getByTestId("shopping-cart-link");
    this.cartBadge = page.getByTestId("shopping-cart-badge");
    this.inventoryList = page.getByTestId("inventory-list");
    this.inventoryItem = page.getByTestId("inventory-item");
    this.inventoryItemImages = this.inventoryList.getByRole("img");
    this.inventoryItemNames = page.getByTestId("inventory-item-name");
    this.sortDropdown = page.getByTestId("product-sort-container");
    this.activeOption = page.getByTestId("active-option");
  }

  async getItemCount(): Promise<number> {
    return this.inventoryItem.count();
  }

  async addItemToCart(itemName: string) {
    await this.getInventoryItemByName(itemName)
      .getByRole("button", { name: "Add to cart", exact: true })
      .click();
  }

  async sortBy(option: SortOption) {
    await this.sortDropdown.selectOption(option);
  }

  async getItemPrices(): Promise<number[]> {
    const priceStrings = await this.inventoryList
      .getByTestId("inventory-item-price")
      .allTextContents();
    return priceStrings.map((price) => parseFloat(price.replace("$", "")));
  }

  async getItemNames(): Promise<string[]> {
    return this.inventoryList
      .getByTestId("inventory-item-name")
      .allTextContents();
  }

  // The item's add/remove button. Its label toggles between "Add to cart"
  // and "Remove", so match either one; tests assert which one is shown.
  // A plain getByRole("button") isn't enough: the item's image and title
  // links also have role="button".
  getCartButton(itemName: string): Locator {
    return this.getInventoryItemByName(itemName).getByRole("button", {
      name: /^(Add to cart|Remove)$/,
    });
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
