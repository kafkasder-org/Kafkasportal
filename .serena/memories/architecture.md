# Mimari Yapı

## Genel Bakış

**Convex-First Architecture**: Backend öncelikli mimari. Convex ana backend, Next.js API routes sadece proxy görevi görür.

```
Client (React) 
    ↓
Next.js API Routes (Proxy Layer)
    ↓
Convex Backend (Primary)
    ↓
Database + Storage + Real-time
```

## Backend Mimari

### Convex (Primary Backend)

**Lokasyon**: `convex/` klasörü

**Yapı**:
```
convex/
├── _generated/          # Auto-generated types
├── schema.ts            # Database schema (tüm collections)
├── auth.ts              # Authentication functions
├── users.ts             # User queries/mutations
├── beneficiaries.ts     # Beneficiary operations
├── donations.ts         # Donation operations
├── tasks.ts             # Task operations
├── meetings.ts          # Meeting operations
├── partners.ts          # Partner operations
├── aid_applications.ts  # Aid application operations
├── scholarships.ts      # Scholarship operations
├── analytics.ts         # Analytics queries
├── communication.ts     # Communication (WhatsApp, SMS, Email)
├── storage.ts           # File storage operations
├── http.ts              # HTTP endpoints
└── ...
```

**Özellikler**:
- Real-time database subscriptions
- Server-side functions (query, mutation, action)
- Custom authentication (bcrypt)
- File storage
- Full-text search indexes

**Collections**:
- `users` - Kullanıcılar (authentication, roles, permissions)
- `beneficiaries` - Yararlanıcılar
- `donations` - Bağışlar
- `tasks` - Görevler
- `meetings` - Toplantılar
- `meeting_decisions` - Toplantı kararları
- `meeting_action_items` - Eylem maddeleri
- `partners` - Partnerler
- `aid_applications` - Yardım başvuruları
- `scholarships` - Burslar
- `finance_records` - Mali kayıtlar
- `messages` - Mesajlar
- `audit_logs` - Denetim kayıtları
- `analytics` - Analitik veriler
- `communication_logs` - İletişim logları
- `workflow_notifications` - Workflow bildirimleri
- `documents` - Dokümanlar
- `settings` - Ayarlar
- `system_settings` - Sistem ayarları

### Next.js API Routes (Proxy Layer)

**Lokasyon**: `src/app/api/` klasörü

**Yapı**:
```
api/
├── auth/              # Authentication endpoints
├── beneficiaries/     # Beneficiary CRUD
├── donations/         # Donation CRUD
├── tasks/             # Task CRUD
├── meetings/          # Meeting CRUD
├── users/             # User CRUD
├── partners/          # Partner CRUD
├── aid-applications/  # Aid application CRUD
├── messages/          # Message operations
├── communication/     # Communication services
├── analytics/         # Analytics endpoints
├── health/            # Health check
├── csrf/              # CSRF token
├── security/          # Security operations
└── ...
```

**Sorumluluklar**:
1. HTTP routing (GET, POST, PUT, DELETE)
2. Request validation
3. Authentication middleware
4. Rate limiting
5. CSRF protection
6. Request/response transformation
7. Convex function çağrısı

**Pattern**:
```typescript
// src/app/api/[resource]/route.ts
export async function GET(request: Request) {
  // 1. Auth check
  // 2. Parse query params
  // 3. Call Convex query
  // 4. Return response
}
```

## Frontend Mimari

### App Router Structure

**Lokasyon**: `src/app/` klasörü

```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Home page
├── providers.tsx           # Global providers
├── (dashboard)/            # Dashboard layout group
│   ├── layout.tsx          # Dashboard layout (sidebar, header)
│   ├── genel/              # Dashboard home
│   ├── bagis/              # Donations (Türkçe: bağış)
│   │   ├── page.tsx
│   │   └── [id]/
│   ├── yardim/             # Aid applications (Türkçe: yardım)
│   │   ├── basvurular/     # Applications
│   │   └── yararlananlar/  # Beneficiaries
│   ├── burs/               # Scholarships (Türkçe: burs)
│   ├── partner/            # Partners
│   ├── kullanici/          # Users (Türkçe: kullanıcı)
│   ├── is/                 # Tasks (Türkçe: iş)
│   ├── mesaj/              # Messages (Türkçe: mesaj)
│   ├── ayarlar/            # Settings (Türkçe: ayarlar)
│   ├── analitik/           # Analytics (Türkçe: analitik)
│   └── financial-dashboard/
├── login/                  # Login page
└── api/                    # API routes
```

**Routing Konvansiyonu**:
- Route isimleri Türkçe (UI dili Türkçe)
- Kod içinde İngilizce (beneficiaries, donations, users)
- Layout groups: `(dashboard)` - shared layout için

### Component Architecture

**Lokasyon**: `src/components/` klasörü

```
components/
├── ui/                     # Radix UI primitives
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── input.tsx
│   └── ...
├── forms/                  # Form components
│   ├── BeneficiaryForm.tsx
│   ├── DonationForm.tsx
│   ├── TaskForm.tsx
│   └── ...
├── tables/                 # Table components
│   ├── BeneficiaryTable.tsx
│   ├── DonationTable.tsx
│   └── ...
├── layout/                 # Layout components
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ...
└── shared/                 # Shared components
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    └── ...
```

