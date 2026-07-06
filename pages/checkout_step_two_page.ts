import { Page, Locator, expect } from '@playwright/test';

import { SelectedProduct } from './inventory_page';

export class CheckoutStepTwoPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartItems: Locator;
  readonly itemTotal: Locator;      // subtotal
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  static readonly URL_PATTERN = /.*checkout-step-two\.html/;
  static readonly EXPECTED_TITLE = 'Checkout: Overview';

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.cartItems = page.locator('.cart_item');
    this.itemTotal = page.locator('[data-test="subtotal-label"]');
    this.tax = page.locator('[data-test="tax-label"]');
    this.total = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(CheckoutStepTwoPage.URL_PATTERN);
    await expect(this.title).toHaveText(CheckoutStepTwoPage.EXPECTED_TITLE);
  }

  /** Validates the order summary contains the expected item count */
  async expectItemCount(count: number) {
    await expect(this.cartItems).toHaveCount(count);
  }

  /** Validates subtotal + tax = total (math check) */
  async expectTotalsAreConsistent() {
    const subtotalText = await this.itemTotal.textContent();   // "Item total: $29.99"
    const taxText = await this.tax.textContent();              // "Tax: $2.40"
    const totalText = await this.total.textContent();          // "Total: $32.39"

    const subtotal = parseFloat(subtotalText!.replace(/[^0-9.]/g, ''));
    const taxValue = parseFloat(taxText!.replace(/[^0-9.]/g, ''));
    const total = parseFloat(totalText!.replace(/[^0-9.]/g, ''));

    expect(total).toBeCloseTo(subtotal + taxValue, 2);
  }

    /**
   * Validates:
   *  - subtotal = sum of selected product prices
   *  - total = subtotal + tax
   */
  async expectTotalsMatchProducts(products: SelectedProduct[]) {
    // expected subtotal from what we actually selected
    let expectedSubtotal = 0;
    for (let i = 0; i < products.length; i++) {
      expectedSubtotal += products[i].price;
    }

    const subtotalText = (await this.itemTotal.textContent()) ?? '';
    const taxText = (await this.tax.textContent()) ?? '';
    const totalText = (await this.total.textContent()) ?? '';

    const subtotal = parseFloat(subtotalText.replace(/[^0-9.]/g, ''));
    const tax = parseFloat(taxText.replace(/[^0-9.]/g, ''));
    const total = parseFloat(totalText.replace(/[^0-9.]/g, ''));

    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);   // soma dos produtos
    expect(total).toBeCloseTo(subtotal + tax, 2);        // matemática do checkout
  }

  async finishOrder() {
    await this.finishButton.click();
  }
}