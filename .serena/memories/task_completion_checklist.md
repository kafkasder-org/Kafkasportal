# Görev Tamamlandığında Yapılacaklar

## Pre-Commit Otomatik Çalışır
Husky pre-commit hook aşağıdakileri otomatik yapar:
1. **lint-staged**: ESLint + Prettier (sadece değişen dosyalarda)
2. **typecheck**: `npm run typecheck`

## Manuel Kontroller

### 1. Kod Kalitesi
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Formatting check
npm run format:check
```

Hata varsa:
```bash
# Linting hatalarını düzelt
npm run lint:fix

# Format hatalarını düzelt
npm run format
```

### 2. Testing
```bash
# Unit/integration testler
npm run test:run

# E2E testler (gerekirse)
npm run test:e2e
```

**Not**: Pre-commit'te testler şu an çalışmıyor (test suite stabilize olunca açılacak).

### 3. Build Test
```bash
# Production build dene
npm run build

# Build başarılıysa, local'de test et
npm run start
```

### 4. Bundle Size Check (İsteğe Bağlı)
```bash
# Bundle analizi
npm run analyze
```

## Commit Öncesi Checklist

- [ ] TypeScript hataları yok (`npm run typecheck`)
- [ ] ESLint hataları yok (`npm run lint`)
- [ ] Format doğru (`npm run format:check`)
- [ ] İlgili testler yazıldı/güncellendi
- [ ] Testler geçiyor (`npm run test:run`)
- [ ] Build başarılı (`npm run build`)
- [ ] `console.log` kullanılmamış (logger kullanıldı)
- [ ] Yeni bağımlılık eklendiyse dokümante edildi
- [ ] Convex fonksiyonları doğru syntax ile (`object` syntax)
- [ ] API client CRUD factory kullanılmış

## Commit Message Format
```bash
# Semantic commit messages
git commit -m "feat: yeni özellik açıklaması"
git commit -m "fix: hata düzeltmesi"
git commit -m "refactor: kod iyileştirmesi"
git commit -m "docs: dokümantasyon güncelleme"
git commit -m "test: test ekleme/düzeltme"
git commit -m "chore: dependency update"
```

## PR Öncesi (Eğer Varsa)

- [ ] Branch güncel (`git pull origin main`)
- [ ] Conflict'ler çözüldü
- [ ] Feature branch'i main ile merge edilebilir durumda
- [ ] PR açıklaması hazırlandı
- [ ] İlgili issue/ticket bağlandı

## Deployment Öncesi

```bash
# Convex deploy (backend değişikliği varsa)
npm run convex:deploy

# Vercel preview deploy (test için)
npm run vercel:preview

# Production deploy
npm run vercel:prod

# Deploy sonrası health check
npm run health:check
```

## Özel Durumlar

### Yeni Resource Eklendiğinde
1. Convex schema güncellendi mi?
2. Convex functions yazıldı mı?
3. API route eklendi mi?
4. CRUD client oluşturuldu mu?
5. Types tanımlandı mı?
6. Validation schema eklendi mi?
7. UI components hazırlandı mı?
8. Testler yazıldı mı?

### Security-Critical Changes
1. CSRF token doğru kullanılıyor mu?
2. Rate limiting uygulandı mı?
3. Input sanitization yapılıyor mu?
4. Authentication check var mı?
5. Permission kontrolü doğru mu?
6. Audit logging eklendi mi?

### Performance-Critical Changes
1. Bundle size etkilendi mi? (`npm run analyze`)
2. API cache kullanılıyor mu?
3. React Query cache config doğru mu?
4. Image optimization uygulandı mı?
5. Code splitting gerekli mi?

## Windows-Specific

- Git Bash kullanıldı mı? (PowerShell değil)
- Path separator'lar doğru mu? (`\` Windows için)
- Line endings CRLF'den LF'e çevrildi mi? (Git auto-convert yapar)

## Final Check
```bash
# Tüm kontroller tek seferde
npm run typecheck && npm run lint && npm run test:run && npm run build
```

Hepsi başarılıysa ✅ Commit ve push yapılabilir!
