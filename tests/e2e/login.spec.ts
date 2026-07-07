import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login_page';
import { InventoryPage } from '../../pages/inventory_page';

const STANDARD_USER = process.env.STANDARD_USER;
const PASSWORD = process.env.PASSWORD;
const PROBLEM_USER = process.env.PROBLEM_USER;
const PERFORMANCE_GLITCH_USER = process.env.PERFORMANCE_GLITCH_USER;
const ERROR_USER = process.env.ERROR_USER;
const VISUAL_USER = process.env.VISUAL_USER;

const INVENTORY_URL = /.*inventory\.html/;



let loginPage: LoginPage;
let inventoryPage: InventoryPage;


test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
  await loginPage.goto();
});

// ----------------------
// Positive scenarios
// ----------------------

test.describe('Login - Positive scenarios', () => {

  test('TC-LOGIN-01: Standard_user logs in successfully -> inventory page', async ({ page }) => {
   
    await loginPage.login(STANDARD_USER, PASSWORD);

    inventoryPage= new InventoryPage(page);
    await inventoryPage.expectLoaded();

  })

 test('TC-LOG-02: problem_user logs in successfully (UI issues expected after)', async ({ page }) => {
    await loginPage.login(PROBLEM_USER, PASSWORD);
    await expect(page).toHaveURL(INVENTORY_URL);

  });

  test('TC-LOGIN-03: performance_glitch_user logs in (slower response tolerated)', async ({ page }) => {
    
    test.setTimeout(60_000); // this user is intentionally slow

    const start = Date.now();
    await loginPage.login(PERFORMANCE_GLITCH_USER, PASSWORD);
    await expect(page).toHaveURL(INVENTORY_URL, { timeout: 30_000 });

    const elapsed = Date.now() - start;
    console.log(`performance_glitch_user login took ${elapsed}ms`);

  });

  test('TC-LOGIN-04: error_user logs in successfully', async ({ page }) => {
   
    await loginPage.login(ERROR_USER, PASSWORD);
    await expect(page).toHaveURL(INVENTORY_URL);

  });

  test('TC-LOGIN-05: visual_user logs in successfully', async ({ page }) => {
    
    await loginPage.login(VISUAL_USER, PASSWORD);
    await expect(page).toHaveURL(INVENTORY_URL);

  });

});