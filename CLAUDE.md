# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kafkasder Panel is a modern non-profit association management system built with Next.js 16, React 19, and Convex. It manages beneficiaries, donations, scholarships, meetings, tasks, and partners with advanced features like AI chat assistants, WhatsApp integration, and comprehensive analytics.

**Tech Stack**: Next.js 16 (App Router) | React 19 | TypeScript | Convex (Backend) | Tailwind CSS 4 | Radix UI | TanStack Query | Vitest + Playwright

**Node Version**: >=20.9.0 (use `.nvmrc`)

## Development Commands

### Essential Commands
```bash
# Development
npm run dev                    # Start dev server (localhost:3000)
npm run convex:dev            # Start Convex backend (run concurrently)

# Type Checking & Linting
npm run typecheck             # TypeScript type checking (runs in pre-commit)
npm run lint                  # Run ESLint
npm run lint:fix              # Auto-fix linting issues
npm run format                # Format code with Prettier
npm run format:check          # Check formatting

# Testing
npm run test                  # Run unit tests (watch mode)
npm run test:ui               # Interactive test UI
npm run test:run              # Run tests once (CI mode)
npm run test:coverage         # Generate coverage report
npm run test:e2e              # Run Playwright E2E tests
npm run e2e:ui                # Playwright test UI

# Building
npm run build                 # Production build
npm run analyze               # Bundle analysis
npm run start                 # Start production server

# Deployment
npm run convex:deploy         # Deploy Convex backend
npm run vercel:prod           # Deploy to Vercel production
npm run vercel:preview        # Deploy preview

# Utilities
npm run clean                 # Clean .next cache
npm run clean:all             # Clean everything, reinstall deps
npm run health:check          # Check API health endpoint
npm run sg                    # Run semantic grep CLI tool
```

### Running a Single Test
```bash
# Vitest (unit tests)
npm run test -- path/to/file.test.ts
npm run test -- -t "test name pattern"

# Playwright (e2e)
npm run test:e2e -- tests/auth.spec.ts
npm run test:e2e -- --grep "login flow"
```

## Architecture

### Backend: Convex-First Architecture

**Convex** is the primary backend (not Next.js API routes). The project uses Convex for:
- Real-time database operations
- Authentication (custom implementation with bcrypt)
- File storage
- Server-side functions (queries, mutations, actions)

#### Convex Structure (`convex/`)
- **`schema.ts`**: Central database schema definition (all collections)
- **Function Files**: Each resource has a dedicated file (e.g., `users.ts`, `beneficiaries.ts`, `donations.ts`)
  - Exports query/mutation/action handlers
  - Uses object syntax with `handler` property (enforced by ESLint)
  - Requires argument validators via `v` from `convex/values`

**Key Collections**: users, beneficiaries, donations, tasks, meetings, partners, aid_applications, scholarships, finance_records, messages, audit_logs, analytics, communication_logs, workflow_notifications

#### API Routes (`src/app/api/`)
Next.js API routes serve as a **thin proxy layer** to Convex functions. They handle:
- HTTP routing and method validation
- Authentication middleware
- Rate limiting and CSRF protection
- Request/response transformation

**Pattern**: Each API route folder (e.g., `api/beneficiaries/`) contains a `route.ts` with GET/POST/PUT/DELETE handlers that call corresponding Convex functions.

### Frontend Architecture

#### App Router Structure (`src/app/`)
```
app/
├── (dashboard)/           # Dashboard layout group
│   ├── layout.tsx        # Shared sidebar/header layout
│   ├── bagis/            # Donations (Turkish: bağış)
│   ├── yardim/           # Aid applications (Turkish: yardım)
│   ├── burs/             # Scholarships (Turkish: burs)
│   ├── partner/          # Partners
│   ├── kullanici/        # Users (Turkish: kullanıcı)
│   ├── is/               # Tasks (Turkish: iş)
│   ├── mesaj/            # Messages (Turkish: mesaj)
│   ├── ayarlar/          # Settings (Turkish: ayarlar)
│   ├── analitik/         # Analytics (Turkish: analitik)
│   └── financial-dashboard/
├── api/                   # API routes (Convex proxy)
├── login/                 # Login page
├── layout.tsx            # Root layout
└── providers.tsx         # Global providers (Convex, TanStack Query)
```

