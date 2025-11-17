# Kod Stili ve Konvansiyonlar

## TypeScript Kuralları

### Strict Mode
- Tüm strict flags aktif (tsconfig.json)
- `noImplicitAny`: true
- `strictNullChecks`: true
- `noUnusedLocals`: true
- `noUnusedParameters`: true
- `noImplicitReturns`: true

### Değişken Kuralları
```typescript
// ✅ İyi
const data = [];
let count = 0;

// ❌ Kötü
var data = [];  // var yasak
let data = [];  // const kullanılmalı (değişmiyorsa)

// Kullanılmayan parametreler _ ile başlamalı
function handler(_req: Request, res: Response) {
  return res.json({});
}
```

### Object Shorthand
```typescript
// ✅ İyi
const user = { name, email, phone };

// ❌ Kötü
const user = { name: name, email: email, phone: phone };
```

### Tip Tanımlamaları
```typescript
// ✅ Açık tipler tercih et
function getUser(id: string): Promise<User> {
  // ...
}

// Interface kullan (type yerine, çoğunlukla)
interface User {
  id: string;
  name: string;
}

// Type sadece union/intersection için
type Status = 'active' | 'inactive';
```

## Logging Kuralları (ÇOK ÖNEMLİ!)

### Console Yasağı
```typescript
// ❌ YASAK - ESLint hatası verir
console.log('Debug message');

// ✅ Logger kullan
import { logger } from '@/lib/logger';
logger.info('Debug message');
logger.error('Error occurred', error);

// İstisnalar:
// - console.warn - İzinli
// - console.error - İzinli
// - Test dosyaları (__tests__/**/*.ts)
// - Scripts (scripts/**/*.ts)
// - API routes (src/app/api/**/*.ts)
// - Logger implementation (src/lib/logger.ts)
```

## Convex Kuralları

### Function Syntax (ESLint zorunlu tutar)
```typescript
// ✅ İyi - Object syntax
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getUser = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ❌ Kötü - Eski syntax
export const getUser = query(async (ctx, args: { id: Id<'users'> }) => {
  return await ctx.db.get(args.id);
});
```

### Argument Validators (Zorunlu)
```typescript
// ✅ Her function args validator olmalı
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // ...
  },
});

// ❌ Args olmadan çalışmaz
export const getAll = query({
  handler: async (ctx) => {
    // ESLint hatası - args: {} olmalı
  },
});
```

## İsimlendirme Konvansiyonları

### Dosya İsimleri
- **Components**: PascalCase - `UserForm.tsx`, `TaskCard.tsx`
- **Hooks**: camelCase, 'use' prefix - `useAuth.ts`, `useFormMutation.ts`
- **Utils**: camelCase - `format-date.ts`, `api-helpers.ts`
- **Types**: camelCase - `database.ts`, `permissions.ts`
- **Routes**: kebab-case veya Türkçe - `bagis/`, `yardim/`, `user-profile/`

### Değişken İsimleri
```typescript
// camelCase - değişkenler ve fonksiyonlar
const userData = {};
function getUserById() {}

// PascalCase - Components, Types, Interfaces
interface UserData {}
type UserStatus = 'active' | 'inactive';
const UserCard = () => {};

// SCREAMING_SNAKE_CASE - Sabitler
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const API_ENDPOINT = '/api/users';
```

### Türkçe İsimlendirme
- Route'lar Türkçe olabilir: `/bagis`, `/yardim`, `/kullanici`
- Kod içinde İngilizce tercih: `donations`, `beneficiaries`, `users`
- UI metinleri Türkçe

## React Kuralları

### Component Structure
```typescript
'use client'; // Client component ise

import { useState } from 'react';
import type { FC } from 'react';

interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
}

export const UserCard: FC<UserCardProps> = ({ user, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div>
      {/* ... */}
    </div>
  );
};
```

### Hooks Sırası
1. React hooks (useState, useEffect, useMemo, etc.)
2. Custom hooks
3. Event handlers
4. Render helpers
5. Return

### Props Destructuring
```typescript
// ✅ Destructure props
export const Card = ({ title, children }: CardProps) => {
  return <div>{title}</div>;
};

// ❌ Props objesini kullanma
export const Card = (props: CardProps) => {
  return <div>{props.title}</div>;
};
```

## Import Sırası
```typescript
// 1. React
import { useState, useEffect } from 'react';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Internal aliases (@/)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

// 4. Relative imports
import { helper } from './helper';
import type { LocalType } from './types';
```

## Path Aliases (tsconfig.json)
```typescript
// Kullanılabilir alias'lar:
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { User } from '@/types/database';
import { getCurrentUser } from '@/convex/auth';
```

## Form Pattern
```typescript
// useStandardForm hook kullan
import { useStandardForm } from '@/hooks/useStandardForm';
import { beneficiarySchema } from '@/lib/validations/forms';

const form = useStandardForm({
  defaultValues: initialData,
  schema: beneficiarySchema,
  mutationFn: beneficiaries.create,
  onSuccess: (data) => {
    toast.success('Oluşturuldu!');
  },
  resetOnSuccess: true,
});
```

## API Client Pattern
```typescript
// CRUD factory kullan
import { beneficiaries } from '@/lib/api/convex-api-client';

// Queries
const list = await beneficiaries.list({ status: 'active' });
const item = await beneficiaries.get(id);

// Mutations
const created = await beneficiaries.create(data);
await beneficiaries.update(id, updates);
await beneficiaries.delete(id);
```

## Error Handling
```typescript
// Try-catch ile logger kullan
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error);
  throw error; // veya handle et
}
```

## Comments & Documentation
```typescript
// JSDoc fonksiyonlar için
/**
 * Kullanıcıyı ID'ye göre getirir
 * @param id - Kullanıcı ID
 * @returns Kullanıcı objesi veya null
 */
async function getUserById(id: string): Promise<User | null> {
  // Implementation
}

// Inline comments açıklayıcı olmalı
// Complex logic için
const total = items.reduce((sum, item) => {
  // Sadece aktif ürünleri hesapla
  return item.isActive ? sum + item.price : sum;
}, 0);
```

## Template Literals
```typescript
// ✅ Template literals tercih et
const message = `Hello, ${name}!`;
const url = `/api/users/${userId}`;

// ❌ String concatenation
const message = 'Hello, ' + name + '!';
```
