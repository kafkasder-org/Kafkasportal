# Copilot Instructions - Kafkasder Panel

## Architecture Overview

**Stack:** Next.js 16 App Router + React 19 + Convex + TypeScript  
**Purpose:** Turkish non-profit management system for aid organizations (dernek/vakıf)  
**Real-time Backend:** Convex handles all database operations with live subscriptions

### Critical Data Flow Pattern

```
Frontend (React) → Convex Hooks (useQuery/useMutation) → convex/*.ts → Convex Cloud DB
                 ↘ TanStack Query (caching layer) ↗
```

**Key Insight:** Convex functions (queries/mutations/actions) are the ONLY way to interact with the database. No direct SQL or REST APIs. All backend logic lives in `convex/*.ts` files with Zod validation via `v` validators.

## Convex Backend Patterns

### File Structure Convention

Each `convex/*.ts` file exports functions with this pattern:

```typescript
import { query, mutation, action } from './_generated/server';
import { v } from 'convex/values';

// Queries (read-only, reactive)
export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    /* implementation */
  },
});

// Mutations (write operations)
export const create = mutation({
  args: { name: v.string() /* ... */ },
  handler: async (ctx, args) => {
    /* implementation */
  },
});
```

**Critical:** After adding/modifying Convex files, run `npx convex dev` to regenerate TypeScript types in `convex/_generated/`. Frontend imports come from `convex/_generated/api`.

### Schema Conventions (convex/schema.ts)

- **Indexes:** Required for filtering (`by_status`, `by_user_id`, etc.)
- **Search indexes:** For text search (`by_search` with `searchField`)
- **Turkish + English dual support:** Payment methods, statuses use BOTH formats
  ```typescript
  payment_method: v.union(
    v.literal('cash'),
    v.literal('NAKIT'),
    v.literal('bank_transfer'),
    v.literal('BANKA_HAVALESI')
  );
  ```
- **Beneficiary categories:** `need_based_family`, `refugee_family`, `orphan_family`

## Development Workflow

### Essential Commands

```bash
npm run dev              # Next.js dev server (port 3000)
npx convex dev           # Convex backend with live reload + type gen
npm test                 # Vitest unit tests
npm run e2e              # Playwright E2E tests
npm run lint:fix         # ESLint + auto-fix
npm run format           # Prettier formatting
```

**CRITICAL PRE-COMMIT:** Husky runs `lint-staged` which enforces ESLint + Prettier. Fix all errors before committing.

### TypeScript Path Aliases (tsconfig.json)

```typescript
import { Button } from '@/components/ui/button'; // NOT ../../../components
import { convexBeneficiaries } from '@/lib/convex/api';
import { useAuthStore } from '@/stores/authStore';
```

### Testing Patterns

- **Unit tests:** `src/__tests__/` with Vitest + React Testing Library
- **Mocks:** Convex API mocked in `src/__tests__/mocks/convex-api.ts`
- **E2E:** Playwright in `e2e/` folder, separate from unit tests
- **Aliases:** Vitest redirects Convex imports to mocks (see `vitest.config.ts`)

## Code Style Enforcement

### Strict Rules (see AGENTS.md)

1. **No `var`** - use `const` (ESLint `prefer-const`)
2. **No `any`** except tests/scripts (strict TypeScript)
3. **Zod validation** for ALL form inputs and Convex args
4. **Turkish naming** for domain concepts, English for tech terms
5. **camelCase** (variables/functions), **PascalCase** (components/types), **SCREAMING_SNAKE_CASE** (constants)

### Codacy Integration (`.cursor/rules/codacy.mdc`)

**MANDATORY:** After ANY file edit, run `codacy_cli_analyze` tool with:

- `rootPath`: workspace path
- `file`: edited file path
- `tool`: empty (or "trivy" for dependencies)

**After package installs:** Run with `tool: "trivy"` for security scans.

## State Management Architecture

### Three-Layer Pattern

1. **Zustand** (`src/stores/`) - Client-side ephemeral state (auth, UI)
2. **TanStack Query** - Server state caching (wraps Convex queries)
3. **Convex Subscriptions** - Real-time database sync

**Example:** Auth state uses Zustand + localStorage persistence:

```typescript
// src/stores/authStore.ts
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      /* state */
    }),
    { name: 'auth-storage' }
  )
);
```

**Performance Note:** `createOptimizedQueryClient()` in `src/lib/cache-config.ts` sets 5min stale time to reduce Convex calls.

## Common Pitfalls

### 1. Convex Type Errors

**Problem:** `Property 'api' does not exist on type...`  
**Solution:** Run `npx convex dev` to regenerate types after editing `convex/*.ts`

### 2. Turkish Data Conflicts

**Problem:** Payment methods don't match schema  
**Solution:** Check dual format support - BOTH `cash` AND `NAKIT` are valid

### 3. Import Alias Confusion

**Wrong:** `import { Button } from '../../components/ui/button'`  
**Correct:** `import { Button } from '@/components/ui/button'`

### 4. Test Failures with Convex

**Problem:** `Cannot find module 'convex/_generated/api'`  
**Solution:** Vitest uses mocks - check `vitest.config.ts` alias mappings

## Project-Specific Patterns

### Beneficiary Data Structure

- **Primary beneficiaries:** `beneficiary_type: 'primary_person'`
- **Dependents:** Linked via `primary_beneficiary_id` field
- **Category mapping:** Mülteci → `refugee_family`, Yetim → `orphan_family`

### Batch Import Pattern (scripts/import-export-data.py)

- CSV → Convex via `beneficiaries:importExportDataBatch` mutation
- 50 records per batch to avoid timeouts
- Auto-generates temp TC numbers for missing IDs: `TEMP-{timestamp}-{random}`

### AI Agent Framework (convex/agents.ts)

- Thread-based conversations with tool integration
- Multi-provider support (OpenAI + Anthropic)
- Usage tracking with token/cost monitoring
- **Critical:** Run `npx convex dev` after editing to fix type errors

## Environment Configuration

**Required in `.env.local`:**

```bash
NEXT_PUBLIC_CONVEX_URL=https://fleet-octopus-839.convex.cloud
CONVEX_DEPLOYMENT=dev:fleet-octopus-839
```

**Optional integrations:** Sentry (error tracking), n8n webhooks (automation)

See `docs/ENVIRONMENT.md` for complete setup guide.

## Documentation References

- **Build commands:** `AGENTS.md` (line 3-13)
- **Architecture:** `README.md` + `AGENTS.md` (line 15-38)
- **Convex schema:** `convex/schema.ts` (1698 lines, 20+ tables)
- **API patterns:** `src/lib/convex/api.ts` (wrapper functions)
- **Testing setup:** `vitest.config.ts` + `src/__tests__/setup.ts`
- **Deployment:** `docs/DEPLOYMENT.md`

## Quick Decision Matrix

**Adding a new feature?**

1. Define schema in `convex/schema.ts` (table + indexes)
2. Create query/mutation in `convex/feature.ts`
3. Run `npx convex dev` to generate types
4. Use in frontend via `useQuery(api.feature.functionName)`
5. Run Codacy analysis on edited files

**Fixing a bug?**

1. Check console for Convex errors (authentication, validation)
2. Verify schema matches data (Turkish vs English fields)
3. Run `npm run lint:fix` before committing
4. Add test in `src/__tests__/` if applicable

**Performance issue?**

1. Check TanStack Query cache config (`src/lib/cache-config.ts`)
2. Verify Convex indexes exist for filtered queries
3. Use React DevTools Profiler to find slow renders
4. Consider splitting large components (Suspense boundaries)
