# Codebase Yapısı

## Üst Seviye Klasör Organizasyonu

```
kafkasder-panel-1/
├── convex/                 # Convex backend (primary backend)
├── src/                    # Frontend source code
├── e2e/                    # Playwright E2E tests
├── weweb-custom/           # WeWeb custom integrations
├── .github/                # GitHub workflows
├── .husky/                 # Git hooks
├── .serena/                # Serena AI memory files
├── node_modules/
└── [config files]
```

## Convex Backend (`convex/`)

```
convex/
├── _generated/             # Auto-generated types (DO NOT EDIT)
│   ├── api.ts
│   ├── dataModel.ts
│   └── server.ts
├── schema.ts               # ⭐ Database schema (single source of truth)
├── convex.config.ts        # Convex configuration
├── tsconfig.json           # TypeScript config for Convex
│
├── auth.ts                 # Authentication functions
├── users.ts                # User operations
├── beneficiaries.ts        # Beneficiary operations
├── donations.ts            # Donation operations
├── tasks.ts                # Task operations
├── meetings.ts             # Meeting operations
├── meeting_decisions.ts    # Meeting decision operations
├── meeting_action_items.ts # Meeting action item operations
├── partners.ts             # Partner operations
├── aid_applications.ts     # Aid application operations
├── scholarships.ts         # Scholarship operations
├── finance_records.ts      # Finance record operations
├── messages.ts             # Message operations
├── communication.ts        # Communication (WhatsApp, SMS, Email)
├── communication_logs.ts   # Communication log operations
├── workflow_notifications.ts # Workflow notification operations
├── analytics.ts            # Analytics queries
├── audit_logs.ts           # Audit log operations
├── documents.ts            # Document operations
├── storage.ts              # File storage operations
├── settings.ts             # Settings operations
├── system_settings.ts      # System settings operations
├── security.ts             # Security operations
├── security_audit.ts       # Security audit operations
├── monitoring.ts           # Monitoring operations
├── errors.ts               # Error handling
├── http.ts                 # HTTP endpoints
├── seed.ts                 # Database seeding
└── seedThemes.ts           # Theme seeding
```

## Frontend Source (`src/`)

