# Projede Eksik/Gereksiz Noktalar ve İyileştirme Planı

## Eksikler

1. CSRF doğrulaması eksik

- İstemci `x-csrf-token` gönderiyor (`src/stores/authStore.ts:169-173`), ancak login API `validateCsrfToken` veya header kontrolü yapmıyor (`src/app/api/auth/login/route.ts` genelinde kontrol yok).
- CSRF util mevcut ama kullanılmıyor (`src/lib/csrf.ts:28`).

2. Sunucu tarafı oturum doğrulaması ve route koruması zayıf

- `initializeAuth` yalnızca `localStorage` okuyor (`src/stores/authStore.ts:108-141`), sunucu-side cookie ile doğrulama yapılmıyor.
- Dashboard koruması client-side yönlendirme ile (`src/app/(dashboard)/layout.tsx:131-137`). Next `middleware.ts` yok.

3. CORS/CSP header’larında yanlış/gevşek ayarlar

- `Access-Control-Allow-Origin: same-origin` standart değil (`next.config.ts:203-206`). Dinamik origin veya `'*'` ile uyumlu yapı gerekli.
- Prod’da `script-src 'unsafe-inline'` mevcut (`next.config.ts:166-170`). Nonce/sha tabanlı CSP önerilir.

4. Login sayfası `searchParams` tipi hatalı

- `searchParams?: Promise<{ redirect?: string }>` ve `await` kullanımı Next App Router semantiği ile uyumsuz (`src/app/login/page.tsx:4-11`).

5. Yetkilendirme (permission) kontrolleri sunucu tarafında tutarlı değil

- İzinler client store’da var (`src/stores/authStore.ts:278-305`), API route’larda permission guard örnekleri görülmedi.

6. Observability yapılandırması eksik

- Sentry entegrasyonu var (`next.config.ts:436-440`, `src/lib/logger.ts:159-164`), ancak `SENTRY_DSN` ve required env’ler belirsiz; hata yakalamaları devre dışı olabilir.

7. Ortam değişkenleri dokümantasyonu/yerelleştirme

- `NEXT_PUBLIC_CONVEX_URL` zorunlu (`src/lib/convex/client.ts:4`). Lokal `.env.local` yönergeleri net değil.
- Uygulama Türkçe; i18n altyapısı yok (örn. `next-intl`).

## Gereksiz/Geliştirilebilir Öğeler

1. Muhtemelen kullanılmayan dev bağımlılıklar

- `jest`: test runner olarak kullanılmıyor (Vitest kullanılıyor).
- `kill-port`: kodda referans yok.
- `rollup-plugin-analyzer`: referans yok.
- `dotenv`: Next tarafında çoğu durumda gereksiz; kod referansı yok (CLI/testlerde gereksinim varsa netleştirilebilir).

2. Çift/tekrarlı güvenlik util’leri

- `src/lib/csrf.ts` ve `src/lib/security.ts` içinde ayrı CSRF sınıfları var; tek bir doğrulama yoluna indirgenmeli.

3. Header sertliği ile üçüncü parti entegrasyon riskleri

- `Cross-Origin-Embedder-Policy: require-corp` + uzaktan görseller devre dışı (`next.config.ts:91-95`), ileride harici kaynaklar kullanılırsa sorun çıkarabilir; kontrollü gevşetme gerekebilir.

## İyileştirme Planı

### Faz 1: Güvenlik Sertleştirme

- CSRF doğrulaması ekle: Login ve state-değiştiren tüm API route’larda `x-csrf-token` ile cookie/oturumdaki token karşılaştırması (`src/lib/csrf.ts:28`).
- Sunucu-side oturum doğrulama: `initializeAuth` başlangıcında `GET /api/auth/session` çağrısı (`src/app/api/auth/session/route.ts:9-50`) ile expire kontrolü; başarısızsa local storage temizle.
- Route koruması: `middleware.ts` ile `(dashboard)` altındaki path’ler için cookie tabanlı guard ve login’e redirect.
- Permission guard: API route’lar için kullanıcı izin kontrolü wrapper’ı (örn. `withAuthAndPermissions(handler, requiredPerms)`).

### Faz 2: Header ve Konfig İyileştirme

- CORS: `Access-Control-Allow-Origin` dinamik origin veya yapıdan kaldırma; yalnızca gerekli API’lara özel CORS.
- CSP: Prod’da `unsafe-inline` yerine nonce/sha tabanlı politika; kritik inline script’lere `next/script` ile nonce ekleme.

### Faz 3: Kod Sağlığı ve Bağımlılıklar

- Kullanılmayan devDep’ler kaldırma: `jest`, `kill-port`, `rollup-plugin-analyzer`, `dotenv` (gerçek kullanım yoksa).
- CSRF util’lerini birleştirme: `src/lib/csrf.ts` tek kaynak; `src/lib/security.ts` içindeki CSRF sınıfını kaldırma.
- Login `searchParams` tip düzeltmesi: `searchParams?: { redirect?: string }` ve senkron kullanım (`src/app/login/page.tsx:4-11`).

### Faz 4: Observability ve Geliştirici Deneyimi

- Sentry: `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` env’lerini prod’da doğrula; örnek .env rehberi.
- i18n: Metinleri message kataloglarına taşıma; rollere/hatalara çok dilli destek.

### Doğrulama

- Unit: CSRF validator ve permission guard testleri (Vitest).
- Integration: `auth/login` ve `auth/session` akış testleri; rate limit ve lockout senaryoları.
- E2E: Middleware ile korunan route’larda login gerekli olduğunun doğrulanması (Playwright).

Onay verirsen, yukarıdaki fazları uygulayıp PR’a hazır değişiklikler olarak sunacağım.
