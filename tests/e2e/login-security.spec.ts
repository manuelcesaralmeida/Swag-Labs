import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login_page';
import { InventoryPage } from '../../pages/inventory_page';


const STANDARD_USER = process.env.STANDARD_USER;
const LOCKED_OUT_USER = process.env.LOCKED_OUT_USER;
const PASSWORD = process.env.PASSWORD;
const BASE_URL = process.env.BASE_URL;


let loginPage: LoginPage;


test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
});



test.describe('E2E - Negative scenarios + access control: Login security', () => {

    test('TEST — Login security: locked user, invalid credentials, protected route access', async ({ page }) => {

        const loginPage = new LoginPage(page);
        await loginPage.goto();

        // Step 1 — Locked_out_user must be rejected with the lockout message
        await loginPage.login(LOCKED_OUT_USER, PASSWORD);
        await loginPage.expectError('Sorry, this user has been locked out.');

        // Step 2 — Invalid credentials must be rejected
        await loginPage.login(STANDARD_USER, 'wrong_password');
        await loginPage.expectError(
            'Username and password do not match any user in this service'
        );

        // Step 3 — Direct access to a protected page without session
        // must redirect back to login with an explicit error
        await page.goto('/inventory.html');
        // await expect(page).toHaveURL('https://www.saucedemo.com/');
        // await expect(page).toHaveURL('https://www.saucedemo.com');
        await expect(page).toHaveURL(BASE_URL);
        await loginPage.expectError(
            "You can only access '/inventory.html' when you are logged in"
        );

        // Step 4 — Sanity: after the failures above, a valid login still works
        await loginPage.login(STANDARD_USER, PASSWORD);
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.expectLoaded();
    });
});
