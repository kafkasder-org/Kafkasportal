# CLAUDE.md

AI asistanlar (Claude Code, GitHub Copilot vb.) icin proje rehberi.

## Proje Ozeti

**Kafkasder Panel** - Next.js 16, React 19 ve Convex ile gelistirilmis dernek yonetim sistemi.

**Ozellikler**: Ihtiyac sahibi yonetimi, bagis takibi, burs yonetimi, toplanti yonetimi, gorev otomasyonu, WhatsApp/SMS/Email entegrasyonu, finansal raporlama, guvenlik denetimi.

## Temel Komutlar

```bash
# Development
npm run dev                    # Next.js dev server (localhost:3000)
npm run convex:dev             # Convex backend (es zamanli calistirilmali)

# Kod Kalitesi
npm run typecheck              # TypeScript tip kontrolu
npm run lint                   # ESLint kontrolu
npm run lint:fix               # ESLint duzeltme
npm run format                 # Prettier formatlama

# Test
npm run test                   # Unit testleri (watch mode)
npm run test:run               # Testleri bir kez calistir
npm run test:e2e               # E2E testleri

# Build & Deploy
npm run build                  # Production build
npm run convex:deploy          # Convex deploy
npm run vercel:prod            # Vercel production deploy
```

## Mimari

### Convex-First Backend

Convex birincil backend'dir (Next.js API routes degil):

- Tum veritabani islemleri `convex/` klasorunde
- `convex/schema.ts` - Veritabani semasi
- Her kaynak icin ayri dosya: `users.ts`, `beneficiaries.ts`, `donations.ts` vb.

**Convex function syntax (zorunlu):**

```typescript
export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

### API Routes

`src/app/api/` - Convex'e ince proxy katmani. Sorumluluklar:

- HTTP routing ve method validation
- Auth middleware
- Rate limiting ve CSRF korumasi

### Frontend

```
src/app/
├── (dashboard)/           # Dashboard layout grubu
│   ├── genel/             # Ana sayfa
│   ├── bagis/             # Bagislar
│   ├── yardim/            # Yardim yonetimi
│   ├── burs/              # Burslar
│   ├── fon/               # Finans
│   ├── partner/           # Partnerler
│   ├── kullanici/         # Kullanicilar
│   ├── is/                # Gorevler/Toplantilar
│   ├── mesaj/             # Mesajlar
│   └── ayarlar/           # Ayarlar
├── api/                   # API routes
└── login/                 # Giris sayfasi
```

### Path Aliases

```typescript
@/*              → ./src/*
@/components/*   → ./src/components/*
@/lib/*          → ./src/lib/*
@/hooks/*        → ./src/hooks/*
@/stores/*       → ./src/stores/*
@/types/*        → ./src/types/*
@/convex/*       → ./convex/*
```

## Kod Kurallari

### ZORUNLU

1. **console.log YASAK** - `src/lib/logger.ts` kullan:

   ```typescript
   import { logger } from '@/lib/logger';
   logger.info('User logged in', { userId });
   logger.error('Failed to save', error);
   ```

2. **TypeScript strict mode** - `any` tipi kullanma

3. **Zod validation** - Tum inputlar validate edilmeli:

   ```typescript
   import { beneficiarySchema } from '@/lib/validations/beneficiary';
   const result = beneficiarySchema.safeParse(data);
   ```

4. **Convex object syntax** - `handler` property zorunlu

### Tercihler

- `const` > `let`, `var` hicbir zaman
- Object shorthand: `{ name }` > `{ name: name }`
- Unused variables: `_` prefix ile isaretle

## Yeni Kaynak Ekleme

1. **Schema** - `convex/schema.ts`

   ```typescript
   myResource: defineTable({
     name: v.string(),
     status: v.string(),
   }).index('by_status', ['status']);
   ```

2. **Convex Functions** - `convex/[resource].ts`

3. **API Route** - `src/app/api/[resource]/route.ts`

4. **API Client** - `src/lib/api/crud-factory.ts`

   ```typescript
   export const myResource = createApiClient<MyResource>('myResource');
   ```

5. **Validation** - `src/lib/validations/[resource].ts`

## Form Pattern

```typescript
import { useStandardForm } from '@/hooks/useStandardForm';
import { beneficiarySchema } from '@/lib/validations/beneficiary';
import { beneficiaries } from '@/lib/api/crud-factory';

function MyForm({ initialData, onSuccess }) {
  const form = useStandardForm({
    defaultValues: initialData || { name: '', status: 'active' },
    schema: beneficiarySchema,
    mutationFn: initialData
      ? (data) => beneficiaries.update(initialData._id, data)
      : beneficiaries.create,
    onSuccess,
    resetOnSuccess: !initialData,
  });

  return <form onSubmit={form.handleSubmit}>...</form>;
}
```

## API Client Kullanimi

```typescript
import { beneficiaries } from '@/lib/api/convex-api-client';

const data = await beneficiaries.list({ status: 'active' });
const item = await beneficiaries.get(id);
const newItem = await beneficiaries.create(data);
await beneficiaries.update(id, updates);
await beneficiaries.delete(id);
```

## Guvenlik

- **CSRF Korumasi**: `src/lib/csrf.ts`
- **Rate Limiting**: `src/lib/rate-limit.ts`, `rate-limit-config.ts`
- **Input Sanitization**: `src/lib/sanitization.ts` (DOMPurify)
- **Audit Logging**: `audit_logs`, `security_audit` collections
- **Auth**: Custom bcrypt-based (`src/app/api/auth/`, `src/stores/authStore.ts`)

## Test

```bash
# Belirli dosya
npm run test -- path/to/file.test.ts

# Pattern ile
npm run test -- -t "test name"

# E2E belirli test
npm run test:e2e -- tests/auth.spec.ts
```

Test dosyalari: `src/__tests__/`, E2E: `e2e/`

## Onemli Dosyalar

| Dosya                          | Aciklama                |
| ------------------------------ | ----------------------- |
| `convex/schema.ts`             | Veritabani semasi       |
| `next.config.ts`               | Next.js config          |
| `src/lib/api/crud-factory.ts`  | API client factory      |
| `src/lib/validations/`         | Zod validation semalari |
| `src/hooks/useStandardForm.ts` | Form hook               |
| `src/stores/authStore.ts`      | Auth state              |

## Debugging

**Convex baglanti sorunu:**

```bash
# NEXT_PUBLIC_CONVEX_URL ayarli mi kontrol et
npm run convex:dev
```

**Build hatalari:**

```bash
npm run clean:all
npm install
npm run build
```

**Type hatalari:**

```bash
npm run typecheck
```

## Detayli Dokumantasyon

- [docs/deployment.md](./docs/deployment.md) - Deployment rehberi
- [docs/testing.md](./docs/testing.md) - Test rehberi
- [docs/api-patterns.md](./docs/api-patterns.md) - API standartlari
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Katki rehberi
- [SECURITY.md](./SECURITY.md) - Guvenlik politikasi
