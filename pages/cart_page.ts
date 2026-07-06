import { Page, Locator, expect } from '@playwright/test';

import { SelectedProduct } from './inventory_page';



export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  static readonly URL_PATTERN = /.*cart\.html/;
  static readonly EXPECTED_TITLE = 'Your Cart';

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  /** Validates the cart page loaded correctly */
  async expectLoaded() {
    await expect(this.page).toHaveURL(CartPage.URL_PATTERN);
    await expect(this.title).toHaveText(CartPage.EXPECTED_TITLE);
  }

  /** Validates the number of items in the cart */
  async expectItemCount(count: number) {
    await expect(this.cartItems).toHaveCount(count);
  }

  /** Validates a specific product is in the cart by name */
  async expectProductInCart(productName: string) {
    await expect(
      this.page.locator('.inventory_item_name', { hasText: productName })
    ).toBeVisible();
  }

  /** Validates every selected product appears in the cart with the correct price */
  async expectProductsWithPrices(products: SelectedProduct[]) {
    await expect(this.cartItems).toHaveCount(products.length);

    for (let i = 0; i < products.length; i++) {
      const row = this.page.locator('.cart_item', {
        has: this.page.locator('[data-test="inventory-item-name"]', { hasText: products[i].name }),
      });

      await expect(row).toHaveCount(1);
      await expect(row.locator('[data-test="inventory-item-price"]'))
        .toHaveText(`$${products[i].price.toFixed(2)}`);
    }
  }


  /** Removes a product from the cart by its slug */
  async removeProduct(productSlug: string) {
    await this.page.locator(`[data-test="remove-${productSlug}"]`).click();
  }

  // CartPage.ts — adicionar este método

  /** Removes a product from the cart by its exact name */
  async removeProductByName(productName: string) {
    const row = this.page.locator('.cart_item', {
      has: this.page.locator('[data-test="inventory-item-name"]', {
        hasText: productName,
      }),
    });
    // slug = lowercase name with spaces replaced by hyphens
    const slug = productName.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '').replace(/\./g, '');
    await row.locator(`[data-test="remove-${slug}"]`).click();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }
}