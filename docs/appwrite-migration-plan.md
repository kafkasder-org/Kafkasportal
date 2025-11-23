# Convex → Appwrite Migration Plan

Bu belge, Kafkasder Panel projesinin Convex'ten Appwrite'a geçiş sürecini detaylandırır.

## 📊 Mevcut Durum

### ✅ Hazır Olanlar
- ✅ Appwrite SDK kurulu (`appwrite`, `node-appwrite`)
- ✅ Appwrite config dosyaları (`src/lib/appwrite/`)
- ✅ API client implementasyonu (`src/lib/appwrite/api-client.ts`)
- ✅ Auth helpers (`src/lib/appwrite/auth.ts`)
- ✅ Unified backend interface (`src/lib/backend/index.ts`)
- ✅ Appwrite setup script (`scripts/appwrite-setup.ts`)
- ✅ Migration dokümantasyonu

### ⏳ Yapılması Gerekenler
- ⏳ Appwrite Database ve Collection'ları oluştur
- ⏳ Convex query/mutation kullanımlarını Appwrite'a çevir
- ⏳ API routes'ları Appwrite client kullanacak şekilde güncelle
- ⏳ Real-time subscriptions'ları Appwrite listeners'a çevir
- ⏳ Storage migration
- ⏳ Auth migration
- ⏳ Data migration
- ⏳ Test ve doğrulama

---

## 🚀 Migration Adımları

### 1. Appwrite Projesi Kurulumu

#### 1.1 Appwrite Cloud Hesabı
1. [Appwrite Cloud](https://cloud.appwrite.io) hesabı oluştur
2. Yeni proje oluştur: `Kafkasder Panel`
3. Proje ID'yi not et

#### 1.2 Environment Variables
`.env.local` dosyasına ekle:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=kafkasder_db
APPWRITE_API_KEY=your-api-key

# Storage Buckets
NEXT_PUBLIC_APPWRITE_BUCKET_DOCUMENTS=documents
NEXT_PUBLIC_APPWRITE_BUCKET_AVATARS=avatars
NEXT_PUBLIC_APPWRITE_BUCKET_RECEIPTS=receipts

# Backend Provider (Migration için)
NEXT_PUBLIC_BACKEND_PROVIDER=appwrite
```

#### 1.3 Database ve Collection'ları Oluştur
```bash
npm run appwrite:setup
# veya
npx tsx scripts/appwrite-setup.ts
```

Bu script:
- Database oluşturur
- Tüm collection'ları oluşturur
- Attribute'ları tanımlar
- Index'leri oluşturur

---

### 2. Kod Değişiklikleri

#### 2.1 Convex Query/Mutation → Appwrite API

**Eski (Convex):**
```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const beneficiaries = useQuery(api.beneficiaries.list, { status: 'AKTIF' });
const createBeneficiary = useMutation(api.beneficiaries.create);
```

**Yeni (Appwrite):**
```typescript
import { useQuery } from '@tanstack/react-query';
import { appwriteBeneficiaries } from '@/lib/appwrite';

const { data: beneficiaries } = useQuery({
  queryKey: ['beneficiaries', { status: 'AKTIF' }],
  queryFn: () => appwriteBeneficiaries.list({ filters: { status: 'AKTIF' } }),
});
```

#### 2.2 Unified Backend Interface Kullanımı

Mevcut `src/lib/backend/index.ts` zaten unified interface sağlıyor:

```typescript
import { createUnifiedCrud } from '@/lib/backend';

const beneficiaries = await createUnifiedCrud<Beneficiary>('beneficiaries');
const data = await beneficiaries.list({ filters: { status: 'AKTIF' } });
```

Bu şekilde `NEXT_PUBLIC_BACKEND_PROVIDER` environment variable'ı ile backend değiştirilebilir.

#### 2.3 API Routes Güncellemesi

**Eski (Convex via API):**
```typescript
// src/app/api/beneficiaries/route.ts
import { convexBeneficiaries } from '@/lib/convex/api';

export async function GET(request: Request) {
  const data = await convexBeneficiaries.list();
  return Response.json(data);
}
```

**Yeni (Appwrite):**
```typescript
// src/app/api/beneficiaries/route.ts
import { serverDatabases } from '@/lib/appwrite/server';
import { appwriteConfig } from '@/lib/appwrite/config';
import { Query } from 'node-appwrite';

export async function GET(request: Request) {
  if (!serverDatabases) {
    return Response.json({ error: 'Appwrite not configured' }, { status: 500 });
  }

  const data = await serverDatabases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.collections.beneficiaries,
    [Query.equal('status', 'AKTIF')]
  );

  return Response.json(data);
}
```

**Veya Unified Backend kullan:**
```typescript
import { createUnifiedCrud } from '@/lib/backend';

