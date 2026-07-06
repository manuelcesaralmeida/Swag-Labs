import { test, expect } from '@playwright/test';
import { buildPet, Pet } from '../../helpers/test_data';

const baseUrlApi = process.env.BASE_URL_API;

/**
 * Covers swagger tag "pet":
 *  POST   /pet                    addPet
 *  PUT    /pet                    updatePet
 *  GET    /pet/findByStatus       findPetsByStatus
 *  GET    /pet/findByTags         findPetsByTags (deprecated)
 *  GET    /pet/{petId}            getPetById
 *  POST   /pet/{petId}            updatePetWithForm
 *  DELETE /pet/{petId}            deletePet
 *  POST   /pet/{petId}/uploadImage uploadFile
 */

test.describe('POST /pet - addPet', () => {

  test('TC-PET-01: Creates a pet with all valid fields -> 200', async ({ request }) => {

    const pet = buildPet();

    const res = await request.post(`${baseUrlApi}/pet`, { data: pet });
    expect(res.status()).toBe(200);

    const body: Pet = await res.json();
    expect(body.id).toBe(pet.id);
    expect(body.name).toBe(pet.name);
    expect(body.status).toBe('available');
    expect(body.photoUrls).toEqual(pet.photoUrls);

  });

  test('TC-PET-02: Creates a pet with only required fields (name, photoUrls)', async ({ request }) => {

    const res = await request.post(`${baseUrlApi}/pet`, {
      data: { name: 'minimal-pet', photoUrls: ['https://picsum.photos/200/300'] },
    });
    expect(res.status()).toBe(200);

    const body: Pet = await res.json();
    expect(body.name).toBe('minimal-pet');
    expect(body.id).toBeDefined();

  });

  test('TC-PET-03: Invalid payload (malformed json) -> 400/405/500', async ({ request }) => {

    const res = await request.post(`${baseUrlApi}/pet`, {
      headers: { 'Content-Type': 'application/json' },
      data: 'invalid json-object',
    });
    // swagger declares 405 Invalid input; demo server returns 400/500 variants
    expect([400, 405, 500]).toContain(res.status());

  });

});


test.describe('PUT /pet — updatePet', () => {

  test('TC-PET-04: Updates an existing pet name and status -> 200', async ({ request }) => {
    const pet = buildPet();
    await request.post(`${baseUrlApi}/pet`, { data: pet });

    const updated = { ...pet, name: `${pet.name}-renamed`, status: 'sold' as const };
    const res = await request.put(`${baseUrlApi}/pet`, { data: updated });
    expect(res.status()).toBe(200);

    const body: Pet = await res.json();
    expect(body.name).toBe(updated.name);
    expect(body.status).toBe('sold');
  });

});


test.describe('GET /pet/findByStatus — findPetsByStatus', () => {

  for (const status of ['available', 'pending', 'sold'] as const) {
    test(`TC-PET-05: Filter by status="${status}" -> 200, all items match`, async ({ request }) => {
      const res = await request.get(`${baseUrlApi}/pet/findByStatus`, { params: { status } });
      expect(res.status()).toBe(200);

      const pets: Pet[] = await res.json();
      expect(Array.isArray(pets)).toBe(true);
      // every returned pet must have the requested status
      for (const p of pets.slice(0, 50)) {
        expect(p.status).toBe(status);
      }
    });
  }

  test('TC-PET-06: Created pet appears in its status filter', async ({ request }) => {

    const pet = buildPet({ status: 'pending' });
    await request.post(`${baseUrlApi}/pet`, { data: pet });

    const res = await request.get(`${baseUrlApi}/pet/findByStatus`, { params: { status: 'pending' } });
    const pets: Pet[] = await res.json();


    let found = false;
    for (let i = 0; i < pets.length; i++) {
      if (pets[i].id === pet.id) {
        found = true;
        break;
      }
    }

    expect(found).toBe(true);
  });


  test.describe('GET /pet/{petId} — getPetById', () => {

    test('TC-PET-08: Fetches an existing pet by id → 200 with correct schema', async ({ request }) => {
      const pet = buildPet();
      await request.post(`${baseUrlApi}/pet`, { data: pet });

      const res = await request.get(`${baseUrlApi}/pet/${pet.id}`);
      expect(res.status()).toBe(200);

      const body: Pet = await res.json();
      expect(body).toMatchObject({ id: pet.id, name: pet.name });
      expect(body).toHaveProperty('photoUrls');
    });

    test('TC-PET-09: Non-existing pet id -> 404 Pet not found', async ({ request }) => {

      const res = await request.get(`${baseUrlApi}/pet/999999999999999`);
      expect(res.status()).toBe(404);

    });

    test('TC-PET-10: Invalid (non-integer) pet id -> 404/400', async ({ request }) => {
      const res = await request.get(`${baseUrlApi}/pet/not-a-number`);
      expect([400, 404]).toContain(res.status());
    });

  });

});