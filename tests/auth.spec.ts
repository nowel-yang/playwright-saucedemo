import { test, expect } from "../fixtures";
import { INVALID_PASSWORD, PASSWORD, usernames } from "../test-data/users";

test.describe("Login", () => {
  test("logs in successfully with standard user", async ({ loginPage }) => {
    await loginPage.login(usernames.standard_user, PASSWORD);
    await expect(loginPage.page).toHaveURL(/inventory/);
  });

  test("shows error with locked out user", async ({ loginPage }) => {
    await loginPage.login(usernames.locked_out_user, PASSWORD);
    await expect(loginPage.errorMessage).toContainText(
      "Sorry, this user has been locked out"
    );
    await expect(loginPage.page).toHaveURL(/saucedemo\.com\/$/);
  });

  test("shows error on invalid password", async ({ loginPage }) => {
    await loginPage.login(usernames.standard_user, INVALID_PASSWORD);
    await expect(loginPage.errorMessage).toContainText(
      "Username and password do not match any user in this service"
    );
    await expect(loginPage.page).toHaveURL(/saucedemo\.com\/$/);
  });

  test("shows error on empty field", async ({ loginPage }) => {
    await loginPage.login("", "");
    await expect(loginPage.errorMessage).toContainText("Username is required");
    await expect(loginPage.page).toHaveURL(/saucedemo\.com\/$/);

    await loginPage.login(usernames.standard_user, "");
    await expect(loginPage.errorMessage).toContainText("Password is required");
    await expect(loginPage.page).toHaveURL(/saucedemo\.com\/$/);
  });

  test("shows broken images with problem user", async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(usernames.problem_user, PASSWORD);
    await expect(loginPage.page).toHaveURL(/inventory/);
    const brokenImages = await inventoryPage.getBrokenImages();
    expect(brokenImages.length).toBeGreaterThan(0);
  });
});
