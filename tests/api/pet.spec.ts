import { test, expect } from '@playwright/test';
import { buildPet, Pet } from '../../helpers/testData';

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

test.describe('POST /pet — addPet', () => {

  test('TC-PET-01: creates a pet with all valid fields → 200 and echoes body', async ({ request }) => {
    const pet = buildPet();

    const res = await request.post(`${baseUrlApi}/pet`, { data: pet });

    expect(res.status()).toBe(200);

    const body: Pet = await res.json();
    expect(body.id).toBe(pet.id);
    expect(body.name).toBe(pet.name);
    expect(body.status).toBe('available');
    expect(body.photoUrls).toEqual(pet.photoUrls);
  });
});
