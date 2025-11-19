# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kafkasder Panel is a modern non-profit association management system built with Next.js 16, React 19, and Convex. It manages beneficiaries, donations, scholarships, meetings, tasks, and partners with advanced features like AI chat assistants, WhatsApp integration, comprehensive analytics, security auditing, and financial tracking.

**Tech Stack**: Next.js 16 (App Router) | React 19 | TypeScript | Convex (Backend) | Tailwind CSS 4 | Radix UI | TanStack Query | Vitest + Playwright

**Node Version**: >=20.9.0 (use `.nvmrc`)

**Key Features**:
- Beneficiary & Aid Management with advanced categorization
- Donation tracking with Kumbara (savings/piggy bank) system
- Scholarship & student management
- Meeting management with decisions and action items
- Task & workflow automation
- AI-powered chat assistants
- WhatsApp & multi-channel communication
- Financial dashboard & reporting
- Security audit & monitoring
- Real-time analytics

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

**Key Collections**:
- **Core**: users, beneficiaries, donations, tasks, meetings, partners
- **Aid & Scholarships**: aid_applications, scholarships, dependents
- **Finance**: finance_records, bank_accounts
- **Communication**: messages, communication_logs, consents
- **Meetings**: meeting_decisions, meeting_action_items
- **AI & Automation**: ai_chat, agents, workflow_notifications
- **System**: analytics, audit_logs, security_audit, errors, monitoring, system_settings, settings
- **Documents**: documents, storage, branding
- **Auth**: two_factor_auth
- **Reports**: reports, data_import_export

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
├── (dashboard)/                    # Dashboard layout group
│   ├── layout.tsx                 # Shared sidebar/header layout
│   ├── genel/                     # General overview/home
│   ├── bagis/                     # Donations (Turkish: bağış)
│   │   ├── liste/                 # Donation list
│   │   ├── raporlar/              # Donation reports
│   │   └── kumbara/               # Piggy bank/savings
│   ├── yardim/                    # Aid management (Turkish: yardım)
│   │   ├── ihtiyac-sahipleri/     # Beneficiaries
│   │   ├── basvurular/            # Aid applications
│   │   ├── liste/                 # Aid list
│   │   └── nakdi-vezne/           # Cash vault
│   ├── burs/                      # Scholarships (Turkish: burs)
│   │   ├── ogrenciler/            # Students
│   │   ├── basvurular/            # Scholarship applications
│   │   └── yetim/                 # Orphan scholarships
│   ├── fon/                       # Finance/funds (Turkish: fon)
│   │   ├── gelir-gider/           # Income/expenses
│   │   └── raporlar/              # Financial reports
│   ├── partner/                   # Partners
│   │   └── liste/                 # Partner list
│   ├── kullanici/                 # Users (Turkish: kullanıcı)
│   │   ├── yeni/                  # New user
│   │   └── [id]/duzenle/          # Edit user
│   ├── is/                        # Tasks & management (Turkish: iş)
│   │   ├── gorevler/              # Tasks
│   │   ├── toplantilar/           # Meetings
│   │   └── yonetim/               # Management
│   ├── mesaj/                     # Messages (Turkish: mesaj)
│   │   ├── toplu/                 # Bulk messages
│   │   ├── whatsapp/              # WhatsApp
│   │   ├── gecmis/                # Message history
│   │   └── kurum-ici/             # Internal messages
│   ├── ayarlar/                   # Settings (Turkish: ayarlar)
│   │   ├── tema/                  # Theme settings
│   │   ├── marka/                 # Branding
│   │   ├── parametreler/          # Parameters
│   │   ├── guvenlik/              # Security
│   │   └── iletisim/              # Communication settings
│   ├── analitik/                  # Analytics
│   ├── financial-dashboard/       # Financial dashboard
│   ├── denetim-kayitlari/         # Audit logs
│   ├── performance-monitoring/    # Performance monitoring
│   ├── errors/                    # Error tracking
│   └── settings/                  # General settings
├── api/                            # API routes (Convex proxy)
│   ├── auth/                      # Authentication
│   ├── users/                     # User management
│   ├── beneficiaries/             # Beneficiary operations
│   ├── donations/                 # Donation operations
│   ├── aid-applications/          # Aid applications
│   ├── scholarships/              # Scholarship operations
│   ├── tasks/                     # Task management
│   ├── meetings/                  # Meeting management
│   ├── meeting-decisions/         # Meeting decisions
│   ├── meeting-action-items/      # Meeting action items
│   ├── messages/                  # Messaging
│   ├── communication/             # Communication API
│   ├── communication-logs/        # Communication logs
│   ├── whatsapp/                  # WhatsApp integration
│   ├── partners/                  # Partner management
│   ├── analytics/                 # Analytics API
│   ├── workflow-notifications/    # Workflow notifications
│   ├── kumbara/                   # Kumbara (savings) API
│   ├── storage/                   # File storage
│   ├── branding/                  # Branding API
│   ├── settings/                  # Settings API
│   ├── security/                  # Security API
│   ├── monitoring/                # System monitoring
│   ├── errors/                    # Error tracking
│   ├── health/                    # Health check
│   ├── csrf/                      # CSRF tokens
│   └── webhooks/                  # Webhook handlers
├── login/                          # Login page
├── layout.tsx                      # Root layout
└── providers.tsx                   # Global providers (Convex, TanStack Query)
```

**Routing Convention**: Turkish route names reflect the UI language (e.g., `/bagis` for donations, `/yardim` for aid management).

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
  - Integrates React Hook Form + Zod validation
  - Automatic error handling and success notifications
  - Configurable reset behavior
- **`useFormMutation`**: Lower-level mutation wrapper for custom form logic
- **`useApiCache`**: API response caching with TTL management
- **`useExport`**: Data export utilities (Excel, PDF)
- **`useFinancialData`**: Financial analytics data fetching
- **`useBeneficiaryForm`**: Specialized form for beneficiary management
- **`useCountUp`**: Animated number counting for stats
- **`useDeviceDetection`**: Mobile/tablet/desktop detection
- **`useInfiniteScroll`**: Infinite scroll pagination

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
@/stores/*       → ./src/stores/*
@/types/*        → ./src/types/*
@/data/*         → ./src/data/*
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
- **Custom auth implementation** (not Convex Auth or NextAuth)
- **Architecture**: Next.js API routes handle password verification (bcrypt), Convex stores user data
- **Password hashing**: Uses `bcryptjs` in Next.js API routes (Convex can't run native modules)
- **Session management**: Via Convex queries (`getCurrentUser`, `getUserByEmail`)
- **Two-factor auth**: Optional 2FA support via `two_factor_auth` collection
- **Key files**:
  - `convex/auth.ts`: User queries without password verification
  - `src/app/api/auth/`: Login/logout endpoints with bcrypt verification
  - `src/stores/authStore.ts`: Client-side auth state (Zustand)

### Validation Schemas (`src/lib/validations/`)
All forms use Zod schemas for type-safe validation:
- **`beneficiary.ts`**: Comprehensive beneficiary validation (16KB - most complex)
- **`forms.ts`**: Generic form schemas (login, settings, etc.)
- **`kumbara.ts`**: Piggy bank/savings validation
- **`meeting.ts`**: Meeting validation
- **`meetingActionItem.ts`**: Meeting action item validation
- **`message.ts`**: Message and communication validation
- **`task.ts`**: Task validation
- **`aid-application.ts`**: Aid application validation
- **`shared-validators.ts`**: Reusable validation utilities (phone, email, dates, etc.)

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
- **CSRF Protection**: Token validation in API routes (`src/lib/csrf.ts`)
- **Rate Limiting**: Per-endpoint limits via middleware (`src/lib/rate-limit.ts`)
  - Configurable limits per endpoint in `rate-limit-config.ts`
  - Rate limit monitoring in `rate-limit-monitor.ts`
- **Content Security Policy**: Strict CSP headers (see `next.config.ts`)
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, etc.
- **Input Sanitization**: DOMPurify via `isomorphic-dompurify` (`src/lib/sanitization.ts`)
- **Audit Logging**: User actions logged to `audit_logs` and `security_audit` collections
  - Track user actions, data access, permission changes
  - Security-specific events in dedicated collection
- **Error Tracking**: Comprehensive error monitoring system
  - `src/lib/error-tracker.ts`: Error tracking utilities
  - `src/lib/errors.ts`: Centralized error definitions
  - `convex/errors.ts`: Backend error collection
- **Authentication Security**: Custom bcrypt-based auth with optional 2FA

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
   ```typescript
   myResource: defineTable({
     name: v.string(),
     status: v.string(),
     createdAt: v.optional(v.string()),
   }).index('by_status', ['status'])
   ```

2. **Create Convex functions** in `convex/[resource].ts`
   ```typescript
   export const list = query({
     args: { status: v.optional(v.string()) },
     handler: async (ctx, args) => {
       // Implementation
     },
   });

   export const create = mutation({
     args: { name: v.string(), status: v.string() },
     handler: async (ctx, args) => {
       // Implementation
     },
   });
   ```

3. **Add API route** in `src/app/api/[resource]/route.ts`
   ```typescript
   export async function GET(request: Request) {
     // Proxy to Convex query
   }

   export async function POST(request: Request) {
     // Proxy to Convex mutation
   }
   ```

4. **Create API client** using `createApiClient` in `crud-factory.ts`
   ```typescript
   export const myResource = createApiClient<MyResourceDocument>('myResource');
   ```

5. **Define types** in `@/types/database.ts` and `@/lib/api/types.ts`

6. **Add validation schema** in `@/lib/validations/` (if needed)
   ```typescript
   export const myResourceSchema = z.object({
     name: z.string().min(1),
     status: z.enum(['active', 'inactive']),
   });
   ```

7. **Create UI components** and forms in `src/components/`

### Creating a Form

Use the `useStandardForm` hook pattern for consistent form handling:
```typescript
import { useStandardForm } from '@/hooks/useStandardForm';
import { beneficiarySchema } from '@/lib/validations/beneficiary';
import { beneficiaries } from '@/lib/api/crud-factory';

