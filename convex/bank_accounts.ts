import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all bank accounts for a beneficiary
export const getBeneficiaryBankAccounts = query({
  args: {
    beneficiaryId: v.id("beneficiaries"),
  },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("bank_accounts")
      .withIndex("by_beneficiary", (q) => q.eq("beneficiary_id", args.beneficiaryId))
      .collect();

    return accounts;
  },
});

// Create bank account
export const createBankAccount = mutation({
  args: {
    beneficiaryId: v.id("beneficiaries"),
    bankName: v.string(),
    accountHolder: v.string(),
    accountNumber: v.string(),
    iban: v.optional(v.string()),
    branchName: v.optional(v.string()),
    branchCode: v.optional(v.string()),
    accountType: v.union(v.literal('checking'), v.literal('savings'), v.literal('other')),
    currency: v.union(v.literal('TRY'), v.literal('USD'), v.literal('EUR')),
    isPrimary: v.optional(v.boolean()),
    status: v.union(v.literal('active'), v.literal('inactive'), v.literal('closed')),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // IMPROVED: Batch updates to reduce OCC conflicts
    // If this is primary, unset other primary accounts
    if (args.isPrimary) {
      const existingAccounts = await ctx.db
        .query("bank_accounts")
        .withIndex("by_beneficiary", (q) => q.eq("beneficiary_id", args.beneficiaryId))
        .filter((q) => q.eq(q.field("is_primary"), true))
        .collect();
      
      // Use Promise.all to update in parallel (safer than sequential)
      await Promise.all(
        existingAccounts.map((account) => 
          ctx.db.patch(account._id, { is_primary: false })
        )
      );
    }

    const accountId = await ctx.db.insert("bank_accounts", {
      beneficiary_id: args.beneficiaryId,
      bank_name: args.bankName,
      account_holder: args.accountHolder,
      account_number: args.accountNumber,
      iban: args.iban,
      branch_name: args.branchName,
      branch_code: args.branchCode,
      account_type: args.accountType,
      currency: args.currency,
      is_primary: args.isPrimary || false,
      status: args.status,
      notes: args.notes,
    });

    return accountId;
  },
});

// Update bank account
export const updateBankAccount = mutation({
  args: {
    accountId: v.id("bank_accounts"),
    bankName: v.optional(v.string()),
    accountHolder: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    iban: v.optional(v.string()),
    branchName: v.optional(v.string()),
    branchCode: v.optional(v.string()),
    accountType: v.optional(v.union(v.literal('checking'), v.literal('savings'), v.literal('other'))),
    currency: v.optional(v.union(v.literal('TRY'), v.literal('USD'), v.literal('EUR'))),
    isPrimary: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal('active'), v.literal('inactive'), v.literal('closed'))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { accountId, isPrimary, ...updates } = args;
    
    // IMPROVED: Use Promise.all for parallel updates to reduce OCC conflicts
    // If setting as primary, unset other primary accounts
    if (isPrimary) {
      const account = await ctx.db.get(accountId);
      if (account) {
        const existingAccounts = await ctx.db
          .query("bank_accounts")
          .withIndex("by_beneficiary", (q) => q.eq("beneficiary_id", account.beneficiary_id))
          .filter((q) => q.and(
            q.neq(q.field("_id"), accountId),
            q.eq(q.field("is_primary"), true)
          ))
          .collect();
        
        // Parallel updates to avoid sequential conflicts
        await Promise.all(
          existingAccounts.map((acc) => 
            ctx.db.patch(acc._id, { is_primary: false })
          )
        );
      }
      await ctx.db.patch(accountId, { ...updates, is_primary: true });
    } else {
      await ctx.db.patch(accountId, updates);
    }

    return { success: true };
  },
});

// Delete bank account
export const deleteBankAccount = mutation({
  args: {
    accountId: v.id("bank_accounts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.accountId);
    return { success: true };
  },
});

