# Components Migration Guide

Bu rehber, Convex hooks'larını Appwrite'a çevirmek için adım adım talimatlar içerir.

## 📋 Migration Öncesi Kontrol Listesi

- [ ] API routes Appwrite'a çevrildi ✅
- [ ] Appwrite clients hazır ✅
- [ ] Unified backend interface hazır ✅
- [ ] Migration hooks hazır (`useAppwriteQuery`, `useAppwriteMutation`)

---

## 🔄 Migration Stratejisi

### 1. Convex Hooks → Appwrite Hooks

#### Önce (Convex):
```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const beneficiaries = useQuery(api.beneficiaries.list);
const createBeneficiary = useMutation(api.beneficiaries.create);

await createBeneficiary(data);
```

#### Sonra (Appwrite):
```typescript
import { useAppwriteQuery, useAppwriteMutation } from '@/hooks/useAppwriteQuery';
import { appwriteBeneficiaries } from '@/lib/appwrite/api';

const { data: beneficiaries } = useAppwriteQuery({
  queryKey: ['beneficiaries'],
  queryFn: () => appwriteBeneficiaries.list(),
  convexQuery: {
    query: api.beneficiaries.list,
    args: {},
  },
});

const createBeneficiary = useAppwriteMutation({
  mutationFn: (data) => appwriteBeneficiaries.create(data),
  convexMutation: {
    mutation: api.beneficiaries.create,
  },
  queryKey: ['beneficiaries'],
  successMessage: 'İhtiyaç sahibi oluşturuldu',
});

await createBeneficiary.mutateAsync(data);
```

---

## 📝 Adım Adım Migration

### Adım 1: Import'ları Değiştir

**Önce:**
```typescript
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
```

**Sonra:**
```typescript
import { useAppwriteQuery, useAppwriteMutation } from '@/hooks/useAppwriteQuery';
import { appwrite[Entity] } from '@/lib/appwrite/api';
```

### Adım 2: useQuery → useAppwriteQuery

**Önce:**
```typescript
const data = useQuery(api.entity.list, { status: 'active' });
```

**Sonra:**
```typescript
const { data, isLoading, error } = useAppwriteQuery({
  queryKey: ['entity', 'list', { status: 'active' }],
  queryFn: () => appwriteEntity.list({ filters: { status: 'active' } }),
  convexQuery: {
    query: api.entity.list,
    args: { status: 'active' },
  },
});
```

### Adım 3: useMutation → useAppwriteMutation

**Önce:**
```typescript
const create = useMutation(api.entity.create);

await create(data);
```

**Sonra:**
```typescript
const create = useAppwriteMutation({
  mutationFn: (data) => appwriteEntity.create(data),
  convexMutation: {
    mutation: api.entity.create,
  },
  queryKey: ['entity'],
  successMessage: 'Başarıyla oluşturuldu',
});

await create.mutateAsync(data);
// veya
create.mutate(data);
```

### Adım 4: useAction → useAppwriteMutation

**Önce:**
```typescript
const action = useAction(api.entity.action);

await action(data);
```

**Sonra:**
```typescript
const action = useAppwriteMutation({
  mutationFn: async (data) => {
    // Appwrite implementation
    const response = await fetch('/api/entity/action', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  convexMutation: {
    mutation: api.entity.action,
  },
  queryKey: ['entity'],
});

await action.mutateAsync(data);
```

### Adım 5: Real-time Subscriptions

**Önce:**
```typescript
const data = useQuery(api.entity.list);
// Automatic real-time updates
```

**Sonra:**
```typescript
// Appwrite Realtime (future implementation)
const { data } = useAppwriteQuery({
  queryKey: ['entity'],
  queryFn: () => appwriteEntity.list(),
  refetchInterval: 5000, // Polling for now
  // Real-time listeners will be added later
});
```

---

## 🎯 Öncelik Sırası

### Yüksek Öncelik (Kritik Components)
1. **Forms Components**
   - `BeneficiaryForm.tsx`
   - `BeneficiaryFormWizard.tsx`
   - `TaskForm.tsx`
   - `MeetingForm.tsx`
   - `MessageForm.tsx`

2. **List Components**
   - `KumbaraList.tsx`
   - Beneficiaries list pages
   - Users list pages

3. **Dashboard Pages**
   - `financial-dashboard/page.tsx`
   - `genel/page.tsx`
   - `yardim/nakdi-vezne/page.tsx`

### Orta Öncelik
4. **Detail Pages**
   - `ihtiyac-sahipleri/[id]/page.tsx`
   - `basvurular/[id]/page.tsx`

5. **Manager Components**
   - `DocumentsManager.tsx`
   - `DependentsManager.tsx`
   - `BankAccountsManager.tsx`

### Düşük Öncelik
6. **AI Components**
   - `AgentChat.tsx` (Complex, needs real-time)
   - `AIChat.tsx` (Complex, needs real-time)

---

## 🔍 Migration Checklist (Her Component İçin)

- [ ] Import'lar değiştirildi
- [ ] `useQuery` → `useAppwriteQuery` çevrildi
- [ ] `useMutation` → `useAppwriteMutation` çevrildi
- [ ] `useAction` → `useAppwriteMutation` çevrildi
- [ ] Loading states kontrol edildi (`isLoading` vs `undefined`)
- [ ] Error handling kontrol edildi
- [ ] Type safety korundu
- [ ] Convex fallback eklendi
- [ ] Test edildi

---

## ⚠️ Dikkat Edilmesi Gerekenler

### 1. Loading States
**Convex:**
```typescript
const data = useQuery(...);
// data === undefined means loading
```

**Appwrite:**
```typescript
const { data, isLoading } = useAppwriteQuery(...);
// isLoading === true means loading
```

### 2. Error Handling
**Convex:**
```typescript
const data = useQuery(...);
// Errors are caught automatically
```

**Appwrite:**
```typescript
const { data, error, isError } = useAppwriteQuery(...);
if (isError) {
  // Handle error
}
```

### 3. Real-time Updates
**Convex:** Otomatik real-time subscriptions
**Appwrite:** Şu an polling veya manual refresh (real-time listeners gelecekte eklenecek)

### 4. Skip Condition
**Convex:**
```typescript
const data = useQuery(api.entity.get, id ? { id } : 'skip');
```

**Appwrite:**
```typescript
const { data } = useAppwriteQuery({
  queryKey: ['entity', id],
  queryFn: () => appwriteEntity.get(id!),
  enabled: !!id,
});
```

---

## 📚 Örnek Migrations

Detaylı örnekler için:
- `src/components/forms/BeneficiaryForm.tsx` (example migration)
- `src/hooks/useAppwriteQuery.ts` (helper hook)
- `src/hooks/useAppwriteMutation.ts` (helper hook)

---

## 🚀 Hızlı Başlangıç

1. Bir component seç
2. Import'ları değiştir
3. `useQuery` → `useAppwriteQuery` çevir
4. `useMutation` → `useAppwriteMutation` çevir
5. Loading/error states'i kontrol et
6. Test et

---

**Son Güncelleme**: Migration hooks hazır, örnek migrations eklenecek

