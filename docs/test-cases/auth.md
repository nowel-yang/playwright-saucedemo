# Test Cases: Login

**Page:** `/` (login) · **Page object:** `pages/LoginPage.ts` · **Spec:** `tests/auth.spec.ts`

**Precondition for all cases:** not logged in, on the login page (the `loginPage`
fixture). All users share the password `secret_sauce`.

The **Test** column names the automated test that covers the case. Blank means
it is not automated yet.

## Successful login (AUTH-001–009)

| ID       | Scenario                                            | Expected result      | Priority | Test                                      |
| -------- | --------------------------------------------------- | -------------------- | -------- | ----------------------------------------- |
| AUTH-001 | Log in as `standard_user` with the correct password | Inventory page opens | High     | `logs in successfully with standard user` |

## Rejected login (AUTH-010–019)

In every case the user stays on the login page.

| ID       | Scenario                                        | Expected result                                                      | Priority | Test                                               |
| -------- | ----------------------------------------------- | -------------------------------------------------------------------- | -------- | -------------------------------------------------- |
| AUTH-010 | Log in as `locked_out_user`                     | Error: "Sorry, this user has been locked out"                        | High     | `shows error with locked out user`                 |
| AUTH-011 | Log in as `standard_user` with a wrong password | Error: "Username and password do not match any user in this service" | High     | `shows error on invalid password`                  |
| AUTH-012 | Submit with username and password both empty    | Error: "Username is required"                                        | Medium   | `shows error when username and password are empty` |
| AUTH-013 | Submit with a username but no password          | Error: "Password is required"                                        | Medium   | `shows error when password is empty`               |
