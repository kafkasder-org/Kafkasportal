# Appwrite Migration Guide - Adım Adım

Bu rehber, projenizi Convex'ten Appwrite'a tamamen geçirmek için gereken tüm adımları içerir.

## 🚀 Hızlı Başlangıç

### Adım 1: Appwrite Projesi Oluştur

1. [Appwrite Cloud Console](https://cloud.appwrite.io/)'a gidin
2. Yeni proje oluşturun: **Kafkasder Panel**
3. **Settings** > **General** > **Project ID**'yi kopyalayın
4. **Settings** > **API Keys** > **Create API Key**
   - İzinler: `users.read`, `users.write`, `databases.read`, `databases.write`, `storage.read`, `storage.write`
   - API Key'i kopyalayın

### Adım 2: Environment Variables

`.env.local` dosyası oluşturun (`.env.example.appwrite` dosyasını referans alın):

```env
NEXT_PUBLIC_BACKEND_PROVIDER=appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=kafkasder_db
APPWRITE_API_KEY=your-api-key
```

### Adım 3: Database Kurulumu

```bash
npx tsx scripts/appwrite-setup.ts
```

### Adım 4: Test

```bash
npm run test:backend
```

## 📋 Migration Checklist

- [ ] Appwrite projesi oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] Database ve collection'lar oluşturuldu
- [ ] API routes Appwrite'a çevrildi
- [ ] Components Appwrite'a çevrildi
- [ ] Auth sistemi Appwrite'a çevrildi
- [ ] Real-time subscriptions eklendi
- [ ] Storage migration yapıldı
- [ ] Test edildi

## 🔄 Kod Migration Örnekleri

### API Route Örneği

**Eski (Convex):**
```typescript
import { convexBeneficiaries } from '@/lib/convex/api';

export async function GET() {
  const data = await convexBeneficiaries.list();
  return Response.json(data);
}
```

**Yeni (Appwrite):**
```typescript
import { serverDatabases } from '@/lib/appwrite/server';
import { appwriteConfig } from '@/lib/appwrite/config';

export async function GET() {
  const data = await serverDatabases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.collections.beneficiaries
  );
  return Response.json(data);
}
```

### Component Örneği

**Eski (Convex):**
```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const beneficiaries = useQuery(api.beneficiaries.list);
```

**Yeni (Appwrite):**
```typescript
import { useQuery } from '@tanstack/react-query';
import { appwriteBeneficiaries } from '@/lib/appwrite';

const { data: beneficiaries } = useQuery({
  queryKey: ['beneficiaries'],
  queryFn: () => appwriteBeneficiaries.list(),
});
```

## 📚 Daha Fazla Bilgi

- [Backend Status](./BACKEND_STATUS.md)
- [Migration Plan](./docs/appwrite-migration-plan.md)
- [Appwrite MCP Guide](./docs/appwrite-mcp-guide.md)

