/**
 * Offline Data Sync Utility
 * Handles offline mutations and syncs them when online
 */

import logger from '@/lib/logger';

interface OfflineMutation {
  id: string;
  timestamp: number;
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: Record<string, unknown>;
  userId?: string;
}

const DB_NAME = 'kafkasder-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-mutations';

/**
 * Initialize IndexedDB for offline storage
 */
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store for pending mutations
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('collection', 'collection', { unique: false });
      }
    };
  });
}

/**
 * Save a mutation to offline queue
 */
export async function queueOfflineMutation(
  mutation: Omit<OfflineMutation, 'id' | 'timestamp'>
): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const offlineMutation: OfflineMutation = {
      ...mutation,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    store.add(offlineMutation);

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    logger.info('Offline mutation queued', { mutation: offlineMutation });
  } catch (error) {
    logger.error('Failed to queue offline mutation', { error });
    throw error;
  }
}

/**
 * Get all pending mutations
 */
export async function getPendingMutations(): Promise<OfflineMutation[]> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error('Failed to get pending mutations', { error });
    return [];
  }
}

/**
 * Remove a mutation from queue after successful sync
 */
export async function removeMutation(id: string): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    store.delete(id);

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    logger.info('Mutation removed from queue', { id });
  } catch (error) {
    logger.error('Failed to remove mutation', { error, id });
  }
}

/**
 * Clear all pending mutations (use with caution)
 */
export async function clearAllMutations(): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    store.clear();

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    logger.info('All mutations cleared');
  } catch (error) {
    logger.error('Failed to clear mutations', { error });
  }
}

/**
 * Sync pending mutations to server
 */
export async function syncPendingMutations(): Promise<{ success: number; failed: number }> {
  logger.info('Starting offline mutation sync');

  const mutations = await getPendingMutations();
  let success = 0;
  let failed = 0;

  for (const mutation of mutations) {
    try {
      // TODO: Implement actual API calls based on mutation type and collection
      // For now, just simulate successful sync
      logger.info('Syncing mutation', { mutation });

      // Example API call (to be implemented):
      // await fetch(`/api/${mutation.collection}`, {
      //   method: mutation.type === 'create' ? 'POST' : mutation.type === 'update' ? 'PUT' : 'DELETE',
      //   body: JSON.stringify(mutation.data),
      // });

      await removeMutation(mutation.id);
      success++;
    } catch (error) {
      logger.error('Failed to sync mutation', { error, mutation });
      failed++;
    }
  }

  logger.info('Offline mutation sync completed', { success, failed, total: mutations.length });

  return { success, failed };
}

/**
 * Check if offline mode is available (IndexedDB supported)
 */
export function isOfflineModeSupported(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

/**
 * Get offline storage statistics
 */
export async function getOfflineStats(): Promise<{
  pendingCount: number;
  oldestMutation?: Date;
  totalSize: number;
}> {
  const mutations = await getPendingMutations();

  return {
    pendingCount: mutations.length,
    oldestMutation:
      mutations.length > 0 ? new Date(Math.min(...mutations.map((m) => m.timestamp))) : undefined,
    totalSize: new Blob([JSON.stringify(mutations)]).size,
  };
}

/**
 * Hook for using offline sync in components
 */
export function useOfflineSync() {
  const queue = (mutation: Omit<OfflineMutation, 'id' | 'timestamp'>) =>
    queueOfflineMutation(mutation);

  const sync = () => syncPendingMutations();

  const getStats = () => getOfflineStats();

  const isSupported = isOfflineModeSupported();

  return {
    queue,
    sync,
    getStats,
    isSupported,
  };
}
