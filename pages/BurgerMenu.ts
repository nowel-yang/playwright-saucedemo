import { Page, Locator } from "@playwright/test";

export class BurgerMenu {
  readonly page: Page;
  readonly menuContainer: Locator;
  readonly menuItems: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menuContainer = page.locator("#menu_container");
    this.menuItems = page.locator(".bm-item-list a");
    this.logoutLink = page.locator("#logout_sidebar_link");
    this.resetAppStateLink = page.locator("#reset_sidebar_link");
  }

  async open() {
    await this.page.locator("#react-burger-menu-btn").click();
    await this.menuContainer.waitFor({ state: "visible" });
  }

  async close() {
    await this.page.locator("#react-burger-cross-btn").click();
    await this.menuContainer.waitFor({ state: "hidden" });
  }

  async clickLogout() {
    await this.logoutLink.click();
  }

  async clickResetAppState() {
    await this.resetAppStateLink.click();
  }
}