```
src/
├── app/                    # Next.js 16 App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── providers.tsx       # Global providers (Convex, React Query)
│   ├── globals.css         # Global styles
│   ├── error.tsx           # Error boundary
│   ├── global-error.tsx    # Global error boundary
│   │
│   ├── (dashboard)/        # Dashboard layout group
│   │   ├── layout.tsx      # Dashboard layout (sidebar, header)
│   │   ├── genel/          # Dashboard home
│   │   ├── bagis/          # Donations
│   │   ├── yardim/         # Aid & Beneficiaries
│   │   │   ├── basvurular/     # Aid applications
│   │   │   └── yararlananlar/  # Beneficiaries
│   │   ├── burs/           # Scholarships
│   │   ├── partner/        # Partners
│   │   ├── kullanici/      # Users
│   │   ├── is/             # Tasks
│   │   ├── mesaj/          # Messages
│   │   ├── ayarlar/        # Settings
│   │   ├── analitik/       # Analytics
│   │   ├── financial-dashboard/
│   │   ├── denetim-kayitlari/  # Audit logs
│   │   ├── performance-monitoring/
│   │   └── errors/         # Error pages
│   │
│   ├── login/              # Login page
│   │   └── page.tsx
│   │
│   └── api/                # Next.js API routes (Convex proxy)
│       ├── auth/           # Authentication
│       ├── beneficiaries/  # Beneficiary CRUD
│       ├── donations/      # Donation CRUD
│       ├── tasks/          # Task CRUD
│       ├── meetings/       # Meeting CRUD
│       ├── meeting-decisions/
│       ├── meeting-action-items/
│       ├── users/          # User CRUD
│       ├── partners/       # Partner CRUD
│       ├── aid-applications/
│       ├── messages/       # Message operations
│       ├── communication/  # Communication services
│       ├── communication-logs/
│       ├── workflow-notifications/
│       ├── analytics/      # Analytics endpoints
│       ├── audit-logs/     # Audit log endpoints
│       ├── branding/       # Branding operations
│       ├── csrf/           # CSRF token
│       ├── errors/         # Error reporting
│       ├── health/         # Health check
│       ├── kumbara/        # Piggy bank feature
│       ├── monitoring/     # Monitoring endpoints
│       ├── security/       # Security operations
│       ├── settings/       # Settings operations
│       ├── storage/        # File storage
│       ├── system_alerts/  # System alerts
│       ├── upload/         # File upload
│       ├── webhooks/       # Webhook handlers
│       └── whatsapp/       # WhatsApp integration
│
├── components/             # React components
│   ├── ui/                 # UI primitives (Radix UI)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── forms/              # Form components
│   ├── tables/             # Table components
│   ├── layout/             # Layout components
│   └── shared/             # Shared components
│
├── hooks/                  # Custom React hooks
│   ├── useStandardForm.ts  # Standard form hook
│   ├── useFormMutation.ts  # Mutation hook
│   ├── useApiCache.ts      # API caching
│   ├── useExport.ts        # Data export
│   ├── useFinancialData.ts # Financial data
│   ├── useDeviceDetection.ts
│   ├── useInfiniteScroll.ts
│   └── useBeneficiaryForm.ts
│
├── lib/                    # Utility libraries
│   ├── api/                # API client
│   │   ├── convex-api-client.ts  # Main API client
│   │   ├── crud-factory.ts       # ⭐ CRUD factory (DRY)
│   │   ├── types.ts              # API types
│   │   ├── route-helpers.ts      # API route helpers
│   │   ├── middleware.ts         # API middleware
│   │   ├── auth-utils.ts         # Auth utilities
│   │   ├── query-cache.ts        # Query cache
│   │   ├── scholarships.ts       # Scholarship API
│   │   └── settings.ts           # Settings API
│   │
│   ├── auth/               # Authentication
│   ├── constants/          # Constants
│   ├── convex/             # Convex utilities
│   ├── errors/             # Error handling
│   ├── export/             # Export utilities (PDF, Excel)
│   ├── financial/          # Financial utilities
│   ├── meetings/           # Meeting utilities
│   ├── messages/           # Message utilities
│   ├── performance/        # Performance monitoring
│   ├── security/           # Security utilities
│   ├── services/           # External services
│   ├── utils/              # General utilities
│   ├── validation/         # Validation utilities
│   ├── validations/        # Validation schemas (Zod)
│   │
│   ├── animations.ts       # Animation configs
│   ├── api-cache.ts        # API cache implementation
│   ├── cache-config.ts     # Cache configuration
│   ├── csrf.ts             # CSRF utilities
│   ├── data-export.ts      # Data export utilities
│   ├── email-templates.ts  # Email templates
│   ├── env-validation.ts   # Environment validation
│   ├── error-notifications.ts
│   ├── error-tracker.ts    # Error tracking (Sentry)
│   ├── errors.ts           # Error definitions
│   ├── global-error-handler.ts
│   ├── http-cache.ts       # HTTP cache
│   ├── logger.ts           # ⭐ Logger (console.log yerine)
│   ├── performance.ts      # Performance utilities
│   ├── performance-monitor.tsx
│   ├── persistent-cache.ts # Persistent cache
│   ├── rate-limit.ts       # Rate limiting
│   ├── rate-limit-config.ts
│   ├── rate-limit-monitor.ts
│   ├── sanitization.ts     # Input sanitization
│   ├── security.ts         # Security utilities
│   └── utils.ts            # General utilities (cn, etc.)
│
├── stores/                 # Zustand stores
│   ├── auth-store.ts
│   └── ...
│
├── types/                  # TypeScript type definitions
│   ├── database.ts         # Database types
│   ├── permissions.ts      # Permission types
│   └── ...
│
├── contexts/               # React contexts
│
├── config/                 # Configuration files
│
├── styles/                 # Global styles
│
├── __tests__/              # Unit & integration tests
│   ├── setup.ts            # Test setup
│   ├── mocks/              # Test mocks
│   │   └── convex-api.ts   # Convex API mock
│   ├── hooks/              # Hook tests
│   │   └── useStandardForm.test.ts
│   ├── lib/
│   │   ├── api/
│   │   │   └── types.test.ts
│   │   └── validations/
│   │       └── forms.test.ts
│   └── integration/
│       └── api-client.test.ts
│
└── proxy.ts                # Proxy configuration
```

