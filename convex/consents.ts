import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all consents for a beneficiary
export const getBeneficiaryConsents = query({
  args: {
    beneficiaryId: v.id("beneficiaries"),
  },
  handler: async (ctx, args) => {
    const consents = await ctx.db
      .query("consents")
      .withIndex("by_beneficiary", (q) => q.eq("beneficiary_id", args.beneficiaryId))
      .collect();

    return consents;
  },
});

// Create consent
export const createConsent = mutation({
  args: {
    beneficiaryId: v.id("beneficiaries"),
    consentType: v.string(),
    consentText: v.string(),
    status: v.union(v.literal('active'), v.literal('revoked'), v.literal('expired')),
    signedAt: v.string(),
    signedBy: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const consentId = await ctx.db.insert("consents", {
      beneficiary_id: args.beneficiaryId,
      consent_type: args.consentType,
      consent_text: args.consentText,
      status: args.status,
      signed_at: args.signedAt,
      signed_by: args.signedBy,
      expires_at: args.expiresAt,
      created_by: args.createdBy,
      notes: args.notes,
    });

    return consentId;
  },
});

// Update consent
export const updateConsent = mutation({
  args: {
    consentId: v.id("consents"),
    status: v.optional(v.union(v.literal('active'), v.literal('revoked'), v.literal('expired'))),
    notes: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { consentId, ...updates } = args;
    await ctx.db.patch(consentId, updates);
    return { success: true };
  },
});

// Delete consent
export const deleteConsent = mutation({
  args: {
    consentId: v.id("consents"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.consentId);
    return { success: true };
  },
});

