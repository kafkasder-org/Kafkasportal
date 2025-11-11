import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const isValidTcNumber = (value: string): boolean => /^\d{11}$/.test(value);

// Scholarships - Scholarship Programs

// List scholarships with filters
export const list = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let scholarships;
    
    if (args.category) {
      scholarships = await ctx.db
        .query("scholarships")
        .withIndex("by_category", (q) => q.eq("category", args.category as any))
        .collect();
    } else if (args.isActive !== undefined) {
      scholarships = await ctx.db
        .query("scholarships")
        .withIndex("by_is_active", (q) => q.eq("is_active", args.isActive!))
        .collect();
    } else {
      scholarships = await ctx.db.query("scholarships").collect();
    }

    const skip = args.skip || 0;
    const limit = args.limit || 50;
    const paginated = scholarships.slice(skip, skip + limit);

    return {
      documents: paginated,
      total: scholarships.length,
    };
  },
});

// Get scholarship by ID
export const get = query({
  args: { id: v.id("scholarships") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create scholarship program
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    amount: v.number(),
    currency: v.union(v.literal("TRY"), v.literal("USD"), v.literal("EUR")),
    duration_months: v.optional(v.number()),
    category: v.string(),
    eligibility_criteria: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),
    application_start_date: v.string(),
    application_end_date: v.string(),
    academic_year: v.optional(v.string()),
    max_recipients: v.optional(v.number()),
    is_active: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scholarships", {
      ...args,
      created_by: "system" as any, // Temporary - should be actual user ID
      created_at: new Date().toISOString(),
    });
  },
});