## E2E Tests (`e2e/`)

```
e2e/
├── auth.spec.ts
├── beneficiaries.spec.ts
├── donations.spec.ts
├── meetings.spec.ts
└── ...
```

## Root Seviye Config Dosyaları

```
├── package.json            # Dependencies & scripts
├── package-lock.json
├── tsconfig.json           # TypeScript config
├── next.config.ts          # Next.js config (security, perf)
├── tailwind.config.js      # Tailwind CSS v4 config
├── postcss.config.mjs      # PostCSS config
├── eslint.config.mjs       # ESLint config
├── .prettierrc.json        # Prettier config
├── .prettierignore
├── vitest.config.ts        # Vitest config
├── playwright.config.cts   # Playwright config
├── components.json         # shadcn/ui config
├── .nvmrc                  # Node version
├── .npmrc                  # npm config
├── .gitignore
├── vercel.json             # Vercel deployment config
├── nixpacks.toml           # Nixpacks config
├── sentry.client.config.ts # Sentry client config
├── sentry.server.config.ts # Sentry server config
└── middleware.ts.backup    # Backup middleware
```

## Dokümantasyon Dosyaları

```
├── README.md               # (Yok - olmadığını fark ettim)
├── CLAUDE.md               # ⭐ Claude Code için rehber
├── TESTING_GUIDE.md        # Test dokümantasyonu
├── PROJECT_OPTIMIZATION_SUMMARY.md
├── API_ROUTE_REFACTORING.md
├── OPTIMIZATION_RUNBOOK.md
├── LICENSE
│
├── HIZLI_OZET.md           # Türkçe - Hızlı özet
├── GUVENLIK_RAPORU.md      # Türkçe - Güvenlik raporu
├── PROJE_ANALIZ_RAPORU.md  # Türkçe - Proje analizi
├── SAYFA_TARAMA_RAPORU.md  # Türkçe - Sayfa tarama
├── SETUP_SISTEM_AYARLARI.md # Türkçe - Setup
├── SORUN_LISTESI.md        # Türkçe - Sorun listesi
└── TESPIT_EDILEN_HATALAR.md # Türkçe - Hatalar
```

## Önemli Dosyalar Özeti

### Mutlaka Bilmesi Gerekenler
1. **`convex/schema.ts`** - Tüm database schema'sı
2. **`src/lib/api/crud-factory.ts`** - API client pattern
3. **`src/lib/logger.ts`** - Logging (console.log yasak!)
4. **`src/app/providers.tsx`** - Global providers
5. **`next.config.ts`** - Security & performance config
6. **`eslint.config.mjs`** - Linting rules (Convex plugin)
7. **`tsconfig.json`** - Path aliases (@/ mappings)

### Yeni Özellik Eklerken İlgili Dosyalar
1. `convex/schema.ts` - Schema tanımı
2. `convex/[resource].ts` - Convex functions
3. `src/app/api/[resource]/route.ts` - API route
4. `src/lib/api/crud-factory.ts` - API client
5. `src/types/database.ts` - Type definitions
6. `src/lib/validations/forms.ts` - Validation schemas
7. `src/app/(dashboard)/[route]/page.tsx` - UI page
8. `src/__tests__/` - Tests

## Path Alias Özeti

```typescript
@/*              → src/*
@/components/*   → src/components/*
@/lib/*          → src/lib/*
@/hooks/*        → src/hooks/*
@/stores/*       → src/stores/*
@/types/*        → src/types/*
@/convex/*       → convex/*
```

## Klasör Adlandırma Konvansiyonu

- **Convex**: snake_case (meeting_decisions.ts)
- **Components**: PascalCase (UserCard.tsx)
- **Hooks**: camelCase (useAuth.ts)
- **Routes**: kebab-case veya Türkçe (bagis/, yardim/)
- **Utils**: kebab-case (format-date.ts)
