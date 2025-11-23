/**
 * Appwrite Mutation Hook
 * Uses React Query mutations for Appwrite backend
 */

import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseAppwriteMutationOptions<TData = unknown, TVariables = unknown, TError = unknown>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey?: (string | number | boolean | null | undefined)[];
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
}

/**
 * Mutation hook for Appwrite backend
 */
export function useAppwriteMutation<TData = unknown, TVariables = unknown, TError = unknown>({
  mutationFn,
  queryKey,
  successMessage,
  errorMessage = 'İşlem başarısız',
  showSuccessToast = true,
  showErrorToast = true,
  onSuccess,
  onError,
  ...options
}: UseAppwriteMutationOptions<TData, TVariables, TError>) {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables>({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      // Invalidate queries
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
      }

      // Show success toast
      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      // Call callbacks
      onSuccess?.(data, variables);
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Show error toast
      if (showErrorToast) {
        const message = error instanceof Error ? error.message : typeof error === 'string' ? error : errorMessage;
        toast.error(message);
      }

      // Call callbacks
      onError?.(error, variables);
      options.onError?.(error, variables, context);
    },
  });
}

