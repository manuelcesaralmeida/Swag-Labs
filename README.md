# Swag Labs — Automated UI Tests

Two automated UI tests for [Swag Labs](https://www.saucedemo.com/) built with **Playwright + TypeScript** using the **Page Object Model**.

## The 2 tests

### TEST 1 — E2E Purchase Flow (happy path)
Validates the core business functionality end-to-end:

1. Login with `standard_user`
2. Inventory page loads (URL, title, 6 products)
3. Add 2 products **by list position**, capturing name + price dynamically
4. Cart badge reflects item count
5. Cart shows the exact selected products with correct prices
6. Checkout: customer information form
7. **Math validation** — subtotal = Σ selected prices, total = subtotal + tax
8. Order confirmation ("Thank you for your order!")

> No product data is hardcoded - names/prices are captured on the inventory
> page and validated downstream, so the test detects inconsistencies
> between inventory, cart and checkout.

### TEST 2 — Login Security (negative + access control)
Validates that the application protects access correctly:

1. `locked_out_user` -> specific lockout error
2. Invalid credentials -> rejection error
3. **Direct URL access** to `/inventory.html` without session -> redirected to login with explicit error
4. Sanity: valid login still works after the failures

## Structure

```
swaglabs-assessment/
  pages/pages.ts            ← 6 Page Objects (Login, Inventory, Cart, Checkout×2, Complete)
  tests/swaglabs.spec.ts    ← the 2 tests
  playwright.config.ts
```

## Run

```bash
npm init -y
npm i -D @playwright/test typescript
npx playwright install chromium
npx playwright test
npx playwright show-report
```

## Design decisions

- **`[data-test="…"]` selectors** — the most stable attributes on SauceDemo
- **Page Object Model** — reusable, maintainable, readable tests
- **Dynamic data capture** — prices/names flow from inventory → cart → checkout assertions
- **Screenshot/video/trace on failure** — full debugging evidence in CI