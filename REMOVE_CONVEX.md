# 🗑️ Convex Kaldırma İşlemi

Bu dosya, projeden Convex'in tamamen kaldırılması için yapılan değişiklikleri listeler.

## ✅ Tamamlanan İşlemler

### 1. Package.json Temizliği
- ✅ `convex` paketi kaldırıldı
- ✅ `@convex-dev/persistent-text-streaming` kaldırıldı
- ✅ `@convex-dev/eslint-plugin` kaldırıldı
- ✅ `convex:dev` ve `convex:deploy` scriptleri kaldırıldı
- ✅ Description güncellendi (Convex → Appwrite)

### 2. Backend Interface Temizliği
- ✅ `src/lib/backend/index.ts` sadece Appwrite kullanacak şekilde güncellendi
- ✅ Convex fallback mekanizması kaldırıldı
- ✅ `isUsingConvex()` her zaman `false` döndürüyor
- ✅ `getBackendProvider()` her zaman `'appwrite'` döndürüyor

### 3. API Routes Temizliği (Devam Ediyor)
- ⏳ Health route Convex referansları kaldırılıyor
- ⏳ Errors routes Convex fallback'leri kaldırılıyor
- ⏳ Diğer routes'lar temizleniyor

## ⏳ Yapılması Gerekenler

### 1. API Routes Temizliği
Tüm API routes'lardan Convex fallback'lerini kaldır:
- `src/app/api/errors/route.ts`
- `src/app/api/errors/[id]/route.ts`
- `src/app/api/errors/stats/route.ts`
- `src/app/api/errors/update-occurrence/route.ts`
- `src/app/api/errors/[id]/assign/route.ts`
- `src/app/api/audit-logs/route.ts`
- `src/app/api/communication-logs/route.ts`
- `src/app/api/system_alerts/create/route.ts`
- `src/app/api/security/route.ts`
- `src/app/api/branding/organization/route.ts`
- `src/app/api/branding/logo/route.ts`
- `src/app/api/communication/route.ts`
- `src/app/api/messages/send-bulk/route.ts`
- `src/app/api/donations/update-analytics/route.ts`

### 2. Convex Dosyaları ve Klasörleri
- ⏳ `convex/` klasörünü sil (backup alarak)
- ⏳ `src/lib/convex/` klasörünü sil
- ⏳ Convex import'larını kaldır

### 3. Components Temizliği
- ⏳ `useAppwriteQuery` ve `useAppwriteMutation` hooks'larını Convex fallback'lerinden temizle
- ⏳ Components'lerden Convex import'larını kaldır

### 4. Environment Variables
- ⏳ `.env.example` ve `.env.local` dosyalarından Convex referanslarını kaldır

### 5. Test ve Doğrulama
- ⏳ Tüm testleri çalıştır
- ⏳ Build'i test et
- ⏳ Lint hatalarını düzelt

## 📝 Notlar

- Convex dosyaları silmeden önce backup alın
- Migration için Convex klasörü geçici olarak saklanabilir
- Tüm değişiklikler test edilmeli

---

**Son Güncelleme**: Package.json ve backend interface temizlendi  
**Durum**: API routes temizliği devam ediyor

