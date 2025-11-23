/**
 * Real-time Query Hooks
 * NOTE: Convex has been removed. These hooks are stubs for backward compatibility.
 * TODO: Implement Appwrite Realtime subscriptions
 */

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Stub types for backward compatibility
type FunctionReference<T extends string> = any;
type FunctionArgs<T> = any;
type FunctionReturnType<T> = any;

interface RealtimeQueryOptions {
  /** Show a toast notification when data changes */
  notifyOnChange?: boolean;
  /** Custom notification message */
  changeMessage?: string;
  /** Disable notification for first load */
  skipInitial?: boolean;
  /** Custom onChange callback */
  onChange?: (newData: unknown, oldData: unknown) => void;
}

/**
 * Enhanced useQuery hook with real-time update notifications
 * Wraps Convex's useQuery and shows toast when data changes
 */
export function useRealtimeQuery<Query extends FunctionReference<'query'>>(
  _query: Query,
  _args: FunctionArgs<Query>,
  _options: RealtimeQueryOptions = {}
): FunctionReturnType<Query> | undefined {
  // Stub implementation - Convex removed
  // TODO: Implement with Appwrite Realtime
  useEffect(() => {
    console.warn('useRealtimeQuery is deprecated. Please migrate to Appwrite Realtime API.');
  }, []);

  return undefined;
}

/**
 * Hook for monitoring real-time list updates with detailed notifications
 */
export function useRealtimeList<Query extends FunctionReference<'query'>>(
  _query: Query,
  _args: FunctionArgs<Query>,
  _options: {
    itemName?: string;
    skipInitial?: boolean;
  } = {}
): FunctionReturnType<Query> | undefined {
  // Stub implementation - Convex removed
  // TODO: Implement with Appwrite Realtime
  useEffect(() => {
    console.warn('useRealtimeList is deprecated. Please migrate to Appwrite Realtime API.');
  }, []);

  return undefined;
}

/**
 * Hook for detecting conflicts when editing records
 * Shows warning if the record is being edited by another user
 */
export function useEditConflictDetection<T extends { _id: string; _updatedAt?: number }>(
  record: T | undefined | null,
  isEditing: boolean
): {
  hasConflict: boolean;
  conflictMessage: string | null;
} {
  const lastSeenTimestampRef = useRef<number | undefined>(undefined);
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  useEffect(() => {
    // Handle state reset when record is cleared or editing stops
    if (!record || !isEditing) {
      if (hasConflict || conflictMessage) {
        Promise.resolve().then(() => {
          setHasConflict(false);
          setConflictMessage(null);
        });
      }
      return;
    }

    const currentTimestamp = record._updatedAt;

    // Initialize on first load
    if (lastSeenTimestampRef.current === undefined) {
      lastSeenTimestampRef.current = currentTimestamp;
      return;
    }

    // Detect if record was updated by someone else
    if (currentTimestamp && currentTimestamp > lastSeenTimestampRef.current) {
      // Defer state updates to avoid cascading renders
      Promise.resolve().then(() => {
        setHasConflict(true);
        setConflictMessage('Bu kayıt başka bir kullanıcı tarafından güncellendi!');

        toast.warning('⚠️ Dikkat: Bu kayıt başka biri tarafından değiştirildi', {
          description: 'Güncel verileri görmek için sayfayı yenileyin.',
          duration: 8000,
          action: {
            label: 'Yenile',
            onClick: () => window.location.reload(),
          },
        });
      });

      lastSeenTimestampRef.current = currentTimestamp;
    }
  }, [record, isEditing, hasConflict, conflictMessage]);

  return {
    hasConflict,
    conflictMessage,
  };
}

/**
 * Hook for showing presence indicators (who is online/editing)
 * This is a placeholder for future implementation with Appwrite Realtime
 */
export function usePresence(_resourceId: string, _userId?: string) {
  // TODO: Implement with Appwrite Realtime API
  // For now, return empty state
  return {
    activeUsers: [] as Array<{ id: string; name: string; cursor?: { x: number; y: number } }>,
    isUserActive: false,
  };
}
