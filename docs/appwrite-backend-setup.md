# Appwrite Backend Yapılandırması

Bu dokümantasyon, projedeki Appwrite backend yapılandırmasını ve kullanımını açıklar.

## ✅ Yapılandırma Durumu

### Environment Variables

`.env.local` dosyası aşağıdaki değerlerle yapılandırıldı:

```env
# Appwrite Endpoint
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1

# Appwrite Project ID
NEXT_PUBLIC_APPWRITE_PROJECT_ID=69221f39000c1aa90fd6

# Appwrite Database ID
NEXT_PUBLIC_APPWRITE_DATABASE_ID=kafkasder_db

# Appwrite API Key (server-side only)
APPWRITE_API_KEY=standard_af9d5a2e7a40ac304118ab6ed3dff44dbeb0889f12ef7fd75d1800c91318012b8ecca90eb216b2fa2df8c7b21bd5936f1124e917878dfc1490fe7172a627d74abf39b5c7c441f9a682fc51be49a7cc36dd063ffc29ed23705b8ed5975433cba679c4d338497522e55d91e2984cd4057383c931ae539631faada99cc1b4e1f821

# Storage Buckets
NEXT_PUBLIC_APPWRITE_BUCKET_DOCUMENTS=documents
NEXT_PUBLIC_APPWRITE_BUCKET_AVATARS=avatars
NEXT_PUBLIC_APPWRITE_BUCKET_RECEIPTS=receipts

# Backend Provider
NEXT_PUBLIC_BACKEND_PROVIDER=appwrite
```

## 📁 Dosya Yapısı

### Core Appwrite Modülleri

1. **`src/lib/appwrite/config.ts`**
   - Appwrite yapılandırma merkezi
   - Environment variables'dan değerleri okur
   - Collection ve bucket ID mapping'leri

2. **`src/lib/appwrite/client.ts`**
   - Client-side Appwrite SDK
   - Browser'da kullanım için
   - Account, Databases, Storage, Avatars, Functions

3. **`src/lib/appwrite/server.ts`**
   - Server-side Appwrite SDK
   - API routes ve server components için
   - API key ile authentication

4. **`src/lib/appwrite/api-client.ts`**
   - Generic CRUD operations
   - Unified API interface
   - Query building ve error handling

5. **`src/lib/appwrite/auth.ts`**
   - Authentication helpers
   - Session management
   - Password operations

6. **`src/lib/appwrite/index.ts`**
   - Central export point
   - Tüm Appwrite modüllerini export eder

### Backend Interface

**`src/lib/backend/index.ts`**
- Unified backend interface
- Appwrite backend provider
- CRUD operations wrapper

## 🔧 Kullanım

### Client-Side (Browser)

```typescript
import { databases, account, storage } from '@/lib/appwrite';

// Database operations
const documents = await databases.listDocuments(
  'kafkasder_db',
  'beneficiaries',
  [Query.limit(10)]
);

// Account operations
const user = await account.get();

// Storage operations
const file = await storage.getFile('avatars', 'file-id');
```

### Server-Side (API Routes)

```typescript
import { serverDatabases, serverUsers, serverStorage } from '@/lib/appwrite';

// Database operations (with API key)
const documents = await serverDatabases.listDocuments(
  'kafkasder_db',
  'beneficiaries',
  [Query.limit(10)]
);

// User management (admin)
const user = await serverUsers.create(
  ID.unique(),
  'user@example.com',
  undefined,
  'password123',
  'User Name'
);
```

### Unified Backend Interface

```typescript
import { getBeneficiaries } from '@/lib/backend';

const beneficiaries = await getBeneficiaries();
const result = await beneficiaries.list({ limit: 10 });
```

### API Client (Generic CRUD)

```typescript
import { appwriteBeneficiaries } from '@/lib/appwrite';

// List
const { data, error } = await appwriteBeneficiaries.list({
  limit: 10,
  filters: { status: 'AKTIF' }
});

// Get
const { data, error } = await appwriteBeneficiaries.get('document-id');

// Create
const { data, error } = await appwriteBeneficiaries.create({
  name: 'Test',
  email: 'test@example.com'
});

// Update
const { data, error } = await appwriteBeneficiaries.update('id', {
  name: 'Updated Name'
});

// Delete
const { data, error } = await appwriteBeneficiaries.delete('id');
```

## 🧪 Test

Backend yapılandırmasını test etmek için:

```bash
npx tsx scripts/test-backend.ts
```

Bu script şunları kontrol eder:
- ✅ Environment variables
- ✅ SDK kurulumları
- ✅ Dosya varlığı
- ✅ Backend provider yapılandırması

## 📊 Mevcut Durum

### ✅ Tamamlananlar

- ✅ Environment variables yapılandırıldı
- ✅ Appwrite client ve server SDK'ları kurulu
- ✅ Unified backend interface hazır
- ✅ API client implementasyonu
- ✅ Authentication helpers
- ✅ Collection mapping'leri

### ⚠️ Dikkat Edilmesi Gerekenler

- ⚠️ Bazı dosyalarda hala Convex import'ları var (migration gerekebilir)
- ⚠️ Database collection'ları oluşturulmalı (`npx tsx scripts/appwrite-setup.ts`)
- ⚠️ Storage bucket'ları oluşturulmalı

## 🚀 Sonraki Adımlar

1. **Database Setup**
   ```bash
   npx tsx scripts/appwrite-setup.ts
   ```

2. **Storage Buckets Oluştur**
   - Appwrite Console > Storage
   - `documents`, `avatars`, `receipts` bucket'larını oluştur

3. **Collection'ları Kontrol Et**
   ```bash
   npx tsx scripts/check-schema-compliance.ts
   ```

4. **MCP Server Test**
   - Cursor'da: "Appwrite kullanıcılarını listele"

## 🔐 Güvenlik Notları

- ✅ `.env.local` dosyası `.gitignore`'da
- ✅ API key sadece server-side kullanılıyor
- ⚠️ API key'i asla commit etmeyin
- ⚠️ Production'da environment variables'ı güvenli bir şekilde saklayın

## 📚 İlgili Dokümantasyon

- [Appwrite MCP Guide](./appwrite-mcp-guide.md)
- [Appwrite Migration Plan](./appwrite-migration-plan.md)
- [Schema Compliance Check](./schema-compliance-check.md)

