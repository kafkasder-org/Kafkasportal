/**
 * Convex API Helper
 * Provides a unified interface for calling Convex functions from API routes
 */

import { convexHttp, api } from './server';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Id } from '@/convex/_generated/dataModel';

export interface ConvexQueryParams {
  limit?: number;
  skip?: number;
  search?: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * Convert Next.js query params to Convex query params
 */
export function normalizeQueryParams(searchParams: URLSearchParams): ConvexQueryParams {
  const params: ConvexQueryParams = {};

  const limitParam = searchParams.get('limit');
  const skipParam = searchParams.get('skip');
  const pageParam = searchParams.get('page');
  const search = searchParams.get('search');
  const status = searchParams.get('status');

  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
      params.limit = Math.min(parsedLimit, 100);
    }
  }

  if (skipParam) {
    const parsedSkip = parseInt(skipParam, 10);
    if (!Number.isNaN(parsedSkip) && parsedSkip >= 0) {
      params.skip = parsedSkip;
    }
  }

  if (pageParam && params.skip === undefined) {
    const parsedPage = parseInt(pageParam, 10);
    if (!Number.isNaN(parsedPage) && parsedPage > 0) {
      const limit = params.limit ?? 20;
      params.skip = (parsedPage - 1) * limit;
    }
  }

  if (search) params.search = search;
  if (status) params.status = status;

  return params;
}

/**
 * Beneficiaries API
 */
type AuthContext = {
  auth?: {
    userId: string;
    role: string;
  };
};

export const convexBeneficiaries = {
  list: async (params?: ConvexQueryParams) => {
    return await convexHttp.query(api.beneficiaries.list, params || {});
  },
  get: async (id: Id<'beneficiaries'>) => {
    return await convexHttp.query(api.beneficiaries.get, { id });
  },
  getByTcNo: async (tc_no: string) => {
    return await convexHttp.query(api.beneficiaries.getByTcNo, { tc_no });
  },
  create: async (data: unknown, context: AuthContext = {}) => {
    const payload = {
      ...(context.auth ? { auth: context.auth } : {}),
      ...(data as Record<string, unknown>),
    };
    return await convexHttp.mutation(api.beneficiaries.create, payload as any);
  },
  update: async (id: Id<'beneficiaries'>, data: unknown, context: AuthContext = {}) => {
    const payload = {
      id,
      ...(data as Record<string, unknown>),
      ...(context.auth ? { auth: context.auth } : {}),
    };
    return await convexHttp.mutation(api.beneficiaries.update, payload as any);
  },
  remove: async (id: Id<'beneficiaries'>) => {
    return await convexHttp.mutation(api.beneficiaries.remove, { id });
  },
};

/**
 * Donations API
 */
export const convexDonations = {
  list: async (params?: ConvexQueryParams) => {
    return await convexHttp.query(api.donations.list, params || {});
  },
  get: async (id: Id<'donations'>) => {
    return await convexHttp.query(api.donations.get, { id });
  },
  getByReceiptNumber: async (receipt_number: string) => {
    return await convexHttp.query(api.donations.getByReceiptNumber, { receipt_number });
  },
  create: async (data: unknown) => {
    return await convexHttp.mutation(api.donations.create, data as any);
  },
  update: async (id: Id<'donations'>, data: unknown) => {
    const payload = {
      id,
      ...(data as Record<string, unknown>),
    };
    return await convexHttp.mutation(api.donations.update, payload as any);
  },
  remove: async (id: Id<'donations'>) => {
    return await convexHttp.mutation(api.donations.remove, { id });
  },
};

/**
 * Tasks API
 */
export const convexTasks = {
  list: async (
    params?: ConvexQueryParams & { assigned_to?: Id<'users'>; created_by?: Id<'users'> }
  ) => {
    return await convexHttp.query(api.tasks.list, params || {});
  },
  get: async (id: Id<'tasks'>) => {
    return await convexHttp.query(api.tasks.get, { id });
  },
  create: async (data: unknown) => {
    return await convexHttp.mutation(api.tasks.create, data as any);
  },
  update: async (id: Id<'tasks'>, data: unknown) => {
    const payload = {
      id,
      ...(data as Record<string, unknown>),
    };
    return await convexHttp.mutation(api.tasks.update, payload as any);
  },
  remove: async (id: Id<'tasks'>) => {
    return await convexHttp.mutation(api.tasks.remove, { id });
  },
};

/**
 * Meetings API
 */
