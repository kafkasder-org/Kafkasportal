/**
 * API Client Index
 *
 * Re-exports the Convex API client for backward compatibility.
 * Components can import from '@/lib/api' instead of '@/lib/api/convex-api-client'
 */

import { convexApiClient } from './convex-api-client';
import { convexSystemSettings } from '@/lib/convex/api';
import type {
  AidApplicationDocument,
  CreateDocumentData,
  UpdateDocumentData,
  ConvexResponse,
  QueryParams,
} from '@/types/database';
import type { Id } from '@/convex/_generated/dataModel';

// Export as default for backward compatibility
const api = convexApiClient;

export default api;
export { convexApiClient as api };
export type { ConvexResponse, QueryParams, CreateDocumentData, UpdateDocumentData };

// Export empty objects for removed APIs to prevent import errors
// TODO: Implement these or remove usage from components
export const parametersApi = {
  getAllParameters: async () => {
    try {
      const settings = await convexSystemSettings.getAll();
      const flattened = Object.entries(settings).flatMap(([category, entries]) =>
        Object.entries(entries as Record<string, unknown>).map(([key, value]) => ({
          category,
          key,
          value,
        }))
      );

      return {
        success: true,
        data: flattened,
        total: flattened.length,
        error: null,
      };
    } catch (error) {
      return { success: false, data: [], total: 0, error };
    }
  },
  getParametersByCategory: async (category?: string) => {
    if (!category) {
      return { success: false, data: [], error: 'Kategori gereklidir' };
    }

    try {
      const settings = await convexSystemSettings.getByCategory(category);
      const items = Object.entries(settings as Record<string, unknown>).map(([key, value]) => ({
        category,
        key,
        value,
      }));

      return { success: true, data: items, error: null };
    } catch (error) {
      return { success: false, data: [], error };
    }
  },
  createParameter: async (data?: {
    category?: string;
    key?: string;
    value?: unknown;
    updatedBy?: string;
  }) => {
    if (!data?.category || !data?.key) {
      return { success: false, error: 'Kategori ve anahtar gereklidir' };
    }

    try {
      await convexSystemSettings.updateSetting(
        data.category,
        data.key,
        data.value,
        data.updatedBy as Id<'users'> | undefined
      );
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },
  updateParameter: async (
    _id: string | undefined,
    data?: { category?: string; key?: string; value?: unknown; updatedBy?: string }
  ) => {
    if (!data?.category || !data?.key) {
      return { success: false, error: 'Kategori ve anahtar gereklidir' };
    }

    try {
      await convexSystemSettings.updateSetting(
        data.category,
        data.key,
        data.value,
        data.updatedBy as Id<'users'> | undefined
      );
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },
  deleteParameter: async (data?: { category?: string; key?: string; updatedBy?: string }) => {
    if (!data?.category || !data?.key) {
      return { success: false, error: 'Kategori ve anahtar gereklidir' };
    }

    try {
      await convexSystemSettings.updateSetting(
        data.category,
        data.key,
        null,
        data.updatedBy as Id<'users'> | undefined
      );
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },
};

// Re-export aidApplications API from convexApiClient
export const aidApplicationsApi = {
  getAidApplication: (id: string) => api.aidApplications.getAidApplication(id),
  updateStage: (id: string, stage: AidApplicationDocument['stage']) =>
    api.aidApplications.updateStage(id, stage),
  getAidApplications: (params?: Record<string, unknown>) =>
    api.aidApplications.getAidApplications(params),
  createAidApplication: (data: CreateDocumentData<AidApplicationDocument>) =>
    api.aidApplications.createAidApplication(data),
};

// Export scholarship APIs
export {
  scholarshipsApi,
  scholarshipApplicationsApi,
  scholarshipPaymentsApi,
} from './scholarships';
