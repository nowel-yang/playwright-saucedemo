# Test Documentation

How the test docs for this project are organized, and why.

## Layout

```
docs/
  README.md          # this file
  test-plan.md       # one plan for the whole project
  test-cases/
    inventory.md     # one file per feature
    cart.md
    ...
```

- **`test-plan.md`** covers the whole project: scope, approach, environment,
  test users, risks, and entry/exit criteria. It describes *why* and *what* we test.
- **`test-cases/<feature>.md`** lists the scenarios for one feature: ID, what is
  checked, expected result, priority, and the automated test that covers it.
  It describes *how* each feature is tested.

## Why one plan and several case files

Scope, environment, test users and risks are the same for every feature, so they
live in a single plan instead of being copied into per-feature plans that would
drift apart. Case files hold only scenarios, so each file has one job and adding a
feature means adding one file.

## Conventions

- **Case IDs** use a feature prefix plus a number: `AUTH-`, `INV-`, `MENU-`, `CART-`,
  `CHK-`. Numbers are grouped in tens by section (`INV-010`–`INV-019` for the
  product list, and so on). An ID is never reused, even if its case is removed.
- **Tagging tests:** add the case ID as a tag on the test that covers it:

  ```ts
  test("add item to cart", { tag: "@INV-030" }, async ({ ... }) => { ... });
  ```

  Run a single case with `npx playwright test --grep @INV-030`.
- **Config values** such as retries, workers and browsers are not copied into the
  docs. The plan points to `playwright.config.ts`, so the docs can't go out of date.
