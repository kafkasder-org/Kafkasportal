# Proje TODO Listesi

Son güncelleme: 2025-11-11

## 🔴 Yüksek Öncelik

### 1. Email Servisi Entegrasyonu
**Dosya:** `src/lib/error-notifications.ts:159`  
**Durum:** Planlanmış  
**Açıklama:** Error notification'lar için email servisi entegre edilmeli.  
**Detaylar:**
- Mevcut email servisi kullanılacak
- Critical error'larda admin'lere otomatik email gönderimi
- Email template'leri hazırlanmalı

**İlgili Dosyalar:**
- `src/lib/services/email.ts` (varsa)
- `src/lib/error-notifications.ts`

---

### 2. Telefon Numarası Yönetimi
**Dosya:** `src/app/api/messages/[id]/route.ts:186`  
**Durum:** Gerekli  
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

## 🟡 Orta Öncelik

### 3. Export Functionality
**Dosya:** `src/app/(dashboard)/financial-dashboard/page.tsx:101`  
**Durum:** Planlanmış  
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

### 4. Parameters API Implementation
**Dosya:** `src/lib/api/index.ts:27`  
**Durum:** Kısmi  
**Açıklama:** Parametreler API'si tam olarak implement edilmeli veya kullanımdan kaldırılmalı.  
**Detaylar:**
- Şu an placeholder implementation var
- Component'lerde kullanımı kontrol edilmeli
- Ya tam implement et ya da kaldır

**Alternatif:**
- Convex system settings direkt kullanılabilir
- Ayrı parametersApi'ye gerek olmayabilir

---

### 5. Döküman Sayısı
**Dosya:** `src/app/(dashboard)/yardim/ihtiyac-sahipleri/[id]/page.tsx:508`  
**Durum:** Mock  
**Açıklama:** İhtiyaç sahibi detay sayfasında döküman sayısı gerçek veriden alınmalı.  
**Detaylar:**
```typescript
// Şu anki durum:
count: 0, // TODO: Get actual document count

// Önerilen:
count: documents?.filter(d => d.beneficiaryId === id).length || 0
```

---

## 🟢 Düşük Öncelik

### 6. İki Faktörlü Doğrulama
**Dosya:** `convex/two_factor_auth.ts`  
**Durum:** Hazır ama kullanımda değil  
**Açıklama:** 2FA backend hazır ama frontend integration eksik.

---

## ✅ Tamamlanan İyileştirmeler

- [x] Kullanılmayan UI componentler silindi (sparkles, text-hover-effect, vb.)
- [x] Gereksiz dependency'ler temizlendi (@tsparticles, motion, tw-animate-css)
- [x] optimization-t geçici dosyası silindi

---

## 📝 Notlar

### Mock Data Kullanımı
Şu sayfalarda mock/sabit data kullanılıyor:
- `src/app/(dashboard)/genel/page.tsx` - Dashboard stats (lines 114-153)
  - Stats değerleri sabit
  - Chart data mock (donationData, categoryData)

**Öneri:** Bu veriler gerçek API'lerden alınmalı veya "Demo Mode" olarak işaretlenmeli.

---

## 🔧 Geliştirme Sırası Önerisi

1. **Faz 1:** Telefon numarası yapısını belirle → SMS sistemi tam çalışsın
2. **Faz 2:** Export functionality ekle → Kullanıcılar rapor alabilsin  
3. **Faz 3:** Email servisi entegre et → Error tracking tamamlansın
4. **Faz 4:** Mock data'yı gerçek API'lere bağla → Production ready
5. **Faz 5:** 2FA frontend ekle → Güvenlik tamamlansın
