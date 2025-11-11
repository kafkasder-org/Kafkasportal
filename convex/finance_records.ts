import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List finance records with filters
export const list = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    record_type: v.optional(v.string()),
    status: v.optional(v.string()),
    created_by: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let records;
    
    if (args.record_type) {
      records = await ctx.db
        .query("finance_records")
        .withIndex("by_record_type", (q) => q.eq("record_type", args.record_type as "income" | "expense"))
        .collect();
    } else if (args.status) {
      records = await ctx.db
        .query("finance_records")
        .withIndex("by_status", (q) => q.eq("status", args.status as "pending" | "approved" | "rejected"))
        .collect();
    } else if (args.created_by) {
      records = await ctx.db
        .query("finance_records")
        .withIndex("by_created_by", (q) => q.eq("created_by", args.created_by!))
        .collect();
    } else {
      records = await ctx.db.query("finance_records").collect();
    }

    const skip = args.skip || 0;
    const limit = args.limit || 50;
    const paginated = records.slice(skip, skip + limit);

    return {
      documents: paginated,
      total: records.length,
    };
  },
});

// Get finance record by ID
export const get = query({
  args: { id: v.id("finance_records") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create finance record
export const create = mutation({
  args: {
    record_type: v.union(v.literal("income"), v.literal("expense")),
    category: v.string(),
    amount: v.number(),
    currency: v.union(v.literal("TRY"), v.literal("USD"), v.literal("EUR")),
    description: v.string(),
    transaction_date: v.string(),
    payment_method: v.optional(v.string()),
    receipt_number: v.optional(v.string()),
    receipt_file_id: v.optional(v.string()),
    related_to: v.optional(v.string()),
    created_by: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("finance_records", args);
  },
});

// Update finance record
export const update = mutation({
  args: {
    id: v.id("finance_records"),
    category: v.optional(v.string()),
    amount: v.optional(v.number()),
    currency: v.optional(v.union(v.literal("TRY"), v.literal("USD"), v.literal("EUR"))),
    description: v.optional(v.string()),
    transaction_date: v.optional(v.string()),
    payment_method: v.optional(v.string()),
    receipt_number: v.optional(v.string()),
    receipt_file_id: v.optional(v.string()),
    related_to: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )
    ),
    approved_by: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const record = await ctx.db.get(id);
    if (!record) {
      throw new Error("Finance record not found");
    }

    // Auto-set approved_by when status changes to approved
    if (updates.status === "approved" && !updates.approved_by && record.created_by) {
      // In a real scenario, you'd get this from auth context
      // For now, we'll leave it as is
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Delete finance record
export const remove = mutation({
  args: { id: v.id("finance_records") },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    if (!record) {
      throw new Error("Finance record not found");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Get financial dashboard metrics
export const getDashboardMetrics = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db.query("finance_records").collect();
    
    // Filter by date range if provided
    const filteredRecords = records.filter(record => {
      if (!args.startDate && !args.endDate) return true;
      const transactionDate = new Date(record.transaction_date);
      const start = args.startDate ? new Date(args.startDate) : new Date(0);
      const end = args.endDate ? new Date(args.endDate) : new Date();
      return transactionDate >= start && transactionDate <= end;
    });

    // Calculate totals
    const income = filteredRecords
      .filter(r => r.record_type === "income" && r.status === "approved")
      .reduce((sum, r) => sum + r.amount, 0);
    
    const expenses = filteredRecords
      .filter(r => r.record_type === "expense" && r.status === "approved")
      .reduce((sum, r) => sum + r.amount, 0);
    
    const netBalance = income - expenses;

    // Get pending counts
    const pendingIncome = filteredRecords
      .filter(r => r.record_type === "income" && r.status === "pending").length;
    
    const pendingExpenses = filteredRecords
      .filter(r => r.record_type === "expense" && r.status === "pending").length;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance,
      pendingIncome,
      pendingExpenses,
      recordCount: filteredRecords.length,
    };
  },
});

// Get monthly financial data for charts
export const getMonthlyData = query({
  args: {
    months: v.optional(v.number()), // Number of months to fetch (default 12)
  },
  handler: async (ctx, args) => {
    const monthsToFetch = args.months || 12;
    const records = await ctx.db.query("finance_records")
      .filter(q => q.eq(q.field("status"), "approved"))
      .collect();
    
    // Group by month
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    const now = new Date();
    
    // Initialize months
    for (let i = monthsToFetch - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = { income: 0, expenses: 0 };
    }
    
    // Aggregate data
    records.forEach(record => {
      const date = new Date(record.transaction_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[key]) {
        if (record.record_type === "income") {
          monthlyData[key].income += record.amount;
        } else if (record.record_type === "expense") {
          monthlyData[key].expenses += record.amount;
        }
      }
    });
    
    // Convert to array format
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  },
});

// Get category breakdown
export const getCategoryBreakdown = query({
  args: {
    recordType: v.union(v.literal("income"), v.literal("expense")),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("finance_records")
      .withIndex("by_record_type", (q) => q.eq("record_type", args.recordType))
      .filter(q => q.eq(q.field("status"), "approved"))
      .collect();
    
    // Filter by date range if provided
    const filteredRecords = records.filter(record => {
      if (!args.startDate && !args.endDate) return true;
      const transactionDate = new Date(record.transaction_date);
      const start = args.startDate ? new Date(args.startDate) : new Date(0);
      const end = args.endDate ? new Date(args.endDate) : new Date();
      return transactionDate >= start && transactionDate <= end;
    });
    
    // Group by category
    const categoryTotals: Record<string, number> = {};
    filteredRecords.forEach(record => {
      const category = record.category || "Diğer";
      categoryTotals[category] = (categoryTotals[category] || 0) + record.amount;
    });
    
    // Convert to array and sort by amount
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  },
});

// Get cash vault balance (only cash payment methods)
export const getVaultBalance = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db
      .query("finance_records")
      .filter(q => q.and(
        q.eq(q.field("payment_method"), "cash"),
        q.eq(q.field("status"), "approved")
      ))
      .collect();
    
    const cashIn = records
      .filter(r => r.record_type === "income")
      .reduce((sum, r) => sum + r.amount, 0);
    
    const cashOut = records
      .filter(r => r.record_type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);
    
    return {
      balance: cashIn - cashOut,
      cashIn,
      cashOut,
      transactionCount: records.length,
    };
  },
});

// Create cash vault transaction
export const createVaultTransaction = mutation({
  args: {
    transaction_type: v.union(v.literal("deposit"), v.literal("withdrawal"), v.literal("transfer")),
    amount: v.number(),
    category: v.string(),
    receipt_number: v.optional(v.string()),
    authorized_by: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const recordType: "income" | "expense" = 
      args.transaction_type === "deposit" ? "income" : "expense";
    
    return await ctx.db.insert("finance_records", {
      record_type: recordType,
      category: args.category,
      amount: args.amount,
      currency: "TRY",
      description: `Kasa ${args.transaction_type === "deposit" ? "giriş" : "çıkış"} - ${args.notes || ""}`,
      transaction_date: new Date().toISOString(),
      payment_method: "cash",
      receipt_number: args.receipt_number,
      created_by: args.authorized_by,
      status: "approved", // Vault transactions are auto-approved
      related_to: "vault",
    });
  },
});

