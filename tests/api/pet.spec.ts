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
