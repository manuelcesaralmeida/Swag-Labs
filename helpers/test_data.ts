// Types derived from swagger #/definitions

export interface Category {
  id?: number;
  name?: string;
}

export interface Tag {
  id?: number;
  name?: string;
}

export type PetStatus = 'available' | 'pending' | 'sold';

export interface Pet {
  id?: number;
  category?: Category;
  name: string;          // required in swagger
  photoUrls: string[];   // required in swagger
  tags?: Tag[];
  status?: PetStatus;
}

export type OrderStatus = 'placed' | 'approved' | 'delivered';

export interface Order {
  id?: number;
  petId?: number;
  quantity?: number;
  shipDate?: string;
  status?: OrderStatus;
  complete?: boolean;
}

export interface User {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  userStatus?: number;
}


/** Unique-ish id to avoid collisions on the shared demo server */
export function uniqueId(): number {
  return Date.now() % 1_000_000_000 + Math.floor(Math.random() * 1000);
}

export function buildPet(overrides: Partial<Pet> = {}): Pet {
  return {
    id: uniqueId(),
    category: { id: 1, name: 'dogs' },
    name: `qa-pet-${Date.now()}`,
    photoUrls: ['https://picsum.photos/id/237/400/300.jpg'],
    tags: [{ id: 1, name: 'qa-tag' }],
    status: 'available',
    ...overrides,
  };

}

export function buildOrder(petId: number, overrides: Partial<Order> = {}): Order {
  return {
    id: Math.floor(Math.random() * 9) + 1, // swagger valid range: 1-10
    petId,
    quantity: 1,
    shipDate: new Date().toISOString(),
    status: 'placed',
    complete: false,
    ...overrides,
  };
}

export function buildUser(overrides: Partial<User> = {}): User {
  const ts = Date.now();
  return {
    id: uniqueId(),
    username: `qa-user-${ts}`,
    firstName: 'QA',
    lastName: 'Tester',
    email: `qa-${ts}@test.com`,
    password: 'Secret123!',
    phone: '+351910000000',
    userStatus: 1,
    ...overrides,
  };
}