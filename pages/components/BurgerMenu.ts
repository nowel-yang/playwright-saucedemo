import { Page, Locator } from "@playwright/test";

export class BurgerMenu {
  readonly page: Page;
  readonly openMenuButton: Locator;
  readonly closeMenuButton: Locator;
  readonly menuNavigation: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;
  readonly lazyLoadLink: Locator;
  readonly spinnerLink: Locator;
  readonly dynamicCatalogLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.openMenuButton = page.getByRole("button", { name: "Open Menu" });
    this.closeMenuButton = page.getByRole("button", { name: "Close Menu" });
    this.dynamicCatalogLink = page.locator("#dynamic_catalog_sidebar_link");
    this.logoutLink = page.getByTestId("logout-sidebar-link");
    this.resetAppStateLink = page.getByTestId("reset-sidebar-link");
    this.lazyLoadLink = page.getByTestId("dynamic-catalog-lazy-load-link");
    this.spinnerLink = page.getByTestId("dynamic-catalog-spinner-link");
    this.menuNavigation = page
      .getByRole("navigation")
      .filter({ has: this.logoutLink });
  }

  async open() {
    await this.openMenuButton.click();
    await this.menuNavigation.waitFor({ state: "visible" });
  }

  async close() {
    await this.closeMenuButton.click();
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
