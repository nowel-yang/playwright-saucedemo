# Debug drills: answers

Spoilers for [debug-drills.md](debug-drills.md). Every fix below was checked to pass.

## @DRILL-1: broken locator

**Error:** `locator.click: Test timeout of 30000ms exceeded`, waiting for `getByTestId('logout-link')`.

**Cause:** the test ID doesn't exist. The real one is `logout-sidebar-link`. A locator that
matches nothing doesn't fail straight away. Playwright waits for it to appear until the
test times out, so a typo looks like a slow page.

**How to find it:** run with `--debug`, open the menu, then use **Pick locator** on the
Logout link. The Inspector shows `getByTestId('logout-sidebar-link')`. Typing the broken
locator into the Inspector's locator box shows 0 matches.

**Fix:**
```ts
await page.getByTestId("logout-sidebar-link").click();
```
Better still, use the page object (`inventoryPage.burgerMenuButton.logoutLink`), so the
locator is defined in one place.

## @DRILL-2: strict mode violation

**Error:** `strict mode violation: getByRole('button', { name: 'Add to cart' }) resolved to 6 elements`.

**Cause:** every product has an "Add to cart" button. Actions need exactly one match, so
Playwright refuses to guess. The error lists all 6 matches and suggests a locator for each.

**Fix:** scope the button to the product. `addItemToCart` already does this with
`filter({ has: ... })`:
```ts
await inventoryPage.addItemToCart(items.backpack.name);
```
**Wrong fix:** `.first()`. It passes today, but it clicks whichever product happens to come
first, so the test breaks or tests the wrong thing when the sort order changes.

## @DRILL-3: state not applied

**Error:** `expect(locator).toHaveText` → `Expected: "2"`, `element(s) not found`.

**Cause:** the test writes the cart to `localStorage`, but the page only reads
`localStorage` when it loads. The data is correct, but the page hasn't picked it up.

**How to find it:** put a breakpoint on the `expect` line and run **Debug Test** in
VS Code. In the Debug Console, run `await inventoryPage.getCartStorage()`: it returns
`[4, 0]`, so the data is right. The browser shows no badge, so the page hasn't refreshed.
(`await page.pause()` before the assertion shows the same thing.)

**Fix:** reload after setting storage, as `remove item from cart` (`@INV-031`) does:
```ts
await inventoryPage.setCartStorage(cartItemIds);
await inventoryPage.page.reload();
```

## @DRILL-4: race condition (flaky)

**Error, sometimes:** `expect(received).toBe(expected)` → `Expected: true`, `Received: false`.
In testing it failed 8 out of 10 runs with `--repeat-each=10`.

**Cause:** `isVisible()` checks **once, right now**, and doesn't wait. Straight after the
login click, the inventory page often hasn't loaded yet. Whether it passes depends on
speed, which is why this kind of bug shows up on slow CI machines.

**How to find it:** `--repeat-each=20` proves it's flaky. The trace shows `isVisible`
returning `false` a few milliseconds after the click, while the snapshot still shows the
login page. `npm run lint` also flags it (`playwright/prefer-web-first-assertions`).

**Fix:** use a web-first assertion, which retries until it passes or times out:
```ts
await expect(inventoryPage.cartLink).toBeVisible();
```
**Wrong fixes:** `waitForTimeout(1000)`, which is slow and still flaky, or adding retries,
which hides the bug.

## @DRILL-5: timeout too short for a slow environment

**Error:** `expect(locator).toHaveCount(expected)` → `Expected: 6`, `Received: 0`, `Timeout: 3000ms`.

**Cause:** `performance_glitch_user` simulates a slow backend. The URL changes to
`/inventory.html` quickly, but the products take about 10 seconds to appear. The test's
custom `timeout: 3000` gives up long before that.

**How to find it:** run with `--trace on` and open the trace. The action list shows
`toHaveCount` running for exactly 3.0s, and the timeline and snapshots show an empty page
the whole time.

**Fix:** remove the custom timeout, or make it longer than the known delay:
```ts
await expect(inventoryPage.inventoryItem).toHaveCount(6, { timeout: 15_000 });
```
**Interview point:** shortening timeouts makes a suite faster but brittle. If an
environment is slow on purpose, set the timeout to fit it, and treat real slowness as a
performance bug to report, not something to hide.

## @DRILL-6: wrong test data

**Error:** `Expected: "Test.allTheThings() T-Shirt (Red)"`, `Received: "Sauce Labs Backpack"`.

**Cause:** the test logs in as `problem_user`, whose sort dropdown deliberately does
nothing. The test code is fine. It's the wrong user for what it's testing.

**How to find it:** run `--headed` or in UI mode. The dropdown changes, but the product
order stays the same. Then check which user is logged in.

**Fix:**
```ts
const user = usernames.standard_user;
```
**Interview point:** this one could be a real app bug. If the test *should* use
`problem_user`, the failure is correct: report the bug, and either mark the test with
`test.fail()` or keep it failing until the bug is fixed. Don't change the expected value
to match the broken behavior.
