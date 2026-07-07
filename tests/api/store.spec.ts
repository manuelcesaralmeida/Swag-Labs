import { test, expect } from '@playwright/test';
// import { buildPet, Pet } from '../../helpers/test_data';
import { buildPet, buildOrder, Order } from '../../helpers/test_data';

const baseUrlApi = process.env.BASE_URL_API;


/**
 * Swagger tag: store
 * GET    /store/inventory          getInventory
 * POST   /store/order              placeOrder
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


test.describe('POST /store/order - placeOrder', () => {

  test('TC-STORE-02: Places a valid order → 200 echoes order body', async ({ request }) => {

    const pet = buildPet();
    await request.post(`${baseUrlApi}/pet`, { data: pet });

    const order = buildOrder(pet.id!);
    const res = await request.post(`${baseUrlApi}/store/order`, { data: order });


    expect(res.status()).toBe(200);
    const body: Order = await res.json();
    expect(body.id).toBe(order.id);
    expect(body.petId).toBe(pet.id);
    expect(body.status).toBe('placed');
    expect(body.complete).toBe(false);
  });

  test('TC-STORE-03: All order statuses accepted - placed/approved/delivered', async ({ request }) => {

    const statuses: Array<'placed' | 'approved' | 'delivered'> = [
      'placed', 'approved', 'delivered',
    ];

    for (let i = 0; i < statuses.length; i++) {
      const res = await request.post(`${baseUrlApi}/store/order`, {
        data: buildOrder(1, { status: statuses[i] }),
      });
      expect(res.status(), `status "${statuses[i]}" should be accepted`).toBe(200);

      const body: Order = await res.json();
      expect(body.status).toBe(statuses[i]);
    }

  });

  test('TC-STO-04: malformed body -> 400/500', async ({ request }) => {

    const res = await request.post(`${baseUrlApi}/store/order`, {
      headers: { 'Content-Type': 'application/json' },
      data: '{invalid',
    });
    expect([400, 500]).toContain(res.status());
  });

});
