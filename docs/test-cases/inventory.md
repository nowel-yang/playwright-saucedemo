# Test Cases: Inventory

**Page:** `/inventory.html` · **Page object:** `pages/InventoryPage.ts` · **Spec:** `tests/inventory.spec.ts`

**Precondition for all cases:** logged in as `standard_user` (the
`authenticatedInventoryPage` fixture), unless the case says otherwise.

The **Test** column names the automated test that covers the case. Blank means
it is not automated yet.

## Access control (INV-001–009)

Precondition: not logged in.

| ID      | Scenario                                          | Expected result                                                 | Priority | Test |
| ------- | ------------------------------------------------- | --------------------------------------------------------------- | -------- | ---- |
| INV-001 | Open `/inventory.html` directly                   | Redirected to login with an error saying the page needs a login | High     |      |
| INV-002 | Delete the `session-username` cookie, then reload | Redirected to login                                             | Medium   |      |

## Product list (INV-010–019)

| ID      | Scenario                | Expected result                                                     | Priority | Test |
| ------- | ----------------------- | ------------------------------------------------------------------- | -------- | ---- |
| INV-010 | Load the page           | 6 products are shown                                                | High     |      |
| INV-011 | Check each product      | Each has a name, description, price, image and "Add to cart" button | High     |      |
| INV-012 | Check the sort dropdown | Default is "Name (A to Z)"                                          | Medium   |      |
| INV-013 | Check product images    | No image is broken                                                  | Medium   |      |

## Sorting (INV-020–029)

| ID      | Scenario                           | Expected result                                           | Priority | Test            |
| ------- | ---------------------------------- | --------------------------------------------------------- | -------- | --------------- |
| INV-020 | Select "Price (low to high)"       | Dropdown and label show the option; prices are ascending  | High     | `sort products` |
| INV-021 | Select "Price (high to low)"       | Dropdown and label show the option; prices are descending | High     | `sort products` |
| INV-022 | Select "Name (A to Z)"             | Dropdown and label show the option; names are A to Z      | High     | `sort products` |
| INV-023 | Select "Name (Z to A)"             | Dropdown and label show the option; names are Z to A      | High     | `sort products` |
| INV-024 | Sort, then add an item to the cart | Sort order and selected option don't change               | Low      |                 |

`sort products` checks INV-020 to INV-023, each in its own `test.step`.

## Cart actions (INV-030–039)

| ID      | Scenario                                    | Expected result                                                            | Priority | Test                    |
| ------- | ------------------------------------------- | -------------------------------------------------------------------------- | -------- | ----------------------- |
| INV-030 | Empty cart; click "Add to cart" on Backpack | Badge shows "1"; button changes to "Remove"                                | High     | `add item to cart`      |
| INV-031 | Backpack in cart; click "Remove"            | Button changes to "Add to cart"; badge disappears; `cart-contents` is `[]` | High     | `remove item from cart` |
| INV-032 | Add three different items                   | Badge shows "3"; all three buttons show "Remove"                           | High     |                         |
| INV-033 | Add an item, then reload the page           | Badge and "Remove" button are still shown                                  | Medium   |                         |
| INV-034 | Add all 6 items                             | Badge shows "6"; all buttons show "Remove"                                 | Low      |                         |

## Navigation (INV-040–049)

| ID      | Scenario                                   | Expected result                  | Priority | Test              |
| ------- | ------------------------------------------ | -------------------------------- | -------- | ----------------- |
| INV-040 | Click the cart link                        | `/cart.html` opens               | High     | `go to cart page` |
| INV-041 | Click a product name                       | That product's detail page opens | Medium   |                   |
| INV-042 | Click a product image                      | That product's detail page opens | Low      |                   |
| INV-043 | On a detail page, click "Back to products" | Inventory page opens             | Low      |                   |

## Special users (INV-050–059)

Precondition: logged in as the user named in the scenario.

| ID      | Scenario                               | Expected result                             | Priority | Test                                    |
| ------- | -------------------------------------- | ------------------------------------------- | -------- | --------------------------------------- |
| INV-050 | `problem_user`: check product images   | Broken images are detected                  | Medium   | `shows broken images with problem user` |
| INV-051 | `problem_user`: change the sort option | Product order doesn't change (known defect) | Low      |                                         |
| INV-052 | `error_user`: add and remove items     | Some actions fail (known defect)            | Low      |                                         |
| INV-053 | `performance_glitch_user`: log in      | Inventory loads within the test timeout     | Low      |                                         |
