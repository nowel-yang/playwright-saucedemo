# playwright-saucedemo

[![Playwright Tests](https://github.com/nowel-yang/playwright-saucedemo/actions/workflows/playwright.yml/badge.svg)](https://github.com/nowel-yang/playwright-saucedemo/actions/workflows/playwright.yml)

End-to-end tests for [SauceDemo](https://www.saucedemo.com), a demo online shop,
written with Playwright and TypeScript. They run in Chromium, Firefox and WebKit.

## Tech stack

- **[Playwright Test](https://playwright.dev)** with **TypeScript**
- **Page Object Model:** one class per page or component in `pages/`
- **Custom fixtures** for logged-in pages (`fixtures/index.ts`)
- **ESLint** with `eslint-plugin-playwright`
- **Husky** pre-commit hook, and **GitHub Actions** for CI

## What's covered

| Feature     | Test cases                                       | Status      |
| ----------- | ------------------------------------------------ | ----------- |
| Login       | [auth.md](docs/test-cases/auth.md)               | Automated   |
| Inventory   | [inventory.md](docs/test-cases/inventory.md)     | In progress |
| Burger menu | [burger-menu.md](docs/test-cases/burger-menu.md) | Automated   |
| Cart        | _planned_                                        | Planned     |
| Checkout    | _planned_                                        | Planned     |

The [test plan](docs/test-plan.md) describes scope, approach, test users and risks.
The [docs README](docs/README.md) explains how the test docs are organized.

## Practices

- **Web-first assertions only.** Assertions wait for the page (`await expect(locator).toHaveText(...)`)
  instead of reading a value once or using fixed waits. ESLint enforces this.
- **Tests are traceable to test cases.** Every test is tagged with its case ID, such as
  `@INV-030`, so a case can be run on its own and found in the HTML report.
- **Two gates.** The pre-commit hook runs lint and the full suite before every commit,
  and GitHub Actions runs the suite again on every push and pull request.
- **Flaky tests are fixed, not retried away.** Retries are off locally so flakiness
  shows up straight away. CI allows 2 retries, and tests marked "flaky" there get
  investigated.
- **Isolated tests.** Each test gets a fresh browser context, and cart state is set
  up directly in `localStorage` so a test only fails for what it is testing.

## Running the tests

Requires Node.js (LTS).

```bash
npm ci                    # install dependencies
npx playwright install    # download the browsers

npm test                  # run all tests in all browsers
npm run test:ui           # interactive UI mode
npm run report            # open the last HTML report
npm run lint              # run ESLint
```

Run one test case, or a whole section, by its tag:

```bash
npx playwright test --grep @INV-030   # one case
npx playwright test --grep @AUTH-01   # every rejected-login case (AUTH-010 to AUTH-019)
```

## Project structure

```text
.github/workflows/   # CI: GitHub Actions workflow
.husky/              # pre-commit hook (lint + tests)
docs/                # test plan and test cases
fixtures/            # custom Playwright fixtures (logged-in pages)
pages/               # page objects
test-data/           # users and product data
tests/               # test specs
eslint.config.mjs    # lint rules
playwright.config.ts # browsers, retries, workers, base URL
```
