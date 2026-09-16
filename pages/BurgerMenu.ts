import { Page, Locator } from "@playwright/test";

export class BurgerMenu {
  readonly page: Page;
  readonly menuNavigation: Locator;
  readonly menuItems: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;
  readonly lazyLoadLink: Locator;
  readonly spinnerLink: Locator;
  readonly dynamicCatalogLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menuNavigation = page.locator("#menu_button_container nav");
    this.dynamicCatalogLink = page.locator("#dynamic_catalog_sidebar_link");
    this.menuItems = page.locator(".bm-item-list a");
    this.logoutLink = page.locator("#logout_sidebar_link");
    this.resetAppStateLink = page.locator("#reset_sidebar_link");
    this.lazyLoadLink = page.locator("#dynamic_catalog_lazy_load_link");
    this.spinnerLink = page.locator("#dynamic_catalog_spinner_link");
  }

  async open() {
    await this.page.locator("#react-burger-menu-btn").click();
    await this.menuNavigation.waitFor({ state: "visible" });
  }

  async close() {
    await this.page.locator("#react-burger-cross-btn").click();
    await this.menuNavigation.waitFor({ state: "hidden" });
  }

  async clickLogout() {
    await this.logoutLink.click();
  }

  async clickResetAppState() {
    await this.resetAppStateLink.click();
  }

  async clickLazyLoad() {
    await this.dynamicCatalogLink.click();
    await this.lazyLoadLink.waitFor({ state: "visible" });
    await this.lazyLoadLink.click();
  }

  async clickSpinner() {
    await this.dynamicCatalogLink.click();
    await this.spinnerLink.waitFor({ state: "visible" });
    await this.spinnerLink.click();
  }
}