export const convexMeetings = {
  list: async (params?: ConvexQueryParams & { organizer?: Id<'users'> }) => {
    return await convexHttp.query(api.meetings.list, params || {});
  },
  get: async (id: Id<'meetings'>) => {
    return await convexHttp.query(api.meetings.get, { id });
  },
  create: async (data: unknown) => {
    return await convexHttp.mutation(api.meetings.create, data as any);
  },
  update: async (id: Id<'meetings'>, data: unknown) => {
    const payload = {
      id,
      ...(data as Record<string, unknown>),
    };
    return await convexHttp.mutation(api.meetings.update, payload as any);
  },
  remove: async (id: Id<'meetings'>) => {
    return await convexHttp.mutation(api.meetings.remove, { id });
  },
};

/**
 * Meeting Decisions API
 */
export const convexMeetingDecisions = {
  list: async (
    params?: {
      meeting_id?: Id<'meetings'>;
      owner?: Id<'users'>;
      status?: 'acik' | 'devam' | 'kapatildi';
    }
  ) => {
    return await convexHttp.query(api.meeting_decisions.list, params || {});
  },
  get: async (id: Id<'meeting_decisions'>) => {
    return await convexHttp.query(api.meeting_decisions.get, { id });
  },
  create: async (data: any) => {
    return await convexHttp.mutation(api.meeting_decisions.create, data);
  },
  update: async (id: Id<'meeting_decisions'>, data: any) => {
    return await convexHttp.mutation(api.meeting_decisions.update, { id, ...data });
  },
  remove: async (id: Id<'meeting_decisions'>) => {
    return await convexHttp.mutation(api.meeting_decisions.remove, { id });
  },
};

/**
 * Meeting Action Items API
 */
export const convexMeetingActionItems = {
  list: async (
    params?: {
      meeting_id?: Id<'meetings'>;
      assigned_to?: Id<'users'>;
      status?: 'beklemede' | 'devam' | 'hazir' | 'iptal';
    }
  ) => {
    return await convexHttp.query(api.meeting_action_items.list, params || {});
  },
  get: async (id: Id<'meeting_action_items'>) => {
    return await convexHttp.query(api.meeting_action_items.get, { id });
  },
  create: async (data: any) => {
    return await convexHttp.mutation(api.meeting_action_items.create, data);
  },
  update: async (id: Id<'meeting_action_items'>, data: any) => {
    return await convexHttp.mutation(api.meeting_action_items.update, { id, ...data });
  },
  updateStatus: async (
    id: Id<'meeting_action_items'>,
    payload: { status: 'beklemede' | 'devam' | 'hazir' | 'iptal'; changed_by: Id<'users'>; note?: string }
  ) => {
    return await convexHttp.mutation(api.meeting_action_items.updateStatus, { id, ...payload });
  },
  remove: async (id: Id<'meeting_action_items'>) => {
    return await convexHttp.mutation(api.meeting_action_items.remove, { id });
  },
};

/**
 * Workflow Notifications API
 */
export const convexWorkflowNotifications = {
  list: async (
    params?: {
      recipient?: Id<'users'>;
      status?: 'beklemede' | 'gonderildi' | 'okundu';
      category?: 'meeting' | 'gorev' | 'rapor' | 'hatirlatma';
    }
  ) => {
    return await convexHttp.query(api.workflow_notifications.list, params || {});
  },
  get: async (id: Id<'workflow_notifications'>) => {
    return await convexHttp.query(api.workflow_notifications.get, { id });
  },
  create: async (data: any) => {
    return await convexHttp.mutation(api.workflow_notifications.create, data);
  },
  markAsSent: async (id: Id<'workflow_notifications'>, sent_at?: string) => {
    return await convexHttp.mutation(api.workflow_notifications.markAsSent, { id, sent_at });
  },
  markAsRead: async (id: Id<'workflow_notifications'>, read_at?: string) => {
    return await convexHttp.mutation(api.workflow_notifications.markAsRead, { id, read_at });
  },
  remove: async (id: Id<'workflow_notifications'>) => {
    return await convexHttp.mutation(api.workflow_notifications.remove, { id });
  },
};

/**
 * Messages API
 */
export const convexMessages = {
  list: async (params?: ConvexQueryParams & { sender?: Id<'users'>; recipient?: Id<'users'> }) => {
    return await convexHttp.query(api.messages.list, params || {});
  },
  get: async (id: Id<'messages'>) => {
    return await convexHttp.query(api.messages.get, { id });
  },
  create: async (data: any) => {
    return await convexHttp.mutation(api.messages.create, data);
  },
  update: async (id: Id<'messages'>, data: any) => {
    return await convexHttp.mutation(api.messages.update, { id, ...data });
  },
  remove: async (id: Id<'messages'>) => {
    return await convexHttp.mutation(api.messages.remove, { id });
  },
};

