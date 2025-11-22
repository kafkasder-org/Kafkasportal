/**
 * Unified Backend API
 *
 * Provides a unified interface that works with both Convex and Appwrite backends.
 * The backend provider is selected via NEXT_PUBLIC_BACKEND_PROVIDER environment variable.
 */

import type { ConvexResponse, QueryParams, CreateDocumentData, UpdateDocumentData } from '@/types/database';

// Backend provider type
export type BackendProvider = 'convex' | 'appwrite';

// Get current backend provider
export const getBackendProvider = (): BackendProvider => {
  const provider = process.env.NEXT_PUBLIC_BACKEND_PROVIDER || 'convex';
  return provider as BackendProvider;
};

// Check if using Convex
export const isUsingConvex = (): boolean => {
  return getBackendProvider() === 'convex';
};

// Check if using Appwrite
export const isUsingAppwrite = (): boolean => {
  return getBackendProvider() === 'appwrite';
};

/**
 * Generic CRUD operations interface
 */
export interface UnifiedCrudOperations<T> {
  list: (params?: QueryParams) => Promise<ConvexResponse<T[]>>;
  get: (id: string) => Promise<ConvexResponse<T>>;
  create: (data: CreateDocumentData<T>) => Promise<ConvexResponse<T>>;
  update: (id: string, data: UpdateDocumentData<T>) => Promise<ConvexResponse<T>>;
  delete: (id: string) => Promise<ConvexResponse<null>>;
}

/**
 * Create unified CRUD operations that work with both backends
 */
export async function createUnifiedCrud<T>(
  entityName: string,
  convexEntityName?: string,
  appwriteCollectionName?: string
): Promise<UnifiedCrudOperations<T>> {
  const provider = getBackendProvider();

  if (provider === 'appwrite') {
    // Dynamic import for Appwrite
    const { createAppwriteCrudOperations } = await import('@/lib/appwrite/api-client');
    const { appwriteConfig } = await import('@/lib/appwrite/config');

    // Find the collection name
    const collectionKey = appwriteCollectionName || entityName;
    const collectionId = appwriteConfig.collections[collectionKey as keyof typeof appwriteConfig.collections];

    if (!collectionId) {
      throw new Error(`Unknown Appwrite collection: ${collectionKey}`);
    }

    const appwriteOps = createAppwriteCrudOperations(collectionKey as keyof typeof appwriteConfig.collections);

    return {
      list: appwriteOps.list as unknown as UnifiedCrudOperations<T>['list'],
      get: appwriteOps.get as unknown as UnifiedCrudOperations<T>['get'],
      create: appwriteOps.create as unknown as UnifiedCrudOperations<T>['create'],
      update: appwriteOps.update as unknown as UnifiedCrudOperations<T>['update'],
      delete: appwriteOps.delete,
    };
  } else {
    // Dynamic import for Convex (via API routes)
    const { createCrudOperations } = await import('@/lib/api/crud-factory');

    const convexOps = createCrudOperations<T>(convexEntityName || entityName);

    return {
      list: convexOps.getAll,
      get: convexOps.getById,
      create: convexOps.create,
      update: convexOps.update,
      delete: convexOps.delete,
    };
  }
}

/**
 * Pre-configured unified CRUD operations
 * These lazy-load the appropriate backend implementation
 */
let _beneficiaries: UnifiedCrudOperations<unknown> | null = null;
let _donations: UnifiedCrudOperations<unknown> | null = null;
let _tasks: UnifiedCrudOperations<unknown> | null = null;
let _users: UnifiedCrudOperations<unknown> | null = null;
let _meetings: UnifiedCrudOperations<unknown> | null = null;
let _messages: UnifiedCrudOperations<unknown> | null = null;
let _partners: UnifiedCrudOperations<unknown> | null = null;
let _scholarships: UnifiedCrudOperations<unknown> | null = null;

export const getBeneficiaries = async () => {
  if (!_beneficiaries) {
    _beneficiaries = await createUnifiedCrud('beneficiaries');
  }
  return _beneficiaries;
};

export const getDonations = async () => {
  if (!_donations) {
    _donations = await createUnifiedCrud('donations');
  }
  return _donations;
};

export const getTasks = async () => {
  if (!_tasks) {
    _tasks = await createUnifiedCrud('tasks');
  }
  return _tasks;
};

export const getUsers = async () => {
  if (!_users) {
    _users = await createUnifiedCrud('users');
  }
  return _users;
};

export const getMeetings = async () => {
  if (!_meetings) {
    _meetings = await createUnifiedCrud('meetings');
  }
  return _meetings;
};

export const getMessages = async () => {
  if (!_messages) {
    _messages = await createUnifiedCrud('messages');
  }
  return _messages;
};

export const getPartners = async () => {
  if (!_partners) {
    _partners = await createUnifiedCrud('partners');
  }
  return _partners;
};

export const getScholarships = async () => {
  if (!_scholarships) {
    _scholarships = await createUnifiedCrud('scholarships');
  }
  return _scholarships;
};

/**
 * Auth provider abstraction
 */
export interface UnifiedAuth {
  login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<{ success: boolean; error: string | null }>;
  getCurrentUser: () => Promise<{ user: unknown | null; error: string | null }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error: string | null }>;
}

export const getAuth = async (): Promise<UnifiedAuth> => {
  const provider = getBackendProvider();

  if (provider === 'appwrite') {
    const { appwriteAuth } = await import('@/lib/appwrite/auth');

    return {
      login: async (email, password) => {
        const { session, error } = await appwriteAuth.createSession(email, password);
        return { success: !!session, error };
      },
      logout: async () => {
        return appwriteAuth.deleteSession();
      },
      getCurrentUser: async () => {
        return appwriteAuth.getCurrentUser();
      },
      register: async (email, password, name) => {
        const { user, error } = await appwriteAuth.createAccount(email, password, name);
        return { success: !!user, error };
      },
    };
  } else {
    // Convex auth uses API routes
    return {
      login: async (email, password) => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });
        const data = await response.json();
        return { success: data.success, error: data.error || null };
      },
      logout: async () => {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
        const data = await response.json();
        return { success: data.success, error: data.error || null };
      },
      getCurrentUser: async () => {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        const data = await response.json();
        return { user: data.user || null, error: data.error || null };
      },
      register: async (email, password, name) => {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
          credentials: 'include',
        });
        const data = await response.json();
        return { success: data.success, error: data.error || null };
      },
    };
  }
};

// Export provider info
export const backendInfo = {
  provider: getBackendProvider(),
  isConvex: isUsingConvex(),
  isAppwrite: isUsingAppwrite(),
};
