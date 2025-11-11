# Deployment Rehberi

Bu dokümantasyon, Dernek Yönetim Sistemi'ni production ortamına deploy etme sürecini açıklar.

## 📋 Genel Hazırlık

### 1. Pre-deployment Checklist

- [ ] Tüm testler geçiyor (`npm test`, `npm run e2e`)
- [ ] Lint hataları yok (`npm run lint:check`)
- [ ] TypeScript hataları yok (`npm run typecheck`)
- [ ] Production build başarılı (`npm run build`)
- [ ] Environment variables hazır ([ENVIRONMENT.md](ENVIRONMENT.md))
- [ ] TODO'lar kontrol edildi ([TODO.md](TODO.md))
- [ ] Güvenlik audit yapıldı (`npm audit`)

### 2. Environment Variables

Production için gerekli tüm değişkenleri hazırlayın:
- Convex deployment URL
- NEXTAUTH_SECRET (güçlü, 32+ karakter)
- CSRF_SECRET
- (Opsiyonel) Sentry DSN
- (Opsiyonel) Twilio credentials
- (Opsiyonel) Email servisi credentials

Detaylı bilgi için [ENVIRONMENT.md](ENVIRONMENT.md) dosyasına bakın.

---

## 🚀 Vercel Deployment (Önerilen)

### Neden Vercel?
- Next.js ile native entegrasyon
- Otomatik CI/CD
- Edge fonksiyonları
- Kolay environment variables yönetimi
- Ücretsiz tier yeterli (proof of concept için)

### Adım 1: Vercel Hesabı

