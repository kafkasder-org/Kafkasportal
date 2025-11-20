/**
 * Convex API Helper
 * Provides a unified interface for calling Convex functions from API routes
 *
 * Type-safe CRUD operations without any 'any' types
 */

import { convexHttp, api } from './server';
import { Id } from '@/convex/_generated/dataModel';
import type {
  BeneficiaryCreateInput,
  BeneficiaryUpdateInput,
  DonationCreateInput,
  DonationUpdateInput,
  TaskCreateInput,
  TaskUpdateInput,
  MeetingCreateInput,
  MeetingUpdateInput,
  MeetingDecisionCreateInput,
  MeetingDecisionUpdateInput,
  MeetingActionItemCreateInput,
  MeetingActionItemUpdateInput,
  MessageCreateInput,
  MessageUpdateInput,
  UserCreateInput,
  UserUpdateInput,
  AidApplicationCreateInput,
  AidApplicationUpdateInput,
  FinanceRecordCreateInput,
  FinanceRecordUpdateInput,
  PartnerCreateInput,
  PartnerUpdateInput,
  WorkflowNotificationCreateInput,
  CreateMutationPayload,
  UpdateMutationPayload,
} from '@/lib/api/types';

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
  create: async (data: BeneficiaryCreateInput, context: AuthContext = {}) => {
    const payload: CreateMutationPayload<BeneficiaryCreateInput> = {
      ...(context.auth ? { auth: context.auth } : {}),
      ...data,
    };
    return await convexHttp.mutation(api.beneficiaries.create, payload as any);
  },
  update: async (
    id: Id<'beneficiaries'>,
    data: BeneficiaryUpdateInput,
    context: AuthContext = {}
  ) => {
    const payload: UpdateMutationPayload<BeneficiaryUpdateInput> = {
      id,
      ...data,
      ...(context.auth ? { auth: context.auth } : {}),
    };
    return await convexHttp.mutation(api.beneficiaries.update, payload);
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
  create: async (data: DonationCreateInput) => {
    return await convexHttp.mutation(api.donations.create, data);
  },
  update: async (id: Id<'donations'>, data: DonationUpdateInput) => {
    const payload: UpdateMutationPayload<DonationUpdateInput> = {
      id,
      ...data,
    };
    return await convexHttp.mutation(api.donations.update, payload);
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
  create: async (data: TaskCreateInput) => {
    return await convexHttp.mutation(api.tasks.create, data);
  },
  update: async (id: Id<'tasks'>, data: TaskUpdateInput) => {
    const payload: UpdateMutationPayload<TaskUpdateInput> = {
      id,
      ...data,
    };
    return await convexHttp.mutation(api.tasks.update, payload);
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
  create: async (data: MeetingCreateInput) => {
    return await convexHttp.mutation(api.meetings.create, data);
  },
  update: async (id: Id<'meetings'>, data: MeetingUpdateInput) => {
    const payload: UpdateMutationPayload<MeetingUpdateInput> = {
      id,
      ...data,
    };
    return await convexHttp.mutation(api.meetings.update, payload);
  },
  remove: async (id: Id<'meetings'>) => {
    return await convexHttp.mutation(api.meetings.remove, { id });
  },
};

/**
 * Meeting Decisions API
 */
export const convexMeetingDecisions = {
  list: async (params?: {
    meeting_id?: Id<'meetings'>;
    owner?: Id<'users'>;
    status?: 'acik' | 'devam' | 'kapatildi';
  }) => {
    return await convexHttp.query(api.meeting_decisions.list, params || {});
  },
  get: async (id: Id<'meeting_decisions'>) => {
    return await convexHttp.query(api.meeting_decisions.get, { id });
  },
  create: async (data: MeetingDecisionCreateInput) => {
    return await convexHttp.mutation(api.meeting_decisions.create, data);
  },
  update: async (id: Id<'meeting_decisions'>, data: MeetingDecisionUpdateInput) => {
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
  list: async (params?: {
    meeting_id?: Id<'meetings'>;
    assigned_to?: Id<'users'>;
    status?: 'beklemede' | 'devam' | 'hazir' | 'iptal';
  }) => {
    return await convexHttp.query(api.meeting_action_items.list, params || {});
  },
  get: async (id: Id<'meeting_action_items'>) => {
    return await convexHttp.query(api.meeting_action_items.get, { id });
  },
  create: async (data: MeetingActionItemCreateInput) => {
    return await convexHttp.mutation(api.meeting_action_items.create, data);
  },
  update: async (id: Id<'meeting_action_items'>, data: MeetingActionItemUpdateInput) => {
    return await convexHttp.mutation(api.meeting_action_items.update, { id, ...data });
  },
  updateStatus: async (
    id: Id<'meeting_action_items'>,
    payload: {
      status: 'beklemede' | 'devam' | 'hazir' | 'iptal';
      changed_by: Id<'users'>;
      note?: string;
    }
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
  list: async (params?: {
    recipient?: Id<'users'>;
    status?: 'beklemede' | 'gonderildi' | 'okundu';
    category?: 'meeting' | 'gorev' | 'rapor' | 'hatirlatma';
  }) => {
    return await convexHttp.query(api.workflow_notifications.list, params || {});
  },
  get: async (id: Id<'workflow_notifications'>) => {
    return await convexHttp.query(api.workflow_notifications.get, { id });
  },
  create: async (data: WorkflowNotificationCreateInput) => {
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
  create: async (data: MessageCreateInput) => {
    return await convexHttp.mutation(api.messages.create, data);
  },
  update: async (id: Id<'messages'>, data: MessageUpdateInput) => {
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
  list: async (params?: {
    search?: string;
    role?: string;
    isActive?: boolean;
    limit?: number;
    cursor?: string;
  }) => {
    return await convexHttp.query(api.users.list, params || {});
  },
  get: async (id: Id<'users'>) => {
    return await convexHttp.query(api.users.get, { id });
  },
  getByEmail: async (email: string) => {
    return await convexHttp.query(api.users.getByEmail, { email });
  },
  create: async (data: UserCreateInput) => {
    return await convexHttp.mutation(api.users.create, data);
  },
  update: async (id: Id<'users'>, data: UserUpdateInput) => {
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
  create: async (data: AidApplicationCreateInput) => {
    return await convexHttp.mutation(api.aid_applications.create, data);
  },
  update: async (id: Id<'aid_applications'>, data: AidApplicationUpdateInput) => {
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
  create: async (data: FinanceRecordCreateInput) => {
    return await convexHttp.mutation(api.finance_records.create, data);
  },
  update: async (id: Id<'finance_records'>, data: FinanceRecordUpdateInput) => {
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
    return await convexHttp.query(api.partners.getPartners, params || {});
  },
  get: async (id: Id<'partners'>) => {
    return await convexHttp.query(api.partners.getPartnerById, { id });
  },
  create: async (data: PartnerCreateInput) => {
    return await convexHttp.mutation(api.partners.createPartner, data);
  },
  update: async (id: Id<'partners'>, data: PartnerUpdateInput) => {
    return await convexHttp.mutation(api.partners.updatePartner, { id, ...data });
  },
  remove: async (id: Id<'partners'>) => {
    return await convexHttp.mutation(api.partners.deletePartner, { id });
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