**Component Pattern**:
```typescript
// Server Component (default)
export default function Page() {
  return <div>...</div>;
}

// Client Component (etkileşim varsa)
'use client';
export function InteractiveCard() {
  const [state, setState] = useState();
  return <div>...</div>;
}
```

### State Management

**Server State** (TanStack Query):
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Query
const { data, isLoading } = useQuery({
  queryKey: ['beneficiaries'],
  queryFn: () => beneficiaries.list(),
});

// Mutation
const mutation = useMutation({
  mutationFn: beneficiaries.create,
  onSuccess: () => {
    queryClient.invalidateQueries(['beneficiaries']);
  },
});
```

**Client State** (Zustand):
```typescript
// src/stores/auth-store.ts
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

**Form State** (React Hook Form):
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues,
});
```

### Custom Hooks

**Lokasyon**: `src/hooks/` klasörü

**Ana Hook'lar**:
```typescript
// Standard form pattern
useStandardForm({
  schema,
  mutationFn,
  defaultValues,
  onSuccess,
  resetOnSuccess,
});

// API mutation
useFormMutation({
  mutationFn,
  onSuccess,
  onError,
});

// Data export
useExport({
  data,
  format: 'excel' | 'pdf',
  filename,
});

// Financial data
useFinancialData({
  startDate,
  endDate,
  category,
});
```

## API Client Architecture

**Lokasyon**: `src/lib/api/` klasörü

### CRUD Factory Pattern

```typescript
// crud-factory.ts
export function createApiClient<T>(resource: string) {
  return {
    list: (params?: QueryParams) => 
      apiRequest(`/api/${resource}`, { params }),
    
    get: (id: string) => 
      apiRequest(`/api/${resource}/${id}`),
    
    create: (data: CreateInput<T>) => 
      apiRequest(`/api/${resource}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: UpdateInput<T>) => 
      apiRequest(`/api/${resource}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) => 
      apiRequest(`/api/${resource}/${id}`, {
        method: 'DELETE',
      }),
  };
}

// Usage
export const beneficiaries = createApiClient<Beneficiary>('beneficiaries');
export const donations = createApiClient<Donation>('donations');
```

### Type Safety

**Lokasyon**: `src/types/` ve `src/lib/api/types.ts`

```typescript
// Database document types
export interface BeneficiaryDocument {
  _id: Id<'beneficiaries'>;
  name: string;
  // ...
}

// Create/Update input types
export interface BeneficiaryCreateInput {
  name: string;
  // ...
}

export interface BeneficiaryUpdateInput {
  name?: string;
  // ... (partial)
}
```

## Data Flow

### Okuma (Read) Flow
```
Component
  → useQuery (TanStack Query)
    → API Client (beneficiaries.list())
      → Next.js API Route (/api/beneficiaries)
        → Convex Query (beneficiaries.list)
          → Database
            ← Data
          ← Results
        ← Response
      ← Cached/Fresh Data
    ← React State Update
  ← Re-render
```

### Yazma (Write) Flow
```
Component (Form Submit)
  → useMutation (TanStack Query)
    → API Client (beneficiaries.create())
      → Next.js API Route (POST /api/beneficiaries)
        → Convex Mutation (beneficiaries.create)
          → Database Insert
            ← New Document
          ← Success
        ← Response
      ← Success Callback
    → Query Invalidation
    ← Refetch
  ← UI Update
```

## Caching Strategy

### Client-Side
- **TanStack Query**: 5 dakika stale time, background refetch
- **API Cache**: `src/lib/api-cache.ts` - In-memory cache
- **Browser Cache**: Static assets 1 yıl

### Server-Side
- **Convex**: Real-time subscriptions, automatic cache invalidation
- **Next.js**: ISR (Incremental Static Regeneration) kullanılmıyor
- **CDN**: Vercel Edge Network

## Security Layers

1. **Authentication**: Custom Convex auth (bcrypt)
2. **Authorization**: Role-based + permission-based
3. **CSRF Protection**: Token validation
4. **Rate Limiting**: Per-endpoint limits
5. **Input Sanitization**: DOMPurify
6. **CSP Headers**: Strict Content Security Policy
7. **Audit Logging**: All mutations logged

## Performance Optimizations

1. **Bundle Splitting**: Framework, vendors, components ayrı chunks
2. **Code Splitting**: Dynamic imports, lazy loading
3. **Image Optimization**: AVIF/WebP, responsive sizes
4. **Tree Shaking**: Package import optimization (20+ packages)
5. **CSS Optimization**: Critical CSS extraction
6. **API Caching**: Client-side + server-side
7. **Compression**: Gzip/Brotli
8. **CDN**: Static assets Vercel Edge'de

## Development vs Production

### Development
- HMR (Hot Module Replacement)
- Source maps
- Verbose logging
- No minification
- Loose CSP (eval allowed for HMR)

### Production
- Minified bundles
- No source maps (security)
- Logger only (no console.log)
- Aggressive caching
- Strict CSP
- Sentry error tracking
- Bundle size < 250KB per chunk
