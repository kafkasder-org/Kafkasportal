/**
 * Real-time Query Hooks
 * Wraps Convex useQuery with real-time notifications and optimistic updates
 */

import { useEffect, useRef } from 'react';
import { useQuery as useConvexQuery } from 'convex/react';
import { toast } from 'sonner';
import type { FunctionReference, FunctionArgs, FunctionReturnType } from 'convex/server';

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
  query: Query,
  args: FunctionArgs<Query>,
  options: RealtimeQueryOptions = {}
): FunctionReturnType<Query> | undefined {
  const {
    notifyOnChange = false,
    changeMessage = 'Veriler güncellendi',
    skipInitial = true,
    onChange,
  } = options;

  const data = useConvexQuery(query, args);
  const previousDataRef = useRef<FunctionReturnType<Query> | undefined>(undefined);
  const isInitialRenderRef = useRef(true);

  useEffect(() => {
    // Skip notification on initial render if requested
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      if (skipInitial) {
        previousDataRef.current = data;
        return;
      }
    }

    // Check if data actually changed
    if (data !== undefined && previousDataRef.current !== undefined) {
      const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);

      if (hasChanged) {
        // Call custom onChange handler
        onChange?.(data, previousDataRef.current);

        // Show notification if enabled
        if (notifyOnChange) {
          toast.info(changeMessage, {
            duration: 3000,
            icon: '🔄',
          });
        }
      }
    }

    previousDataRef.current = data;
  }, [data, notifyOnChange, changeMessage, onChange, skipInitial]);

  return data;
}

/**
 * Hook for monitoring real-time list updates with detailed notifications
 */
export function useRealtimeList<Query extends FunctionReference<'query'>>(
  query: Query,
  args: FunctionArgs<Query>,
  options: {
    itemName?: string;
    skipInitial?: boolean;
  } = {}
): FunctionReturnType<Query> | undefined {
  const { itemName = 'öğe', skipInitial = true } = options;

  const data = useConvexQuery(query, args);
  const previousCountRef = useRef<number | undefined>(undefined);
  const isInitialRenderRef = useRef(true);

  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      if (skipInitial && Array.isArray(data)) {
        previousCountRef.current = data.length;
        return;
      }
    }

    if (Array.isArray(data) && previousCountRef.current !== undefined) {
      const currentCount = data.length;
      const previousCount = previousCountRef.current;

      if (currentCount > previousCount) {
        const newCount = currentCount - previousCount;
        toast.success(`${newCount} yeni ${itemName} eklendi`, {
          icon: '✨',
          duration: 4000,
        });
      } else if (currentCount < previousCount) {
        const removedCount = previousCount - currentCount;
        toast.info(`${removedCount} ${itemName} kaldırıldı`, {
          icon: '🗑️',
          duration: 3000,
        });
      }

      previousCountRef.current = currentCount;
    } else if (Array.isArray(data)) {
      previousCountRef.current = data.length;
    }
  }, [data, itemName, skipInitial]);

  return data;
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
  const hasConflict = useRef(false);
  const conflictMessage = useRef<string | null>(null);

  useEffect(() => {
    if (!record || !isEditing) {
      hasConflict.current = false;
      conflictMessage.current = null;
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
      hasConflict.current = true;
      conflictMessage.current = 'Bu kayıt başka bir kullanıcı tarafından güncellendi!';

      toast.warning('⚠️ Dikkat: Bu kayıt başka biri tarafından değiştirildi', {
        description: 'Güncel verileri görmek için sayfayı yenileyin.',
        duration: 8000,
        action: {
          label: 'Yenile',
          onClick: () => window.location.reload(),
        },
      });

      lastSeenTimestampRef.current = currentTimestamp;
    }
  }, [record, isEditing]);

  return {
    hasConflict: hasConflict.current,
    conflictMessage: conflictMessage.current,
  };
}

/**
 * Hook for showing presence indicators (who is online/editing)
 * This is a placeholder for future implementation with Convex presence
 */
export function usePresence(_resourceId: string, _userId?: string) {
  // TODO: Implement with Convex presence API
  // For now, return empty state
  return {
    activeUsers: [] as Array<{ id: string; name: string; cursor?: { x: number; y: number } }>,
    isUserActive: false,
  };
}
