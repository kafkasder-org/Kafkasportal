# Convex → Appwrite Migration Guide

Bu belge, Kafkasder Panel projesinin Convex'ten Appwrite'a geçiş sürecini dokümante eder.

## Geçiş Durumu

| Aşama | Durum |
|-------|-------|
| Appwrite SDK Kurulumu | ✅ Tamamlandı |
| Yapılandırma Dosyaları | ✅ Tamamlandı |
| API Client | ✅ Tamamlandı |
| Auth Sistemi | ✅ Tamamlandı |
| Schema Mapping | 📋 Bu belge |
| Veri Migrasyon Scriptleri | ⏳ Beklemede |
| Test & Doğrulama | ⏳ Beklemede |

## Yapılandırma

### Ortam Değişkenleri

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
APPWRITE_API_KEY=your-api-key

# Storage Buckets
NEXT_PUBLIC_APPWRITE_BUCKET_DOCUMENTS=documents
NEXT_PUBLIC_APPWRITE_BUCKET_AVATARS=avatars
NEXT_PUBLIC_APPWRITE_BUCKET_RECEIPTS=receipts
```

### Dosya Yapısı

```
src/lib/appwrite/
├── config.ts      # Yapılandırma ve sabitler
├── client.ts      # Client-side Appwrite client
├── server.ts      # Server-side Appwrite client (API key ile)
├── api-client.ts  # Generic CRUD operations
├── auth.ts        # Authentication helpers
└── index.ts       # Module exports
```

## Collection Mapping (Convex → Appwrite)

### User Management

| Convex Collection | Appwrite Collection ID | Notlar |
|-------------------|------------------------|--------|
| `users` | `users` | Appwrite Auth ile entegre |
| `user_sessions` | `user_sessions` | Appwrite Sessions kullanılabilir |
| `two_factor_settings` | `two_factor_settings` | Custom collection |
| `trusted_devices` | `trusted_devices` | Custom collection |

### Core Beneficiary System

| Convex Collection | Appwrite Collection ID | Notlar |
|-------------------|------------------------|--------|
| `beneficiaries` | `beneficiaries` | Ana veri tablosu |
| `dependents` | `dependents` | FK: beneficiary_id |
| `consents` | `consents` | FK: beneficiary_id |
| `bank_accounts` | `bank_accounts` | FK: beneficiary_id |

### Aid/Donations

| Convex Collection | Appwrite Collection ID | Notlar |
|-------------------|------------------------|--------|
| `donations` | `donations` | |
| `aid_applications` | `aid_applications` | FK: beneficiary_id |
| `scholarships` | `scholarships` | |
| `scholarship_applications` | `scholarship_applications` | FK: scholarship_id, student_id |
| `scholarship_payments` | `scholarship_payments` | FK: application_id |

### Finance

| Convex Collection | Appwrite Collection ID | Notlar |
|-------------------|------------------------|--------|
| `finance_records` | `finance_records` | FK: created_by, approved_by |

### Communication

| Convex Collection | Appwrite Collection ID | Notlar |
|-------------------|------------------------|--------|
| `messages` | `messages` | FK: sender, recipients |
| `communication_logs` | `communication_logs` | |
| `workflow_notifications` | `workflow_notifications` | FK: recipient |

### Meetings & Tasks

| Convex Collection | Appwrite Collection ID | Notlar |
|-------------------|------------------------|--------|
| `meetings` | `meetings` | FK: organizer, participants |
| `meeting_decisions` | `meeting_decisions` | FK: meeting_id |
| `meeting_action_items` | `meeting_action_items` | FK: meeting_id, decision_id |
| `tasks` | `tasks` | FK: assigned_to, created_by |

### Partners

| Convex Collection | Appwrite Collection ID | Notlar |
|-------------------|------------------------|--------|
| `partners` | `partners` | |

### Documents

| Convex Collection | Appwrite Collection ID | Notlar |
|-------------------|------------------------|--------|
| `files` | `files` | Appwrite Storage kullan |
| `document_versions` | `document_versions` | FK: document_id |

### Reporting

| Convex Collection | Appwrite Collection ID | Notlar |
|-------------------|------------------------|--------|
| `report_configs` | `report_configs` | FK: created_by |

### Security/Audit

| Convex Collection | Appwrite Collection ID | Notlar |
|-------------------|------------------------|--------|
| `security_events` | `security_events` | |
| `audit_logs` | `audit_logs` | FK: userId |
| `rate_limit_log` | `rate_limit_log` | |

### System

| Convex Collection | Appwrite Collection ID | Notlar |
|-------------------|------------------------|--------|
| `system_settings` | `system_settings` | |
| `theme_presets` | `theme_presets` | |
| `parameters` | `parameters` | |

### Error Tracking

| Convex Collection | Appwrite Collection ID | Notlar |
|-------------------|------------------------|--------|
| `errors` | `errors` | |
| `error_occurrences` | `error_occurrences` | FK: error_id |
| `error_logs` | `error_logs` | |
| `system_alerts` | `system_alerts` | |

### Monitoring

| Convex Collection | Appwrite Collection ID | Notlar |
|-------------------|------------------------|--------|
| `analytics_events` | `analytics_events` | |
| `performance_metrics` | `performance_metrics` | |

### AI Features

| Convex Collection | Appwrite Collection ID | Notlar |
|-------------------|------------------------|--------|
| `ai_chats` | `ai_chats` | FK: user_id |
| `agent_threads` | `agent_threads` | FK: user_id |
| `agent_messages` | `agent_messages` | FK: thread_id |
| `agent_tools` | `agent_tools` | |
| `agent_usage` | `agent_usage` | FK: user_id, thread_id |

## Veri Tipi Dönüşümleri

### Convex → Appwrite Tip Karşılıkları

| Convex Type | Appwrite Attribute Type |
|-------------|------------------------|
| `v.string()` | `string` |
| `v.number()` | `integer` / `double` |
| `v.boolean()` | `boolean` |
| `v.id('collection')` | `string` (relationship) |
| `v.array(v.string())` | `string[]` |
| `v.object({...})` | JSON string veya ayrı attributes |
| `v.optional(...)` | Non-required attribute |
| `v.union(v.literal(...))` | `enum` |
| `v.any()` | JSON string |
| `v.record(...)` | JSON string |

### Özel Dönüşümler

1. **Convex ID'ler**: `v.id('collection')` → String attribute + relationship
2. **Timestamps**: ISO 8601 string formatında tutulacak
3. **Arrays of Objects**: JSON string olarak saklanacak
4. **Nested Objects**: JSON string veya ayrı attributes

## Index Mapping

### Convex Indexes → Appwrite Indexes

```typescript
// Convex
.index('by_status', ['status'])