// Update scholarship program
export const update = mutation({
  args: {
    id: v.id("scholarships"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    amount: v.optional(v.number()),
    duration_months: v.optional(v.number()),
    category: v.optional(v.string()),
    eligibility_criteria: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),
    application_start_date: v.optional(v.string()),
    application_end_date: v.optional(v.string()),
    academic_year: v.optional(v.string()),
    max_recipients: v.optional(v.number()),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const scholarship = await ctx.db.get(id);
    if (!scholarship) {
      throw new Error("Scholarship not found");
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Delete scholarship
export const remove = mutation({
  args: { id: v.id("scholarships") },
  handler: async (ctx, args) => {
    const scholarship = await ctx.db.get(args.id);
    if (!scholarship) {
      throw new Error("Scholarship not found");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Scholarship Applications

// List applications with filters
// TC number search requires authentication and ADMIN/MANAGER role
export const listApplications = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    scholarship_id: v.optional(v.id("scholarships")),
    status: v.optional(v.string()),
    tc_no: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.tc_no) {
      if (!isValidTcNumber(args.tc_no)) {
        throw new Error("Invalid TC number format");
      }

      const applications = await ctx.db
        .query("scholarship_applications")
        .withIndex("by_tc_no", (q) => q.eq("applicant_tc_no", args.tc_no!))
        .collect();

      const skip = args.skip || 0;
      const limit = args.limit || 50;
      const paginated = applications.slice(skip, skip + limit);

      return {
        documents: paginated,
        total: applications.length,
      };
    }

    let applications;
    
    if (args.scholarship_id) {
      applications = await ctx.db
        .query("scholarship_applications")
        .withIndex("by_scholarship", (q) => q.eq("scholarship_id", args.scholarship_id!))
        .collect();
    } else if (args.status) {
      applications = await ctx.db
        .query("scholarship_applications")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else {
      applications = await ctx.db.query("scholarship_applications").collect();
    }

    const skip = args.skip || 0;
    const limit = args.limit || 50;
    const paginated = applications.slice(skip, skip + limit);

    return {
      documents: paginated,
      total: applications.length,
    };
  },
});

// Get application by ID
// Requires authentication and ADMIN/MANAGER role (contains TC number)
export const getApplication = query({
  args: { id: v.id("scholarship_applications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create scholarship application
export const createApplication = mutation({
  args: {
    scholarship_id: v.id("scholarships"),
    student_id: v.optional(v.id("beneficiaries")),
    applicant_name: v.string(),
    applicant_tc_no: v.string(),
    applicant_phone: v.string(),
    applicant_email: v.optional(v.string()),
    university: v.optional(v.string()),
    department: v.optional(v.string()),
    grade_level: v.optional(v.string()),
    gpa: v.optional(v.number()),
    academic_year: v.optional(v.string()),
    monthly_income: v.optional(v.number()),
    family_income: v.optional(v.number()),
    father_occupation: v.optional(v.string()),
    mother_occupation: v.optional(v.string()),
    sibling_count: v.optional(v.number()),
    is_orphan: v.optional(v.boolean()),
    has_disability: v.optional(v.boolean()),
    essay: v.optional(v.string()),
    documents: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    if (!isValidTcNumber(args.applicant_tc_no)) {
      throw new Error("Invalid TC number format");
    }

    const priorityScore = calculatePriorityScore(args);

    return await ctx.db.insert("scholarship_applications", {
      ...args,
      applicant_tc_no: args.applicant_tc_no,
      priority_score: priorityScore,
      status: "draft",
      created_at: new Date().toISOString(),
    });
  },
});

// Update scholarship application
// Requires authentication and ADMIN/MANAGER role (accesses TC number data)
export const updateApplication = mutation({
  args: {
    id: v.id("scholarship_applications"),
    status: v.optional(v.union(v.literal("draft"), v.literal("submitted"), v.literal("under_review"), v.literal("approved"), v.literal("rejected"), v.literal("waitlisted"))),
    reviewer_notes: v.optional(v.string()),
    reviewed_by: v.optional(v.id("users")),
    reviewed_at: v.optional(v.string()),
    submitted_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const application = await ctx.db.get(id);
    if (!application) {
      throw new Error("Application not found");
    }

    if (updates.status === "submitted" && !updates.submitted_at) {
      (updates as any).submitted_at = new Date().toISOString();
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Submit application
// Requires authentication and ADMIN/MANAGER role (accesses TC number data)
export const submitApplication = mutation({
  args: { id: v.id("scholarship_applications") },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.id);
    if (!application) {
      throw new Error("Application not found");
    }

    if (application.status !== "draft") {
      throw new Error("Only draft applications can be submitted");
    }

    await ctx.db.patch(args.id, {
      status: "submitted",
      submitted_at: new Date().toISOString(),
    });

    return await ctx.db.get(args.id);
  },
});

// Helper function to calculate priority score
function calculatePriorityScore(args: any): number {
  let score = 0;

  // GPA factor (30% weight)
  if (args.gpa) {
    score += (args.gpa / 4.0) * 30;
  }

  // Income factors (40% weight)
  if (args.family_income) {
    // Lower income = higher score
    if (args.family_income < 2000) score += 20;
    else if (args.family_income < 4000) score += 15;
    else if (args.family_income < 6000) score += 10;
    else score += 5;
  }

  if (args.monthly_income) {
    // Lower income = higher score
    if (args.monthly_income < 1000) score += 20;
    else if (args.monthly_income < 2000) score += 15;
    else if (args.monthly_income < 3000) score += 10;
    else score += 5;
  }

  // Special circumstances (30% weight)
  if (args.is_orphan) score += 15;
  if (args.has_disability) score += 10;
  if (args.sibling_count && args.sibling_count > 3) score += 5;

  return Math.round(score);
}

// Scholarship Payments

// List payments with filters
export const listPayments = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    application_id: v.optional(v.id("scholarship_applications")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let payments;
    
    if (args.application_id) {
      payments = await ctx.db
        .query("scholarship_payments")
        .withIndex("by_application", (q) => q.eq("application_id", args.application_id!))
        .collect();
    } else if (args.status) {
      payments = await ctx.db
        .query("scholarship_payments")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else {
      payments = await ctx.db.query("scholarship_payments").collect();
    }

    const skip = args.skip || 0;
    const limit = args.limit || 50;
    const paginated = payments.slice(skip, skip + limit);

    return {
      documents: paginated,
      total: payments.length,
    };
  },
});

// Create scholarship payment
export const createPayment = mutation({
  args: {
    application_id: v.id("scholarship_applications"),
    payment_date: v.string(),
    amount: v.number(),
    currency: v.union(v.literal("TRY"), v.literal("USD"), v.literal("EUR")),
    payment_method: v.string(),
    payment_reference: v.optional(v.string()),
    bank_account: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scholarship_payments", {
      ...args,
      status: "pending",
      created_at: new Date().toISOString(),
    });
  },
});

// Update payment status
export const updatePayment = mutation({
  args: {
    id: v.id("scholarship_payments"),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"), v.literal("cancelled")),
    processed_by: v.optional(v.id("users")),
    receipt_file_id: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const payment = await ctx.db.get(id);
    if (!payment) {
      throw new Error("Payment not found");
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Get payment statistics
export const getStatistics = query({
  args: {
    scholarship_id: v.optional(v.id("scholarships")),
  },
  handler: async (ctx, args) => {
    let applications;
    
    if (args.scholarship_id) {
      applications = await ctx.db
        .query("scholarship_applications")
        .withIndex("by_scholarship", (q) => q.eq("scholarship_id", args.scholarship_id!))
        .collect();
    } else {
      applications = await ctx.db.query("scholarship_applications").collect();
    }

    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const payments = await ctx.db.query("scholarship_payments").collect();
    const totalPaid = payments
      .filter((p: { status: string }) => p.status === "paid")
      .reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);

    return {
      totalApplications: applications.length,
      statusCounts,
      totalPaid,
      approvedApplications: statusCounts.approved || 0,
      pendingApplications: statusCounts.under_review || 0,
    };
  },
});