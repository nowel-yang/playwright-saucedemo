import { test, expect } from "../fixtures";

test.describe("Burger Menu", () => {
  test.describe("with menu open", () => {
    test.beforeEach(async ({ authenticatedInventoryPage: inventoryPage }) => {
      // Open the burger menu
      await inventoryPage.burgerMenuButton.open();
      await expect(inventoryPage.burgerMenuButton.menuNavigation).toBeVisible();
    });

    test("open and close the burger menu", async ({
      authenticatedInventoryPage: inventoryPage,
    }) => {
      // Close the burger menu
      await inventoryPage.burgerMenuButton.close();
      await expect(inventoryPage.burgerMenuButton.menuNavigation).toBeHidden();
    });

    test("log out from the burger menu", async ({
      authenticatedInventoryPage: inventoryPage,
    }) => {
      // Click the logout link
      await inventoryPage.burgerMenuButton.logoutLink.click();

      // Verify that the user is redirected to the login page
      await expect(inventoryPage.page).toHaveURL("https://www.saucedemo.com/");
    });

    test("dynamic catalog - lazy load", async ({
      authenticatedInventoryPage: inventoryPage,
    }) => {
      await inventoryPage.burgerMenuButton.clickLazyLoad();
      await expect(inventoryPage.page).toHaveURL(
        "https://www.saucedemo.com/dynamic-catalog-lazy-load.html"
      );
    });

    test("dynamic catalog - spinner", async ({
      authenticatedInventoryPage: inventoryPage,
    }) => {
      await inventoryPage.burgerMenuButton.clickSpinner();
      await expect(inventoryPage.page).toHaveURL(
        "https://www.saucedemo.com/dynamic-catalog-spinner.html"
      );
    });
  });

  test("reset app state", async ({
    authenticatedInventoryPage: inventoryPage,
  }) => {
    // Add an item to the cart
    await inventoryPage.setCartStorage([1]);
    await inventoryPage.page.reload();
    await expect(inventoryPage.cartBadge).toHaveText("1");

    // Click the reset app state link
    await inventoryPage.burgerMenuButton.open();
    await inventoryPage.burgerMenuButton.clickResetAppState();

    // Verify that the cart is empty
    await expect(inventoryPage.cartBadge).toBeHidden();
  });
});
