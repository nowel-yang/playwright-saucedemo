import { test, expect } from "../fixtures";
import { INVALID_PASSWORD, PASSWORD, usernames } from "../test-data/users";

// Login tests must start LOGGED OUT, so override the saved session
// from the config with an empty one for this whole file.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login", () => {
  test(
    "logs in successfully with standard user",
    { tag: "@AUTH-001" },
    async ({ loginPage }) => {
      await loginPage.login(usernames.standard_user, PASSWORD);
      await expect(loginPage.page).toHaveURL(/inventory/);
    }
  );

  test(
    "shows error with locked out user",
    { tag: "@AUTH-010" },
    async ({ loginPage }) => {
      await loginPage.login(usernames.locked_out_user, PASSWORD);
      await expect(loginPage.errorMessage).toContainText(
        "Sorry, this user has been locked out"
      );
      await expect(loginPage.page).toHaveURL(/saucedemo\.com\/$/);
    }
  );

  test(
    "shows error on invalid password",
    { tag: "@AUTH-011" },
    async ({ loginPage }) => {
      await loginPage.login(usernames.standard_user, INVALID_PASSWORD);
      await expect(loginPage.errorMessage).toContainText(
        "Username and password do not match any user in this service"
      );
      await expect(loginPage.page).toHaveURL(/saucedemo\.com\/$/);
    }
  );

  test(
    "shows error when username and password are empty",
    { tag: "@AUTH-012" },
    async ({ loginPage }) => {
      await loginPage.login("", "");
      await expect(loginPage.errorMessage).toContainText(
        "Username is required"
      );
      await expect(loginPage.page).toHaveURL(/saucedemo\.com\/$/);
    }
  );

  test(
    "shows error when password is empty",
    { tag: "@AUTH-013" },
    async ({ loginPage }) => {
      await loginPage.login(usernames.standard_user, "");
      await expect(loginPage.errorMessage).toContainText(
        "Password is required"
      );
      await expect(loginPage.page).toHaveURL(/saucedemo\.com\/$/);
    }
  );
});
