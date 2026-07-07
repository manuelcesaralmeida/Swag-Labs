import { test, expect } from '@playwright/test';
import { buildUser, User } from '../../helpers/test_data';

const baseUrlApi = process.env.BASE_URL_API;
const GHOST_USER = process.env.GHOST_USER;


test.describe('POST /user - createUser', () => {

  test('TC-USER-01: Creates a user -> 200 default operation', async ({ request }) => {
    const user = buildUser();
    const res = await request.post(`${baseUrlApi}/user`, { data: user });
    expect(res.status()).toBe(200);
  });

  test('TC-USER-02: Created user is retrievable by username', async ({ request }) => {
    const user = buildUser();
    await request.post(`${baseUrlApi}/user`, { data: user });

    const res = await request.get(`${baseUrlApi}/user/${user.username}`);
    expect(res.status()).toBe(200);

    const body: User = await res.json();
    expect(body.username).toBe(user.username);
    expect(body.email).toBe(user.email);
    expect(body.firstName).toBe(user.firstName);
  });

});

test.describe('POST /user/createWithList - createUsersWithListInput', () => {

  test('TC-USER-03: Creates multiple users from list -> 200', async ({ request }) => {
    const users = [buildUser(), buildUser()];
    const res = await request.post(`${baseUrlApi}/user/createWithList`, { data: users });
    expect(res.status()).toBe(200);

    // verify first user exists
    const check = await request.get(`${baseUrlApi}/user/${users[0].username}`);
    expect(check.status()).toBe(200);
  });

});


test.describe('POST /user/createWithArray - createUsersWithArrayInput', () => {

  test('TC-USER-04: Creates multiple users from array -> 200', async ({ request }) => {

    const users = [buildUser(), buildUser()];
    const res = await request.post(`${baseUrlApi}/user/createWithArray`, { data: users });
    expect(res.status()).toBe(200);

  });

});


test.describe('GET /user/{username} - getUserByName', () => {

  test('TC-USER-05: Existing user returns 200 with correct schema', async ({ request }) => {

    const user = buildUser();
    await request.post(`${baseUrlApi}/user`, { data: user });

    const res = await request.get(`${baseUrlApi}/user/${user.username}`);
    expect(res.status()).toBe(200);

    const body: User = await res.json();
    expect(body.username).toBe(user.username);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');

  });

  test('TC-USER-06: Non-existing username -> 404', async ({ request }) => {

    // const res = await request.get(`${baseUrlApi}/user/ghost-user-${Date.now()}`);
    const res = await request.get(`${baseUrlApi}/user/${GHOST_USER}-${Date.now()}`);
    expect(res.status()).toBe(404);

  });

});


test.describe('PUT /user/{username} - updateUser', () => {

  test('TC-USER-07: Updates user email -> 200 and change is persisted', async ({ request }) => {

    const user = buildUser();
    await request.post(`${baseUrlApi}/user`, { data: user });

    const updated = { ...user, email: `updated-${Date.now()}@test.com` };
    const res = await request.put(`${baseUrlApi}/user/${user.username}`, { data: updated });
    expect(res.status()).toBe(200);

    const check = await request.get(`${baseUrlApi}/user/${user.username}`);
    if (check.status() === 200) {
      const body: User = await check.json();
      expect(body.email).toBe(updated.email);
    }
  });

});

test.describe('DELETE /user/{username} - deleteUser', () => {

  test('TC-USER-08: Deletes existing user -> 200 then GET 404', async ({ request }) => {

    const user = buildUser();
    await request.post(`${baseUrlApi}/user`, { data: user });

    const del = await request.delete(`${baseUrlApi}/user/${user.username}`);
    expect(del.status()).toBe(200);

    const after = await request.get(`${baseUrlApi}/user/${user.username}`);
    expect(after.status()).toBe(404);
  });

  test('TC-USER-09: Delete non-existing user -> 404', async ({ request }) => {

    const urlApi = `${baseUrlApi}/user/${GHOST_USER}-${Date.now()}`;
    const res = await request.delete(urlApi);
    expect(res.status()).toBe(404);

  });
  
});