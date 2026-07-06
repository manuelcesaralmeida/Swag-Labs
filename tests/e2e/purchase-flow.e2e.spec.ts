import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login_page';
import { InventoryPage } from '../../pages/inventory_page';
import { CartPage } from '../../pages/cart_page';
import { CheckoutStepOnePage } from '../../pages/checkout_step_one_page';
import { CheckoutStepTwoPage } from '../../pages/checkout_step_two_page';
import { CheckoutCompletePage } from '../../pages/checkout_complete_page';

const PASSWORD = 'secret_sauce';
const INVENTORY_URL = /.*inventory\.html/;

let loginPage: LoginPage;
let inventoryPage: InventoryPage;


test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
});



test.describe('E2E — Purchase All Products', () => {

    test('TC-E2E-02: Select all 6 products, validate names/prices, validate checkout total', async ({ page }) => {

        // 1. Login
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('standard_user', 'secret_sauce');

        // 2. Inventory — add ALL products, capturing name + price
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.expectLoaded();

        const selectedProducts = await inventoryPage.addAllProductsToCart();
        await inventoryPage.expectCartCount(selectedProducts.length);
        await inventoryPage.goToCart();

        // 3. Cart — validate every product name and price
        const cartPage = new CartPage(page);
        await cartPage.expectLoaded();
        await cartPage.expectProductsWithPrices(selectedProducts);
        await cartPage.proceedToCheckout();

        // 4. Customer information
        const stepOne = new CheckoutStepOnePage(page);
        await stepOne.expectLoaded();
        await stepOne.fillInformationAndContinue({
            firstName: 'Cesar',
            lastName: 'Almeida',
            postalCode: '4430-381',
        });

        // 5 Click on Continue button
        await stepOne.clickContinueButton()


        // 6. Overview — validate total = sum of selected products (+ tax)
        const stepTwo = new CheckoutStepTwoPage(page);
        await stepTwo.expectLoaded();
        await stepTwo.expectItemCount(selectedProducts.length);
        await stepTwo.expectTotalsMatchProducts(selectedProducts);
        await stepTwo.finishOrder();

        // 7. Confirmation
        const completePage = new CheckoutCompletePage(page);
        await completePage.expectOrderConfirmed();
    });

});

