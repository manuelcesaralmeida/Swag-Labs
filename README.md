# Petstore API — Playwright Test Suite

Automated E2E test suite for [Swag Labs](https://www.saucedemo.com/) built with **Playwright + TypeScript** using the **Page Object Model**.

Repository: [https://github.com/manuelcesaralmeida/Swag-Labs](https://github.com/manuelcesaralmeida/Swag-Labs)

---

## Project structure

```
Swag-Labs/
  pages/
    login_page.ts
    inventory_page.ts
    cart_page.ts
    checkout_step_one_page.ts
    checkout_step_two_page.ts
    checkout_complete_page.ts
  tests/
    e2e/
      login-security.spec.ts        ← 1 test case (negative + access control)
      purchase-flow.e2e.spec.ts     ← 2 test cases (E2E purchase flows)
  playwright.config.ts
  .env                              ← credentials and base URL (not committed)
```

---

## Setup

```bash
npm install
npx playwright install chromium   # only needed if running UI reports
```

---

Create a `.env` file at the root:

```env
BASE_URL=https://www.saucedemo.com
STANDARD_USER=standard_user
LOCKED_OUT_USER=locked_out_user
PASSWORD=secret_sauce
FIRST_NAME=Cesar
LAST_NAME=Almeida
POSTAL_CODE=4430-381
```

---

## Run tests

```bash
# all tests
npx playwright test

# by tag (file)
npx playwright test tests/pet.spec.ts
npx playwright test tests/store.spec.ts
npx playwright test tests/user.spec.ts
npx playwright test tests/e2e/login-security.spec.ts
npx playwright test tests/e2e/purchase-flow.e2e.spec.ts

# open HTML report after run
npx playwright show-report
```

---

## Configuration

| Setting | Value |
|---|---|
| Base URL | `https://petstore.swagger.io/v2` |
| Auth header | `api_key: special-key` |
| Timeout | 30 000 ms |
| Retries (local) | 1 |
| Retries (CI) | 2 |
| Workers (local) | automatic (half available CPUs) |
| Workers (CI) | 1 (sequential) |
| Reporters | `list`, `html`, `junit` |

---

## Test coverage

### pet.spec.ts — 15 test cases

| TC | Endpoint | Method | Scenario |
|---|---|---|---|
| TC-PET-01 | `/pet` | POST | Create pet with all fields → 200, echoes body |
| TC-PET-02 | `/pet` | POST | Create pet with required fields only (name + photoUrls) |
| TC-PET-03 | `/pet` | POST | Validates photoUrls contain `.jpg` extension |
| TC-PET-04 | `/pet` | POST | Invalid payload → 400/405/500 |
| TC-PET-05 | `/pet` | PUT | Update existing pet name and status → 200 |
| TC-PET-06 | `/pet/findByStatus` | GET | Filter by each status enum (available/pending/sold) |
| TC-PET-07 | `/pet/findByStatus` | GET | Created pet appears in its status filter |
| TC-PET-08 | `/pet/findByTags` | GET | Filter by tag → 200 returns array (deprecated endpoint) |
| TC-PET-09 | `/pet/{petId}` | GET | Fetch existing pet → 200 with correct schema |
| TC-PET-10 | `/pet/{petId}` | GET | Non-existing pet id → 404 |
| TC-PET-11 | `/pet/{petId}` | GET | Non-integer pet id → 400/404 |
| TC-PET-12 | `/pet/{petId}` | POST | Update name/status via form data → 200, change persisted |
| TC-PET-13 | `/pet/{petId}` | DELETE | Delete existing pet → 200, then GET returns 404 |
| TC-PET-14 | `/pet/{petId}` | DELETE | Delete non-existing pet → 404 |
| TC-PET-15 | `/pet/{petId}/uploadImage` | POST | Upload jpg image (multipart) → 200 ApiResponse schema |

### store.spec.ts — 11 test cases

| TC | Endpoint | Method | Scenario |
|---|---|---|---|
| TC-STO-01 | `/store/inventory` | GET | Returns map of status → integer quantities |
| TC-STO-02 | `/store/order` | POST | Place valid order → 200, echoes body |
| TC-STO-03 | `/store/order` | POST | All order status enums accepted (placed/approved/delivered) |
| TC-STO-04 | `/store/order` | POST | Malformed body → 400/500 |
| TC-STO-05 | `/store/order/{orderId}` | GET | Fetch order in valid range (1-10) → 200 |
| TC-STO-06 | `/store/order/{orderId}` | GET | orderId above maximum (11) → 400/404 (swagger max=10) |
| TC-STO-07 | `/store/order/{orderId}` | GET | orderId below minimum (0) → 400/404 (swagger min=1) |
| TC-STO-08 | `/store/order/{orderId}` | GET | Non-integer orderId → 400/404 |
| TC-STO-09 | `/store/order/{orderId}` | DELETE | Delete existing order → 200, then GET returns 404 |
| TC-STO-10 | `/store/order/{orderId}` | DELETE | Negative orderId → 400/404 |
| TC-STO-11 | `/store/order/{orderId}` | DELETE | Non-integer orderId → 400/404 |

### user.spec.ts — 12 test cases

| TC | Endpoint | Method | Scenario |
|---|---|---|---|
| TC-USR-01 | `/user` | POST | Create user → 200 |
| TC-USR-02 | `/user` | POST | Created user retrievable by username |
| TC-USR-03 | `/user/createWithList` | POST | Create multiple users from list → 200 |
| TC-USR-04 | `/user/createWithArray` | POST | Create multiple users from array → 200 |
| TC-USR-05 | `/user/{username}` | GET | Existing user → 200 with correct schema |
| TC-USR-06 | `/user/{username}` | GET | Non-existing username → 404 |
| TC-USR-07 | `/user/{username}` | PUT | Update user email → 200, change persisted |
| TC-USR-08 | `/user/{username}` | DELETE | Delete existing user → 200, then GET returns 404 |
| TC-USR-09 | `/user/{username}` | DELETE | Delete non-existing user → 404 |
| TC-USR-10 | `/user/login` | GET | Valid login → 200 + X-Rate-Limit + X-Expires-After headers |
| TC-USR-11 | `/user/login` | GET | Missing required params → 400 or demo 200 |
| TC-USR-12 | `/user/logout` | GET | Logout → 200 |

---

---

## Test specifications

### `tests/e2e/login-security.spec.ts`

**E2E — Negative scenarios + access control: Login security**

| TC | Test case | Steps | Expected result |
|---|---|---|---|
| TC-LOGIN-SECURITY-01 | Login security: locked user, invalid credentials, protected route access | 1. Login with `locked_out_user` + valid password | Error: *"Sorry, this user has been locked out."* |
| | | 2. Login with `standard_user` + wrong password | Error: *"Username and password do not match any user in this service"* |
| | | 3. Navigate directly to `/inventory.html` without session | Redirect to base URL with error: *"You can only access '/inventory.html' when you are logged in"* |
| | | 4. Login with valid `standard_user` credentials | Inventory page loads correctly |

---

### `tests/e2e/purchase-flow.e2e.spec.ts`

**E2E — Purchase All Products**

| TC | Test case | Steps | Expected result |
|---|---|---|---|
| TC-E2E-01 | Select all 6 products, validate names/prices, validate checkout total | 1. Login with `standard_user` | Inventory page loads |
| | | 2. Add all 6 products (capturing name + price dynamically) | Cart badge = 6 |
| | | 3. Navigate to cart — validate every product name and price | All 6 products present with correct prices |
| | | 4. Proceed to checkout — fill customer information | Form accepted |
| | | 5. Overview — validate subtotal = Σ product prices, total = subtotal + tax | Math validation passes |
| | | 6. Finish order | *"Thank you for your order!"* confirmation |

**E2E — Purchase with Product Removal**

| TC | Test case | Steps | Expected result |
|---|---|---|---|
| TC-E2E-02 | Select all 6 products, remove 3rd and 5th, validate names/prices, validate checkout total | 1. Login with `standard_user` | Inventory page loads |
| | | 2. Add all 6 products (capturing name + price dynamically) | Cart badge = 6 |
| | | 3. Navigate to cart — remove product at position 3 (index 2) and position 5 (index 4) | 4 products remain |
| | | 4. Validate remaining 4 products with correct names and prices | Correct products and prices displayed |
| | | 5. Proceed to checkout — fill customer information | Form accepted |
| | | 6. Overview — validate subtotal = Σ remaining product prices, total = subtotal + tax | Math validation passes for 4 products |
| | | 7. Finish order | *"Thank you for your order!"* confirmation |

---

## Page Objects

| File | Responsibility |
|---|---|
| `login_page.ts` | `goto()`, `login()`, `expectError()` |
| `inventory_page.ts` | `expectLoaded()`, `addAllProductsToCart()`, `expectCartCount()`, `goToCart()` |
| `cart_page.ts` | `expectLoaded()`, `expectProductsWithPrices()`, `removeProductByName()`, `proceedToCheckout()` |
| `checkout_step_one_page.ts` | `expectLoaded()`, `fillInformation()`, `clickContinueButton()` |
| `checkout_step_two_page.ts` | `expectLoaded()`, `expectItemCount()`, `expectTotalsMatchProducts()`, `finishOrder()` |
| `checkout_complete_page.ts` | `expectOrderConfirmed()` |

---

## Design decisions

**Environment variables** — credentials and base URL are loaded from `.env` via `process.env`, keeping sensitive data out of the codebase and making the suite configurable across environments.

**Dynamic data capture** — product names and prices are captured on the inventory page via `addAllProductsToCart()` and propagated to cart and checkout assertions. No hardcoded product data — the test detects any inconsistency between pages automatically.

**Math validation** — `expectTotalsMatchProducts()` validates that `subtotal = Σ selected product prices` and `total = subtotal + tax`, catching pricing bugs that a simple text check would miss.

**Product removal by name** — `removeProductByName()` finds the cart row by the product's captured name, making the removal independent of DOM position and resilient to reordering.

**`[data-test="…"]` selectors** — the most stable attribute on SauceDemo, decoupled from CSS classes and element hierarchy.

**`beforeEach` hook** — navigates to the login page before each test, ensuring a clean state without relying on shared session state between tests.

**`uniqueId()` factory** — generates unique numeric IDs per run using `Date.now()` to avoid collisions on the shared public demo server.

**Factories (`buildPet`, `buildOrder`, `buildUser`)** — centralise test data creation with sensible defaults and allow per-test overrides via spread.

**Boundary testing** — `orderId` min/max constraints declared in the swagger (`minimum: 1`, `maximum: 10`) are explicitly tested with values at, above and below the boundary.

**Enum coverage** — `Pet.status` (`available`/`pending`/`sold`) and `Order.status` (`placed`/`approved`/`delivered`) are tested value by value inside classic `for` loops.

**Contract header validation** — `GET /user/login` asserts both `X-Rate-Limit` and `X-Expires-After` response headers, which are explicitly declared in the swagger spec.

**Flexible error assertions** — where the demo server deviates from the swagger contract (e.g. returns 500 instead of 405), assertions accept a range of plausible status codes `[400, 405, 500]` with an inline comment explaining the deviation.

**`retries: 1`** — petstore.swagger.io is a shared public server and can be intermittently slow or return unexpected responses; a single retry avoids false failures without masking real bugs.

---

## CI integration

Set the `CI` environment variable to enable CI mode:

```bash
CI=true npx playwright test
```

In CI mode: `workers=1` (sequential), `retries=2`, JUnit report written to `results/junit.xml`.