1. [Vercel](https://vercel.com/) hesabı oluşturun
2. GitHub/GitLab repository'nizi bağlayın

### Adım 2: Proje Import

```bash
# CLI ile (önerilir)
npm install -g vercel
vercel login
vercel
```

Veya Vercel Dashboard üzerinden:
1. "Add New Project"
2. GitHub repository'nizi seçin
3. Framework preset: **Next.js**

### Adım 3: Convex Production Deploy

```bash
# Convex production deployment oluşturun
npx convex deploy --prod

# Çıkan URL'i not edin
# Örnek: https://your-deployment.convex.cloud
```

### Adım 4: Environment Variables (Vercel)

Vercel Dashboard > Project Settings > Environment Variables:

```env
# Production Environment
CONVEX_DEPLOYMENT=prod-dernek-xxxxx
NEXT_PUBLIC_CONVEX_URL=https://prod-dernek-xxxxx.convex.cloud
NEXTAUTH_SECRET=<güçlü-random-secret>
NEXTAUTH_URL=https://yourdomain.com
CSRF_SECRET=<güçlü-random-secret>
SENTRY_DSN=<sentry-dsn>
NEXT_PUBLIC_SENTRY_DSN=<sentry-dsn>
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=60000
```

**Önemli:** Environment için "Production" seçin!

### Adım 5: Deploy

```bash
# Production deploy
npm run vercel:prod

# Veya otomatik (git push ile)
git push origin main  # main branch'e push = otomatik deploy
```

### Adım 6: Domain Bağlama

Vercel Dashboard > Project > Settings > Domains:
1. Custom domain ekleyin (örn: `dernek.example.com`)
2. DNS kayıtlarını güncelleyin (Vercel otomatik SSL sağlar)

### Deploy Script

Otomatik deploy script kullanabilirsiniz:

```bash
npm run deploy:vercel
```

Bu script:
1. Lint + typecheck yapar
2. Build alır
3. Convex deploy eder
4. Vercel'e deploy eder
5. Deployment'ı validate eder

---

## 🐳 Docker Deployment

### Dockerfile

Proje root'unda `Dockerfile` oluşturun:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm ci

# Build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

### Build & Run

```bash
# Build image
docker build -t dernek-yonetim .

# Run container
docker run -p 3000:3000 \
  -e CONVEX_DEPLOYMENT=prod-dernek-xxxxx \
  -e NEXT_PUBLIC_CONVEX_URL=https://prod-dernek-xxxxx.convex.cloud \
  -e NEXTAUTH_SECRET=your-secret \
  -e NEXTAUTH_URL=https://yourdomain.com \
  dernek-yonetim
```

### Docker Compose

`docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

```bash
docker-compose up -d
```

---

## 🌐 VPS Deployment (Ubuntu)

### Gereksinimler
- Ubuntu 22.04+
- Node.js 20+
- Nginx
- PM2 (process manager)
- Certbot (SSL)

### Adım 1: Sunucu Hazırlığı

```bash
# Node.js kurulumu
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kurulumu
sudo npm install -g pm2

# Nginx kurulumu
sudo apt-get install -y nginx

# Certbot kurulumu (SSL)
sudo apt-get install -y certbot python3-certbot-nginx
```

### Adım 2: Proje Deploy

```bash
# Proje klasörü
cd /var/www
sudo git clone https://github.com/your-username/dernek-yonetim-sistemi.git
cd dernek-yonetim-sistemi

# Dependencies
sudo npm install

# Environment variables
sudo nano .env.production
# (Değişkenleri buraya ekleyin)

# Build
sudo npm run build

# PM2 ile çalıştır
pm2 start npm --name "dernek-app" -- start
pm2 save
pm2 startup
```

### Adım 3: Nginx Konfigürasyonu

`/etc/nginx/sites-available/dernek`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Nginx config aktifleştir
sudo ln -s /etc/nginx/sites-available/dernek /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Adım 4: SSL Sertifikası

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Güncelleme Süreci

```bash
cd /var/www/dernek-yonetim-sistemi
sudo git pull
sudo npm install
sudo npm run build
pm2 restart dernek-app
```

---

## 📊 Production Monitoring

### Sentry Error Tracking

1. [Sentry.io](https://sentry.io/) projesi oluşturun
2. Environment variables'a DSN ekleyin
3. Otomatik error tracking aktif

### Health Check Endpoint

```bash
# Health check
curl https://yourdomain.com/api/health?detailed=true

# Yanıt:
{
  "status": "ok",
  "timestamp": "2025-01-11T12:00:00.000Z",
  "version": "0.1.0",
  "database": "connected",
  "services": {
    "auth": "ok",
    "api": "ok"
  }
}
```

### Performance Monitoring

Vercel Analytics otomatik aktif. Alternatif:
- Google Analytics
- Plausible Analytics

---

## 🔄 CI/CD Pipeline

### GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint:check
      
      - name: Type check
        run: npm run typecheck
      
      - name: Test
        run: npm run test:run
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: npm run vercel:prod
```

---

## 🔙 Rollback

### Vercel Rollback

```bash
# Son deployment'ı geri al
vercel rollback

# Script ile
npm run vercel:rollback
```

### VPS Rollback

```bash
cd /var/www/dernek-yonetim-sistemi
git log --oneline  # Commit listesi
git reset --hard <commit-hash>
npm install
npm run build
pm2 restart dernek-app
```

---

## ✅ Post-Deployment Checklist

- [ ] Site erişilebilir
- [ ] SSL/HTTPS çalışıyor
- [ ] Login yapılabiliyor
- [ ] Database bağlantısı OK
- [ ] Health check endpoint OK (`/api/health`)
- [ ] Error tracking çalışıyor (Sentry)
- [ ] DNS doğru ayarlanmış
- [ ] Email/SMS servisleri test edildi
- [ ] Rate limiting çalışıyor
- [ ] Backup stratejisi hazır

---

## 🆘 Troubleshooting

### "Build failed"
```bash
# Cache temizle
rm -rf .next node_modules
npm install
npm run build
```

### "NEXTAUTH_URL not set"
Environment variables'ı kontrol edin:
```bash
vercel env ls
```

### "Convex connection failed"
- Convex deployment URL'i doğru mu?
- CORS ayarları yapıldı mı?

### "500 Internal Server Error"
Sentry'de error loglarını kontrol edin veya:
```bash
# Vercel logs
vercel logs

# PM2 logs
pm2 logs dernek-app
```

---

## 📚 İlgili Dokümantasyon

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Convex Production Best Practices](https://docs.convex.dev/production/hosting)
- [Environment Variables](ENVIRONMENT.md)