export async function GET(request: Request) {
  const beneficiaries = await createUnifiedCrud('beneficiaries');
  const { data, error } = await beneficiaries.list({ filters: { status: 'AKTIF' } });
  
  if (error) {
    return Response.json({ error }, { status: 500 });
  }
  
  return Response.json(data);
}
```

#### 2.4 Real-time Subscriptions

**Eski (Convex):**
```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const beneficiaries = useQuery(api.beneficiaries.list); // Auto-updates
```

**Yeni (Appwrite Realtime):**
```typescript
import { useEffect, useState } from 'react';
import { databases, isAppwriteReady } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwrite/config';
import { RealtimeResponseEvent } from 'appwrite';

function useBeneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);

  useEffect(() => {
    if (!isAppwriteReady()) return;

    // Initial load
    const loadData = async () => {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.beneficiaries
      );
      setBeneficiaries(response.documents);
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribe = databases.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.collections.beneficiaries}.documents`,
      (response: RealtimeResponseEvent<any>) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          setBeneficiaries(prev => [...prev, response.payload]);
        } else if (response.events.includes('databases.*.collections.*.documents.*.update')) {
          setBeneficiaries(prev =>
            prev.map(item => item.$id === response.payload.$id ? response.payload : item)
          );
        } else if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
          setBeneficiaries(prev => prev.filter(item => item.$id !== response.payload.$id));
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return beneficiaries;
}
```

#### 2.5 Auth Migration

**Eski (Custom bcrypt):**
```typescript
import { createSession } from '@/lib/auth/session';
// Custom bcrypt-based auth
```

**Yeni (Appwrite Auth):**
```typescript
import { appwriteAuth } from '@/lib/appwrite';

// Login
const { session, error } = await appwriteAuth.createSession(email, password);

// Get current user
const { user } = await appwriteAuth.getCurrentUser();

// Logout
await appwriteAuth.deleteSession();
```

---

### 3. Storage Migration

#### 3.1 Convex Storage → Appwrite Storage

**Eski (Convex):**
```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const uploadFile = useMutation(api.storage.upload);
```

**Yeni (Appwrite Storage):**
```typescript
import { storage, isAppwriteReady } from '@/lib/appwrite';
import { appwriteConfig, ID } from 'appwrite';

async function uploadFile(file: File, bucket: 'documents' | 'avatars' | 'receipts') {
  if (!isAppwriteReady() || !storage) {
    throw new Error('Appwrite storage not configured');
  }

  const bucketId = appwriteConfig.buckets[bucket];
  const fileId = ID.unique();

  return await storage.createFile(bucketId, fileId, file);
}
```

#### 3.2 File Download URL

```typescript
import { storage } from '@/lib/appwrite';

function getFileUrl(fileId: string, bucket: string) {
  if (!storage) return null;
  
  const bucketId = appwriteConfig.buckets[bucket];
  return storage.getFileView(bucketId, fileId).toString();
}
```

---

### 4. Data Migration

#### 4.1 Migration Script Oluştur

`scripts/migrate-data.ts` dosyası oluştur:

```typescript
/**
 * Data Migration Script: Convex → Appwrite
 * 
 * Kullanım:
 *   npx tsx scripts/migrate-data.ts
 */

import { convexHttp } from '@/lib/convex/server';
import { serverDatabases } from '@/lib/appwrite/server';
import { appwriteConfig } from '@/lib/appwrite/config';
import { api } from '@/convex/_generated/api';
import { ID } from 'node-appwrite';

async function migrateCollection(collectionName: string) {
  console.log(`\n📦 Migrating ${collectionName}...`);
  
  // Get data from Convex
  const convexData = await convexHttp.query(api[collectionName].list, {});
  
  if (!convexData || convexData.length === 0) {
    console.log(`   ⚠ No data to migrate`);
    return;
  }

  const collectionId = appwriteConfig.collections[collectionName];
  
  // Migrate each document
  for (const doc of convexData) {
    try {
      // Convert Convex document to Appwrite format
      const appwriteDoc = convertDocument(doc);
      
      // Create in Appwrite
      await serverDatabases.createDocument(
        appwriteConfig.databaseId,
        collectionId,
        doc._id || ID.unique(),
        appwriteDoc
      );
      
      console.log(`   ✓ Migrated: ${doc._id || doc.name}`);
    } catch (error) {
      console.error(`   ✗ Failed: ${doc._id || doc.name}`, error);
    }
  }
  
  console.log(`   ✅ Completed: ${convexData.length} documents`);
}

function convertDocument(doc: any) {
  const converted = { ...doc };
  
  // Remove Convex-specific fields
  delete converted._id;
  delete converted._creationTime;
  
  // Convert dates
  if (converted.createdAt) {
    converted.createdAt = new Date(converted.createdAt).toISOString();
  }
  
  // Convert arrays/objects to JSON strings if needed
  // (Appwrite can handle arrays/objects natively, but may need conversion)
  
  return converted;
}

async function main() {
  const collections = [
    'users',
    'beneficiaries',
    'donations',
    'tasks',
    'meetings',
    // ... diğer collection'lar
  ];

  for (const collection of collections) {
    await migrateCollection(collection);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ Migration completed!');
}

main();
```

---

### 5. Test ve Doğrulama

#### 5.1 Environment Variable'ı Değiştir

```env
NEXT_PUBLIC_BACKEND_PROVIDER=appwrite
```

#### 5.2 Test Checklist

- [ ] Kullanıcı login/logout
- [ ] Beneficiaries CRUD işlemleri
- [ ] Donations CRUD işlemleri
- [ ] Tasks CRUD işlemleri
- [ ] Meetings CRUD işlemleri
- [ ] File upload/download
- [ ] Real-time updates
- [ ] Search ve filtreleme
- [ ] Pagination
- [ ] Error handling

#### 5.3 Rollback Planı

Eğer sorun olursa:

```env
NEXT_PUBLIC_BACKEND_PROVIDER=convex
```

Bu şekilde Convex'e geri dönebilirsiniz.

---

### 6. Temizlik (Opsiyonel)

Migration başarılı olduktan ve test edildikten sonra:

1. Convex bağımlılıklarını kaldır (opsiyonel - backup olarak tutulabilir)
2. `convex/` klasörünü arşivle
3. `src/lib/convex/` dosyalarını kaldır
4. `src/lib/backend/index.ts`'de Convex fallback'i kaldır

---

## 🔍 Önemli Notlar

### 1. ID Formatları

- **Convex**: `Id<'collection'>` (type-safe)
- **Appwrite**: `string` (UUID formatında)

### 2. Timestamp Formatları

- **Convex**: ISO 8601 string (`"2024-01-01T00:00:00.000Z"`)
- **Appwrite**: ISO 8601 string (aynı format)

### 3. Nested Objects

- **Convex**: Native object/array support
- **Appwrite**: JSON string veya native object/array (collection'a göre)

### 4. Relationships

- **Convex**: `v.id('collection')` (type-safe references)
- **Appwrite**: String ID'ler (manual relationship management)

### 5. Real-time

- **Convex**: Automatic subscriptions via `useQuery`
- **Appwrite**: Manual subscription setup via `databases.subscribe()`

---

## 📚 Kaynaklar

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Web SDK](https://appwrite.io/docs/sdks#client-web)
- [Appwrite Node.js SDK](https://appwrite.io/docs/sdks#server-nodejs)
- [Appwrite Realtime](https://appwrite.io/docs/realtime)
- [Appwrite Storage](https://appwrite.io/docs/storage)

---

## 🆘 Sorun Giderme

### Database connection hatası
- `NEXT_PUBLIC_APPWRITE_ENDPOINT` doğru mu?
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` doğru mu?
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID` doğru mu?

### Collection bulunamıyor
- `appwrite-setup.ts` scripti çalıştırıldı mı?
- Collection ID'ler `appwriteConfig.collections` ile eşleşiyor mu?

### Auth hatası
- Appwrite Auth API'leri etkinleştirildi mi?
- Email/password provider aktif mi?

### Real-time çalışmıyor
- WebSocket bağlantısı açık mı?
- Collection permissions doğru mu?

---

## ✅ Migration Checklist

- [ ] Appwrite projesi oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] Database ve collection'lar oluşturuldu
- [ ] API routes güncellendi
- [ ] Real-time subscriptions eklendi
- [ ] Storage migration yapıldı
- [ ] Auth migration yapıldı
- [ ] Data migration yapıldı
- [ ] Test edildi
- [ ] Production'a deploy edildi
- [ ] Rollback planı hazır

---

**Son Güncelleme**: 2024-01-XX
**Durum**: Migration Planı Hazır

