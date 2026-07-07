import { test, expect } from '@playwright/test';
import { buildPet, Pet } from '../../helpers/test_data';

const baseUrlApi = process.env.BASE_URL_API;


/**
 * Swagger tag: store
 * GET    /store/inventory          getInventory

 */

test.describe('GET /store/inventory - getInventory', () => {

  test('TC-STORE-01: Returns 200 with map of status -> integer quantities', async ({ request }) => {
    const res = await request.get(`${baseUrlApi}/store/inventory`);

    expect(res.status()).toBe(200);
    const body: Record<string, number> = await res.json();
    expect(typeof body).toBe('object');

    const keys = Object.keys(body);
    for (let i = 0; i < keys.length; i++) {
      expect(typeof keys[i]).toBe('string');
      expect(Number.isInteger(body[keys[i]])).toBe(true);
    }
  });
});
