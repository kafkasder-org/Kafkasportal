/**
 * Scholarships API Client
 * Handles all scholarship, application, and payment operations
 */

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { convex } from '@/lib/convex/client';

// Scholarship Programs API
export const scholarshipsApi = {
  // Get all scholarships
  list: async (params?: {
    limit?: number;
    skip?: number;
    category?: string;
    isActive?: boolean;
  }) => {
    try {
      if (!convex) throw new Error('Convex client not available');
      const response = await convex.query(api.scholarships.list, params || {});
      return {
        success: true,
        data: response.documents,
        total: response.total,
        error: null,
      };
    } catch (error) {
      console.error('Error listing scholarships:', error);
      return {
        success: false,
        data: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },

  // Get single scholarship
  get: async (id: Id<'scholarships'>) => {
    try {
      if (!convex) throw new Error('Convex client not available');
      const data = await convex.query(api.scholarships.get, { id });
      return {
        success: true,
        data,
        error: null,
      };
    } catch (error) {
      console.error('Error getting scholarship:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },

  // Create scholarship
  create: async (data: {
    title: string;
    description?: string;
    amount: number;
    currency: 'TRY' | 'USD' | 'EUR';
    duration_months?: number;
    category: string;
    eligibility_criteria?: string;
    requirements?: string[];
    application_start_date: string;
    application_end_date: string;
    academic_year?: string;
    max_recipients?: number;
    is_active: boolean;
  }) => {
    try {
      if (!convex) throw new Error('Convex client not available');
      const id = await convex.mutation(api.scholarships.create, data);
      return {
        success: true,
        data: { _id: id },
        error: null,
      };
    } catch (error) {
      console.error('Error creating scholarship:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },

  // Update scholarship
  update: async (
    id: Id<'scholarships'>,
    data: {
      title?: string;
      description?: string;
      amount?: number;
      duration_months?: number;
      category?: string;
      eligibility_criteria?: string;
      requirements?: string[];
      application_start_date?: string;
      application_end_date?: string;
      academic_year?: string;
      max_recipients?: number;
      is_active?: boolean;
    }
  ) => {
    try {
      if (!convex) throw new Error('Convex client not available');
      await convex.mutation(api.scholarships.update, { id, ...data });
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error('Error updating scholarship:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },

  // Delete scholarship
  remove: async (id: Id<'scholarships'>) => {
    try {
      if (!convex) throw new Error('Convex client not available');
      await convex.mutation(api.scholarships.remove, { id });
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },

  // Get statistics
  getStatistics: async (scholarshipId?: Id<'scholarships'>) => {
    try {
      if (!convex) throw new Error('Convex client not available');
      const stats = await convex.query(api.scholarships.getStatistics, {
        scholarship_id: scholarshipId,
      });
      return {
        success: true,
        data: stats,
        error: null,
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },
};

// Scholarship Applications API
export const scholarshipApplicationsApi = {
  // List applications
  list: async (params?: {
    limit?: number;
    skip?: number;
    scholarship_id?: Id<'scholarships'>;
    status?: string;
    tc_no?: string;
  }) => {
    try {
      if (!convex) throw new Error('Convex client not available');
      const response = await convex.query(api.scholarships.listApplications, params || {});
      return {
        success: true,
        data: response.documents,
        total: response.total,
        error: null,
      };
    } catch (error) {
      console.error('Error listing applications:', error);
      return {
        success: false,
        data: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },

  // Get single application
  get: async (id: Id<'scholarship_applications'>) => {
    try {
      if (!convex) throw new Error('Convex client not available');
      const data = await convex.query(api.scholarships.getApplication, { id });
      return {
        success: true,
        data,
        error: null,
      };
    } catch (error) {
      console.error('Error getting application:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },

  // Create application
  create: async (data: {
    scholarship_id: Id<'scholarships'>;
    student_id?: Id<'beneficiaries'>;
    applicant_name: string;
    applicant_tc_no: string;
    applicant_phone: string;
    applicant_email?: string;
    university?: string;
    department?: string;
    grade_level?: string;
    gpa?: number;
    academic_year?: string;
    monthly_income?: number;
    family_income?: number;
    father_occupation?: string;
    mother_occupation?: string;
    sibling_count?: number;
    is_orphan?: boolean;
    has_disability?: boolean;
    essay?: string;
    documents?: string[];
  }) => {
    try {
      if (!convex) throw new Error('Convex client not available');
      const id = await convex.mutation(api.scholarships.createApplication, data);
      return {
        success: true,
        data: { _id: id },
        error: null,
      };
    } catch (error) {
      console.error('Error creating application:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },

  // Update application
  update: async (
    id: Id<'scholarship_applications'>,
    data: {
      status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
      reviewer_notes?: string;
      reviewed_by?: Id<'users'>;
      reviewed_at?: string;
      submitted_at?: string;
    }
  ) => {
    try {
      if (!convex) throw new Error('Convex client not available');
      await convex.mutation(api.scholarships.updateApplication, { id, ...data });
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error('Error updating application:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },

  // Submit application
  submit: async (id: Id<'scholarship_applications'>) => {
    try {
      if (!convex) throw new Error('Convex client not available');
      await convex.mutation(api.scholarships.submitApplication, { id });
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error('Error submitting application:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },
};

// Scholarship Payments API
export const scholarshipPaymentsApi = {
  // List payments
  list: async (params?: {
    limit?: number;
    skip?: number;
    application_id?: Id<'scholarship_applications'>;
    status?: string;
  }) => {
    try {
      if (!convex) throw new Error('Convex client not available');
      const response = await convex.query(api.scholarships.listPayments, params || {});
      return {
        success: true,
        data: response.documents,
        total: response.total,
        error: null,
      };
    } catch (error) {
      console.error('Error listing payments:', error);
      return {
        success: false,
        data: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },

  // Create payment
  create: async (data: {
    application_id: Id<'scholarship_applications'>;
    payment_date: string;
    amount: number;
    currency: 'TRY' | 'USD' | 'EUR';
    payment_method: string;
    payment_reference?: string;
    bank_account?: string;
    notes?: string;
  }) => {
    try {
      if (!convex) throw new Error('Convex client not available');
      const id = await convex.mutation(api.scholarships.createPayment, data);
      return {
        success: true,
        data: { _id: id },
        error: null,
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },

  // Update payment
  update: async (
    id: Id<'scholarship_payments'>,
    data: {
      status: 'pending' | 'paid' | 'failed' | 'cancelled';
      processed_by?: Id<'users'>;
      receipt_file_id?: string;
      notes?: string;
    }
  ) => {
    try {
      if (!convex) throw new Error('Convex client not available');
      await convex.mutation(api.scholarships.updatePayment, { id, ...data });
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error('Error updating payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  },
};
