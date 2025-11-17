# Önerilen Komutlar

## Geliştirme
```bash
# Development server başlat
npm run dev

# Convex backend başlat (dev ile paralel çalıştır)
npm run convex:dev

# Production build
npm run build

# Production server
npm run start
```

## Kod Kalitesi
```bash
# TypeScript type checking (pre-commit'te otomatik çalışır)
npm run typecheck

# ESLint kontrolü
npm run lint

# ESLint otomatik düzeltme
npm run lint:fix

# Prettier ile format kontrol
npm run format:check

# Prettier ile formatla
npm run format
```

## Testing
```bash
# Unit testler (watch mode)
npm run test

# Test UI (interaktif)
npm run test:ui

# Testleri bir kez çalıştır (CI mode)
npm run test:run

# Coverage raporu
npm run test:coverage

# E2E testler (Playwright)
npm run test:e2e

# E2E test UI
npm run e2e:ui

# Tek bir test dosyası çalıştır
npm run test -- path/to/file.test.ts

# İsme göre test çalıştır
npm run test -- -t "test name pattern"

# Tek bir E2E test
npm run test:e2e -- tests/auth.spec.ts
```

## Deployment
```bash
# Convex deploy
npm run convex:deploy

# Vercel production deploy
npm run vercel:prod

# Vercel preview deploy
npm run vercel:preview

# Health check
npm run health:check
```

## Utilities
```bash
# Bundle analizi
npm run analyze

# Cache temizle
npm run clean

# Tam temizlik + reinstall
npm run clean:all

# Geçici dosyaları temizle
npm run clean:temp

# Semantic grep tool
npm run sg
```

## Git Workflow
```bash
# Pre-commit otomatik çalışır (husky):
# - lint-staged (eslint + prettier)
# - typecheck

# Git operations (Windows - Git Bash kullan)
git status
git add .
git commit -m "message"
git push
```

## Windows-Specific
```bash
# PowerShell yerine Git Bash kullan (Husky için)
# MSYS_NT ortamında çalışıyor

# Port kill (eğer 3000 meşgulse)
npx kill-port 3000

# Node version check
node --version  # >= 20.9.0 olmalı
```

## Database (Convex)
```bash
# Convex dashboard aç
npx convex dashboard

# Convex login
npx convex login

# Convex functions çalıştır
# Doğrudan dashboard'dan veya kod üzerinden
```

## Debugging
```bash
# Next.js debug mode
NODE_OPTIONS='--inspect' npm run dev

# Verbose output
DEBUG=* npm run dev
```
