# Kafkasder Panel

Dernek Yonetim Sistemi - Next.js 16 + Convex

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/Vadalov/Kafkasder-panel?utm_source=oss&utm_medium=github&utm_campaign=Vadalov%2FKafkasder-panel&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

Modern, guvenli ve olceklenebilir dernek yonetim platformu.

## Ozellikler

- **Ihtiyac Sahibi Yonetimi**: Kapsamli kategorizasyon ve takip
- **Bagis Takibi**: Kumbara sistemi ile tasarruf yonetimi
- **Burs Yonetimi**: Ogrenci ve burs basvuru takibi
- **Toplanti Yonetimi**: Kararlar ve aksiyon takibi
- **Gorev Otomasyonu**: Is akisi ve bildirimler
- **Coklu Kanal Iletisim**: WhatsApp, SMS, Email entegrasyonu
- **Finansal Dashboard**: Gelir-gider raporlama
- **Guvenlik**: 2FA, CSRF korumasi, rate limiting

## Hizli Baslangic

### Gereksinimler

- Node.js >= 20.9.0
- npm >= 9.0.0
- Convex hesabi

### Kurulum

```bash
# Repo'yu klonla
git clone https://github.com/Vadalov/Kafkasder-panel.git
cd Kafkasder-panel

# Bagimliliklari yukle
npm install

# Environment variables ayarla
cp .env.example .env.local
# .env.local dosyasini duzenle

# Convex ve Next.js'i baslat (ayri terminallerde)
npm run convex:dev
npm run dev
```

Uygulama `http://localhost:3000` adresinde calisacaktir.

## Temel Komutlar

```bash
# Development
npm run dev              # Development server
npm run convex:dev       # Convex backend

# Kod Kalitesi
npm run typecheck        # TypeScript kontrolu
npm run lint             # ESLint kontrolu
npm run format           # Prettier formatlama

# Test
npm run test             # Unit testleri
npm run test:e2e         # E2E testleri

# Build & Deploy
npm run build            # Production build
npm run convex:deploy    # Convex deploy
npm run vercel:prod      # Vercel deploy
```

## Proje Yapisi

```
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React componentleri
│   ├── lib/              # Utility fonksiyonlari
│   ├── hooks/            # Custom hooks
│   ├── stores/           # State yonetimi
│   └── types/            # TypeScript types
├── convex/               # Backend (Convex)
├── e2e/                  # E2E testleri
└── docs/                 # Teknik dokumantasyon
```

## Dokumantasyon

| Dosya                                          | Icerik               |
| ---------------------------------------------- | -------------------- |
| [docs/](./docs/)                               | Teknik dokumantasyon |
| [docs/deployment.md](./docs/deployment.md)     | Deployment rehberi   |
| [docs/testing.md](./docs/testing.md)           | Test rehberi         |
| [docs/api-patterns.md](./docs/api-patterns.md) | API standartlari     |
| [CONTRIBUTING.md](./CONTRIBUTING.md)           | Katki rehberi        |
| [SECURITY.md](./SECURITY.md)                   | Guvenlik politikasi  |

## Teknoloji Yigini

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Convex (serverless database)
- **UI**: Radix UI + Tailwind CSS 4
- **State**: Zustand + TanStack Query
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel + Convex Cloud

## Environment Variables

```env
# Zorunlu
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CSRF_SECRET=your-32-char-secret
SESSION_SECRET=your-32-char-secret

# Opsiyonel
SENTRY_DSN=https://your-sentry-dsn
SMTP_HOST=smtp.example.com
TWILIO_ACCOUNT_SID=your-sid
```

Detaylar icin `.env.example` dosyasina bakin.

## Guvenlik

- CSRF Korumasi
- Rate Limiting
- Input Validation (Zod)
- XSS Korumasi
- 2FA Destegi

Guvenlik aciklarini bildirmek icin [SECURITY.md](./SECURITY.md) dosyasina bakin.

## Katki

1. Fork'layin
2. Feature branch olusturun (`git checkout -b feature/ozellik`)
3. Commit'leyin (`git commit -m 'feat: yeni ozellik'`)
4. Push'layin (`git push origin feature/ozellik`)
5. Pull Request acin

Detaylar icin [CONTRIBUTING.md](./CONTRIBUTING.md) dosyasina bakin.

## Lisans

MIT License - [LICENSE](./LICENSE) dosyasina bakin.

## Linkler

- [GitHub Repository](https://github.com/Vadalov/Kafkasder-panel)
- [Issues](https://github.com/Vadalov/Kafkasder-panel/issues)
- [Security Advisories](https://github.com/Vadalov/Kafkasder-panel/security)
