# Dernek Yönetim Sistemi

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Convex](https://img.shields.io/badge/Convex-Database-orange.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

Türkçe olarak geliştirilmiş, **yardım dernekleri, vakıflar ve sivil toplum kuruluşları** için profesyonel bir yönetim platformu.

> **v1.0.0 Production Release** - İlk stabil sürüm yayında! 🎉
> 
> **Demo Mode:** Analitik ve bazı finansal raporlar demo data kullanmaktadır. v1.1.0'da gerçek API entegrasyonu tamamlanacaktır. Detaylar için [docs/TODO.md](docs/TODO.md) dosyasına bakın.

## 🚀 Özellikler

### Çekirdek Modüller
- ✅ **Kimlik Doğrulama** - Email/şifre, RBAC, CSRF koruması
- ✅ **İhtiyaç Sahipleri** - Başvuru ve takip sistemi
- ✅ **Bağış Yönetimi** - Standart bağışlar + kumbara sistemi (GPS takipli)
- ✅ **Burs Sistemi** - Öğrenci ve yetim burs programları
- ✅ **Finansal Yönetim** - Gelir-gider takibi, raporlar
- ✅ **İş Yönetimi** - Görev ve toplantı yönetimi
- ✅ **İletişim** - Kurum içi mesajlaşma, toplu SMS/e-posta

### Gelişmiş Özellikler
- 📊 Analitik ve raporlama dashboard'u
- 📈 Performans izleme (Web Vitals)
- 🧠 Akıllı API cache sistemi
- 🔒 Veri güvenliği (TC maskeleme, CSRF, rate limiting)

## 🛠️ Teknoloji Stack

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion  
**Backend:** Convex (real-time database), Next.js API Routes  
**State:** Zustand, TanStack Query  
**Security:** CSRF protection, Rate limiting, Sentry

## 📋 Gereksinimler

- Node.js 20.9.0+
- npm 9.0.0+ veya pnpm
- Convex hesabı
- (Opsiyonel) Sentry hesabı

## 🔧 Kurulum

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/your-username/dernek-yonetim-sistemi.git
cd dernek-yonetim-sistemi
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Environment Variables
```bash
cp .env.example .env.local
```

Gerekli değişkenler için [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) dosyasına bakın.

### 4. Convex Setup
```bash
npm install -g convex
npx convex dev
```

### 5. Uygulamayı Başlatın
```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 📝 Proje Yapısı

```
src/
├── app/                    # Next.js App Router (pages & API)
├── components/            # React componentleri
│   ├── ui/               # Temel UI bileşenleri
│   └── layouts/          # Layout bileşenleri
├── lib/                   # Utility kütüphaneleri
├── stores/               # Zustand state yönetimi
├── types/                # TypeScript tipleri
└── config/               # Yapılandırma dosyaları
convex/                   # Convex backend (schema, queries, mutations)
docs/                     # Dokümantasyon
e2e/                      # Playwright E2E testleri
```

## 🧪 Test

```bash
# Birim testleri
npm test

# E2E testleri
npm run e2e

# Test coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Önerilen)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
# Production build
npm run build

# Convex deploy
npx convex deploy

# Vercel deploy
npm run vercel:prod
```

Detaylı deployment rehberi için [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) dosyasına bakın.

## 🔒 Güvenlik

- **CSRF Koruması** - Tüm form gönderimlerinde
- **Rate Limiting** - API endpoint'lerinde
- **Veri Maskeleme** - TC kimlik ve hassas bilgiler
- **Input Validasyonu** - Zod ile tüm girişler
- **Error Tracking** - Sentry entegrasyonu

## 📊 Dokümantasyon

- [API Dokümantasyonu](docs/API.md)
- [TODO ve Roadmap](docs/TODO.md)
- [Environment Variables](docs/ENVIRONMENT.md)
- [Deployment Rehberi](docs/DEPLOYMENT.md)
- [Katkı Kılavuzu](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını okuyun.

**Hızlı Katkı:**
1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 🐛 Sorun Bildirme

Sorun bulduğunuzda [Issues](https://github.com/your-username/dernek-yonetim-sistemi/issues) sekmesinden bildirebilirsiniz.

## 📞 Destek

- **Dokümantasyon:** [Wiki](https://github.com/your-username/dernek-yonetim-sistemi/wiki)
- **Issues:** [GitHub Issues](https://github.com/your-username/dernek-yonetim-sistemi/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/dernek-yonetim-sistemi/discussions)

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/)
- [Convex](https://convex.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tüm katkıda bulunanlar](https://github.com/your-username/dernek-yonetim-sistemi/graphs/contributors)

---

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**
