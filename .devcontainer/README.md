# GitHub Codespaces Yapılandırması

Bu klasör, projenizi GitHub Codespaces'da çalıştırmak için gerekli yapılandırmaları içerir.

## 🚀 Hızlı Başlangıç

### 1. Codespace Oluşturma

1. GitHub repository'nize gidin
2. Yeşil **"Code"** butonuna tıklayın
3. **"Codespaces"** sekmesini seçin
4. **"Create codespace on main"** veya **"+"** butonuna tıklayın

### 2. İlk Kurulum

Codespace açıldığında otomatik olarak:
- Node.js 20 kurulur
- Bağımlılıklar yüklenir (`npm install`)
- TypeScript kontrolü yapılır

### 3. Environment Variables

Codespace'de `.env.local` dosyası oluşturun:

```bash
# Convex Configuration (Required)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Authentication Secrets (Required in production)
CSRF_SECRET=your-32-character-minimum-secret-here
SESSION_SECRET=your-32-character-minimum-secret-here
```

### 4. Development Server'ı Başlatma

```bash
# Convex dev mode (terminal 1)
npm run convex:dev

# Next.js dev server (terminal 2)
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 📦 Özellikler

### Otomatik Kurulum
- Node.js 20.9.0+
- npm 9.0.0+
- Git ve GitHub CLI

### VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Playwright
- Convex

### Port Forwarding
- `3000` - Next.js development server
- `5173` - Vite dev server (eğer kullanılıyorsa)

## 🔧 Özelleştirme

### Yeni Extension Ekleme

`.devcontainer/devcontainer.json` dosyasındaki `extensions` listesine ekleyin:

```json
"extensions": [
  "dbaeumer.vscode-eslint",
  "yeni-extension-id"
]
```

### Yeni Port Ekleme

`forwardPorts` listesine ekleyin:

```json
"forwardPorts": [3000, 5173, 8080]
```

## 💡 İpuçları

1. **Codespace'i Durdurma**: Kullanmadığınızda durdurun (maliyet tasarrufu)
2. **Environment Variables**: GitHub Secrets kullanarak güvenli şekilde saklayın
3. **Terminal**: Birden fazla terminal açarak farklı komutlar çalıştırabilirsiniz
4. **Port Forwarding**: Portlar otomatik olarak public URL'ler oluşturur

## 🐛 Sorun Giderme

### Port Zaten Kullanılıyor
```bash
# Port'u öldür
lsof -ti:3000 | xargs kill -9
```

### Bağımlılıklar Yüklenmiyor
```bash
# Cache temizle ve yeniden yükle
rm -rf node_modules package-lock.json
npm install
```

### Convex Bağlantı Sorunu
```bash
# Convex CLI'yi kontrol et
npx convex --version

# Convex dev mode'u başlat
npm run convex:dev
```

## 🔄 Değişiklikleri Main'e Gönderme

Codespace'de yaptığınız değişiklikleri main branch'e göndermek için:

### Yöntem 1: Pull Request (Önerilen) ✅

**En güvenli yöntem** - Tüm kontrollerden geçer:

```bash
# 1. Yeni branch oluştur
git checkout -b feature/yeni-ozellik

# 2. Değişiklikleri commit et
git add .
git commit -m "feat: Yeni özellik eklendi"

# 3. Branch'i GitHub'a push et
git push origin feature/yeni-ozellik

# 4. GitHub'da Pull Request oluştur
# - GitHub UI'dan "Compare & pull request" butonuna tıkla
# - Veya: gh pr create --title "feat: Yeni özellik" --body "Açıklama"
```

**Otomatik Merge:** PR'da `auto-merge` veya `claude` label'ı varsa, tüm kontroller geçince otomatik merge edilir.

### Yöntem 2: Doğrudan Main'e Push (Dikkatli!)

⚠️ **Sadece küçük değişiklikler için** - Branch protection varsa çalışmaz:

```bash
# 1. Main branch'e geç
git checkout main

# 2. Değişiklikleri al (güncel olmak için)
git pull origin main

# 3. Değişiklikleri commit et
git add .
git commit -m "feat: Değişiklik açıklaması"

# 4. Push et
git push origin main
```

### Yöntem 3: GitHub CLI ile (Kolay)

```bash
# GitHub CLI zaten kurulu (devcontainer'da)

# 1. Branch oluştur ve değişiklikleri commit et
git checkout -b feature/yeni-ozellik
git add .
git commit -m "feat: Yeni özellik"
git push origin feature/yeni-ozellik

# 2. PR oluştur (otomatik)
gh pr create --title "feat: Yeni özellik" --body "Açıklama" --label "auto-merge"
```

### Git Durumunu Kontrol Etme

```bash
# Hangi dosyalar değişti?
git status

# Değişiklikleri görüntüle
git diff

# Commit geçmişi
git log --oneline
```

### ⚠️ Önemli Notlar

1. **Branch Protection:** Main branch korumalıysa, doğrudan push çalışmaz - PR gerekir
2. **CI Kontrolleri:** PR açıldığında otomatik testler çalışır (lint, typecheck, test)
3. **Auto-Merge:** `auto-merge` label'ı ile PR otomatik merge edilir
4. **Commit Mesajları:** Conventional commits kullanın (`feat:`, `fix:`, `docs:`)

## 📚 Daha Fazla Bilgi

- [GitHub Codespaces Dokümantasyonu](https://docs.github.com/en/codespaces)
- [Dev Containers Dokümantasyonu](https://containers.dev/)
- [Proje README](../README.md)
- [Auto-Merge Kılavuzu](../.github/AUTO_MERGE.md)

