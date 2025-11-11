# Dernek Yönetim Sistemi

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Convex](https://img.shields.io/badge/Convex-Database-orange.svg)

Türkçe olarak geliştirilmiş, **yardım dernekleri, vakıflar ve sivil toplum kuruluşları** için profesyonel bir yönetim platformu.

## 🚀 Özellikler

### Çekirdek Modüller
- ✅ **Kimlik Doğrulama ve Yetkilendirme** - Email/şifre giriş, RBAC, CSRF koruması
- ✅ **İhtiyaç Sahipleri Yönetimi** - Detaylı kişisel bilgi kaydı, başvuru takibi
- ✅ **Bağış Yönetimi** - Standart bağışlar, kumbara sistemi (GPS konum takibi)
- ✅ **Burs Sistemi** - Öğrenci kayıtları, yetim burs programı
- ✅ **Finansal Yönetim** - Gelir-gider takibi, mali raporlar, çoklu para birimi
- ✅ **İş Yönetimi** - Görev atama, toplantı planlama, eylem öğesi takibi
- ✅ **İletişim Sistemi** - Kurum içi mesajlaşma, toplu SMS/e-posta

### Gelişmiş Özellikler
- 📊 **Analitik ve Raporlama** - Dashboard istatistikleri, grafiksel raporlar
- 📈 **Performans İzleme** - Gerçek zamanlı FPS monitoring, Web Vitals takibi
- 🧠 **Gelişmiş Cache Sistemi** - Akıllı API response caching, prefetching
- 🔒 **Güvenlik Özellikleri** - TC kimlik maskeleme, hassas veri koruması

## 🛠️ Teknoloji Yığını

### Frontend
- **Next.js 14** - React tabanlı full-stack framework
- **React 18** - Kullanıcı arayüzü kütüphanesi
- **TypeScript** - Tip güvenliği sağlayan programlama dili
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animasyon ve geçiş efektleri
- **Lucide React** - İkon kütüphanesi
- **Recharts** - Grafik ve chart bileşenleri

### Backend & Veritabanı
- **Convex** - Gerçek zamanlı veritabanı ve backend platformu
- **Next.js API Routes** - RESTful API endpoint'leri
- **PostgreSQL** (Convex üzerinden) - İlişkisel veritabanı

### Durum Yönetimi & Cache
- **Zustand** - Hafif durum yönetimi kütüphanesi
- **@tanstack/react-query** - Veri fetching ve caching
- **Özel Smart Cache sistemi** - Gelişmiş API response caching

### Güvenlik & İzleme
- **CSRF koruması** - Cross-site request forgery önlemi
- **Rate limiting** - API istek sınırlaması
- **Sentry** - Hata takip ve performans izleme
- **Özel logger sistemi** - Detaylı loglama ve maskeleme

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya pnpm
- Convex hesabı ve API anahtarları
- Modern web tarayıcısı

## 🔧 Kurulum

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/your-username/dernek-yonetim-sistemi.git
cd dernek-yonetim-sistemi
```

### 2. Bağımlılıkları Yükleyin
```bash
# npm kullanıyorsanız
npm install

# pnpm kullanıyorsanız
pnpm install
```

### 3. Ortam Değişkenlerini Yapılandırın
```bash
cp .env.example .env.local
```

`.env.local` dosyasını açın ve aşağıdaki değişkenleri doldurun:

```env
# Convex Configuration
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Sentry (Opsiyonel)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=
RATE_LIMIT_WINDOW_MS=

# CSRF
CSRF_SECRET=
```

### 4. Convex Veritabanını Kurun
```bash
# Convex CLI'yı yükleyin (henüz yüklü değilse)
npm install -g convex

# Convex development sunucusunu başlatın
npx convex dev
```

### 5. Uygulamayı Başlatın
```bash
# Geliştirme sunucusu
npm run dev
# veya
pnpm dev

# Üretim build'i
npm run build
npm start
# veya
pnpm build
pnpm start
```

Uygulama başarıyla başlatıldığında: [http://localhost:3000](http://localhost:3000) adresinde erişilebilir olacaktır.

## 📝 Geliştirme Talimatları

### Proje Yapısı
```
src/
├── app/                    # Next.js App Router yapısı
│   ├── (dashboard)/       # Dashboard layout ve sayfalar
│   ├── api/               # API route'ları
│   └── login/             # Giriş sayfası
├── components/            # Yeniden kullanılabilir UI bileşenleri
│   ├── ui/               # Temel UI bileşenleri
│   └── layouts/          # Layout bileşenleri
├── lib/                   # Yardımcı kütüphaneler
│   ├── performance-monitor.tsx  # Performans izleme sistemi
│   └── api-cache.ts      # Gelişmiş caching sistemi
├── stores/               # Zustand durum yönetimi
├── types/                # TypeScript tip tanımlamaları
└── config/               # Yapılandırma dosyaları
```

### Kod Kalitesi
- **ESLint** ve **Prettier** otomatik olarak çalışır
- **TypeScript** ile tip güvenliği sağlanmıştır
- **Husky** pre-commit hook'ları ile kod kalitesi korunur

### Test
```bash
# Birim testleri
npm run test
# veya
pnpm test

# E2E testler
npm run test:e2e
# veya
pnpm test:e2e

# Test coverage
npm run test:coverage
# veya
pnpm test:coverage
```

### Performans İzleme
Uygulama performansını gerçek zamanlı olarak izlemek için:
- Dashboard'da sağ üst köşedeki performans panelini açın
- Web Vitals metriklerini görüntüleyin
- Memory usage ve FPS monitoring verilerini takip edin

## 🔒 Güvenlik

### Uygulanan Güvenlik Önlemleri
- **CSRF Koruması** - Tüm form gönderimlerinde otomatik koruma
- **Rate Limiting** - API isteklerinde otomatik sınırlama
- **Veri Maskeleme** - TC kimlik numarası gibi hassas bilgiler otomatik maskelenir
- **Input Validasyonu** - Tüm kullanıcı girişleri doğrulanır
- **Error Tracking** - Sentry ile hata takibi ve güvenlik uyarıları

### Güvenlik Önerileri
- Güçlü şifre politikaları uygulayın
- Düzenli olarak bağımlılıkları güncelleyin
- Production ortamında debug modunu kapatın
- Hassas verileri loglarken dikkatli olun

## 📊 Raporlama ve Analitik

### Mevcut Raporlar
- **Bağış Raporları** - Aylık/yıllık bağış istatistikleri
- **Burs Raporları** - Bursiyer ve ödeme takibi
- **Finansal Raporlar** - Gelir-gider tabloları
- **Kullanıcı Aktivite Raporları** - Sistem kullanım istatistikleri

### Özelleştirilebilir Dashboard
- Drag-and-drop widget sistemi
- Grafiksel veri görselleştirme
- Filtreleme ve sıralama seçenekleri
- Export (PDF/Excel) özellikleri

## 🚀 Deployment

### Vercel ile Deploy (Önerilen)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/dernek-yonetim-sistemi)

### Manuel Deploy
```bash
# Production build oluştur
npm run build

# Convex migration'ları çalıştır
npx convex deploy

# Ortam değişkenlerini yapılandırın
# Deploy script'ini çalıştırın
```

### Docker Deploy (Yakında)
```bash
# Docker image oluştur
docker build -t dernek-yonetim-sistemi .

# Container'ı çalıştır
docker run -p 3000:3000 --env-file .env.local dernek-yonetim-sistemi
```

## 🤝 Katkıda Bulunma

### Katkı Süreci
1. Fork yapın
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

### Kod Stili
- **Conventional Commits** kullanın
- **TypeScript** tip tanımlamalarına dikkat edin
- **Component-based** mimariyi koruyun
- **Test** yazmayı unutmayın

### Katkı Türleri
- 🐛 **Bug Raporları** - Issues sekmesinden bildirin
- 💡 **Feature Önerileri** - Yeni özellik fikirleri
- 📚 **Dokümantasyon** - README ve wiki iyileştirmeleri
- 🌍 **Çeviri** - Multi-language desteği
- 🔧 **Kod Katkısı** - Yeni özellikler ve bug düzeltmeleri

## 🐛 Sorun Bildirme

Bir sorun mu buldunuz? Lütfen şu adımları izleyin:

1. **Issues** sekmesine gidin
2. Yeni bir issue oluşturun
3. Aşağıdaki bilgileri ekleyin:
   - Sorunun açıklaması
   - Adımlarla tekrar üretme talimatları
   - Beklenen vs gerçek davranış
   - Ekran görüntüleri (varsa)
   - Ortam bilgileri (tarayıcı, işletim sistemi)

## 📞 Destek

- **Dokümantasyon** - [Wiki](https://github.com/your-username/dernek-yonetim-sistemi/wiki)
- **Issues** - [GitHub Issues](https://github.com/your-username/dernek-yonetim-sistemi/issues)
- **Discussions** - [GitHub Discussions](https://github.com/your-username/dernek-yonetim-sistemi/discussions)

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - Harika framework için
- [Convex](https://convex.dev/) - Gerçek zamanlı veritabanı çözümü
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework'ü
- [Tüm katkıda bulunanlar](CONTRIBUTORS.md)

## 📈 Proje Durumu

- ✅ **Aktif Geliştirme** - Sürekli yeni özellikler ekleniyor
- ✅ **Production Ready** - Canlı ortamda kullanılıyor
- ✅ **Topluluk Desteği** - Açık kaynak topluluğu tarafından destekleniyor

---

**⭐ Bu projeyi beğendiyseniz, lütfen yıldız verin!**