# Petstore API — Playwright Test Suite

Automated API test suite for the [Swagger Petstore v2](https://petstore.swagger.io/) built with **Playwright** and **TypeScript**.

---

## Project structure

```
petstore-api-playwright/
  helpers/
    testData.ts          ← TypeScript types + factories (buildPet, buildOrder, buildUser)
  tests/
    pet.spec.ts          ← 15 test cases — 8 endpoints (pet tag)
    store.spec.ts        ← 11 test cases — 4 endpoints (store tag)
    user.spec.ts         ← 12 test cases — 8 endpoints (user tag)
  playwright.config.ts   ← base URL, headers, retries, reporters
  package.json
  README.md
```

---

## Setup

```bash
npm install
npx playwright install chromium   # only needed if running UI reports
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

## Design decisions

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