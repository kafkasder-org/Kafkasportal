# Quick Deployment Guide

Fast track deployment for Vercel + Convex. For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## 🚀 Quick Deploy (5 Minutes)

### Option 1: Automated Script (Recommended)

```bash
./deploy.sh
```

This script will:
- ✅ Check prerequisites
- ✅ Generate security secrets
- ✅ Guide you through Convex deployment
- ✅ Help link Vercel project
- ✅ Deploy to production

### Option 2: Manual Steps

#### 1. Deploy Convex

```bash
npx convex login
npx convex deploy --yes
```

**Save the Convex URL** (e.g., `https://your-project.convex.cloud`)

#### 2. Generate Secrets

```bash
# CSRF Secret
node -e "console.log('CSRF_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"

# Session Secret
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
```

**Copy these values**

#### 3. Configure Vercel

```bash
# Login and link project
npx vercel login
npx vercel link

# Set environment variables (use the interactive script)
./setup-vercel-env.sh

# Or set manually
npx vercel env add NEXT_PUBLIC_CONVEX_URL production
# ... (paste your Convex URL)

npx vercel env add CSRF_SECRET production
# ... (paste generated secret)

npx vercel env add SESSION_SECRET production
# ... (paste generated secret)

npx vercel env add FIRST_ADMIN_EMAIL production
# ... (enter: baskan@dernek.org or your email)

npx vercel env add FIRST_ADMIN_PASSWORD production
# ... (enter a secure password)

npx vercel env add NODE_ENV production
# ... (enter: production)
```

#### 4. Deploy

```bash
npx vercel --prod
```

## ⚡ Even Faster (If Already Set Up)

```bash
# Deploy Convex
npm run convex:deploy

# Deploy Vercel
npm run vercel:prod
```

## 📋 Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | `https://xxx.convex.cloud` |
| `CSRF_SECRET` | CSRF protection secret (32+ chars) | Generated via script |
| `SESSION_SECRET` | Session encryption secret (32+ chars) | Generated via script |
| `FIRST_ADMIN_EMAIL` | Initial admin email | `baskan@dernek.org` |
| `FIRST_ADMIN_PASSWORD` | Initial admin password | Your secure password |
| `NODE_ENV` | Environment | `production` |

## 🧪 Verify Deployment

After deployment:

1. Visit your deployment URL (shown in Vercel output)
2. Check health: `https://your-url.vercel.app/api/health?detailed=true`
3. Login at: `https://your-url.vercel.app/login`

Expected health check response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T...",
  "environment": "production",
  "version": "1.0.0"
}
```

## 🔧 Helper Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Full Deploy** | `./deploy.sh` | Complete guided deployment |
| **Env Setup** | `./setup-vercel-env.sh` | Interactive environment variable setup |
| **Convex Deploy** | `npm run convex:deploy` | Deploy Convex backend only |
| **Vercel Deploy** | `npm run vercel:prod` | Deploy to Vercel production |
| **Preview Deploy** | `npm run vercel:preview` | Deploy preview (staging) |

## ❌ Common Issues

### "Convex not authenticated"
```bash
npx convex login
```

### "Vercel not authenticated"
```bash
npx vercel login
```

### "Build failed - environment variables missing"
- Ensure all required env vars are set
- Check they're set for the correct environment (production/preview/development)
- Verify values don't have extra spaces or quotes

### "Cannot connect to Convex"
- Verify `NEXT_PUBLIC_CONVEX_URL` includes `https://`
- Check Convex deployment status at https://dashboard.convex.dev
- Ensure Convex deployment was successful

## 📚 Documentation

- **Detailed Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Project Overview**: [CLAUDE.md](./CLAUDE.md)
- **Environment Variables**: [.env.example](./.env.example)

## 🆘 Need Help?

1. Check the [full deployment guide](./DEPLOYMENT_GUIDE.md)
2. Review [Convex docs](https://docs.convex.dev)
3. Review [Vercel docs](https://vercel.com/docs)
4. Open an issue at https://github.com/Vadalov/Kafkasder-panel/issues

---

**Quick Start**: Run `./deploy.sh` and follow the prompts!
