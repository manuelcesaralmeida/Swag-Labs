import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login_page';
import { InventoryPage } from '../../pages/inventory_page';

const PASSWORD = 'secret_sauce';
const INVENTORY_URL = /.*inventory\.html/;

let loginPage: LoginPage;
let inventoryPage: InventoryPage;


test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
  await loginPage.goto();
});

// ─────────────────────────────────────────────────────────
// Positive scenarios
// ─────────────────────────────────────────────────────────

test.describe('Login — positive scenarios', () => {

  test('TC-LOG-01: standard_user logs in successfully → inventory page', async ({ page }) => {
   
    await loginPage.login('standard_user', PASSWORD);

    inventoryPage= new InventoryPage(page);
    await inventoryPage.expectLoaded();

  });


});