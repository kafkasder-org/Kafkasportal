/**
 * Standard Form Hook
 * Simplified version that works with existing form patterns
 * Eliminates duplicate form logic across the application
 */

import { useForm, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormMutation } from './useFormMutation';

// Disable strict typing for this hook due to complex React Hook Form generics
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UseStandardFormOptions<TFormData extends FieldValues = any, TResponse = any> {
  schema: z.ZodType<TFormData>;
  mutationFn: (variables: TFormData) => Promise<TResponse>;
  queryKey: string | string[];
  successMessage?: string;
  errorMessage?: string;
  defaultValues?: Partial<TFormData>;
  onSuccess?: (data: TResponse) => void;
  onError?: (error: unknown) => void;
  transformData?: (data: TFormData) => any;
  resetOnSuccess?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export interface UseStandardFormReturn<TFormData extends FieldValues = any, TResponse = any> {
  form: UseFormReturn<TFormData>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: unknown;
  data: TResponse | undefined;
  reset: () => void;
}

/**
 * Standard form hook with built-in validation, mutation, and error handling
 */
export function useStandardForm<TFormData extends FieldValues = any, TResponse = any>({
  schema,
  mutationFn,
  queryKey,
  successMessage = 'İşlem başarılı',
  errorMessage = 'İşlem başarısız',
  defaultValues,
  onSuccess,
  onError: _onError,
  transformData,
  resetOnSuccess = true,
  showSuccessToast = true,
  showErrorToast = true,
}: UseStandardFormOptions<TFormData, TResponse>): UseStandardFormReturn<TFormData, TResponse> {
  const form = useForm<TFormData>({
    resolver: zodResolver(schema as any) as any,
    defaultValues: defaultValues as any,
    mode: 'onBlur',
  });

  const mutation = useFormMutation({
    mutationFn: transformData ? (data: any) => mutationFn(transformData(data)) : mutationFn,
    queryKey,
    successMessage,
    errorMessage,
    showSuccessToast,
    showErrorToast,
    onSuccess: () => {
      if (resetOnSuccess) {
        form.reset();
      }
      onSuccess?.(undefined as any);
    },
  });

  const handleSubmit = form.handleSubmit(async (data: any) => {
    await mutation.mutate(data);
  });

  return {
    form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting || mutation.isPending,
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: () => form.reset(),
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for creating new entities
 */
export function useCreateForm<TFormData extends FieldValues, TResponse = unknown>(
  options: Omit<UseStandardFormOptions<TFormData, TResponse>, 'queryKey' | 'successMessage'> & {
    entityName: string;
    queryKey: string | string[];
  }
) {
  return useStandardForm({
    ...options,
    successMessage: `${options.entityName} başarıyla oluşturuldu`,
    errorMessage: `${options.entityName} oluşturulurken hata`,
    resetOnSuccess: true,
  });
}

/**
 * Hook for updating existing entities
 */
export function useUpdateForm<TFormData extends FieldValues, TResponse = unknown>(
  options: Omit<UseStandardFormOptions<TFormData, TResponse>, 'queryKey' | 'successMessage'> & {
    entityName: string;
    queryKey: string | string[];
  }
) {
  return useStandardForm({
    ...options,
    successMessage: `${options.entityName} başarıyla güncellendi`,
    errorMessage: `${options.entityName} güncellenirken hata`,
    resetOnSuccess: false,
  });
}

/**
 * Hook for delete confirmations
 */
export function useDeleteForm<TResponse = unknown>(options: {
  mutationFn: () => Promise<TResponse>;
  queryKey: string | string[];
  entityName: string;
  onSuccess?: (data: TResponse) => void;
}) {
  const { mutationFn, queryKey, entityName, onSuccess } = options;

  return useFormMutation({
    mutationFn,
    queryKey,
    successMessage: `${entityName} başarıyla silindi`,
    errorMessage: `${entityName} silinirken hata`,
    onSuccess: onSuccess as any,
  });
}
