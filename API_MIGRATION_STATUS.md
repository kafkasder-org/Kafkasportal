# API Routes Migration Status

## ✅ Appwrite Kullanan API Routes (Hazır)

Bu routes zaten Appwrite kullanıyor ve migration gerektirmiyor:

- ✅ `/api/beneficiaries` - Appwrite kullanıyor
- ✅ `/api/users` - Appwrite kullanıyor
- ✅ `/api/donations` - Appwrite kullanıyor
- ✅ `/api/tasks` - Appwrite kullanıyor
- ✅ `/api/meetings` - Appwrite kullanıyor
- ✅ `/api/messages` - Appwrite kullanıyor
- ✅ `/api/storage/upload` - Appwrite Storage kullanıyor
- ✅ `/api/aid-applications` - Appwrite kullanıyor (appwriteAidApplications)

## ⏳ Migration Gereken API Routes

Bu routes hala Convex kullanıyor ve Appwrite'a çevrilmeli:

### Yüksek Öncelik

1. **`/api/errors`** - ⚠️ **Kısmen Migrate Edildi**
   - ✅ `appwriteErrors` client eklendi
   - ✅ Create endpoint Appwrite desteği eklendi
   - ✅ List endpoint Appwrite desteği eklendi
   - ⚠️ Diğer error endpoints kontrol edilmeli

2. **`/api/audit-logs`** - ❌ Convex kullanıyor
   - `fetchQuery`, `fetchMutation` kullanıyor
   - `appwriteAuditLogs` client eklenmeli

3. **`/api/communication-logs`** - ❌ Convex kullanıyor
   - `fetchQuery`, `fetchMutation` kullanıyor
   - `appwriteCommunicationLogs` client eklenmeli

4. **`/api/branding/*`** - ❌ Convex kullanıyor
   - Logo ve organization routes
   - `appwriteBranding` veya `appwriteSystemSettings` kullanılabilir

### Orta Öncelik

5. **`/api/system_alerts/create`** - ❌ Convex kullanıyor
   - `getConvexHttp`, `api.monitoring.createAlert` kullanıyor
   - `appwriteSystemAlerts` client eklenmeli

6. **`/api/security`** - ❌ Convex kullanıyor
   - `getConvexHttp`, `api.security` kullanıyor
   - `appwriteSecurityEvents` client eklenmeli

7. **`/api/communication`** - ❌ Convex kullanıyor
   - Communication logs ile ilgili
   - `appwriteCommunicationLogs` kullanılabilir

8. **`/api/messages/send-bulk`** - ❌ Convex kullanıyor
   - `fetchMutation`, `api.messages.sendBulk` kullanıyor
   - Appwrite'a çevrilmeli

### Düşük Öncelik

9. **`/api/donations/update-analytics`** - ❌ Convex kullanıyor
   - Analytics update işlemi
   - `appwriteAnalyticsEvents` kullanılabilir

10. **`/api/errors/stats`** - ❌ Convex kullanıyor
    - Error statistics
    - `appwriteErrors` ile aggregate edilebilir

11. **`/api/errors/update-occurrence`** - ❌ Convex kullanıyor
    - Error occurrence update
    - `appwriteErrorOccurrences` client eklenmeli

12. **`/api/errors/[id]`** - ❌ Convex kullanıyor
    - Error CRUD operations
    - `appwriteErrors` kullanılabilir

13. **`/api/errors/[id]/assign`** - ❌ Convex kullanıyor
    - Error assignment
    - `appwriteErrors.update` kullanılabilir

## 📊 Migration İstatistikleri

- **Toplam API Routes**: ~66
- **Appwrite'a Geçiş Yapılan**: 8-9 routes ✅
- **Migration Gereken**: ~13 routes ⏳
- **Migration Tamamlanma**: ~60%

## 🚀 Hızlı Migration Rehberi

### Bir API Route'u Appwrite'a Çevirme

#### 1. Import Değişiklikleri

**Eski:**
```typescript
import { fetchQuery, fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { toOptionalConvexId } from '@/lib/convex/id-helpers';
```

**Yeni:**
```typescript
import { appwrite[Entity] } from '@/lib/appwrite/api';
import { normalizeQueryParams } from '@/lib/appwrite/api';
import { getBackendProvider } from '@/lib/backend';
```

#### 2. Query/Mutation Değişiklikleri

**Eski:**
```typescript
const data = await fetchQuery(api.entity.list, { status: 'active' });
const result = await fetchMutation(api.entity.create, data);
```

**Yeni:**
```typescript
const provider = getBackendProvider();
if (provider === 'appwrite') {
  const response = await appwriteEntity.list({ filters: { status: 'active' } });
  const data = response.data || [];
  
  const result = await appwriteEntity.create(data);
} else {
  // Fallback to Convex during migration
  const { fetchQuery } = await import('convex/nextjs');
  // ...
}
```

## 🔍 Detaylı Kontrol Listesi

Her route için kontrol edilmesi gerekenler:

- [ ] Convex import'ları kaldırıldı mı?
- [ ] Appwrite client kullanılıyor mu?
- [ ] Query params normalize ediliyor mu?
- [ ] Error handling doğru mu?
- [ ] Type safety korunuyor mu?
- [ ] Fallback mekanizması var mı? (migration dönemi için)

## 📝 Sonraki Adımlar

1. ✅ Errors route Appwrite desteği eklendi
2. ⏳ Audit logs route migration
3. ⏳ Communication logs route migration
4. ⏳ Branding routes migration
5. ⏳ System alerts route migration
6. ⏳ Security route migration
7. ⏳ Tüm routes test edilmeli

---

**Son Güncelleme**: Test çalıştırıldıktan sonra
**Durum**: Migration devam ediyor