function BeneficiaryForm({ initialData, onSuccess }) {
  const form = useStandardForm({
    defaultValues: initialData || {
      name: '',
      status: 'active',
    },
    schema: beneficiarySchema,
    mutationFn: initialData
      ? (data) => beneficiaries.update(initialData._id, data)
      : beneficiaries.create,
    onSuccess: () => {
      toast.success('Saved successfully!');
      onSuccess?.();
    },
    resetOnSuccess: !initialData, // Reset only for create, not edit
  });

  return (
    <form onSubmit={form.handleSubmit}>
      {/* Form fields using form.register */}
    </form>
  );
}
```

### Adding a Dashboard Page

1. Create route in `src/app/(dashboard)/[route]/page.tsx`
   ```typescript
   export default function MyPage() {
     return (
       <div className="p-6">
         <h1 className="text-2xl font-bold">My Page</h1>
         {/* Content */}
       </div>
     );
   }
   ```

2. Use dashboard layout automatically (sidebar, header)

3. Add to sidebar navigation in `src/app/(dashboard)/layout.tsx`
   ```typescript
   const navItems = [
     // ... existing items
     {
       title: 'My Page',
       href: '/my-page',
       icon: MyIcon,
     },
   ];
   ```

### Working with Convex Queries

```typescript
'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function MyComponent() {
  const data = useQuery(api.myResource.list, { status: 'active' });

  if (data === undefined) {
    return <LoadingSpinner />;
  }

  return <div>{/* Render data */}</div>;
}
```

### Implementing Caching

```typescript
import { getCache } from '@/lib/api-cache';