**Routing Convention**: Turkish route names reflect the UI language (e.g., `/bagis` for donations page).

#### Component Organization (`src/components/`)
- **UI Components**: Radix UI primitives in `components/ui/` (button, dialog, select, etc.)
- **Feature Components**: Domain-specific components organized by feature
- **Forms**: Use `react-hook-form` + `zod` validation
- **Tables**: TanStack Table for data grids

#### State Management
- **Server State**: TanStack Query (React Query) for data fetching/caching
- **Client State**: Zustand stores in `src/stores/`
- **Form State**: React Hook Form

#### Custom Hooks (`src/hooks/`)
- **`useStandardForm`**: Standard form pattern with mutation, validation, reset
- **`useFormMutation`**: Lower-level mutation wrapper
- **`useApiCache`**: API response caching
- **`useExport`**: Data export (Excel, PDF)
- **`useFinancialData`**: Financial analytics

### API Client Pattern (`src/lib/api/`)

**CRUD Factory** (`crud-factory.ts`): DRY pattern for creating typed API clients
```typescript
// Creates CRUD operations: list, get, create, update, delete
const beneficiaries = createApiClient<Beneficiary>('beneficiaries');
```

**Usage in Components**:
```typescript
import { beneficiaries } from '@/lib/api/convex-api-client';

// Queries
const data = await beneficiaries.list({ status: 'active' });
const item = await beneficiaries.get(id);

// Mutations
const newItem = await beneficiaries.create(data);
await beneficiaries.update(id, updates);
await beneficiaries.delete(id);
```

**Type Safety**: All API operations use types from `@/types/database` and `@/lib/api/types`

### Path Aliases (tsconfig.json)
```typescript
@/*              → ./src/*
@/components/*   → ./src/components/*
@/lib/*          → ./src/lib/*
@/hooks/*        → ./src/hooks/*
@/types/*        → ./src/types/*
@/convex/*       → ./convex/*
```

## Code Style & Conventions

### TypeScript
- **Strict mode enabled**: All compiler strict flags on
- **No unused vars**: Prefix with `_` to ignore (e.g., `_unusedParam`)
- **Prefer `const`**: Use `const` over `let`, never `var`
- **Object shorthand**: Prefer `{ name }` over `{ name: name }`

### Logging
- **NO `console.log` in production code** (ESLint enforces this)
- Use the logger from `src/lib/logger.ts` instead
- Exception: `console.warn` and `console.error` allowed
- Exception: Test files, scripts, API routes, and logger implementation itself

### Convex Functions
- Use **object syntax** with `handler` property (not old function syntax)
- Always define **argument validators** using `v` from `convex/values`
- ESLint rules enforce these patterns via `@convex-dev/eslint-plugin`

### Authentication
- Custom auth implementation (not Convex Auth or NextAuth)
- Session management via Convex queries
- Password hashing with `bcryptjs`
- Two-factor auth support (optional)
- Current user: `getCurrentUser` query from `convex/auth.ts`

## Testing

### Test Structure
```
src/__tests__/
├── hooks/                    # Hook tests
├── lib/
│   ├── api/types.test.ts    # API type validation
│   └── validations/         # Schema validation tests
├── integration/             # API integration tests
└── setup.ts                 # Test setup (jsdom, React Testing Library)

e2e/                         # Playwright E2E tests
├── auth.spec.ts
├── beneficiaries.spec.ts
└── ...
```

### Testing Guidelines
- **Vitest** for unit/integration tests
- **Playwright** for E2E tests
- **@testing-library/react** for component tests
- Mock Convex API in tests using `src/__tests__/mocks/convex-api.ts`
- Test coverage goal: 30%
- Pre-commit runs typecheck + lint (tests run in CI)

