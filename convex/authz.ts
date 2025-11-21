import { ConvexError } from 'convex/values';
import type { ActionCtx, MutationCtx, QueryCtx } from './_generated/server';

type AuthCtx = QueryCtx | MutationCtx | ActionCtx;

/**
 * Basit kimlik doğrulama denetimi: çağıran kimliği yoksa hata fırlatır.
 */
export async function requireIdentity(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError('UNAUTHENTICATED');
  }

  return identity;
}
