# Test Plan: SauceDemo

## 1. Objective

Verify the main shopping flows of [SauceDemo](https://www.saucedemo.com): logging
in, browsing and sorting products, managing the cart, and checking out. Also
verify how the site behaves for each of its test users.

## 2. Scope

### Features in scope

| Feature     | Test cases                                             | Spec                       |
| ----------- | ------------------------------------------------------ | -------------------------- |
| Login       | [test-cases/auth.md](test-cases/auth.md)               | `tests/auth.spec.ts`       |
| Inventory   | [test-cases/inventory.md](test-cases/inventory.md)     | `tests/inventory.spec.ts`  |
| Burger menu | [test-cases/burger-menu.md](test-cases/burger-menu.md) | `tests/burgerMenu.spec.ts` |
| Cart        | [test-cases/cart.md](test-cases/cart.md)               | _not yet_                  |
| Checkout    | _not documented yet_                                   | _not yet_                  |

### Out of scope

- Performance, load and accessibility audits
- Mobile or responsive layouts
- Backend or API testing (SauceDemo is a front-end-only demo)

## 3. Test Approach

| Aspect         | Approach                                                                               |
| -------------- | -------------------------------------------------------------------------------------- |
| Framework      | Playwright Test with TypeScript                                                        |
| Design pattern | Page Object Model, one class per page or component in `pages/`                         |
| Login          | Fixtures in `fixtures/index.ts`; `authenticatedInventoryPage` logs in through the UI before each test |
| Test data      | `test-data/users.ts` for credentials, `test-data/items.ts` for product names and IDs   |
| App state      | Cart state is set up and checked directly in `localStorage` (`cart-contents`)          |
| Isolation      | Each test gets a fresh browser context, so no login or cart state is shared            |
| Assertions     | Web-first assertions (`expect(locator).toHave*`), no fixed waits                        |
| Traceability   | Each case has an ID that is used as a tag on its test (see [README](README.md))         |

## 4. Environment

- **Base URL:** `https://www.saucedemo.com`
- **Browsers, retries, workers, reporters:** see `playwright.config.ts`. Local and
  CI runs use different values, depending on the `CI` environment variable.
- **Pre-commit gate:** a Husky hook runs `npm test` locally and blocks the commit
  if any test fails.
- **CI gate:** GitHub Actions (`.github/workflows/playwright.yml`) runs the suite
  on every push and pull request to `main` and uploads the HTML report.

## 5. Test Users

All users share the password `secret_sauce`.

| User                      | Expected behaviour                                          |
| ------------------------- | ----------------------------------------------------------- |
| `standard_user`           | Everything works; used as the baseline                      |
| `locked_out_user`         | Login fails with a "locked out" error                        |
| `problem_user`            | Broken images; sorting and some cart actions are faulty      |
| `error_user`              | Some cart and checkout actions fail or throw errors          |
| `visual_user`             | Visual differences in layout, prices and images              |
| `performance_glitch_user` | Slow page loads after login                                  |

Baseline tests with `standard_user` are written and verified before the tests for
the other users. Otherwise a broken assertion can't be told apart from a real
product bug.

## 6. Entry and Exit Criteria

**Entry**
- saucedemo.com is reachable
- `standard_user` login works

**Exit**
- All High priority cases are automated and passing in every configured browser
- No open High severity defects for `standard_user`
- Known defects of the special users are documented as expected behaviour, not
  treated as failures

## 7. Risks and Mitigations

| Risk                                                   | Mitigation                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| The `session-username` login cookie expires after about 10 minutes | Log in per test through a fixture; don't reuse an old `storageState` |
| Cart state in `localStorage` leaks between steps       | Clear or set `cart-contents` at the start of each cart test         |
| The third-party demo site changes selectors or data    | Prefer `data-test` selectors; keep product data in `test-data/`     |
| Flaky timing, especially with `performance_glitch_user` | Web-first assertions only; retries are kept to CI                  |
| Retries hide intermittent bugs                         | 0 retries locally; review tests marked "flaky" in CI reports        |