See `TESTING_GUIDE.md` for comprehensive testing documentation.

## Security & Performance

### Security Features
- **CSRF Protection**: Token validation in API routes
- **Rate Limiting**: Per-endpoint limits via middleware
- **Content Security Policy**: Strict CSP headers (see `next.config.ts`)
- **Security Headers**: HSTS, X-Frame-Options, etc.
- **Input Sanitization**: DOMPurify via `isomorphic-dompurify`
- **Audit Logging**: User actions logged to `audit_logs` collection

### Performance Optimizations
- **Bundle Splitting**: Aggressive code splitting in `next.config.ts`
  - Separate chunks for framework, Radix UI, Lucide, TanStack, charts
- **Package Import Optimization**: Tree-shaking for 20+ packages
- **Image Optimization**: AVIF/WebP, responsive sizes, 1-year cache
- **CSS Optimization**: Critical CSS extraction enabled
- **API Caching**: Client-side cache via `src/lib/api-cache.ts`
- **Query Caching**: TanStack Query with configurable stale times

### Monitoring
- **Sentry**: Error tracking (client + server)
- **Vercel Analytics**: Web vitals, performance metrics
- Health check endpoint: `/api/health?detailed=true`

## Windows Compatibility

This project runs on Windows. Key considerations:
- **Standalone output disabled** on Windows to avoid EINVAL errors (see `next.config.ts`)
- Use MSYS/Git Bash for shell scripts
- Husky hooks work via Git Bash

## Key Files & Configs

- **`convex/schema.ts`**: Database schema (all collections)
- **`next.config.ts`**: Next.js config (security, perf, webpack)
- **`tsconfig.json`**: TypeScript config + path aliases
- **`eslint.config.mjs`**: ESLint rules (Convex plugin, console ban)
- **`vitest.config.ts`**: Test config + mocks
- **`tailwind.config.js`**: Tailwind v4 config
- **`src/app/providers.tsx`**: Global providers (Convex, React Query)
- **`src/lib/api/crud-factory.ts`**: API client factory (DRY pattern)

## Common Patterns

### Creating a New Resource

1. **Define schema** in `convex/schema.ts`
2. **Create Convex functions** in `convex/[resource].ts`
3. **Add API route** in `src/app/api/[resource]/route.ts`
4. **Create API client** using `createApiClient` in `crud-factory.ts`
5. **Define types** in `@/types/database.ts` and `@/lib/api/types.ts`
6. **Add validation schema** in `@/lib/validations/forms.ts` (if needed)
7. **Create UI components** and forms

### Creating a Form

Use the `useStandardForm` hook pattern:
```typescript
const form = useStandardForm({
  defaultValues: initialData,
  schema: beneficiarySchema,
  mutationFn: beneficiaries.create,
  onSuccess: () => { /* ... */ },
  resetOnSuccess: true,
});
```

### Adding a Dashboard Page

1. Create route in `src/app/(dashboard)/[route]/page.tsx`
2. Use dashboard layout automatically (sidebar, header)
3. Add to sidebar navigation in `src/app/(dashboard)/layout.tsx`

## Documentation Files

- **`TESTING_GUIDE.md`**: Comprehensive testing documentation
- **`PROJECT_OPTIMIZATION_SUMMARY.md`**: Performance optimizations applied
- **`API_ROUTE_REFACTORING.md`**: API architecture decisions
- **Turkish docs**: `HIZLI_OZET.md`, `GUVENLIK_RAPORU.md`, etc.

## Environment Variables

Check for `.env.local` (not in repo). Required variables:
- `CONVEX_DEPLOYMENT` or `NEXT_PUBLIC_CONVEX_URL`: Convex backend URL
- `SENTRY_DSN`: Error tracking
- Additional variables for WhatsApp, SMS, email services

Use `src/lib/env-validation.ts` for runtime validation.
