# Kafkasder Panel - Teknik Dokumantasyon

Bu klasor projenin tum teknik dokumantasyonunu icerir.

## Icerik

| Dosya                                | Aciklama                                       |
| ------------------------------------ | ---------------------------------------------- |
| [deployment.md](./deployment.md)     | Vercel ve Convex deployment rehberi            |
| [testing.md](./testing.md)           | Test altyapisi ve yazim rehberi                |
| [api-patterns.md](./api-patterns.md) | API route standartlari ve middleware kullanimi |

## Hizli Erisim

### Proje Yapisi

```
Kafkasder-panel/
├── src/
│   ├── app/                 # Next.js App Router sayfalari
│   │   ├── (dashboard)/     # Dashboard layout grubu
│   │   ├── api/             # API route'lari (Convex proxy)
│   │   └── login/           # Giris sayfasi
│   ├── components/          # React componentleri
│   │   └── ui/              # Radix UI temel componentleri
│   ├── lib/                 # Utility fonksiyonlari
│   │   ├── api/             # API client ve helpers
│   │   └── validations/     # Zod validation semalari
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand state yonetimi
│   └── types/               # TypeScript type tanimlari
├── convex/                  # Convex backend
│   ├── schema.ts            # Veritabani semasi
│   └── [resource].ts        # Query/mutation dosyalari
├── e2e/                     # Playwright E2E testleri
└── docs/                    # Teknik dokumantasyon
```

### Temel Komutlar

```bash
# Development
npm run dev              # Next.js dev server (localhost:3000)
npm run convex:dev       # Convex backend (es zamanli calistirilmali)

# Kod Kalitesi
npm run typecheck        # TypeScript tip kontrolu
npm run lint             # ESLint kontrolu
npm run lint:fix         # ESLint hatalari duzelt
npm run format           # Prettier ile formatla

# Test
npm run test             # Unit testleri (watch mode)
npm run test:run         # Testleri bir kez calistir
npm run test:coverage    # Coverage raporu
npm run test:e2e         # E2E testleri

# Build & Deploy
npm run build            # Production build
npm run convex:deploy    # Convex'i deploy et
npm run vercel:prod      # Vercel'e deploy et
```

### Teknoloji Yigini

| Kategori       | Teknoloji                                 |
| -------------- | ----------------------------------------- |
| **Frontend**   | Next.js 16, React 19, TypeScript          |
| **Backend**    | Convex (serverless database)              |
| **Styling**    | Tailwind CSS 4, Radix UI                  |
| **State**      | Zustand (client), TanStack Query (server) |
| **Forms**      | React Hook Form + Zod                     |
| **Testing**    | Vitest (unit), Playwright (E2E)           |
| **Deployment** | Vercel + Convex Cloud                     |

### Mimari Prensipler

#### 1. Convex-First Backend

Convex birincil backend'dir. Next.js API route'lari sadece proxy gorevindedir:

- Tum veritabani islemleri `convex/` klasorunde
- API route'lari rate limiting, CSRF ve auth middleware saglar
- Real-time updates Convex tarafindan yonetilir

#### 2. Type-Safe Her Sey

- TypeScript strict mode aktif
- Zod ile runtime validation
- Convex argument validators zorunlu

#### 3. Guvenlik Oncelikli

- CSRF korumasi tum mutation endpoint'lerinde
- Rate limiting endpoint bazinda yapilandirilir
- Input sanitization (DOMPurify)
- Audit logging tum kritik islemlerde

## Detayli Rehberler

### Yeni Ozellik Ekleme

1. **Convex Schema** - `convex/schema.ts`'e tablo ekle
2. **Convex Functions** - Query/mutation dosyasi olustur
3. **API Route** - `src/app/api/[resource]/route.ts` ekle
4. **Validation** - `src/lib/validations/` altina Zod semasi ekle
5. **UI** - Component ve sayfa olustur

### Form Olusturma

```typescript
import { useStandardForm } from '@/hooks/useStandardForm';
import { beneficiarySchema } from '@/lib/validations/beneficiary';

function MyForm({ onSuccess }) {
  const form = useStandardForm({
    defaultValues: { name: '', status: 'active' },
    schema: beneficiarySchema,
    mutationFn: (data) => api.create(data),
    onSuccess,
  });

  return <form onSubmit={form.handleSubmit}>...</form>;
}
```

### API Client Kullanimi

```typescript
import { beneficiaries } from '@/lib/api/crud-factory';

// CRUD islemleri
const list = await beneficiaries.list({ status: 'active' });
const item = await beneficiaries.get(id);
const created = await beneficiaries.create(data);
await beneficiaries.update(id, updates);
await beneficiaries.delete(id);
```

## Onemli Kurallar

1. **console.log YASAK** - `src/lib/logger.ts` kullan
2. **Convex object syntax** - `handler` property zorunlu
3. **Zod validation** - Tum inputlar validate edilmeli
4. **Prettier/ESLint** - Commit oncesi kontrol edilir

## Daha Fazla Bilgi

- [Deployment Rehberi](./deployment.md)
- [Test Rehberi](./testing.md)
- [API Patterns](./api-patterns.md)
- [Contributing](../CONTRIBUTING.md)
- [Security Policy](../SECURITY.md)
