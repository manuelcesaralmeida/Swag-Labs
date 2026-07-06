import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login_page';
import { InventoryPage } from '../../pages/inventory_page';

const STANDARD_USER = process.env.STANDARD_USER;
const PASSWORD = process.env.PASSWORD;


let loginPage: LoginPage;
let inventoryPage: InventoryPage;


test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
  await loginPage.goto();
});

// ----------------------
// Positive scenarios
// ----------------------

test.describe('Login — Positive scenarios', () => {

  test('TC-LOG-01: Standard_user logs in successfully -> inventory page', async ({ page }) => {
   
    await loginPage.login(STANDARD_USER, PASSWORD);

    inventoryPage= new InventoryPage(page);
    await inventoryPage.expectLoaded();

  });


});