import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login_page';
import { InventoryPage } from '../../pages/inventory_page';
import { CartPage } from '../../pages/cart_page';
import { CheckoutStepOnePage } from '../../pages/checkout_step_one_page';
import { CheckoutStepTwoPage } from '../../pages/checkout_step_two_page';
import { CheckoutCompletePage } from '../../pages/checkout_complete_page';

const STANDARD_USER = process.env.STANDARD_USER;
const PASSWORD = process.env.PASSWORD;
const FIRST_NAME = process.env.FIRST_NAME;
const LAST_NAME = process.env.LAST_NAME;
const POSTAL_CODE = process.env.POSTAL_CODE;

let loginPage: LoginPage;
let inventoryPage: InventoryPage;


test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
});



test.describe('E2E - Purchase All Products', () => {

    test('TC-E2E-01: Select all 6 products, validate names/prices, validate checkout total', async ({ page }) => {

        // 1. Login
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        // await loginPage.login('standard_user', 'secret_sauce');
        await loginPage.login(STANDARD_USER, PASSWORD);

        // 2. Inventory - Add ALL products, capturing name + price
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.expectLoaded();

        const selectedProducts = await inventoryPage.addAllProductsToCart();
        await inventoryPage.expectCartCount(selectedProducts.length);
        await inventoryPage.goToCart();

        // 3. Cart - Validate every product name and price
        const cartPage = new CartPage(page);
        await cartPage.expectLoaded();
        await cartPage.expectProductsWithPrices(selectedProducts);
        await cartPage.proceedToCheckout();

        // 4. Customer information
        const stepOne = new CheckoutStepOnePage(page);
        await stepOne.expectLoaded();
        await stepOne.fillInformation({
            firstName: FIRST_NAME,
            lastName: LAST_NAME,
            postalCode: POSTAL_CODE,
        });

        // 5 Click on Continue button
        await stepOne.clickContinueButton()


        // 6. Overview - Validate total = sum of selected products (+ tax)
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

test.describe('E2E - Purchase with Product Removal', () => {
    test('TC-E2E-02: Select all 6 products, remove 3rd and 5th, validate names/prices, validate checkout total', async ({ page }) => {

        // 1. Login
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        // await loginPage.login('standard_user', 'secret_sauce');
        await loginPage.login(STANDARD_USER, PASSWORD);

        // 2. Inventory - Add ALL 6 products, capturing name + price
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.expectLoaded();
        const allProducts = await inventoryPage.addAllProductsToCart();
        await inventoryPage.expectCartCount(allProducts.length);
        await inventoryPage.goToCart();

        // 3. Cart - Remove 3rd (index 2) and 5th (index 4) products
        const cartPage = new CartPage(page);
        await cartPage.expectLoaded();

        // Capture the names to remove before filtering
        const productToRemove1 = allProducts[2]; // position 3
        const productToRemove2 = allProducts[4]; // position 5

        await cartPage.removeProductByName(productToRemove1.name);
        await cartPage.removeProductByName(productToRemove2.name);

        // Remaining products after removal
        const remainingProducts = allProducts.filter(
            p => p.name !== productToRemove1.name && p.name !== productToRemove2.name
        );

        // 4. Cart - Validate only remaining products with correct names/prices
        await cartPage.expectProductsWithPrices(remainingProducts);
        await cartPage.proceedToCheckout();

        // 5. Customer information
        const stepOne = new CheckoutStepOnePage(page);
        await stepOne.expectLoaded();
        await stepOne.fillInformation({
            firstName: FIRST_NAME,
            lastName: LAST_NAME,
            postalCode: POSTAL_CODE,
        });

        // 6. Click on Continue button
        await stepOne.clickContinueButton();

        // 7. Overview - Validate total = sum of REMAINING products (+ tax)
        const stepTwo = new CheckoutStepTwoPage(page);
        await stepTwo.expectLoaded();
        await stepTwo.expectItemCount(remainingProducts.length);
        await stepTwo.expectTotalsMatchProducts(remainingProducts);
        await stepTwo.finishOrder();

        // 8. Confirmation
        const completePage = new CheckoutCompletePage(page);
        await completePage.expectOrderConfirmed();
    });
});