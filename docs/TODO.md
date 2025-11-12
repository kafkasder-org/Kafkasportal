# Proje TODO Listesi

Son güncelleme: 2025-11-12

## 📊 v1.0.0 Production Release (Tamamlandı - 2025-11-12)

### ✅ Tamamlanan İyileştirmeler

**Kod Kalitesi:**
- [x] Kullanılmayan UI componentler silindi (sparkles, text-hover-effect, vb.)
- [x] Gereksiz dependency'ler temizlendi (@tsparticles, motion, tw-animate-css)
- [x] optimization-t geçici dosyası silindi
- [x] console.log temizliği yapıldı (production-safe logging)
- [x] Development endpoints korundu (NODE_ENV guard)
- [x] TODO/FIXME review tamamlandı

**Mock Data Yönetimi:**
- [x] Demo Mode implementasyonu tamamlandı
- [x] Analitik, finansal raporlar ve dashboard'da demo banners eklendi
- [x] `NEXT_PUBLIC_DEMO_MODE` environment variable desteği

**Test ve Kalite:**
- [x] Kritik testler stabilize edildi
- [x] Pre-commit hooks aktifleştirildi
- [x] npm audit temizlendi

**Dokümantasyon:**
- [x] CHANGELOG v1.0.0 güncellendi
- [x] README.md production-ready hale getirildi
- [x] TODO.md v1.1.0 roadmap eklendi

---

## 🔵 v1.1.0 Roadmap

### 🔴 Yüksek Öncelik

#### 1. Mock Data → Gerçek API Dönüşümü
**Dosyalar:**
- `src/app/(dashboard)/analitik/page.tsx` (tam mock)
- `src/app/(dashboard)/genel/page.tsx` (stats mock)
- `src/app/(dashboard)/fon/raporlar/page.tsx` (report data mock)
- `src/app/(dashboard)/fon/gelir-gider/page.tsx` (finance records mock)

**Durum:** v1.1.0'a planlandı  
**Açıklama:** Convex queries ile gerçek veri entegrasyonu yapılacak.  
**Detaylar:**
- Analytics: Convex'ten gerçek event/metrics data
- Dashboard stats: Gerçek beneficiary/donation/scholarship counts
- Financial reports: Convex finance_records'tan gerçek data
- Demo Mode'u kaldır veya opsiyonel yap

**Öncelik:** Bu tamamlanınca uygulama tam production-ready

---

#### 2. Email Servisi Entegrasyonu
**Dosya:** `src/lib/error-notifications.ts:159`  
**Durum:** v1.1.0'a planlandı  
**Açıklama:** Error notification'lar için email servisi entegre edilmeli.  
**Detaylar:**
- Mevcut email servisi kullanılacak
- Critical error'larda admin'lere otomatik email gönderimi
- Email template'leri hazırlanmalı

**İlgili Dosyalar:**
- `src/lib/services/email.ts` (varsa)
- `src/lib/error-notifications.ts`

---

#### 3. Telefon Numarası Yönetimi
**Dosya:** `src/app/api/messages/[id]/route.ts:186`  
**Durum:** v1.1.0'a planlandı  
**Açıklama:** Kullanıcı telefon numaraları için data structure belirlenmeli.  
**Detaylar:**
- Users tablosuna phone field eklenmeli veya
- Beneficiaries üzerinden phone bilgisi alınmalı
- SMS gönderimi için gerekli

**Veritabanı Değişikliği:**
```typescript
// Öneri: users schema'ya phone eklenmeli
phone?: string;
```

---

### 🟡 Orta Öncelik

#### 4. Export Functionality
**Dosya:** `src/app/(dashboard)/financial-dashboard/page.tsx:101`  
**Durum:** v1.1.0'a planlandı  
**Açıklama:** Finansal verileri PDF/Excel olarak export etme özelliği.  
**Detaylar:**
- PDF export için jsPDF kullanılabilir (zaten dependency'de var)
- Excel export için xlsx kütüphanesi eklenebilir
- Export formatları: PDF, Excel, CSV

**Örnek Implementation:**
```typescript
import { exportToPDF } from '@/lib/data-export';

const handleExport = () => {
  const data = {
    monthlyData,
    summary: {
      totalIncome,
      totalExpense,
      netBalance
    }
  };
  exportToPDF(data, 'mali-rapor.pdf');
};
```

---

#### 5. Parameters API Implementation
**Dosya:** `src/lib/api/index.ts:27`  
**Durum:** v1.1.0'a planlandı  
**Açıklama:** Parametreler API'si tam olarak implement edilmeli veya kullanımdan kaldırılmalı.  
**Detaylar:**
- Şu an placeholder implementation var
- Component'lerde kullanımı kontrol edilmeli
- Ya tam implement et ya da kaldır

**Alternatif:**
- Convex system settings direkt kullanılabilir
- Ayrı parametersApi'ye gerek olmayabilir

---

#### 6. Döküman Sayısı
**Dosya:** `src/app/(dashboard)/yardim/ihtiyac-sahipleri/[id]/page.tsx:508`  
**Durum:** v1.1.0'a planlandı  
**Açıklama:** İhtiyaç sahibi detay sayfasında döküman sayısı gerçek veriden alınmalı.  
**Detaylar:**
```typescript
// Şu anki durum:
count: 0, // TODO: Get actual document count

// Önerilen:
count: documents?.filter(d => d.beneficiaryId === id).length || 0
```

---

### 🟢 Düşük Öncelik

#### 7. İki Faktörlü Doğrulama
**Dosya:** `convex/two_factor_auth.ts`  
**Durum:** v1.1.0 veya sonrası  
**Açıklama:** 2FA backend hazır ama frontend integration eksik.

---

## 🔧 Geliştirme Sırası Önerisi (v1.1.0)

1. **Faz 1:** Mock data → Gerçek API dönüşümü → Production tam ready
2. **Faz 2:** Telefon numarası yapısını belirle → SMS sistemi tam çalışsın
3. **Faz 3:** Export functionality ekle → Kullanıcılar rapor alabilsin  
4. **Faz 4:** Email servisi entegre et → Error tracking tamamlansın
5. **Faz 5:** 2FA frontend ekle → Güvenlik tamamlansın

---

## 📝 Notlar

### v1.0.0 Demo Mode
v1.0.0 release'inde aşağıdaki sayfalar demo data kullanmaktadır:
- Analitik sayfası (tüm chart'lar)
- Genel dashboard (stats widget'ları ve chart'lar)
- Finansal raporlar
- Gelir-gider kayıtları

Her sayfada belirgin ⚠️ uyarı banner'ı eklenmiştir.

### v1.1.0 Hedefi
v1.1.0 ile birlikte tüm mock data gerçek Convex queries ile değiştirilecek ve uygulama tam production-ready olacaktır.
