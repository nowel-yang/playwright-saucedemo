# Test Cases: Burger Menu

**Component:** side menu opened from the header · **Page object:** `pages/BurgerMenu.ts` · **Spec:** `tests/burgerMenu.spec.ts`

**Precondition for all cases:** logged in as `standard_user`, on the inventory page
(the `authenticatedInventoryPage` fixture).

The **Test** column names the automated test that covers the case. Blank means
it is not automated yet.

## Open and close (MENU-001–009)

| ID       | Scenario                          | Expected result        | Priority | Test                             |
| -------- | --------------------------------- | ---------------------- | -------- | -------------------------------- |
| MENU-001 | Click the burger menu button      | Menu opens and is visible | High  | `open and close the burger menu` |
| MENU-002 | With the menu open, click the close (X) button | Menu is hidden | High | `open and close the burger menu` |

MENU-001 is checked in the `beforeEach` of the "with menu open" group, so it runs
before every test in that group.

## Menu actions (MENU-010–019)

| ID       | Scenario                                                   | Expected result                  | Priority | Test                           |
| -------- | ---------------------------------------------------------- | -------------------------------- | -------- | ------------------------------ |
| MENU-010 | Open the menu and click "Logout"                           | Login page (`/`) opens           | High     | `log out from the burger menu` |
| MENU-011 | One item in the cart; open the menu and click "Reset App State" | Cart badge disappears       | High     | `reset app state`              |

## Dynamic catalog (MENU-020–029)

| ID       | Scenario                                                   | Expected result                                 | Priority | Test                          |
| -------- | ---------------------------------------------------------- | ----------------------------------------------- | -------- | ----------------------------- |
| MENU-020 | Open the menu, click "Dynamic Catalog", then "Lazy Load"   | `/dynamic-catalog-lazy-load.html` opens         | Medium   | `dynamic catalog - lazy load` |
| MENU-021 | Open the menu, click "Dynamic Catalog", then "Spinner"     | `/dynamic-catalog-spinner.html` opens           | Medium   | `dynamic catalog - spinner`   |
