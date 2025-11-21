# Kafkasder Panel

Dernek Yönetim Sistemi - Next.js 16 + Convex

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/Vadalov/Kafkasder-panel?utm_source=oss&utm_medium=github&utm_campaign=Vadalov%2FKafkasder-panel&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

Modern, güvenli ve ölçeklenebilir dernek yönetim platformu.

## 🚀 Özellikler

- **Modern Stack**: Next.js 16, React 19, TypeScript
- **Backend**: Convex (serverless database)
- **UI**: Radix UI + Tailwind CSS
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions
- **Auto-Merge**: Claude PR'ları otomatik merge edilir
- **Security**: 2FA, CSRF protection, rate limiting
- **Monitoring**: Sentry error tracking, analytics

## 📋 Gereksinimler

- Node.js >= 20.9.0
- npm >= 9.0.0
- Convex account (for backend)

## 🛠️ Kurulum

### 1. Repository'yi klonlayın

```bash
git clone https://github.com/Vadalov/Kafkasder-panel.git
cd Kafkasder-panel
```

### 2. Bağımlılıkları yükleyin

```bash
npm install
```

### 3. Environment variables ayarlayın

`.env.local` dosyası oluşturun (`.env.example` dosyasına bakın):

```env
# Convex Configuration (Required)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Authentication Secrets (Required in production)
CSRF_SECRET=your-32-character-minimum-secret-here
SESSION_SECRET=your-32-character-minimum-secret-here

# Optional: Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_DSN=https://your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Optional: Email Configuration (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@example.com

# Optional: SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Optional: Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Optional: File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB in bytes
MAX_FILES_PER_UPLOAD=5
```

### 4. Convex'i başlatın

```bash
npm run convex:dev
```

### 5. Development server'ı başlatın

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 🏗️ Mimari

### Tech Stack

- **Frontend Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 + Radix UI
- **Backend**: Convex (serverless, real-time database)
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Error Tracking**: Sentry
- **Deployment**: Vercel

### Proje Yapısı

```
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities & helpers
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand state stores
│   └── types/            # TypeScript types
├── convex/               # Convex backend functions
├── e2e/                  # Playwright E2E tests
└── public/               # Static assets
```

## 📝 Scripts

### Development

- `npm run dev` - Development server başlat
- `npm run convex:dev` - Convex development mode
- `npm run test` - Testleri watch mode'da çalıştır
- `npm run test:ui` - Test UI'ı aç

### Build & Production

- `npm run build` - Production build
- `npm run start` - Production server başlat
- `npm run deploy:vercel` - Vercel'e deploy et

### Code Quality

- `npm run lint` - ESLint kontrolü
- `npm run lint:fix` - ESLint hatalarını düzelt
- `npm run typecheck` - TypeScript tip kontrolü
- `npm run format` - Prettier ile formatla

### Testing

- `npm run test:run` - Testleri bir kez çalıştır
- `npm run test:coverage` - Coverage raporu oluştur
- `npm run test:e2e` - E2E testleri çalıştır
- `npm run e2e:ui` - Playwright UI modu

### Utilities

- `npm run clean` - Build cache temizle
- `npm run clean:all` - Tüm cache ve node_modules temizle
- `npm run analyze` - Bundle size analizi

## 🔧 Environment Variables

Detaylı environment variables listesi için `src/lib/env-validation.ts` dosyasına bakın.

### Zorunlu (Production)

- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `CSRF_SECRET` - CSRF koruması için secret (min 32 karakter)
- `SESSION_SECRET` - Session yönetimi için secret (min 32 karakter)

### Opsiyonel

- **Sentry**: Error tracking için
- **SMTP**: Email gönderimi için
- **Twilio**: SMS gönderimi için
- **Rate Limiting**: API rate limit ayarları
- **File Upload**: Dosya yükleme limitleri

## 🚀 Deployment

### Vercel (Önerilen)

```bash
# Vercel CLI ile
npm run deploy:vercel

# Veya GitHub'dan otomatik deploy
# Vercel GitHub integration aktif olduğunda otomatik deploy edilir
```

### Convex Deployment

```bash
# Production'a deploy
npm run convex:deploy
```

### Environment Variables (Production)

Production'da aşağıdaki environment variables'ları ayarlayın:

- Vercel Dashboard → Settings → Environment Variables
- Convex Dashboard → Settings → Environment Variables

## 🧪 Testing

### Unit Tests

```bash
# Watch mode
npm run test

# Single run
npm run test:run

# Coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Interactive UI
npm run e2e:ui
```

## 🔒 Güvenlik

- ✅ CSRF Protection
- ✅ Session Management
- ✅ Rate Limiting
- ✅ Input Validation (Zod)
- ✅ XSS Protection
- ✅ 2FA Support
- ✅ Secure File Upload

Güvenlik açıkları için [SECURITY.md](SECURITY.md) dosyasına bakın.

## 🤖 Auto-Merge

Claude ile yapılan PR'lar otomatik olarak merge edilir. Detaylar için [.github/AUTO_MERGE.md](.github/AUTO_MERGE.md) dosyasına bakın.

## 📚 Dokümantasyon

- [Improvement Roadmap](IMPROVEMENTS_ROADMAP.md) - İyileştirme planı
- [Security Policy](SECURITY.md) - Güvenlik politikası
- [Testing Guide](TESTING_GUIDE.md) - Test rehberi
- [Auto-Merge Guide](.github/AUTO_MERGE.md) - Auto-merge kullanımı

## 🐛 Troubleshooting

### Convex Bağlantı Sorunları

```bash
# Convex deployment URL'ini kontrol et
echo $NEXT_PUBLIC_CONVEX_URL

# Convex dev mode'u başlat
npm run convex:dev
```

### Build Hataları

```bash
# Cache temizle
npm run clean:all
npm install
npm run build
```

### Type Errors

```bash
# Type check çalıştır
npm run typecheck

# Type definitions güncelle
npm install @types/node @types/react @types/react-dom
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🔗 Linkler

- [GitHub Repository](https://github.com/Vadalov/Kafkasder-panel)
- [Security Advisories](https://github.com/Vadalov/Kafkasder-panel/security)
- [Issues](https://github.com/Vadalov/Kafkasder-panel/issues)
