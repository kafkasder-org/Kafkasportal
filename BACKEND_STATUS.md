# Backend Migration Status

**Tarih**: $(date)
**Durum**: ⚠️ **Backend hala Convex kullanıyor**

## Test Sonuçları

### ✅ Hazır Olanlar
- ✅ Appwrite SDK'ları kurulu (client: ^21.4.0, server: ^20.3.0)
- ✅ Appwrite config dosyaları mevcut
- ✅ Unified backend interface hazır

### ❌ Yapılandırılması Gerekenler
- ❌ `NEXT_PUBLIC_BACKEND_PROVIDER=appwrite` ayarlanmamış
- ❌ `NEXT_PUBLIC_APPWRITE_ENDPOINT` ayarlanmamış
- ❌ `NEXT_PUBLIC_APPWRITE_PROJECT_ID` ayarlanmamış
- ❌ `APPWRITE_API_KEY` ayarlanmamış

### ⚠️ Migration Gereken Kodlar
- ⚠️ **107 adet** Convex kullanımı tespit edildi:
  - 18 direkt Convex import
  - 5 useQuery hook kullanımı
  - 3 useMutation hook kullanımı
  - 81 convexHttp kullanımı

## Appwrite'a Geçiş Adımları

### 1. Environment Variables Ayarla

`.env.local` dosyasına ekle:

```env
# Backend Provider
NEXT_PUBLIC_BACKEND_PROVIDER=appwrite

# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=kafkasder_db
APPWRITE_API_KEY=your-api-key-here
```

### 2. Appwrite Database Kurulumu

```bash
# Database ve collection'ları oluştur
npx tsx scripts/appwrite-setup.ts
```

### 3. Kod Migrasyonu Gerekiyor

**107 adet Convex kullanımı** Appwrite'a çevrilmeli:

#### Örnek Değişiklikler:

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

### 4. Test Et

```bash
# Backend durumunu test et
npx tsx scripts/test-backend.ts
```

## Dosyalar ve Yerler

### Convex Kullanımı Olan Dosyalar (Örnekler)

**API Routes:**
- `src/app/api/health/route.ts` - Health check hala Convex kullanıyor
- `src/app/api/*` - Çoğu API route Convex kullanıyor

**Components:**
- `src/components/ai/AgentChat.tsx` - Convex useQuery/useMutation
- `src/components/ai/AIChat.tsx` - Convex hooks
- `src/app/(dashboard)/**/*.tsx` - Çoğu sayfa Convex kullanıyor

**Lib:**
- `src/lib/convex/**` - Convex helper'ları
- `src/lib/api/**` - API client'ları Convex'e bağlı

## Migration Öncelik Sırası

1. **Yüksek Öncelik:**
   - Environment variables ayarla
   - Appwrite database kurulumu
   - API routes'ları Appwrite'a çevir
   - Auth sistemi migration

2. **Orta Öncelik:**
   - Component'lerdeki Convex hooks'ları çevir
   - Real-time subscriptions'ları Appwrite listeners'a çevir
   - Storage migration

3. **Düşük Öncelik:**
   - Convex helper dosyalarını kaldır (geçiş dönemi sonrası)
   - Test ve optimizasyon

## Test Komutu

```bash
# Backend durumunu kontrol et
npm run test:backend

# veya
npx tsx scripts/test-backend.ts
```

## Sonraki Adımlar

1. ✅ Test scripti oluşturuldu
2. ⏳ Environment variables ayarla
3. ⏳ Appwrite database kurulumu
4. ⏳ Kod migration'ı başlat
5. ⏳ Test ve doğrulama

---

**Not**: Migration işlemi aşamalı olarak yapılabilir. Unified backend interface sayesinde, her modülü tek tek Appwrite'a çevirebilirsiniz.