// Appwrite (Console veya CLI ile oluştur)
// Index Name: by_status
// Type: key
// Attributes: ['status']
// Order: ASC
```

### Search Indexes

Convex'teki `searchIndex` → Appwrite'da `fulltext` index kullan.

```typescript
// Convex
.searchIndex('by_search', {
  searchField: 'name',
  filterFields: ['email', 'phone'],
})

// Appwrite
// Index Name: by_search
// Type: fulltext
// Attributes: ['name']
```

## Auth Sistemi Değişiklikleri

### Eski Sistem (Convex + bcrypt)
- Custom bcrypt password hashing
- Manual session management
- Custom 2FA implementation

### Yeni Sistem (Appwrite Auth)
- Appwrite'ın built-in auth sistemi
- Email/password authentication
- Session management otomatik
- OAuth desteği (isteğe bağlı)

### Migration Notları

1. **Kullanıcı Parolaları**: Appwrite'a geçişte kullanıcılar parola sıfırlama yapmalı
2. **Session'lar**: Tüm mevcut session'lar geçersiz olacak
3. **2FA**: Appwrite'ın 2FA özelliği kullanılabilir veya custom devam edilebilir

## API Değişiklikleri

### Eski API Pattern (Convex)

```typescript
// convex/beneficiaries.ts
export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // ...
  },
});
```

### Yeni API Pattern (Appwrite)

```typescript
// API route veya client-side
import { appwriteBeneficiaries } from '@/lib/appwrite';

const { data, error } = await appwriteBeneficiaries.list({
  filters: { status: 'AKTIF' }
});
```

## Migrasyon Adımları

### 1. Appwrite Projesi Oluştur
1. [Appwrite Console](https://cloud.appwrite.io) üzerinde proje oluştur
2. Database oluştur
3. API Key oluştur (server-side için)

### 2. Collection'ları Oluştur
Appwrite Console veya CLI kullanarak tüm collection'ları oluştur.

### 3. Attribute'ları Tanımla
Her collection için gerekli attribute'ları ekle.

### 4. Index'leri Oluştur
Performance için gerekli index'leri oluştur.

### 5. Storage Bucket'ları Oluştur
- `documents` - Genel dökümanlar
- `avatars` - Kullanıcı avatarları
- `receipts` - Makbuzlar

### 6. Veri Migrasyonu
Convex'ten veri export edip Appwrite'a import et.

### 7. Frontend Entegrasyonu
API çağrılarını yeni Appwrite client'a geçir.

### 8. Test & Doğrulama
Tüm CRUD işlemlerini test et.

## Rollback Planı

Eğer migrasyon başarısız olursa:

1. Convex backend'i aktif tut
2. Environment değişkenlerini Convex'e geri döndür
3. Appwrite client'ı devre dışı bırak

## Kaynaklar

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Web SDK](https://appwrite.io/docs/sdks#client-web)
- [Appwrite Node.js SDK](https://appwrite.io/docs/sdks#server-nodejs)
- [Convex Documentation](https://docs.convex.dev/)