// In your API function
const cache = getCache<MyData>('myResource');
const cacheKey = `myResource:${id}`;

// Try cache first
const cached = cache.get(cacheKey);
if (cached) return cached;

// Fetch and cache
const data = await fetchData();
cache.set(cacheKey, data, 5 * 60 * 1000); // 5 min TTL
return data;
```

## Special Features

### AI Chat System
- **Location**: `convex/ai_chat.ts`, `convex/agents.ts`
- **Purpose**: AI-powered chat assistants for user support and automation
- **Integration**: Uses Vercel AI SDK (`ai` package) with Anthropic/OpenAI
- **Features**:
  - Streaming responses via `@convex-dev/persistent-text-streaming`
  - Context-aware conversations
  - Multi-turn dialogue support
  - Agent-based automation

### Kumbara (Piggy Bank/Savings System)
- **Location**:
  - Backend: `convex/kumbara.ts` (implied from API route)
  - Frontend: `src/app/(dashboard)/bagis/kumbara/`
  - API: `src/app/api/kumbara/`
  - Validation: `src/lib/validations/kumbara.ts`
  - Components: `src/components/kumbara/`
- **Purpose**: Track and manage donation savings/piggy banks
- **Features**: Savings tracking, goal management, donation allocation

### Meeting Management
- **Meetings**: Full meeting lifecycle (scheduling, attendees, agenda)
- **Decisions**: Track meeting decisions with `meeting_decisions` collection
- **Action Items**: Follow up tasks from meetings with `meeting_action_items` collection
- **Integration**: Links meetings → decisions → action items → tasks

### Multi-Channel Communication
- **WhatsApp**: Native integration via `whatsapp-web.js`
- **SMS**: Twilio integration
- **Email**: Nodemailer for transactional emails
- **Communication Logs**: All interactions tracked in `communication_logs`
- **Templates**: Email templates in `src/lib/email-templates.ts`

### Financial Management
- **Dashboards**: Dedicated financial dashboard at `/financial-dashboard`
- **Fund Tracking**: Income/expense management at `/fon`
- **Bank Accounts**: `bank_accounts` collection for account management
- **Finance Records**: Detailed transaction records in `finance_records`
- **Reports**: Financial reporting and export capabilities

### Security & Audit
- **Audit Logs**: All user actions tracked in `audit_logs`
- **Security Audit**: Dedicated `security_audit` collection for security events
- **Error Tracking**: Comprehensive error monitoring and logging
- **Performance Monitoring**: Real-time performance metrics at `/performance-monitoring`

## Component Best Practices

### UI Components (`src/components/ui/`)
- Built on Radix UI primitives
- Fully accessible (ARIA compliant)
- Customizable via `class-variance-authority`
- Consistent styling with Tailwind CSS
- Examples: `button.tsx`, `dialog.tsx`, `select.tsx`, `table.tsx`

### Feature Components Organization
```
src/components/
├── ui/                      # Radix UI primitives
├── forms/                   # Reusable form components
├── tables/                  # Data table components
├── layouts/                 # Layout components
├── ai/                      # AI chat components
├── analytics/               # Analytics widgets
├── kumbara/                 # Kumbara-specific components
├── meetings/                # Meeting components
├── messages/                # Messaging components
├── tasks/                   # Task components
├── users/                   # User management components
├── beneficiary-analytics/   # Beneficiary analytics
├── consents/                # Consent management
├── dependents/              # Dependent management
├── documents/               # Document handling
├── errors/                  # Error display components
├── notifications/           # Notification components
├── profile/                 # Profile components
└── scholarships/            # Scholarship components
```

### Shared Component Pattern
```typescript
// Good: Reusable, typed, composable
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({ data, columns, onRowClick }: DataTableProps<T>) {
  // Implementation using TanStack Table
}
```

## Documentation Files

- **`TESTING_GUIDE.md`**: Comprehensive testing documentation
- **`PROJECT_OPTIMIZATION_SUMMARY.md`**: Performance optimizations applied
- **`API_ROUTE_REFACTORING.md`**: API architecture decisions
- **Turkish docs**: `HIZLI_OZET.md`, `GUVENLIK_RAPORU.md`, etc.

## Important Libraries & Utilities

### Core Libraries
- **Convex**: `convex@1.29.1` - Real-time backend and database
- **Next.js**: `next@^16.0.1` - React framework with App Router
- **React**: `react@19.2.0` - UI library (latest version with overrides)
- **TypeScript**: `typescript@^5` - Type safety
- **Zod**: `zod@^4.1.12` - Runtime validation
- **TanStack Query**: `@tanstack/react-query@^5.90.6` - Server state management
- **TanStack Table**: `@tanstack/react-table@^8.21.3` - Data tables
- **React Hook Form**: `react-hook-form@^7.66.0` - Form management
- **Zustand**: `zustand@^5.0.8` - Client state management

### UI & Styling
- **Tailwind CSS**: `tailwindcss@^4` - Utility-first CSS
- **Radix UI**: `@radix-ui/react-*` - Accessible component primitives
- **Lucide React**: `lucide-react@^0.552.0` - Icon library
- **Framer Motion**: `framer-motion@^12.23.24` - Animations
- **Sonner**: `sonner@^2.0.7` - Toast notifications
- **Vaul**: `vaul@^1.1.2` - Drawer component
- **class-variance-authority**: For component variants
- **tailwind-merge**: For class merging
- **clsx**: For conditional classes

### Data & Export
- **date-fns**: `date-fns@^4.1.0` - Date manipulation
- **xlsx**: `xlsx@^0.18.5` - Excel export
- **jspdf**: `jspdf@^3.0.3` - PDF generation
- **jspdf-autotable**: `jspdf-autotable@^5.0.2` - PDF tables
- **recharts**: `recharts@^3.3.0` - Charts and graphs

### Communication & Integration
- **whatsapp-web.js**: `whatsapp-web.js@^1.26.0` - WhatsApp integration
- **twilio**: `twilio@^5.10.4` - SMS service
- **nodemailer**: `nodemailer@^7.0.10` - Email sending
- **qrcode**: `qrcode@^1.5.4` - QR code generation

### AI & Processing
- **ai**: `ai@^5.0.93` - Vercel AI SDK
- **@ai-sdk/anthropic**: `@ai-sdk/anthropic@^2.0.44` - Anthropic integration
- **@ai-sdk/openai**: `@ai-sdk/openai@^2.0.65` - OpenAI integration
- **@convex-dev/persistent-text-streaming**: Streaming text support
- **handlebars**: `handlebars@^4.7.8` - Template engine

### Security & Validation
- **bcryptjs**: `bcryptjs@^3.0.3` - Password hashing
- **isomorphic-dompurify**: `isomorphic-dompurify@^2.31.0` - HTML sanitization

### Monitoring & Analytics
- **@sentry/nextjs**: `@sentry/nextjs@^10.22.0` - Error tracking
- **@vercel/analytics**: `@vercel/analytics@^1.5.0` - Web analytics
- **@vercel/speed-insights**: `@vercel/speed-insights@^1.2.0` - Performance insights

### Utilities (`src/lib/`)
Key utility modules:
- **`logger.ts`**: Centralized logging (use instead of console.log)
- **`api-cache.ts`**: Client-side API caching
- **`persistent-cache.ts`**: Persistent cache with TTL
- **`http-cache.ts`**: HTTP response caching
- **`cache-config.ts`**: Cache configuration
- **`sanitization.ts`**: Input sanitization with DOMPurify
- **`security.ts`**: Security utilities
- **`csrf.ts`**: CSRF token generation and validation
- **`rate-limit.ts`**: Rate limiting implementation
- **`rate-limit-config.ts`**: Rate limit configuration
- **`rate-limit-monitor.ts`**: Rate limit monitoring
- **`error-tracker.ts`**: Error tracking and reporting
- **`errors.ts`**: Centralized error definitions
- **`data-export.ts`**: Data export utilities (Excel, PDF)
- **`email-templates.ts`**: Email template rendering
- **`env-validation.ts`**: Environment variable validation
- **`performance.ts`**: Performance utilities
- **`performance-monitor.tsx`**: Performance monitoring component
- **`global-error-handler.ts`**: Global error handling

### State Management (`src/stores/`)
- **`authStore.ts`**: Authentication state (Zustand)
  - Current user session
  - Login/logout state
  - Permission checks
  - Token management

## Environment Variables

Check for `.env.local` (not in repo). Required variables:
- `CONVEX_DEPLOYMENT` or `NEXT_PUBLIC_CONVEX_URL`: Convex backend URL
- `SENTRY_DSN`: Error tracking
- `NEXT_PUBLIC_SENTRY_DSN`: Client-side error tracking
- Additional variables for WhatsApp, SMS, email services
- AI API keys for Anthropic/OpenAI (if using AI features)

Use `src/lib/env-validation.ts` for runtime validation.

## Debugging & Troubleshooting

### Common Issues

**1. Convex Connection Issues**
- Ensure `CONVEX_DEPLOYMENT` or `NEXT_PUBLIC_CONVEX_URL` is set
- Run `npm run convex:dev` alongside `npm run dev`
- Check Convex dashboard for deployment status

**2. Type Errors**
- Run `npm run typecheck` to catch TypeScript errors
- Ensure `@types/react@^19` matches React 19
- Check path aliases are correct in `tsconfig.json`

**3. Build Errors**
- Clear cache: `npm run clean` or `npm run clean:all`
- On Windows: Standalone output is disabled (see `next.config.ts`)
- Check for console.log usage (ESLint will error)

**4. Authentication Issues**
- Password verification happens in Next.js API routes (bcrypt)
- Session queries in Convex (`getCurrentUser`)
- Check `authStore` for client-side state

**5. Rate Limiting**
- Check rate limit configuration in `rate-limit-config.ts`
- Monitor via `rate-limit-monitor.ts`
- Adjust limits per endpoint as needed

### Development Tips

**Hot Reload Issues**
```bash
# Clear everything and restart
npm run clean:all
npm install
npm run dev
```

**Database Schema Changes**
```bash
# After modifying convex/schema.ts
npm run convex:dev  # Auto-applies schema changes
```

**Testing Locally**
```bash
# Run specific test file
npm run test -- src/__tests__/lib/api-client.test.ts

# Run tests matching pattern
npm run test -- -t "beneficiary"

# Run with UI
npm run test:ui
```

**Performance Profiling**
- Visit `/performance-monitoring` in the app
- Use React DevTools Profiler
- Check Network tab for bundle sizes
- Run `npm run analyze` for bundle analysis

**Console Logging**
- DO NOT use `console.log` in production code
- Import and use `logger` from `src/lib/logger.ts`:
  ```typescript
  import { logger } from '@/lib/logger';
  logger.info('User logged in', { userId });
  logger.error('Failed to save', error);
  ```

### Useful Commands

```bash
# Clean temp files
npm run clean:temp

# Check health endpoint
npm run health:check

# Type check only (no build)
npm run typecheck

# Lint and auto-fix
npm run lint:fix

# Format all files
npm run format

# Run semantic grep
npm run sg "pattern to search"
```

### Quick Reference

**File a Bug**: Create issue at https://github.com/Vadalov/Kafkasder-panel/issues
**Code Review**: All PRs require review before merge
**Commit Messages**: Use conventional commits (feat:, fix:, docs:, etc.)
**Branch Naming**: `feature/`, `fix/`, `refactor/`, `docs/`
