import { test, expect } from "../fixtures";
import { PASSWORD, usernames } from "../test-data/users";

test.describe("Login", () => {
  test("logs in successfully with standard user", async ({ loginPage }) => {
    await loginPage.login(usernames.standard_user, PASSWORD);
    await expect(loginPage.page).toHaveURL(/inventory/);
  });

  test("shows error when logging in with locked out user", async ({
    loginPage,
  }) => {
    await loginPage.login(usernames.locked_out_user, PASSWORD);
    await expect(loginPage.errorMessage).toContainText(
      "Sorry, this user has been locked out"
    );
    await expect(loginPage.page).toHaveURL(/saucedemo\.com\/$/);
  });
});
