// pages/InventoryPage.ts
import { Page, Locator, expect } from '@playwright/test';


export interface SelectedProduct {
  name: string;
  price: number;
}

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly inventoryItems: Locator;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;

  static readonly URL_PATTERN = /.*inventory\.html/;
  static readonly EXPECTED_TITLE = 'Products';
  static readonly EXPECTED_ITEM_COUNT = 6;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('.inventory_item');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(InventoryPage.URL_PATTERN);
    await expect(this.title).toHaveText(InventoryPage.EXPECTED_TITLE);
    await expect(this.inventoryItems).toHaveCount(InventoryPage.EXPECTED_ITEM_COUNT);
  }

    /**
   * Adds ALL products to the cart, capturing name and price of each.
   * Returns the list of selected products for later validation.
   */
  async addAllProductsToCart(): Promise<SelectedProduct[]> {
    const selected: SelectedProduct[] = [];
    const count = await this.inventoryItems.count();

    for (let i = 0; i < count; i++) {
      const item = this.inventoryItems.nth(i);

      const name = (await item.locator('[data-test="inventory-item-name"]').textContent()) ?? '';
      const priceText = (await item.locator('[data-test="inventory-item-price"]').textContent()) ?? '';
      const price = parseFloat(priceText.replace('$', ''));

      await item.locator('button', { hasText: 'Add to cart' }).click();

      selected.push({ name, price });
    }

    return selected;
  }

  /**
   * Adds a product to the cart by its position in the list (0-based).
   * Position 0 = Sauce Labs Backpack, 1 = Bike Light, 2 = Bolt T-Shirt,
   * 3 = Fleece Jacket, 4 = Onesie, 5 = Test.allTheThings() T-Shirt (Red)
   */
  async addProductToCartByPosition(position: number) {
    const item = this.inventoryItems.nth(position);
    await item.locator('button', { hasText: 'Add to cart' }).click();
  }

  /** Returns the product name at a given position — useful to validate later in the cart */
  async getProductNameByPosition(position: number): Promise<string> {
    const item = this.inventoryItems.nth(position);
    return (await item.locator('[data-test="inventory-item-name"]').textContent()) ?? '';
  }

  /** Returns the product price at a given position (e.g. "$29.99") */
  async getProductPriceByPosition(position: number): Promise<string> {
    const item = this.inventoryItems.nth(position);
    return (await item.locator('[data-test="inventory-item-price"]').textContent()) ?? '';
  }

  /**
   * Adds a product to the cart by its slug.
   * Example: addProductToCart('sauce-labs-backpack')
   */
  async addProductToCart(productSlug: string) {
    await this.page.locator(`[data-test="add-to-cart-${productSlug}"]`).click();
  }

  /** Validates the cart badge shows the expected number of items */
  async expectCartCount(count: number) {
    await expect(this.shoppingCartBadge).toHaveText(String(count));
  }

  async goToCart() {
    await this.shoppingCartLink.click();
  }
}