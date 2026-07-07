import { test, expect } from '@playwright/test';
import { buildUser, User } from '../../helpers/test_data';

const baseUrlApi = process.env.BASE_URL_API;



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
    const res = await request.post('/user/createWithList', { data: users });
    expect(res.status()).toBe(200);
 
    // verify first user exists
    const check = await request.get(`/user/${users[0].username}`);
    expect(check.status()).toBe(200);
  });

});