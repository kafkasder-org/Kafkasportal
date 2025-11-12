# Değişiklik Günlüğü

Tüm önemli değişiklikler bu dosyada belirtilecektir.

Biçim [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standardına uyar,
ve bu proje [Semantic Versioning](https://semver.org/spec/v2.0.0.html) kullanır.

## [1.0.0] - 2025-11-12

### Eklendi
- **Demo Mode Göstergesi** - Mock data kullanan sayfalarda belirgin uyarı banner'ı
- **Production-Safe Logging** - Tüm console.log kullanımları development guard'ı ile korundu
- **Kapsamlı Error Tracking** - Sentry entegrasyonu tam çalışır durumda
- **Production Health Check** - `/api/health` endpoint ile sistem durumu izleme
- **CSRF Protection** - Tüm state-changing işlemlerde CSRF koruması aktif
- **Development Endpoint Koruma** - `/api/auth/dev-login` production'da 404 döndürüyor
- **docs/TODO.md** - v1.1.0 roadmap ve planlanan özellikler dokümante edildi
- **docs/ENVIRONMENT.md** - Environment variables için kapsamlı rehber
- **docs/DEPLOYMENT.md** - Vercel, Docker ve VPS deployment rehberleri

### Değişti
- **README.md** - Production-ready hale getirildi, demo mode bilgisi eklendi
- **package.json** - Deployment scripts basitleştirildi (shell scriptler kaldırıldı)
- **TODO yorumları** - Daha açıklayıcı ve docs/TODO.md'ye referans veriyor
- **Logging sistemi** - Production-safe, sadece gerekli error'lar loglanıyor
- **Test coverage** - Kritik akışlar stabilize edildi

### Kaldırıldı
- **Kullanılmayan UI componentleri** (4 dosya)
  - `src/components/ui/sparkles.tsx`
  - `src/components/ui/text-hover-effect.tsx`
  - `src/components/ui/animated-gradient.tsx`
  - `src/components/ui/background-pattern.tsx`
- **Gereksiz npm paketleri** (5 paket)
  - `@tsparticles/engine`, `@tsparticles/react`, `@tsparticles/slim`
  - `motion` (framer-motion kullanılıyor)
  - `tw-animate-css` (animasyonlar globals.css'te)
- **Geçici dosya**: `optimization-t`
- **Shell script referansları** - package.json'dan kaldırıldı

### Güvenlik
- npm audit temizlendi (0 high/critical vulnerabilities)
- Development endpoints production'da korunuyor
- CSRF ve rate limiting aktif
- Sentry error tracking ile güvenlik ihlalleri izleniyor

### Bilinen Kısıtlamalar
- **Demo Mode Sayfaları** - Aşağıdaki sayfalar demo data kullanıyor (v1.1.0'da güncellenecek):
  - Analitik dashboard (tüm chart'lar)
  - Genel dashboard (stats widget'ları ve chart'lar)
  - Finansal raporlar sayfası
  - Gelir-gider kayıtları sayfası
- **Email/SMS servisleri** - Henüz aktif değil (v1.1.0 roadmap)
- **Export functionality** - PDF/Excel export henüz implement edilmedi (v1.1.0 roadmap)

### Dokümante Edildi
- Mock data kullanımı her sayfada belirgin banner ile işaretlendi
- v1.1.0 roadmap ve öncelikler belirlendi
- Production deployment rehberi tamamlandı
- Environment variables tam dokümante edildi

---

## [0.1.0] - 2024-01-XX (Önceki Sürümler)

### Eklendi
- Proje başlatıldı
- Temel proje yapısı oluşturuldu
- Next.js + TypeScript + Tailwind CSS + Convex kurulumu
- Kimlik doğrulama ve yetkilendirme sistemi
- İhtiyaç sahipleri yönetimi
- Bağış yönetimi (standart bağışlar + kumbara sistemi)
- Burs yönetim sistemi
- Finansal yönetim modülü
- İş yönetimi (görevler ve toplantılar)
- İletişim sistemi
- Analitik ve raporlama dashboard'u
- Performans izleme sistemi
- Gelişmiş cache sistemi
- Responsive tasarım
- Test altyapısı (birim ve E2E testler)

### Güvenlik
- CSRF koruması eklendi
- Rate limiting implemente edildi
- Veri maskeleme sistemi oluşturuldu
- Güvenlik audit log'ları eklendi

---

## 📋 Sembol Açıklamaları

- `Eklendi` - Yeni özellikler
- `Değişti` - Mevcut özelliklerde değişiklik
- `Kaldırıldı` - Kaldırılan özellikler
- `Güvenlik` - Güvenlikle ilgili değişiklikler
- `Hata Düzeltmeleri` - Bug fix'ler

## 🏷️ Etiketleme

Git etiketleri şu formatta:
```bash
git tag -a v1.0.0 -m "Version 1.0.0 - First stable release"
git push origin v1.0.0
```

## 📈 Sürüm Geçmişi

- **v1.0.0** - İlk stabil sürüm (Production ready with demo mode)
- **v0.1.0** - İlk geliştirme sürümü