/**
 * Users API
 */
export const convexUsers = {
  list: async (
    params?: {
      search?: string;
      role?: string;
      isActive?: boolean;
      limit?: number;
      cursor?: string;
    }
  ) => {
    return await convexHttp.query(api.users.list, params || {});
  },
  get: async (id: Id<'users'>) => {
    return await convexHttp.query(api.users.get, { id });
  },
  getByEmail: async (email: string) => {
    return await convexHttp.query(api.users.getByEmail, { email });
  },
  create: async (data: any) => {
    return await convexHttp.mutation(api.users.create, data);
  },
  update: async (id: Id<'users'>, data: any) => {
    return await convexHttp.mutation(api.users.update, { id, ...data });
  },
  remove: async (id: Id<'users'>) => {
    return await convexHttp.mutation(api.users.remove, { id });
  },
};

/**
 * Aid Applications API
 */
export const convexAidApplications = {
  list: async (
    params?: ConvexQueryParams & {
      stage?: string;
      beneficiary_id?: Id<'beneficiaries'>;
    }
  ) => {
    return await convexHttp.query(api.aid_applications.list, params || {});
  },
  get: async (id: Id<'aid_applications'>) => {
    return await convexHttp.query(api.aid_applications.get, { id });
  },
  create: async (data: any) => {
    return await convexHttp.mutation(api.aid_applications.create, data);
  },
  update: async (id: Id<'aid_applications'>, data: any) => {
    return await convexHttp.mutation(api.aid_applications.update, { id, ...data });
  },
  remove: async (id: Id<'aid_applications'>) => {
    return await convexHttp.mutation(api.aid_applications.remove, { id });
  },
};

/**
 * Finance Records API
 */
export const convexFinanceRecords = {
  list: async (
    params?: ConvexQueryParams & {
      record_type?: 'income' | 'expense';
      created_by?: Id<'users'>;
    }
  ) => {
    return await convexHttp.query(api.finance_records.list, params || {});
  },
  get: async (id: Id<'finance_records'>) => {
    return await convexHttp.query(api.finance_records.get, { id });
  },
  create: async (data: any) => {
    return await convexHttp.mutation(api.finance_records.create, data);
  },
  update: async (id: Id<'finance_records'>, data: any) => {
    return await convexHttp.mutation(api.finance_records.update, { id, ...data });
  },
  remove: async (id: Id<'finance_records'>) => {
    return await convexHttp.mutation(api.finance_records.remove, { id });
  },
};

/**
 * Partners API
 */
export const convexPartners = {
  list: async (
    params?: ConvexQueryParams & {
      type?: 'organization' | 'individual' | 'sponsor';
      status?: 'active' | 'inactive' | 'pending';
      partnership_type?: 'donor' | 'supplier' | 'volunteer' | 'sponsor' | 'service_provider';
    }
  ) => {
    // @ts-expect-error - partners types
    return await convexHttp.query(api.partners.list, params || {});
  },
  get: async (id: Id<'partners'>) => {
    // @ts-expect-error - partners types
    return await convexHttp.query(api.partners.get, { id });
  },
  create: async (data: any) => {
    // @ts-expect-error - partners types
    return await convexHttp.mutation(api.partners.create, data);
  },
  update: async (id: Id<'partners'>, data: any) => {
    // @ts-expect-error - partners types
    return await convexHttp.mutation(api.partners.update, { id, ...data });
  },
  remove: async (id: Id<'partners'>) => {
    // @ts-expect-error - partners types
    return await convexHttp.mutation(api.partners.remove, { id });
  },
};

export const convexSystemSettings = {
  getAll: async () => {
    return await convexHttp.query(api.system_settings.getSettings, {});
  },
  getByCategory: async (category: string) => {
    return await convexHttp.query(api.system_settings.getSettingsByCategory, { category });
  },
  get: async (category: string, key: string) => {
    return await convexHttp.query(api.system_settings.getSetting, { category, key });
  },
  updateSettings: async (
    category: string,
    settings: Record<string, unknown>,
    updatedBy?: Id<'users'>
  ) => {
    return await convexHttp.mutation(api.system_settings.updateSettings, {
      category,
      settings,
      updatedBy,
    });
  },
  updateSetting: async (category: string, key: string, value: unknown, updatedBy?: Id<'users'>) => {
    return await convexHttp.mutation(api.system_settings.updateSetting, {
      category,
      key,
      value,
      updatedBy,
    });
  },
  resetSettings: async (category?: string, updatedBy?: Id<'users'>) => {
    return await convexHttp.mutation(api.system_settings.resetSettings, {
      category,
      updatedBy,
    });
  },
};
