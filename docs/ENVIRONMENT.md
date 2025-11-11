# Environment Variables Rehberi

Bu dokümantasyon, proje için gerekli tüm environment variables'ları açıklar.

## 📋 Gerekli Değişkenler

### Convex Configuration

```env
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

**Nasıl Alınır:**
1. [Convex Dashboard](https://dashboard.convex.dev/) üzerinden proje oluşturun
2. Settings > Deployment URL kısmından alın
3. `npx convex dev` komutu otomatik olarak `.env.local` dosyasını oluşturur

---

### Authentication

```env
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**NEXTAUTH_SECRET Oluşturma:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Production için:**
```env
NEXTAUTH_URL=https://yourdomain.com
```

---

### CSRF Protection

```env
CSRF_SECRET=another-random-secret-32-chars
```

**Oluşturma:** NEXTAUTH_SECRET ile aynı yöntemle oluşturulur.

---

## 🔧 Opsiyonel Değişkenler

### Sentry (Error Tracking)

```env
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=your-auth-token
```

**Nasıl Alınır:**
1. [Sentry.io](https://sentry.io/) hesabı oluşturun
2. Yeni proje oluşturun (Next.js)
3. Settings > Client Keys (DSN) bölümünden DSN'i alın
4. Settings > Auth Tokens'dan token oluşturun

---

### Rate Limiting

```env
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

**Varsayılan Değerler:**
- `MAX_REQUESTS`: 100 (1 dakikada maksimum istek)
- `WINDOW_MS`: 60000 (1 dakika = 60000ms)

**Production Önerisi:**
```env
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=60000
```

---

### SMS/Email Servisleri

#### Twilio (SMS)
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Nasıl Alınır:**
1. [Twilio Console](https://console.twilio.com/)
2. Account Info'dan SID ve Token alın
3. Phone Numbers'dan bir numara satın alın

#### Nodemailer (Email)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com
```

**Gmail için App Password:**
1. Google Account > Security
2. 2-Step Verification'ı aktifleştirin
3. App passwords bölümünden yeni şifre oluşturun

---

### Google Maps (Kumbara Lokasyon)

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Nasıl Alınır:**
1. [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services > Credentials
3. Create credentials > API key
4. Maps JavaScript API'yi etkinleştirin

---

## 📁 Dosya Yapısı

```
.env.local          # Local development (gitignore'da)
.env.example        # Template dosya (git'e commit edilir)
.env.production     # Production variables (Vercel/host'ta)
```

### .env.local Örneği

```env
# Convex
CONVEX_DEPLOYMENT=dev-dernek-12345
NEXT_PUBLIC_CONVEX_URL=https://dev-dernek-12345.convex.cloud

# Auth
NEXTAUTH_SECRET=super-secret-key-32-chars-long
NEXTAUTH_URL=http://localhost:3000
CSRF_SECRET=another-super-secret-key-here

# Sentry (opsiyonel)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Twilio (opsiyonel)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Email (opsiyonel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=

# Google Maps (opsiyonel)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## 🔒 Güvenlik Best Practices

### ✅ Yapılması Gerekenler

1. **Asla commit etmeyin:**
   - `.env.local` dosyasını git'e eklemeyin
   - Gerçek secret'ları paylaşmayın

2. **Güçlü secret'lar kullanın:**
   - En az 32 karakter
   - Rastgele oluşturun (yukarıdaki komutları kullanın)

3. **Production'da farklı secret'lar:**
   - Development ve production için farklı değerler kullanın
   - Production secret'larını KMS/Vault'ta saklayın

4. **Değişkenleri validate edin:**
   - Proje zaten `src/lib/env-validation.ts` ile validate ediyor
   - Eksik değişken olursa uygulama başlamaz

### ❌ Yapılmaması Gerekenler

1. Hardcoded secret'lar
2. Weak/basit şifreler
3. Public repository'de .env dosyaları
4. Production secret'larını log'lara yazdırmak

---

## 🚀 Vercel Deployment

Vercel'de environment variables ayarlama:

1. Project Settings > Environment Variables
2. Yukarıdaki değişkenleri ekleyin
3. Environment seçin (Production/Preview/Development)
4. Save

**Not:** `NEXT_PUBLIC_` ile başlayan değişkenler client-side'da görünür olur!

---

## 🧪 Test Environment

Test için ayrı değişkenler:

```env
# .env.test
CONVEX_DEPLOYMENT=test-dernek-12345
NEXT_PUBLIC_CONVEX_URL=https://test-dernek-12345.convex.cloud
NEXTAUTH_SECRET=test-secret-for-ci-only
NEXTAUTH_URL=http://localhost:3000
```

---

## ❓ Sorun Giderme

### "CONVEX_DEPLOYMENT is not defined"
```bash
# Convex'i yeniden initialize edin
npx convex dev
```

### "Invalid NEXTAUTH_SECRET"
```bash
# Yeni secret oluşturun
openssl rand -base64 32
```

### "Rate limit errors in development"
```env
# Limitleri artırın
RATE_LIMIT_MAX_REQUESTS=1000
```

---

## 📚 İlgili Dokümantasyon

- [Convex Environment Variables](https://docs.convex.dev/production/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
