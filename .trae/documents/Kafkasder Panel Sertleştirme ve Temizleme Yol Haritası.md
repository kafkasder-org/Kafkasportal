# Aşamalar ve Adım Adım Plan

## Faz 1: Güvenlik Sertleştirme

1. CSRF’yi tüm state-değiştiren API’larda zorunlu yap

- Mevcut yardımcı: `src/lib/csrf.ts` (validateCsrfToken)
- Örnek uygulama: `src/app/api/auth/login/route.ts`, `logout/route.ts`
- Yapılacak: POST/PUT/PATCH/DELETE kullanan route’larda doğrulama (örn. `src/app/api/*/**/route.ts`, toplantılar gibi `src/app/api/meetings/[id]/route.ts:67,131` zaten `verifyCsrfToken` kullanıyor, benzer hale getirilecek).

2. Oturum kontrolünü sunucu tarafında ortaklaştır

- Mevcut: `src/app/api/auth/session/route.ts`
- Yapılacak: Ortak helper `requireSession()` (cookie `auth-session` + expire kontrol) `src/lib/api/auth-utils.ts` içine; tüm korumalı API’lar bu helper ile başlasın.

3. Route guard’ı genişlet

- Mevcut: `middleware.ts`
- Yapılacak: Matcher’a gerekirse modül bazlı beyaz liste ekleme; rol/izin tabanlı redirect (örn. `/is/yonetim` sadece yöneticiler).

## Faz 2: Yetkilendirme (RBAC)

1. İzin/rol kontrol wrapper’ları

- Dosya: `src/lib/api/auth-utils.ts`
- Yapılacak: `requirePermissions(perm[])`, `requireRole(role)`; hata yanıtını `buildErrorResponse` biçiminde döndür.
- Uygulama: `src/app/api/**/route.ts` içindeki kritik endpoint’lerde (ör. `donations`, `beneficiaries`, `tasks`, `meetings`).

2. Dashboard görünürlük/menü filtreleme

- Dosya: `src/config/navigation.ts`, `src/components/ui/modern-sidebar.tsx`
- Yapılacak: Kullanıcı rol/izinlerine göre item’ları gizle/göster.

## Faz 3: Tip ve API Tutarlılığı Temizliği

1. Form bileşen tipleri

- Hatalar: `AddressInfoStep.tsx`, `PersonalInfoStep.tsx` (Implicit any, `ParameterSelectProps` uyumsuzluğu)
- Yapılacak: `ParameterSelectProps` tanımını netle (`src/components/ui/parameter-select.tsx` varsa); `onValueChange` için doğru generic tipler; implicit any’leri kaldır.

2. Zod/React Hook Form uyumsuzlukları

- Hatalar: `BeneficiaryFormWizard.tsx:58,223`, `useStandardForm.ts:61,73`
- Yapılacak: `zodResolver` ile form data tiplerinin eşlenmesi; `SubmitHandler<T>` kullanımını doğru generic ile güncelle.

3. Convex API istemcisi çağrı sözleşmeleri

- Hatalar: `src/lib/api/convex-api-client.ts:137,181,657` (argüman sayısı)
- Yapılacak: `apiRequest` imzasına uyum (endpoint, init?, cacheKey?); ekstra dördüncü argümanı kaldır veya helper’ı güncelle.

4. PDF export tipleri

- Hata: `src/lib/utils/pdf-export.ts:175,228,253`
- Yapılacak: `jspdf-autotable` `AutoTableOptions` tipleri ile uyum; `fontStyle` yerine `styles: { fontStyle: 'bold' }`; `unknown` alanlar için güvenli cast ya da schema.

5. Küçük temizlikler

- Kullanılmayan import/değişkenler (TS6133) `date-picker.tsx`, `skeleton-optimized.tsx`, `step-progress.tsx` vb.; kaldır veya kullan.

## Faz 4: CSP ve CORS İyileştirmeleri

1. CSP’de nonce/sha yaklaşımı

- Dosya: `next.config.ts:155-177`
- Yapılacak: Prod’da `script-src` için `'unsafe-inline'` kaldır; `next/script` nonce kullanımı; dış kaynak whitelist gereksinimi analiz.

2. CORS sadeleştirme

- Mevcut: API header grubundaki statik CORS kaldırıldı
- Yapılacak: Gerekli endpoint’lerde dinamik CORS (gelişirse); şu an same-origin cookie akışı yeterli.

## Faz 5: Bağımlılık Temizliği

1. Kullanılmayan dev bağımlılıklar

- Adaylar: `jest`, `kill-port`, `rollup-plugin-analyzer`, `dotenv`
- Yapılacak: Kod aramasıyla doğrula; kaldır, script’leri güncelle.

## Faz 6: i18n Altyapısı

1. Sağlayıcı kurulumu

- Araç: `next-intl` veya hafif bir i18n çözümü
- Dosya: `src/app/providers.tsx` ve sayfa düzeyleri
- Yapılacak: TR varsayılan, EN ikinci dil; login/hata mesajlarını mesaj dosyalarına taşı.

## Faz 7: Test Kapsamı

1. Unit

- CSRF validator (`src/lib/csrf.ts`), izin wrapper’ları (`src/lib/api/auth-utils.ts`), rate-limit (`src/lib/rate-limit.ts`)

2. Integration

- Auth akışı: `csrf -> login -> session -> logout`; lockout ve rate limit; `meetings` update/delete izin ve csrf.

3. E2E (Playwright)

- Middleware guard: korunan route’a login’siz erişim redirect; login sonrası redirect parametresi çalışıyor.

## Faz 8: Doğrulama ve Yayın

1. Tip kontrol ve lint

- `npm run typecheck`, `npm run lint`

2. Lokal doğrulama

- `npm run dev`; kritik sayfalar (login, dashboard, beneficiaries/donations) gezinti.

3. CI

- Mevcut workflow’lar ile testler çalışır; gerekiyorsa yeni job ekle.

---

Onayladığında Faz 1’den başlayıp adımları sırayla uygulayacağım; her faz sonunda tip/lint/test doğrulaması yapıp ilerlemeyi raporlayacağım.
