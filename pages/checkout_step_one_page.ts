import { Page, Locator, expect } from '@playwright/test';

export interface CheckoutInfo {

  firstName: string;
  lastName: string;
  postalCode: string;

}

export class CheckoutStepOnePage {

  readonly page: Page;
  readonly title: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  static readonly URL_PATTERN = /.*checkout-step-one\.html/;
  static readonly EXPECTED_TITLE = 'Checkout: Your Information';

  constructor(page: Page) {

    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');

  }

  async expectLoaded() {

    await expect(this.page).toHaveURL(CheckoutStepOnePage.URL_PATTERN);
    await expect(this.title).toHaveText(CheckoutStepOnePage.EXPECTED_TITLE);

  }

  /** Fills the customer information */
  async fillInformation(info: CheckoutInfo) {

    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);

  }

  async clickContinueButton() {

    await this.continueButton.click();

  }

  async clickCancelButton() {

    await this.cancelButton.click();

  }

  /** For negative tests — validates form error messages */u
  async expectError(message: string) {

    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);

  }
}