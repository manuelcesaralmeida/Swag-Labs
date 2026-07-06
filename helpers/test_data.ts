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

// ── Factories ────────────────────────────────────────────c
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

