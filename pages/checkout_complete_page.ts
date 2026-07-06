import { Page, Locator, expect } from '@playwright/test';

export class CheckoutCompletePage {
  readonly page: Page;
  readonly title: Locator;
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  static readonly URL_PATTERN = /.*checkout-complete\.html/;
  static readonly EXPECTED_TITLE = 'Checkout: Complete!';
  static readonly EXPECTED_MESSAGE = 'Thank you for your order!';

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  /** Validates the full order confirmation page state */
  async expectOrderConfirmed() {
    await expect(this.page).toHaveURL(CheckoutCompletePage.URL_PATTERN);
    await expect(this.title).toHaveText(CheckoutCompletePage.EXPECTED_TITLE);
    await expect(this.completeHeader).toHaveText(CheckoutCompletePage.EXPECTED_MESSAGE);
  }

  /** Returns to the inventory page */
  async backToProducts() {
    await this.backHomeButton.click();
  }
}