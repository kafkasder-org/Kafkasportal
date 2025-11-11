import { vi } from 'vitest';

// Mock Convex API for testing
export const api = {
  auth: {
    getUserByEmail: vi.fn(),
    updateLastLogin: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
  users: {
    get: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  beneficiaries: {
    get: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  donations: {
    list: vi.fn(),
    create: vi.fn(),
  },
  tasks: {
    list: vi.fn(),
    create: vi.fn(),
  },
  meetings: {
    list: vi.fn(),
    create: vi.fn(),
  },
  messages: {
    list: vi.fn(),
    send: vi.fn(),
  },
  scholarships: {
    list: vi.fn(),
    create: vi.fn(),
  },
  // Add other Convex API functions as needed
};

const convexApiMock = { api };
export default convexApiMock;
