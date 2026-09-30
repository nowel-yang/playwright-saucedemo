# Test Documentation

How the test docs for [playwright-saucedemo](../README.md) are organized, and why.

## Layout

| File                                                   | Contents                                                  |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [test-plan.md](test-plan.md)                           | Whole project: scope, approach, environment, users, risks |
| [test-cases/auth.md](test-cases/auth.md)               | Login (`AUTH-`)                                           |
| [test-cases/inventory.md](test-cases/inventory.md)     | Inventory page (`INV-`)                                   |
| [test-cases/burger-menu.md](test-cases/burger-menu.md) | Side menu (`MENU-`)                                       |

- **`test-plan.md`** covers the whole project: scope, approach, environment,
  test users, risks, and entry/exit criteria. It describes _why_ and _what_ we test.
- **`test-cases/<feature>.md`** lists the scenarios for one feature: ID, what is
  checked, expected result, priority, and the automated test that covers it.
  It describes _how_ each feature is tested.

## Why one plan and several case files

Scope, environment, test users and risks are the same for every feature, so they
live in a single plan instead of being copied into per-feature plans that would
drift apart. Case files hold only scenarios, so each file has one job and adding a
feature means adding one file.

## Conventions

- **Case IDs** use a feature prefix plus a number: `AUTH-`, `INV-`, `MENU-`, `CART-`,
  `CHK-`. Numbers are grouped in tens by section (`INV-010`–`INV-019` for the
  product list, and so on). An ID is never reused, even if its case is removed.
- **Test column:** each case lists the automated test that covers it. A blank cell
  means the case is not automated yet.
- **Tagging tests:** add the case ID as a tag on the test that covers it. A test
  that covers several cases gets all of their tags:

  ```ts
  test("add item to cart", { tag: "@INV-030" }, async ({ ... }) => { ... });
  test("sort products", { tag: ["@INV-020", "@INV-021"] }, async ({ ... }) => { ... });
  ```

  Run one case with `npx playwright test --grep @INV-030`. Because IDs are grouped
  in tens, `--grep @AUTH-01` runs a whole section (every rejected-login case).

- **Config values** such as retries, workers and browsers are not copied into the
  docs. The plan points to `playwright.config.ts`, so the docs don't need updating
  when the config changes.
