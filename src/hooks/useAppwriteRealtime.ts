/**
 * Appwrite Realtime Hook
 * 
 * Provides real-time subscriptions to Appwrite collections
 * Replaces deprecated useRealtimeQuery from Convex
 */

import { useEffect, useState, useRef } from 'react';
import { Client, RealtimeResponseEvent } from 'appwrite';
import { appwriteConfig } from '@/lib/appwrite/config';
import { client } from '@/lib/appwrite/client';
import { toast } from 'sonner';
import logger from '@/lib/logger';

interface RealtimeOptions {
  /** Show toast notification when data changes */
  notifyOnChange?: boolean;
  /** Custom notification message */
  changeMessage?: string;
  /** Disable notification for first load */
  skipInitial?: boolean;
  /** Custom onChange callback */
  onChange?: (event: 'create' | 'update' | 'delete', payload: unknown) => void;
}

/**
 * Subscribe to Appwrite collection changes in real-time
 * 
 * @param collectionId - Collection ID to subscribe to
 * @param options - Realtime options
 * @returns Connected state and unsubscribe function
 * 
 * @example
 * ```tsx
 * const { isConnected } = useAppwriteRealtime(
 *   'donations',
 *   {
 *     notifyOnChange: true,
 *     onChange: (event, payload) => {
 *       queryClient.invalidateQueries(['donations']);
 *     }
 *   }
 * );
 * ```
 */
export function useAppwriteRealtime(
  collectionId: string,
  options: RealtimeOptions = {}
) {
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const { notifyOnChange = false, changeMessage, skipInitial = true, onChange } = options;
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !appwriteConfig.databaseId) {
      logger.warn('Appwrite not configured for realtime');
      return;
    }

    // Use existing client or create new one
    const realtimeClient = client || new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);

    if (!realtimeClient) {
      logger.warn('Appwrite client not available for realtime');
      return;
    }

    // Build channel name
    const channel = `databases.${appwriteConfig.databaseId}.collections.${collectionId}.documents`;

    // Subscribe to channel
    const unsubscribe = realtimeClient.subscribe(channel, (response: RealtimeResponseEvent) => {
      const eventType = response.events[0]?.split('.').pop() as 'create' | 'update' | 'delete' | undefined;

      if (!eventType) return;

      // Skip initial load notification
      if (isInitialMount.current && skipInitial) {
        isInitialMount.current = false;
        return;
      }

      // Call custom onChange handler
      onChange?.(eventType, response.payload);

      // Show notification if enabled
      if (notifyOnChange) {
        const messages = {
          create: changeMessage || 'Yeni kayıt eklendi',
          update: changeMessage || 'Kayıt güncellendi',
          delete: changeMessage || 'Kayıt silindi',
        };

        toast.info(messages[eventType] || 'Değişiklik algılandı');
      }
    });

    unsubscribeRef.current = unsubscribe;
    setIsConnected(true);
    isInitialMount.current = false;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setIsConnected(false);
    };
  }, [collectionId, notifyOnChange, changeMessage, skipInitial, onChange]);

  return { isConnected };
}

/**
 * Subscribe to multiple collections
 */
export function useAppwriteRealtimeMultiple(
  collectionIds: string[],
  options: RealtimeOptions = {}
) {
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const unsubscribeRefs = useRef<Record<string, () => void>>({});

  useEffect(() => {
    if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !appwriteConfig.databaseId) {
      return;
    }

    const realtimeClient = client || new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);

    if (!realtimeClient) {
      logger.warn('Appwrite client not available for realtime');
      return;
    }

    const newConnections: Record<string, boolean> = {};
    const newUnsubscribes: Record<string, () => void> = {};

    collectionIds.forEach((collectionId) => {
      const channel = `databases.${appwriteConfig.databaseId}.collections.${collectionId}.documents`;

      const unsubscribe = realtimeClient.subscribe(channel, (response: RealtimeResponseEvent) => {
        const eventType = response.events[0]?.split('.').pop() as 'create' | 'update' | 'delete' | undefined;

        if (eventType) {
          options.onChange?.(eventType, response.payload);
        }
      });

      newUnsubscribes[collectionId] = unsubscribe;
      newConnections[collectionId] = true;
    });

    unsubscribeRefs.current = newUnsubscribes;
    setConnections(newConnections);

    return () => {
      Object.values(unsubscribeRefs.current).forEach((unsubscribe) => unsubscribe());
      unsubscribeRefs.current = {};
      setConnections({});
    };
  }, [collectionIds.join(','), options]);

  return { connections, isAllConnected: Object.values(connections).every(Boolean) };
}

