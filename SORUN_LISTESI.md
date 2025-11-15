# 🚨 Kafkasder Panel - Detaylı Sorun ve İyileştirme Listesi

## 📑 İçindekiler

- [Uyumsuz Kodlar](#uyumsuz-kodlar)
- [Gereksiz Kodlar](#gereksiz-kodlar)
- [Fazla Uzun Kodlar](#fazla-uzun-kodlar)
- [Performans Sorunları](#performans-sorunları)
- [Güvenlik Açıkları](#güvenlik-açıkları)

---

## 🔴 UYUMSUZ KODLAR

### 1. İsimlendirme Tutarsızlıkları

#### 1.1 Snake_case vs CamelCase Karmaşası

**Konum:** Proje geneli
**Sorun:**

```typescript
// Convex schema'da snake_case
beneficiaries: defineTable({
  tc_no: v.string(),
  birth_date: v.string(),
  created_at: v.string(),
});

// TypeScript kodda bazen camelCase
interface BeneficiaryData {
  tcNo: string;
  birthDate: string;
  createdAt: string;
}

// Bazen snake_case
interface BeneficiaryData {
  tc_no: string;
  birth_date: string;
  created_at: string;
}
```

**İyileştirme:**

```typescript
// ✅ Standard:
// - DB/Schema: snake_case
// - TypeScript: camelCase
// - Constants/Enums: SCREAMING_SNAKE_CASE veya PascalCase

// DB Schema
{ tc_no: string, created_at: string }

// TypeScript Interface
interface Beneficiary {
  tcNo: string;
  createdAt: Date;
}

// Enum
enum BeneficiaryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}
```

**Etkilenen Dosyalar:** ~200+ dosya

---

#### 1.2 Enum Değer Tutarsızlığı

**Konum:** `src/types/beneficiary.ts`, schema, forms
**Sorun:**

```typescript
// Schema'da literal values
category: v.union(
  v.literal('need_based_family'),
  v.literal('refugee_family'),
  v.literal('orphan_family')
);

// Types'da farklı format
export enum BeneficiaryCategory {
  YETIM_AILESI = 'YETIM_AILESI',
  MULTECI_AILE = 'MULTECI_AILE',
  IHTIYAC_SAHIBI_AILE = 'IHTIYAC_SAHIBI_AILE',
}
```

**İyileştirme:**

```typescript
// ✅ Tek standard belirlenmeli
export enum BeneficiaryCategory {
  ORPHAN_FAMILY = 'orphan_family',
  REFUGEE_FAMILY = 'refugee_family',
  NEED_BASED_FAMILY = 'need_based_family',
}

// veya Türkçe tutulacaksa:
export enum BeneficiaryCategory {
  YETIM_AILESI = 'yetim_ailesi',
  MULTECI_AILE = 'multeci_aile',
  IHTIYAC_SAHIBI_AILE = 'ihtiyac_sahibi_aile',
}
```

---

### 2. API Pattern Tutarsızlıkları

#### 2.1 Error Handling Inconsistency

**Konum:** `src/app/api/**/route.ts` (53 dosya)
**Sorun:**

```typescript
// Route 1: try-catch + Response.json
export async function GET() {
  try {
    const data = await fetch();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}

// Route 2: NextResponse
export async function POST() {
  try {
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

// Route 3: try-catch yok
export async function DELETE() {
  const data = await delete(); // ❌ Error handling yok
  return Response.json(data);
}
```

**İyileştirme:**

```typescript
// ✅ lib/api/route-helpers.ts kullan (zaten var!)
import { withAuth, withErrorHandling } from '@/lib/api/route-helpers';

export const GET = withAuth(
  withErrorHandling(async (request, { session }) => {
    const data = await fetchData();
    return Response.json(data);
  })
);
```

**Etkilenen Dosyalar:** 53 API route dosyası

---

#### 2.2 Authentication Check Tutarsızlığı

**Konum:** API routes
**Sorun:**

```typescript
// Bazı route'larda:
const session = await getSession();
if (!session) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

// Bazı route'larda:
const user = await getCurrentUser();
if (!user) throw new Error('Not authenticated');

// Bazı route'larda:
// ❌ Hiç check yok
```

**İyileştirme:**

```typescript
// ✅ Middleware veya HOC kullan
export const GET = withAuth(async (request, context) => {
  // context.session otomatik var
});
```

---

### 3. State Management Tutarsızlıkları

#### 3.1 Form State Patterns

**Konum:** `src/components/forms/`
**Sorun:**

```typescript
// Form 1: React Hook Form
const { register, handleSubmit } = useForm();

// Form 2: useState + manual
const [name, setName] = useState('');
const [errors, setErrors] = useState({});

// Form 3: Karışık
const form = useForm();
const [customField, setCustomField] = useState('');
```

**İyileştirme:**

```typescript
// ✅ Tek pattern: React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: initialData,
});
```

---

### 4. Import/Export Tutarsızlıkları

#### 4.1 Default vs Named Exports

**Konum:** Proje geneli
**Sorun:**

```typescript
// Bazı dosyalarda default export
export default function Component() {}

// Bazı dosyalarda named export
export function Component() {}

// Karışık kullanım
export { Component as default };
```

**İyileştirme:**

```typescript
// ✅ Standard belirlenmeli:
// - React Components: named export (tree-shaking için)
// - Pages: default export (Next.js requirement)
// - Utilities: named export

// Component
export function Button() {} // ✅

// Page
export default function HomePage() {} // ✅

// Utility
export const formatDate = () => {}; // ✅
```

---

## 🗑️ GEREKSIZ KODLAR

### 1. Kullanılmayan Imports

**Konum:** Proje geneli (~100+ dosya)
**Örnek:**

```typescript
// ❌ 20 import, sadece 5'i kullanılıyor
import {
  User,
  Settings,
  Home,
  Plus,
  Minus,
  Check,
  X,
  AlertCircle,
  Info,
  ChevronRight,
  // ... 10 tane daha
} from 'lucide-react';

// Sadece bunlar kullanılıyor:
<User />
<Settings />
<Home />
```

**İyileştirme:**

```bash
# ESLint ile otomatik tespit
npm run lint -- --fix

# VSCode extension: "Unused imports"
```

**Etkilenen Dosyalar:** ~100 dosya  
**Potansiyel Bundle Size Kazancı:** ~50-100KB

---

### 2. Dead Code (Hiç Kullanılmayan Fonksiyonlar)

#### 2.1 Old Implementations

**Konum:** Çeşitli lib/ dosyaları
**Örnek:**

```typescript
// ❌ Eski implementasyon, hiç çağrılmıyor
function oldFetchBeneficiaries() {
  // ... 50 satır eski kod
}

// Yeni implementasyon kullanılıyor
function fetchBeneficiaries() {
  // ... yeni kod
}
```

**İyileştirme:** Sil veya archive'a taşı

---

#### 2.2 Commented Out Code

**Konum:** Proje geneli
**Örnek:**

```typescript
// ❌ Yorum satırı kod blokları
// function handleOldClick() {
//   console.log('old implementation');
//   // ... 30 satır yorum kod
// }

// ❌ Debug console.log'lar
// console.log('Debug: user data', userData);
// console.log('State:', state);
```

**İyileştirme:** Tamamen sil (Git history'de kalır)

---

### 3. Duplicate Utilities

#### 3.1 Format Functions

**Konum:** Multiple locations
**Sorun:**

```typescript
// lib/utils/format.ts
export function formatDate(date: Date) {
  /* ... */
}

// lib/utils.ts
export function formatDate(date: Date) {
  /* ... */
}

// components/helpers/date.ts
export function formatDate(date: Date) {
  /* ... */
}
```

**İyileştirme:**

```typescript
// ✅ Tek lokasyon
// lib/utils/format.ts
export function formatDate(date: Date) {
  /* ... */
}

// Diğer yerlerden import et
import { formatDate } from '@/lib/utils/format';
```

---

#### 3.2 Duplicate Type Definitions

**Konum:** types/ ve component files
**Sorun:**

```typescript
// types/user.ts
interface User {
  id: string;
  name: string;
  email: string;
}

// components/UserCard.tsx
interface User {
  id: string;
  name: string;
  email: string;
}
```

**İyileştirme:** Central type definitions kullan

---

### 4. Unused Dependencies

**Konum:** package.json
**Potansiyel Gereksiz:**

```json
{
  "critters": "^0.0.25", // ❓ Kullanılıyor mu?
  "immer": "^10.2.0", // ❓ Zustand ile gerekli mi?
  "isomorphic-dompurify": "^2.31.0" // ❓ Başka sanitizer var
}
```

**Kontrol:**

```bash
npx depcheck
npm run analyze
```

---

## 📏 FAZLA UZUN KODLAR

### 1. Mega Files (>1000 satır)

#### 1.1 Biggest Offenders

**Liste:**

```
1. yardim/ihtiyac-sahipleri/[id]/page.tsx  - 2,155 satır ⚠️⚠️⚠️
2. forms/AdvancedBeneficiaryForm.tsx       - 932 satır  ⚠️⚠️
3. kumbara/KumbaraForm.tsx                 - 815 satır  ⚠️
4. fon/gelir-gider/page.tsx                - 798 satır  ⚠️
5. mesaj/toplu/page.tsx                    - 792 satır  ⚠️
6. is/toplantilar/page.tsx                 - 785 satır
7. genel/page.tsx                          - 749 satır
8. lib/api/convex-api-client.ts            - 746 satır
9. settings/page.tsx                       - 726 satır
10. profile/profile-management.tsx         - 720 satır
```

**Hedef:** Her dosya maksimum 300-400 satır

---

#### 1.2 Refactoring Planı: En Büyük Dosya

**Dosya:** `yardim/ihtiyac-sahipleri/[id]/page.tsx` (2,155 satır)

**Mevcut Yapı:**

```typescript
// 2,155 satır tek dosyada:
// - 50 satır import
// - 200 satır state management
// - 300 satır form handling
// - 400 satır UI components
// - 500 satır modal/dialog logic
// - 400 satır data fetching
// - 305 satır misc
```

**Yeni Yapı:**

```
beneficiaries/[id]/
├── page.tsx (150 satır)
│   └── Sadece layout ve orchestration
│
├── components/
│   ├── BeneficiaryHeader.tsx (100 satır)
│   ├── BeneficiaryTabs.tsx (80 satır)
│   ├── PersonalInfoTab.tsx (150 satır)
│   ├── DocumentsTab.tsx (120 satır)
│   ├── DependentsTab.tsx (140 satır)
│   ├── AidHistoryTab.tsx (130 satır)
│   ├── BankAccountsTab.tsx (100 satır)
│   ├── ConsentsTab.tsx (90 satır)
│   └── ActionsToolbar.tsx (80 satır)
│
├── hooks/
│   ├── useBeneficiaryData.ts (100 satır)
│   ├── useBeneficiaryMutations.ts (120 satır)
│   └── useBeneficiaryValidation.ts (80 satır)
│
└── lib/
    ├── beneficiary-utils.ts (100 satır)
    └── beneficiary-constants.ts (50 satır)
```

**Sonuç:** 2,155 → ~1,490 satır (13 dosya, ortalama 115 satır/dosya)

---

### 2. God Functions (>100 satır)

#### 2.1 handleSubmit Functions

**Konum:** Forms
**Örnek:**

```typescript
// ❌ 200 satır tek fonksiyon
async function handleSubmit(data: FormData) {
  // Validation - 30 satır
  // Sanitization - 20 satır
  // Data transformation - 40 satır
  // API call - 20 satır
  // Error handling - 30 satır
  // Success handling - 30 satır
  // State updates - 20 satır
  // Side effects - 10 satır
}
```

**İyileştirme:**

```typescript
// ✅ Alt-fonksiyonlara böl
async function handleSubmit(data: FormData) {
  const validated = await validateData(data);
  const sanitized = sanitizeData(validated);
  const transformed = transformData(sanitized);

  try {
    const result = await saveData(transformed);
    handleSuccess(result);
  } catch (error) {
    handleError(error);
  }
}

// Her fonksiyon 20-30 satır
```

---

### 3. Nested Complexity (>5 Level)

#### 3.1 Nested Ternaries

**Konum:** Components, utils
**Örnek:**

```typescript
// ❌ 7 level nested
const status = isActive
  ? hasPermission
    ? isVerified
      ? isComplete
        ? 'active-complete'
        : 'active-incomplete'
      : 'active-unverified'
    : 'active-no-permission'
  : 'inactive';
```

**İyileştirme:**

```typescript
// ✅ Early return pattern
function getStatus() {
  if (!isActive) return 'inactive';
  if (!hasPermission) return 'active-no-permission';
  if (!isVerified) return 'active-unverified';
  if (!isComplete) return 'active-incomplete';
  return 'active-complete';
}

const status = getStatus();
```

---

#### 3.2 Nested Callbacks

**Konum:** Async operations
**Örnek:**

```typescript
// ❌ Callback hell
fetchUser(id, (user) => {
  fetchProfile(user.id, (profile) => {
    fetchSettings(profile.id, (settings) => {
      updateUI(settings);
    });
  });
});
```

**İyileştirme:**

```typescript
// ✅ Async/await
const user = await fetchUser(id);
const profile = await fetchProfile(user.id);
const settings = await fetchSettings(profile.id);
updateUI(settings);
```

---

### 4. Copy-Paste Code

#### 4.1 Similar Components

**Konum:** components/forms/
**Örnek:**

```typescript
// ❌ 5 benzer form component, sadece field'lar farklı
// DonationForm.tsx - 400 satır
// BeneficiaryForm.tsx - 450 satır
// ScholarshipForm.tsx - 420 satır
// PartnerForm.tsx - 380 satır
// TaskForm.tsx - 350 satır

// Her biri aynı pattern:
// - useForm setup
// - validation
// - submit handler
// - error display
// - loading state
```

**İyileştirme:**

```typescript
// ✅ Generic form wrapper
function GenericForm<T>({
  schema,
  onSubmit,
  renderFields
}: GenericFormProps<T>) {
  const form = useForm({ resolver: zodResolver(schema) });
  // ... common logic

  return <form>{renderFields(form)}</form>;
}

// Usage
<GenericForm
  schema={donationSchema}
  onSubmit={handleDonationSubmit}
  renderFields={(form) => <DonationFields form={form} />}
/>
```

---

## ⚡ PERFORMANS SORUNLARI

### 1. Over-Fetching

**Konum:** API calls, queries
**Sorun:**

```typescript
// ❌ Tüm beneficiary data çekiliyor (60+ field)
const { data: beneficiaries } = useQuery(['beneficiaries'], () => api.beneficiaries.list());

// Sadece name ve tc_no kullanılıyor
```

**İyileştirme:**

```typescript
// ✅ Sadece gerekli field'ları çek
const { data: beneficiaries } = useQuery(['beneficiaries-list'], () =>
  api.beneficiaries.list({
    select: ['name', 'tc_no', 'status'],
  })
);
```

---

### 2. No Pagination

**Konum:** List queries
**Sorun:**

```typescript
// ❌ Limit yok, tüm kayıtları çekiyor
const items = await ctx.db.query('beneficiaries').collect(); // 10,000+ kayıt olabilir!
```

**İyileştirme:**

```typescript
// ✅ Pagination
const items = await ctx.db.query('beneficiaries').paginate(args.paginationOpts); // ✅

// veya
const items = await ctx.db.query('beneficiaries').order('desc').take(20); // ✅ İlk 20 kayıt
```

---

### 3. Missing Memoization

**Konum:** Components
**Sorun:**

```typescript
// ❌ Her render'da hesaplanıyor
function Component({ data }) {
  const processedData = expensiveCalculation(data); // ❌
  const sortedData = data.sort((a, b) => a.date - b.date); // ❌

  return <div>{processedData.map(...)}</div>;
}
```

**İyileştirme:**

```typescript
// ✅ useMemo kullan
function Component({ data }) {
  const processedData = useMemo(
    () => expensiveCalculation(data),
    [data]
  );

  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.date - b.date),
    [data]
  );

  return <div>{processedData.map(...)}</div>;
}
```

---

### 4. Large Bundle Size

**Mevcut Durum:**

```
Next.js Bundle Analysis:
├── Main bundle: ~850 KB
├── Vendor bundle: ~1.2 MB
├── Page bundles: 200-500 KB each
└── Total: ~3-4 MB

⚠️ Too large for initial load!
```

**İyileştirmeler:**

```typescript
// 1. Dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
});

// 2. Tree-shaking
// ❌ Tüm kütüphane import ediliyor
import _ from 'lodash';

// ✅ Sadece kullanılan fonksiyon
import debounce from 'lodash/debounce';

// 3. Code splitting
// ❌ Tek route bundle'ında
import { AllCharts } from 'recharts';

// ✅ Lazy load
const PieChart = lazy(() => import('recharts').then(m => ({ default: m.PieChart })));
```

---

## 🔒 GÜVENLİK SORUNLARI

### 1. Sensitive Data Logging

**Konum:** Console statements
**Sorun:**

```typescript
// ❌ Hassas veri console'a yazılıyor
console.log('User password:', password); // ❌❌❌
console.log('API key:', apiKey); // ❌
console.log('User data:', user); // email, phone exposed
```

**İyileştirme:**

```typescript
// ✅ Logger + sanitization
logger.info('User login', {
  userId: user.id, // ✅ ID only
  timestamp: new Date(),
});

// Hassas alanları redact et
const sanitizedUser = {
  ...user,
  password: '[REDACTED]',
  email: maskEmail(user.email),
};
logger.debug('User data', sanitizedUser);
```

---

### 2. Missing Input Validation

**Konum:** API routes
**Sorun:**

```typescript
// ❌ Validation yok
export async function POST(request: Request) {
  const body = await request.json();
  // Direkt kullanılıyor, XSS/injection riski
  await db.insert(body);
}
```

**İyileştirme:**

```typescript
// ✅ Zod validation
const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  tc_no: z.string().regex(/^\d{11}$/),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validated = schema.parse(body); // ✅ Throws if invalid
  await db.insert(validated);
}
```

---

### 3. No Rate Limiting (Bazı Endpoints)

**Konum:** Public API routes
**Sorun:**

```typescript
// ❌ Rate limit yok
export async function POST(request: Request) {
  // DDoS riski, brute force açık
  await processLogin(credentials);
}
```

**İyileştirme:**

```typescript
// ✅ Rate limiting middleware (zaten var, ama her yerde kullanılmıyor!)
import { withRateLimit } from '@/lib/rate-limit';

export const POST = withRateLimit(
  async (request: Request) => {
    await processLogin(credentials);
  },
  { maxRequests: 5, windowMs: 60000 } // 5 req/min
);
```

---

### 4. Insufficient Error Messages

**Konum:** API responses
**Sorun:**

```typescript
// ❌ Çok detaylı error
return Response.json(
  {
    error: 'Database query failed: SELECT * FROM users WHERE password = ...',
    stack: error.stack, // ❌ Stack trace expose
  },
  { status: 500 }
);
```

**İyileştirme:**

```typescript
// ✅ Generic message
logger.error('DB query failed', { error, userId });

return Response.json(
  {
    error: 'An internal error occurred',
    code: 'DB_ERROR',
  },
  { status: 500 }
);
```

---

## 📋 ÖNCELIK SIRALI EYLEM PLANI

### Sprint 1: Kritik Sorunlar (1 Hafta)

**Gün 1-2: Type Safety**

- [ ] `lib/convex/api.ts` - 40 'any' → proper types
- [ ] `lib/errors.ts` - Error type hierarchy
- [ ] ESLint strict rules aç

**Gün 3-4: Console Cleanup**

- [ ] Find-replace script: console.log → logger
- [ ] Tüm files review
- [ ] CI/CD check ekle

**Gün 5: Büyük Dosya #1**

- [ ] `page.tsx` (2,155 satır) refactor başlat
- [ ] Components çıkar
- [ ] Hooks oluştur

### Sprint 2: Orta Sorunlar (2 Hafta)

**Hafta 1:**

- [ ] Büyük dosyaları refactor et (3 dosya)
- [ ] Duplicate code consolidate
- [ ] API pattern standardize

**Hafta 2:**

- [ ] Test coverage %30'a çıkar
- [ ] Schema refactor başlat
- [ ] Performance optimizations

### Sprint 3: İyileştirmeler (1 Ay)

- [ ] Test coverage %70+
- [ ] Documentation complete
- [ ] Security audit
- [ ] Performance tuning

---

**Toplam Tahmini Süre:** 6-8 hafta full-time work
**Kritik Path:** Type safety → Console cleanup → Refactoring
